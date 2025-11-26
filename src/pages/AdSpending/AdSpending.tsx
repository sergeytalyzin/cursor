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
// Это client_id и client_secret из личного кабинета Ozon Performance
const PERFORMANCE_CLIENT_ID = 'XYZ@advertising.performance.ozon.ru'; // Нужно заменить на реальный
const PERFORMANCE_CLIENT_SECRET = 'your_client_secret_here'; // Нужно заменить на реальный

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
		isLoading: campaignsLoading,
		error: campaignsError 
	} = usePerformanceCampaigns(
		PERFORMANCE_CLIENT_ID,
		PERFORMANCE_CLIENT_SECRET
	);

	// Получаем статистику по продуктам в рекламе
	const { 
		isLoading: adProductsLoading,
		error: adProductsError 
	} = usePerformanceProductReport(
		dateRange[0].format('YYYY-MM-DD'),
		dateRange[1].format('YYYY-MM-DD'),
		PERFORMANCE_CLIENT_ID,
		PERFORMANCE_CLIENT_SECRET
	);

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

	// Моковые данные для демонстрации (пока API не настроен)
	const mockAdData = useMemo(() => {
		return {
			totalSpent: 145230, // Общий рекламный бюджет
			totalViews: 1245000, // Показы
			totalClicks: 34560, // Клики
			totalOrders: 890, // Заказы с рекламы
			avgCPC: 4.2, // Средняя стоимость клика
			ctr: 2.77, // CTR (клики/показы)
			conversionRate: 2.57, // Конверсия (заказы/клики)
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
	}, []);

	// Расчёт KPI
	const kpiData = useMemo(() => {
		const adSpent = mockAdData.totalSpent;
		const revenue = salesMetrics.revenue;
		const adOrders = mockAdData.totalOrders;
		
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
			totalViews: mockAdData.totalViews,
			totalClicks: mockAdData.totalClicks,
			ctr: mockAdData.ctr,
			conversionRate: mockAdData.conversionRate,
		};
	}, [mockAdData, salesMetrics]);

	// Данные для графиков
	const chartData = useMemo(() => {
		return {
			spendingChart: {
				labels: mockAdData.dailyStats.labels,
				series: [
					{
						name: 'Расходы на рекламу',
						data: mockAdData.dailyStats.spent,
						color: '#FF3B30',
					},
				],
			},
			ordersChart: {
				labels: mockAdData.dailyStats.labels,
				series: [
					{
						name: 'Заказы с рекламы',
						data: mockAdData.dailyStats.orders,
						color: '#34C759',
					},
				],
			},
			campaignChart: {
				labels: mockAdData.campaigns.map(c => c.name),
				series: [
					{
						name: 'Расходы',
						data: mockAdData.campaigns.map(c => c.spent),
						color: '#007AFF',
					},
				],
			},
		};
	}, [mockAdData]);

	const isLoading = salesLoading || campaignsLoading || adProductsLoading;
	const hasError = campaignsError || adProductsError;

	if (isLoading && !salesData) {
		return (
			<div className="ad-spending" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
				<Spin size="large" tip="Загрузка данных..." />
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
			{/* Предупреждение о настройке API */}
			{hasError && (
				<Alert
					message="Требуется настройка Performance API"
					description={
						<div>
							<p>Для получения реальных данных о рекламе необходимо:</p>
							<ol>
								<li>Получить client_id и client_secret в личном кабинете Ozon (Настройки → API-ключи)</li>
								<li>Обновить константы PERFORMANCE_CLIENT_ID и PERFORMANCE_CLIENT_SECRET в коде</li>
							</ol>
							<p>Сейчас отображаются демонстрационные данные.</p>
						</div>
					}
					type="warning"
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
					dataSource={mockAdData.campaigns}
					rowKey="id"
					scroll={{ x: 1200 }}
					pagination={{
						pageSize: 10,
						showSizeChanger: true,
						pageSizeOptions: ['10', '20', '50'],
						showTotal: (total) => `Всего: ${total} кампаний`,
					}}
				/>
			</Card>
		</div>
	);
};
