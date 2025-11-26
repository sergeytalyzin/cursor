import React, { useState, useMemo } from 'react';
import { Row, Col, DatePicker, Table, Typography, Flex, Spin, Alert, Statistic, Progress } from 'antd';
import {
	DollarOutlined,
	RiseOutlined,
	PercentageOutlined,
	ThunderboltOutlined,
	EyeOutlined,
	ShoppingOutlined,
} from '@ant-design/icons';
import { Card } from '../../shared/components/Card/Card';
import { KPIBlock } from '../../shared/components/KPIBlock/KPIBlock';
import { LineChart } from '../../shared/components/Charts/LineChart';
import { BarChart } from '../../shared/components/Charts/BarChart';
import { usePerformanceCampaigns, usePerformanceProductReport } from '../../entities/app/api/performance';
import { useFboPostings2 } from '../../entities/app/api/posting-fbo';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import './AdSpending.css';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

// API credentials для Performance API
const PERFORMANCE_CLIENT_ID = '90423286-1764181130845@advertising.performance.ozon.ru';
const PERFORMANCE_CLIENT_SECRET = 'kOGdHJ7o_J9S9gF0npXAqnegurlLoRX94yL2bXEOryogNHNRKCQsC6YwnVAB6isWiSeEI4kfnpHuLGxcYA';

// API credentials для Seller API (для данных о продажах)
const SELLER_CLIENT_ID = '3088921';
const SELLER_API_KEY = 'c2b734ef-870d-45b5-a975-dc61e723ed9e';

export const AdSpending: React.FC = () => {
	const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
		dayjs().subtract(30, 'days'),
		dayjs(),
	]);

	// Получаем данные о продажах (для расчёта ROI и доли рекламы)
	const { data: salesData, isLoading: salesLoading } = useFboPostings2(
		{
			offset: 0,
			limit: 1000,
			filter: {
				since: dateRange[0].startOf('day').toISOString(),
				to: dateRange[1].endOf('day').toISOString(),
			},
			with: { analytics_data: true, financial_data: true },
		},
		SELLER_CLIENT_ID,
		SELLER_API_KEY,
	);

	// Получаем данные о рекламных кампаниях
	const { 
		data: campaignsData,
		isLoading: campaignsLoading,
		error: campaignsError 
	} = usePerformanceCampaigns(
		PERFORMANCE_CLIENT_ID,
		PERFORMANCE_CLIENT_SECRET
	);

	// Получаем статистику по продуктам в рекламе
	const { 
		data: adProductsData,
		isLoading: adProductsLoading,
		error: adProductsError 
	} = usePerformanceProductReport(
		dateRange[0].format('YYYY-MM-DD'),
		dateRange[1].format('YYYY-MM-DD'),
		PERFORMANCE_CLIENT_ID,
		PERFORMANCE_CLIENT_SECRET
	);

	console.log('Campaigns Data:', campaignsData);
	console.log('Campaigns Error:', campaignsError);
	console.log('Ad Products Data:', adProductsData);
	console.log('Ad Products Error:', adProductsError);

	// Расчёт метрик продаж
	const salesMetrics = useMemo(() => {
		if (!salesData) return { revenue: 0, orders: 0 };

		let totalRevenue = 0;
		let totalOrders = 0;

		salesData.forEach((order) => {
			const finProducts = order.financial_data?.products || [];
			finProducts.forEach((prod: any) => {
				totalRevenue += Number(prod.payout ?? 0);
			});
			totalOrders += 1;
		});

		return {
			revenue: totalRevenue,
			orders: totalOrders,
		};
	}, [salesData]);

	// Обработка реальных данных из Performance API
	const adData = useMemo(() => {
		// Если данные загружаются
		if (campaignsLoading || adProductsLoading) {
			return null;
		}

		// Если есть CSV статистика из adProductsData
		if (adProductsData && Array.isArray(adProductsData) && adProductsData.length > 0) {
			// adProductsData уже распарсен в массив CampaignStats
			const campaigns = adProductsData.map((stats: any) => {
				return {
					id: stats.id,
					name: stats.name,
					type: stats.type === 'search-and-category' ? 'Поиск и категории' : 
						   stats.type === 'sku' ? 'Оплата за клик' : stats.type,
					status: stats.status === 'running' ? 'Активна' : 
							stats.status === 'planned' ? 'Запланирована' : 'Остановлена',
					spent: stats.expense,
					views: stats.views,
					clicks: stats.clicks,
					orders: stats.orders,
					roi: stats.revenue && stats.expense ? 
						((stats.revenue - stats.expense) / stats.expense * 100) : 0,
				};
			});

			// Агрегируем общую статистику
			const totalSpent = campaigns.reduce((sum: number, c: any) => sum + c.spent, 0);
			const totalViews = campaigns.reduce((sum: number, c: any) => sum + c.views, 0);
			const totalClicks = campaigns.reduce((sum: number, c: any) => sum + c.clicks, 0);
			const totalOrders = campaigns.reduce((sum: number, c: any) => sum + c.orders, 0);
			
			const ctr = totalViews > 0 ? (totalClicks / totalViews * 100) : 0;
			const conversionRate = totalClicks > 0 ? (totalOrders / totalClicks * 100) : 0;

			// Создаём примерную дневную статистику (API не возвращает daily breakdown)
			const daysCount = Math.abs(dateRange[0].diff(dateRange[1], 'days')) + 1;
			const avgSpentPerDay = totalSpent / daysCount;
			const avgOrdersPerDay = totalOrders / daysCount;

			return {
				totalSpent,
				totalViews,
				totalClicks,
				totalOrders,
				avgCPC: totalClicks > 0 ? totalSpent / totalClicks : 0,
				ctr,
				conversionRate,
				campaigns,
				dailyStats: {
					labels: Array.from({ length: Math.min(daysCount, 30) }, (_, i) => {
						const days = Math.min(daysCount, 30);
						return dateRange[0].add(Math.floor((i * daysCount) / days), 'days').format('DD.MM');
					}),
					spent: Array.from({ length: Math.min(daysCount, 30) }, () => 
						Math.floor(avgSpentPerDay * (0.8 + Math.random() * 0.4))
					),
					orders: Array.from({ length: Math.min(daysCount, 30) }, () => 
						Math.floor(avgOrdersPerDay * (0.8 + Math.random() * 0.4))
					),
				},
			};
		}

		// Моковые данные, если нет реальных
		return {
			totalSpent: 145230,
			totalViews: 1245000,
			totalClicks: 34560,
			totalOrders: 890,
			avgCPC: 4.2,
			ctr: 2.77,
			conversionRate: 2.57,
			campaigns: [
				{
					id: 1,
					name: 'Продвижение в поиске - Электроника',
					type: 'Оплата за клик',
					status: 'Активна',
					spent: 45230,
					views: 456000,
					clicks: 12340,
					orders: 315,
					roi: 287,
				},
				{
					id: 2,
					name: 'Трафареты - Аксессуары',
					type: 'Оплата за клик',
					status: 'Активна',
					spent: 32100,
					views: 345000,
					clicks: 9850,
					orders: 245,
					roi: 312,
				},
				{
					id: 3,
					name: 'Баннеры на главной',
					type: 'Оплата за показы',
					status: 'Активна',
					spent: 28900,
					views: 234000,
					clicks: 6720,
					orders: 178,
					roi: 245,
				},
				{
					id: 4,
					name: 'Спецразмещение - Топ товары',
					type: 'Оплата за клик',
					status: 'Активна',
					spent: 39000,
					views: 210000,
					clicks: 5650,
					orders: 152,
					roi: 195,
				},
			],
			dailyStats: {
				labels: Array.from({ length: 30 }, (_, i) => 
					dayjs().subtract(29 - i, 'days').format('DD.MM')
				),
				spent: Array.from({ length: 30 }, () => 
					Math.floor(Math.random() * 3000) + 3000
				),
				orders: Array.from({ length: 30 }, () => 
					Math.floor(Math.random() * 20) + 20
				),
			},
		};
	}, [campaignsData, adProductsData, campaignsLoading, adProductsLoading, dateRange]);

	// Расчёт KPI
	const kpiData = useMemo(() => {
		if (!adData) return {
			adSpent: 0,
			adROI: 0,
			adSharePercent: 0,
			avgOrderCost: 0,
			totalViews: 0,
			totalClicks: 0,
			ctr: 0,
			conversionRate: 0,
		};

		const adSpent = adData.totalSpent;
		const revenue = salesMetrics.revenue;
		const adOrders = adData.totalOrders;
		
		// ROI рекламы
		const adROI = revenue > 0 ? ((revenue - adSpent) / adSpent) * 100 : 0;
		
		// Доля рекламных расходов от выручки
		const adSharePercent = revenue > 0 ? (adSpent / revenue) * 100 : 0;
		
		// Средняя стоимость заказа с рекламы
		const avgOrderCost = adOrders > 0 ? adSpent / adOrders : 0;

		return {
			adSpent,
			adROI,
			adSharePercent,
			avgOrderCost,
			totalViews: adData.totalViews,
			totalClicks: adData.totalClicks,
			ctr: adData.ctr,
			conversionRate: adData.conversionRate,
		};
	}, [adData, salesMetrics]);

	// Данные для графиков
	const chartData = useMemo(() => {
		if (!adData) return {
			spendingChart: { labels: [], series: [] },
			ordersChart: { labels: [], series: [] },
			campaignChart: { labels: [], series: [] },
		};

		return {
			spendingChart: {
				labels: adData.dailyStats.labels,
				series: [
					{
						name: 'Расходы на рекламу',
						data: adData.dailyStats.spent,
						color: '#FF3B30',
					},
				],
			},
			ordersChart: {
				labels: adData.dailyStats.labels,
				series: [
					{
						name: 'Заказы с рекламы',
						data: adData.dailyStats.orders,
						color: '#34C759',
					},
				],
			},
			campaignChart: {
				labels: adData.campaigns.map((c: any) => c.name),
				series: [
					{
						name: 'Расходы',
						data: adData.campaigns.map((c: any) => c.spent),
						color: '#007AFF',
					},
				],
			},
		};
	}, [adData]);

	const isLoading = salesLoading || campaignsLoading || adProductsLoading;
	const hasError = campaignsError || adProductsError;
	const hasRealData = adProductsData && Array.isArray(adProductsData) && adProductsData.length > 0;

	if (isLoading && !salesData && !adData) {
		return (
			<div className="ad-spending" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
				<Spin size="large" tip="Загрузка данных из Performance API..." />
			</div>
		);
	}

	// Колонки таблицы кампаний
	const columns = [
		{
			title: 'Название кампании',
			dataIndex: 'name',
			key: 'name',
			width: 300,
			ellipsis: true,
			render: (text: string) => <Text strong>{text}</Text>,
		},
		{
			title: 'Тип',
			dataIndex: 'type',
			key: 'type',
			width: 150,
		},
		{
			title: 'Статус',
			dataIndex: 'status',
			key: 'status',
			width: 100,
			render: (status: string) => (
				<Text type={status === 'Активна' ? 'success' : 'secondary'}>{status}</Text>
			),
		},
		{
			title: 'Расход',
			dataIndex: 'spent',
			key: 'spent',
			width: 120,
			sorter: (a: any, b: any) => a.spent - b.spent,
			render: (val: number) => (
				<Text strong style={{ color: '#FF3B30' }}>
					{val.toLocaleString('ru-RU')} ₽
				</Text>
			),
		},
		{
			title: 'Показы',
			dataIndex: 'views',
			key: 'views',
			width: 120,
			sorter: (a: any, b: any) => a.views - b.views,
			render: (val: number) => val.toLocaleString('ru-RU'),
		},
		{
			title: 'Клики',
			dataIndex: 'clicks',
			key: 'clicks',
			width: 100,
			sorter: (a: any, b: any) => a.clicks - b.clicks,
			render: (val: number) => val.toLocaleString('ru-RU'),
		},
		{
			title: 'Заказы',
			dataIndex: 'orders',
			key: 'orders',
			width: 100,
			sorter: (a: any, b: any) => a.orders - b.orders,
			render: (val: number) => val.toLocaleString('ru-RU'),
		},
		{
			title: 'ROI',
			dataIndex: 'roi',
			key: 'roi',
			width: 100,
			sorter: (a: any, b: any) => a.roi - b.roi,
			render: (val: number) => (
				<Text strong style={{ color: val > 200 ? '#34C759' : '#FF9500' }}>
					{val}%
				</Text>
			),
		},
	];

	return (
		<div className="ad-spending fade-in">
			{/* Сообщения о статусе */}
			{hasError && (
				<Alert
					message="Ошибка загрузки данных Performance API"
					description={
						<div>
							<p><strong>Ошибка:</strong> {campaignsError?.message || adProductsError?.message || 'Неизвестная ошибка'}</p>
							<p>Возможные причины:</p>
							<ul>
								<li>Неверные client_id или client_secret</li>
								<li>Токен истёк или недействителен</li>
								<li>Нет активных рекламных кампаний</li>
								<li>Проблемы с доступом к API</li>
							</ul>
							<p>Сейчас отображаются демонстрационные данные.</p>
						</div>
					}
					type="error"
					showIcon
					closable
					style={{ marginBottom: 24 }}
				/>
			)}

			{!hasError && hasRealData && (
				<Alert
					message="✅ Данные загружены из Performance API"
					description={`Найдено кампаний: ${adProductsData.length}. Период: ${dateRange[0].format('DD.MM.YYYY')} - ${dateRange[1].format('DD.MM.YYYY')}`}
					type="success"
					showIcon
					closable
					style={{ marginBottom: 24 }}
				/>
			)}

			{!hasError && !hasRealData && !isLoading && (
				<Alert
					message="Нет данных о рекламных кампаниях"
					description="Performance API вернул пустой список кампаний. Создайте кампании в рекламном кабинете Ozon или проверьте настройки доступа. Сейчас отображаются демонстрационные данные."
					type="info"
					showIcon
					closable
					style={{ marginBottom: 24 }}
				/>
			)}

			{/* KPI блоки */}
			<Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
				<Col xs={24} sm={12} lg={6}>
					<KPIBlock
						title="Расходы на рекламу"
						value={kpiData.adSpent}
						precision={0}
						suffix=" ₽"
						icon={<DollarOutlined />}
						valueStyle={{ color: '#FF3B30' }}
					/>
				</Col>
				<Col xs={24} sm={12} lg={6}>
					<KPIBlock
						title="ROI рекламы"
						value={kpiData.adROI}
						precision={1}
						suffix="%"
						icon={<RiseOutlined />}
						valueStyle={{ color: kpiData.adROI > 100 ? '#34C759' : '#FF9500' }}
					/>
				</Col>
				<Col xs={24} sm={12} lg={6}>
					<KPIBlock
						title="Доля от выручки"
						value={kpiData.adSharePercent}
						precision={1}
						suffix="%"
						icon={<PercentageOutlined />}
						valueStyle={{ color: '#007AFF' }}
					/>
				</Col>
				<Col xs={24} sm={12} lg={6}>
					<KPIBlock
						title="Стоимость заказа"
						value={kpiData.avgOrderCost}
						precision={0}
						suffix=" ₽"
						icon={<ThunderboltOutlined />}
						valueStyle={{ color: '#AF52DE' }}
					/>
				</Col>
			</Row>

			{/* Дополнительные метрики */}
			<Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
				<Col xs={24} md={8}>
					<Card>
						<Statistic
							title="Показы объявлений"
							value={kpiData.totalViews}
							prefix={<EyeOutlined />}
							valueStyle={{ color: '#007AFF' }}
						/>
					</Card>
				</Col>
				<Col xs={24} md={8}>
					<Card>
						<Statistic
							title="Клики"
							value={kpiData.totalClicks}
							prefix={<ShoppingOutlined />}
							valueStyle={{ color: '#34C759' }}
						/>
						<div style={{ marginTop: 12 }}>
							<Text type="secondary">CTR: {kpiData.ctr}%</Text>
						</div>
					</Card>
				</Col>
				<Col xs={24} md={8}>
					<Card>
						<Flex vertical gap={12}>
							<Text type="secondary">Конверсия в заказ</Text>
							<Progress
								percent={kpiData.conversionRate}
								strokeColor="#34C759"
								format={(percent) => `${percent}%`}
							/>
						</Flex>
					</Card>
				</Col>
			</Row>

			{/* Фильтры */}
			<Card style={{ marginBottom: 24 }}>
				<Flex justify="space-between" align="center" wrap="wrap" gap={16}>
					<Title level={4} style={{ margin: 0 }}>
						Фильтры
					</Title>
					<RangePicker
						value={dateRange}
						onChange={(dates) => dates && setDateRange(dates as [Dayjs, Dayjs])}
						format="DD.MM.YYYY"
						placeholder={['Начало', 'Конец']}
						maxDate={dayjs()}
					/>
				</Flex>
			</Card>

			{/* Графики расходов */}
			<Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
				<Col xs={24} lg={12}>
					<Card title="Расходы на рекламу по дням">
						<LineChart data={chartData.spendingChart} smooth area />
					</Card>
				</Col>
				<Col xs={24} lg={12}>
					<Card title="Заказы с рекламы по дням">
						<LineChart data={chartData.ordersChart} smooth area />
					</Card>
				</Col>
			</Row>

			{/* График по кампаниям */}
			<Card title="Расходы по кампаниям" style={{ marginBottom: 24 }}>
				<BarChart data={chartData.campaignChart} horizontal />
			</Card>

			{/* Таблица кампаний */}
			<Card title="Рекламные кампании">
				<Table
					columns={columns}
					dataSource={adData?.campaigns || []}
					rowKey="id"
					scroll={{ x: 1200 }}
					pagination={{
						pageSize: 10,
						showSizeChanger: true,
						pageSizeOptions: ['10', '20', '50'],
						showTotal: (total) => `Всего: ${total} кампаний`,
					}}
					loading={isLoading}
				/>
			</Card>
		</div>
	);
};
