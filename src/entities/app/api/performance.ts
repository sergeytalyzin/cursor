import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const PERFORMANCE_API_BASE = 'https://api-performance.ozon.ru';

// Типы для Performance API
interface TokenResponse {
	access_token: string;
	expires_in: number;
	token_type: string;
}

// Статистика кампании из CSV
export interface CampaignStats {
	id: string;
	name: string;
	status: string;
	type: string;
	placement: string;
	dailyBudget: number;
	weeklyBudget: number;
	expense: number; // Расход
	views: number; // Показы
	clicks: number; // Клики
	addToCart: number; // В корзину
	avgBid: number; // Средняя ставка
	avgCPM: number; // Ср. цена 1000 показов
	ctr: number; // CTR
	avgCPC: number; // Ср. цена клика
	orders: number; // Заказы, шт
	revenue: number; // Заказы, ₽
	drr: number; // ДРР
}

// Функция парсинга CSV данных
function parseCSVStats(csvText: string): CampaignStats[] {
	const lines = csvText.trim().split('\n');
	if (lines.length < 2) return [];
	
	// Пропускаем заголовок (первая строка)
	const dataLines = lines.slice(1);
	
	return dataLines.map(line => {
		const parts = line.split(';');
		
		// Парсим числа с запятой как десятичным разделителем
		const parseNumber = (str: string) => {
			if (!str || str === '') return 0;
			return parseFloat(str.replace(',', '.'));
		};
		
		return {
			id: parts[0] || '',
			name: parts[1] || '',
			status: parts[2] || '',
			type: parts[3] || '',
			placement: parts[4] || '',
			dailyBudget: parseNumber(parts[5]),
			weeklyBudget: parseNumber(parts[6]),
			expense: parseNumber(parts[7]),
			views: parseNumber(parts[8]),
			clicks: parseNumber(parts[9]),
			addToCart: parseNumber(parts[10]),
			avgBid: parseNumber(parts[11]),
			avgCPM: parseNumber(parts[12]),
			ctr: parseNumber(parts[13]),
			avgCPC: parseNumber(parts[14]),
			orders: parseNumber(parts[15]),
			revenue: parseNumber(parts[16]),
			drr: parseNumber(parts[17]),
		};
	});
}

// Получение токена для Performance API
export async function getPerformanceToken(clientId: string, clientSecret: string): Promise<string> {
	try {
		const { data } = await axios.post<TokenResponse>(
			`${PERFORMANCE_API_BASE}/api/client/token`,
			{
				client_id: clientId,
				client_secret: clientSecret,
				grant_type: 'client_credentials',
			},
			{
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
				},
			}
		);
		return data.access_token;
	} catch (error) {
		console.error('Error getting performance token:', error);
		throw error;
	}
}

// Hook для получения списка кампаний
export function usePerformanceCampaigns(clientId?: string, clientSecret?: string) {
	return useQuery({
		enabled: !!clientId && !!clientSecret,
		queryKey: ['performance-campaigns', clientId],
		queryFn: async () => {
			const token = await getPerformanceToken(clientId!, clientSecret!);
			
			const { data } = await axios.get(
				`${PERFORMANCE_API_BASE}/api/client/campaign`,
				{
					headers: {
						'Authorization': `Bearer ${token}`,
						'Content-Type': 'application/json',
					},
				}
			);
			
			return data;
		},
		staleTime: 5 * 60 * 1000, // 5 минут
	});
}

// Hook для получения статистики по кампаниям
export function usePerformanceStatistics(
	campaignIds: number[],
	dateFrom: string,
	dateTo: string,
	clientId?: string,
	clientSecret?: string
) {
	return useQuery({
		enabled: !!clientId && !!clientSecret && campaignIds.length > 0,
		queryKey: ['performance-statistics', campaignIds, dateFrom, dateTo, clientId],
		queryFn: async () => {
			const token = await getPerformanceToken(clientId!, clientSecret!);
			
			// Формируем запрос статистики
			const { data } = await axios.post(
				`${PERFORMANCE_API_BASE}/api/client/statistics`,
				{
					campaigns: campaignIds,
					dateFrom,
					dateTo,
					groupBy: 'DATE',
				},
				{
					headers: {
						'Authorization': `Bearer ${token}`,
						'Content-Type': 'application/json',
					},
				}
			);
			
			return data;
		},
		staleTime: 5 * 60 * 1000,
	});
}

// Hook для получения отчёта по продуктам в кампаниях (CSV формат)
export function usePerformanceProductReport(
	dateFrom: string,
	dateTo: string,
	clientId?: string,
	clientSecret?: string
) {
	return useQuery<CampaignStats[]>({
		enabled: !!clientId && !!clientSecret,
		queryKey: ['performance-product-report', dateFrom, dateTo, clientId],
		queryFn: async () => {
			const token = await getPerformanceToken(clientId!, clientSecret!);
			
			// API возвращает CSV, не JSON!
			const { data } = await axios.get<string>(
				`${PERFORMANCE_API_BASE}/api/client/statistics/campaign/product`,
				{
					params: {
						dateFrom,
						dateTo,
					},
					headers: {
						'Authorization': `Bearer ${token}`,
						'Accept': 'text/csv',
					},
					responseType: 'text', // Важно!
				}
			);
			
			console.log('CSV Response:', data);
			
			// Парсим CSV данные
			const stats = parseCSVStats(data);
			console.log('Parsed Stats:', stats);
			
			return stats;
		},
		staleTime: 5 * 60 * 1000,
	});
}
