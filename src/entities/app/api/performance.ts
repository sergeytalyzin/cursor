import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const PERFORMANCE_API_BASE = 'https://api-performance.ozon.ru';

// Типы для Performance API
interface TokenResponse {
	access_token: string;
	expires_in: number;
	token_type: string;
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

// Hook для получения отчёта по продуктам в кампаниях
export function usePerformanceProductReport(
	dateFrom: string,
	dateTo: string,
	clientId?: string,
	clientSecret?: string
) {
	return useQuery({
		enabled: !!clientId && !!clientSecret,
		queryKey: ['performance-product-report', dateFrom, dateTo, clientId],
		queryFn: async () => {
			const token = await getPerformanceToken(clientId!, clientSecret!);
			
			const { data } = await axios.get(
				`${PERFORMANCE_API_BASE}/api/client/statistics/campaign/product`,
				{
					params: {
						dateFrom,
						dateTo,
					},
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
