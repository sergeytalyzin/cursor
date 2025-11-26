import React, { useState, useMemo } from 'react';
import { Row, Col, DatePicker, Table, Space, Typography, Flex, Tag, Spin, InputNumber } from 'antd';
import {
	DollarOutlined,
	ShoppingOutlined,
	RiseOutlined,
	PercentageOutlined,
	CheckCircleOutlined,
	CarOutlined,
	CloseCircleOutlined,
} from '@ant-design/icons';
import { Card } from '../../shared/components/Card/Card';
import { KPIBlock } from '../../shared/components/KPIBlock/KPIBlock';
import { LineChart } from '../../shared/components/Charts/LineChart';
import { BarChart } from '../../shared/components/Charts/BarChart';
import { useFboPostings2 } from '../../entities/app/api/posting-fbo';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import './SalesAnalytics.css';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

// Константы API (временно захардкожены)
const CLIENT_ID = '3088921';
const API_KEY = 'c2b734ef-870d-45b5-a975-dc61e723ed9e';

export const SalesAnalytics: React.FC = () => {
	const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
		dayjs('2025-10-01'),
		dayjs('2025-10-27'),
	]);

	const [costs, setCosts] = useState<Record<number, number>>({});

	// Запрос данных из Ozon API
	const { data: postings, isLoading } = useFboPostings2(
		{
			offset: 0,
			limit: 1000,
			filter: {
				since: dateRange[0].startOf('day').toISOString(),
				to: dateRange[1].endOf('day').toISOString(),
			},
			with: { analytics_data: true, financial_data: true },
		},
		CLIENT_ID,
		API_KEY,
	);

	// Агрегация данных по SKU
	const skuData = useMemo(() => {
		if (!postings) return [];

		const skuMap = new Map<number, any>();

		for (const order of postings) {
			const finProducts = order.financial_data?.products || [];
			const status = order.status;

			for (const prod of finProducts) {
				const sku = Number(prod.product_id);
				const productInfo = order.products.find((x) => x.sku === sku);
				const name = productInfo?.name || 'Без названия';

				if (!skuMap.has(sku)) {
					skuMap.set(sku, {
						key: String(sku),
						sku,
						name,
						quantity: 0,
						price: 0,
						revenue: 0,
						commission: 0,
						payout: 0,
						delivered: 0,
						cancelled: 0,
						delivering: 0,
						warehouses: new Set<string>(),
					});
				}

				const item = skuMap.get(sku)!;
				item.quantity += prod.quantity ?? 1;
				item.price = Number(prod.price ?? 0);
				item.revenue += Number(prod.price ?? 0) * (prod.quantity ?? 1);
				item.commission += Math.abs(Number(prod.commission_amount ?? 0));
				item.payout += Number(prod.payout ?? 0);

				if (order.analytics_data?.warehouse_name) {
					item.warehouses.add(order.analytics_data.warehouse_name);
				}

				if (status === 'delivered') item.delivered += 1;
				if (status === 'delivering') item.delivering += 1;
				if (status === 'cancelled') item.cancelled += 1;
			}
		}

		return Array.from(skuMap.values()).map((item) => ({
			...item,
			warehouses: Array.from(item.warehouses),
			totalOrders: item.delivered + item.delivering + item.cancelled,
		}));
	}, [postings]);

	// Расчёт KPI метрик
	const kpiData = useMemo(() => {
		if (!skuData.length) {
			return {
				totalRevenue: 0,
				totalOrders: 0,
				avgCheck: 0,
				totalProfit: 0,
				roi: 0,
			};
		}

		const totalRevenue = skuData.reduce((sum, item) => sum + item.payout, 0);
		const totalOrders = skuData.reduce((sum, item) => sum + item.totalOrders, 0);
		const avgCheck = totalOrders > 0 ? totalRevenue / totalOrders : 0;

		// Расчёт прибыли с учётом себестоимости
		let totalCost = 0;
		skuData.forEach((item) => {
			const cost = costs[item.sku] || 0;
			totalCost += cost * item.quantity;
		});

		const totalProfit = totalRevenue - totalCost;
		const roi = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

		return {
			totalRevenue,
			totalOrders,
			avgCheck,
			totalProfit,
			roi,
		};
	}, [skuData, costs]);

	// Данные по складам
	const warehouseData = useMemo(() => {
		if (!skuData.length) return { labels: [], series: [] };

		const warehouseMap = new Map<string, number>();

		skuData.forEach((item) => {
			item.warehouses.forEach((warehouse: string) => {
				warehouseMap.set(warehouse, (warehouseMap.get(warehouse) || 0) + item.totalOrders);
			});
		});

		const sortedWarehouses = Array.from(warehouseMap.entries())
			.sort((a, b) => b[1] - a[1])
			.slice(0, 10);

		return {
			labels: sortedWarehouses.map(([name]) => name || 'Неизвестно'),
			series: [
				{
					name: 'Заказы',
					data: sortedWarehouses.map(([, count]) => count),
					color: '#FF9500',
				},
			],
		};
	}, [skuData]);

	// Данные по дням (группируем заказы)
	const dailyData = useMemo(() => {
		if (!postings) return { salesData: { labels: [], series: [] }, ordersData: { labels: [], series: [] } };

		const dailyMap = new Map<string, { revenue: number; orders: number }>();

		postings.forEach((order) => {
			const date = dayjs(order.in_process_at || order.created_at).format('DD.MM');
			
			if (!dailyMap.has(date)) {
				dailyMap.set(date, { revenue: 0, orders: 0 });
			}

			const day = dailyMap.get(date)!;
			day.orders += 1;

			// Считаем выручку из financial_data
			const finProducts = order.financial_data?.products || [];
			finProducts.forEach((prod: any) => {
				day.revenue += Number(prod.payout ?? 0);
			});
		});

		const sortedDays = Array.from(dailyMap.entries()).sort((a, b) => {
			const dateA = dayjs(a[0], 'DD.MM');
			const dateB = dayjs(b[0], 'DD.MM');
			return dateA.diff(dateB);
		});

		const labels = sortedDays.map(([date]) => date);
		const revenueData = sortedDays.map(([, data]) => Math.round(data.revenue));
		const ordersData = sortedDays.map(([, data]) => data.orders);

		return {
			salesData: {
				labels,
				series: [{ name: 'Выручка', data: revenueData, color: '#007AFF' }],
			},
			ordersData: {
				labels,
				series: [{ name: 'Заказы', data: ordersData, color: '#34C759' }],
			},
		};
	}, [postings]);

	if (isLoading) {
		return (
			<div className="sales-analytics" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
				<Spin size="large" tip="Загрузка данных..." />
			</div>
		);
	}

	const tableData = skuData.map((item) => {
		const cost = costs[item.sku] || 0;
		const totalCost = cost * item.quantity;
		const profit = item.payout - totalCost;
		const margin = item.payout > 0 ? ((profit / item.payout) * 100).toFixed(1) : '0';

		return {
			...item,
			totalCost,
			profit,
			margin,
		};
	});

	const columns = [
		{
			title: 'SKU',
			dataIndex: 'sku',
			key: 'sku',
			width: 100,
			fixed: 'left' as const,
			render: (text: number) => <Text strong>{text}</Text>,
		},
		{
			title: 'Название товара',
			dataIndex: 'name',
			key: 'name',
			width: 250,
			ellipsis: true,
		},
		{
			title: 'Кол-во',
			dataIndex: 'quantity',
			key: 'quantity',
			width: 80,
			sorter: (a: any, b: any) => a.quantity - b.quantity,
			render: (val: number) => val.toLocaleString('ru-RU'),
		},
		{
			title: 'Цена',
			dataIndex: 'price',
			key: 'price',
			width: 100,
			sorter: (a: any, b: any) => a.price - b.price,
			render: (val: number) => `${Math.round(val).toLocaleString('ru-RU')} ₽`,
		},
		{
			title: 'Выплата продавцу',
			dataIndex: 'payout',
			key: 'payout',
			width: 130,
			sorter: (a: any, b: any) => a.payout - b.payout,
			render: (val: number) => (
				<Text strong style={{ color: '#007AFF' }}>
					{Math.round(val).toLocaleString('ru-RU')} ₽
				</Text>
			),
		},
		{
			title: 'Комиссия',
			dataIndex: 'commission',
			key: 'commission',
			width: 110,
			sorter: (a: any, b: any) => a.commission - b.commission,
			render: (val: number) => `${Math.round(val).toLocaleString('ru-RU')} ₽`,
		},
		{
			title: 'Статусы',
			key: 'statuses',
			width: 280,
			render: (_: any, record: any) => (
				<Space size="small" wrap>
					<Tag icon={<CheckCircleOutlined />} color="success">
						{record.delivered}
					</Tag>
					<Tag icon={<CarOutlined />} color="processing">
						{record.delivering}
					</Tag>
					<Tag icon={<CloseCircleOutlined />} color="error">
						{record.cancelled}
					</Tag>
				</Space>
			),
		},
		{
			title: 'Себестоимость ₽/шт',
			key: 'cost',
			width: 150,
			render: (_: any, record: any) => (
				<InputNumber
					min={0}
					value={costs[record.sku] || 0}
					onChange={(v) => setCosts((prev) => ({ ...prev, [record.sku]: Number(v) || 0 }))}
					size="small"
					style={{ width: '100%' }}
				/>
			),
		},
		{
			title: 'Прибыль',
			dataIndex: 'profit',
			key: 'profit',
			width: 120,
			sorter: (a: any, b: any) => a.profit - b.profit,
			fixed: 'right' as const,
			render: (val: number) => (
				<Text strong style={{ color: val >= 0 ? '#34C759' : '#FF3B30' }}>
					{Math.round(val).toLocaleString('ru-RU')} ₽
				</Text>
			),
		},
		{
			title: 'Склады',
			dataIndex: 'warehouses',
			key: 'warehouses',
			width: 150,
			render: (warehouses: string[]) => (
				<Flex wrap="wrap" gap={4}>
					{warehouses.slice(0, 2).map((w, idx) => (
						<Tag key={idx} style={{ margin: 0 }}>
							{w || 'Неизвестно'}
						</Tag>
					))}
					{warehouses.length > 2 && <Tag>+{warehouses.length - 2}</Tag>}
				</Flex>
			),
		},
	];

	return (
		<div className="sales-analytics fade-in">
			{/* KPI блоки */}
			<Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
				<Col xs={24} sm={12} lg={6}>
					<KPIBlock
						title="Выплата продавцу"
						value={kpiData.totalRevenue}
						precision={0}
						suffix=" ₽"
						icon={<DollarOutlined />}
						valueStyle={{ color: '#007AFF' }}
					/>
				</Col>
				<Col xs={24} sm={12} lg={6}>
					<KPIBlock
						title="Заказы"
						value={kpiData.totalOrders}
						precision={0}
						icon={<ShoppingOutlined />}
						valueStyle={{ color: '#34C759' }}
					/>
				</Col>
				<Col xs={24} sm={12} lg={6}>
					<KPIBlock
						title="Средний чек"
						value={kpiData.avgCheck}
						precision={0}
						suffix=" ₽"
						icon={<RiseOutlined />}
						valueStyle={{ color: '#FF9500' }}
					/>
				</Col>
				<Col xs={24} sm={12} lg={6}>
					<KPIBlock
						title="Прибыль"
						value={kpiData.totalProfit}
						precision={0}
						suffix=" ₽"
						icon={<PercentageOutlined />}
						valueStyle={{ color: kpiData.totalProfit >= 0 ? '#34C759' : '#FF3B30' }}
					/>
				</Col>
			</Row>

			{/* Фильтры */}
			<Card style={{ marginBottom: 24 }}>
				<Flex justify="space-between" align="center" wrap="wrap" gap={16}>
					<Title level={4} style={{ margin: 0 }}>
						Фильтры
					</Title>
					<Space size="middle">
						<RangePicker
							value={dateRange}
							onChange={(dates) => dates && setDateRange(dates as [Dayjs, Dayjs])}
							format="DD.MM.YYYY"
							placeholder={['Начало', 'Конец']}
						/>
					</Space>
				</Flex>
			</Card>

			{/* Графики продаж */}
			<Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
				<Col xs={24} lg={12}>
					<Card title="Выплаты продавцу по дням">
						{dailyData.salesData.labels.length > 0 ? (
							<LineChart data={dailyData.salesData} smooth area />
						) : (
							<div style={{ textAlign: 'center', padding: '40px' }}>
								<Text type="secondary">Нет данных за выбранный период</Text>
							</div>
						)}
					</Card>
				</Col>
				<Col xs={24} lg={12}>
					<Card title="Заказы по дням">
						{dailyData.ordersData.labels.length > 0 ? (
							<LineChart data={dailyData.ordersData} smooth area />
						) : (
							<div style={{ textAlign: 'center', padding: '40px' }}>
								<Text type="secondary">Нет данных за выбранный период</Text>
							</div>
						)}
					</Card>
				</Col>
			</Row>

			{/* График по складам */}
			<Card title="Статистика по складам" style={{ marginBottom: 24 }}>
				{warehouseData.labels.length > 0 ? (
					<BarChart data={warehouseData} />
				) : (
					<div style={{ textAlign: 'center', padding: '40px' }}>
						<Text type="secondary">Нет данных о складах</Text>
					</div>
				)}
			</Card>

			{/* Таблица продаж по SKU */}
			<Card title="Продажи по товарам">
				<div style={{ marginBottom: 16 }}>
					<Text type="secondary">
						💡 Введите себестоимость товаров для расчёта прибыли
					</Text>
				</div>
				<Table
					columns={columns}
					dataSource={tableData}
					scroll={{ x: 1400 }}
					pagination={{
						pageSize: 20,
						showSizeChanger: true,
						pageSizeOptions: ['10', '20', '50', '100'],
						showTotal: (total) => `Всего: ${total} товаров`,
					}}
					loading={isLoading}
				/>
			</Card>
		</div>
	);
};
