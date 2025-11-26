import React, { useState } from 'react';
import { Row, Col, DatePicker, Table, Space, Typography, Flex, Tag, Progress } from 'antd';
import {
	EyeOutlined,
	ShoppingCartOutlined,
	ShoppingOutlined,
	CheckCircleOutlined,
} from '@ant-design/icons';
import { Card } from '../../shared/components/Card/Card';
import { KPIBlock } from '../../shared/components/KPIBlock/KPIBlock';
import { FunnelChart } from '../../shared/components/Charts/FunnelChart';
import { LineChart } from '../../shared/components/Charts/LineChart';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import './SalesFunnel.css';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

// Моковые данные воронки
const mockFunnelData = [
	{ name: 'Показы', value: 125000, conversion: undefined },
	{ name: 'Клики', value: 5625, conversion: 4.5 },
	{ name: 'В корзину', value: 2250, conversion: 40.0 },
	{ name: 'Заказы', value: 1350, conversion: 60.0 },
	{ name: 'Выкупы', value: 1188, conversion: 88.0 },
];

// Данные воронки по дням
const mockFunnelTrendData = {
	labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
	series: [
		{
			name: 'Показы',
			data: [15000, 17000, 16500, 19000, 18500, 21000, 18000],
			color: '#007AFF',
		},
		{
			name: 'Клики',
			data: [675, 765, 742, 855, 833, 945, 810],
			color: '#34C759',
		},
		{
			name: 'Заказы',
			data: [162, 183, 178, 205, 200, 227, 195],
			color: '#FF9500',
		},
		{
			name: 'Выкупы',
			data: [143, 161, 157, 180, 176, 200, 171],
			color: '#AF52DE',
		},
	],
};

// Данные по товарам
const mockProductFunnelData = [
	{
		key: '1',
		sku: 'SKU-001',
		name: 'Наушники Bluetooth TWS',
		views: 25000,
		clicks: 1125,
		cart: 450,
		orders: 270,
		purchases: 237,
		conversionRate: 21.1,
	},
	{
		key: '2',
		sku: 'SKU-002',
		name: 'Умные часы Sport Edition',
		views: 18500,
		clicks: 833,
		cart: 333,
		orders: 200,
		purchases: 176,
		conversionRate: 21.1,
	},
	{
		key: '3',
		sku: 'SKU-003',
		name: 'Портативная колонка',
		views: 32000,
		clicks: 1440,
		cart: 576,
		orders: 346,
		purchases: 304,
		conversionRate: 21.1,
	},
	{
		key: '4',
		sku: 'SKU-004',
		name: 'Беспроводная зарядка',
		views: 21000,
		clicks: 945,
		cart: 378,
		orders: 227,
		purchases: 200,
		conversionRate: 21.2,
	},
	{
		key: '5',
		sku: 'SKU-005',
		name: 'Чехол для телефона',
		views: 28500,
		clicks: 1282,
		cart: 513,
		orders: 308,
		purchases: 271,
		conversionRate: 21.1,
	},
];

export const SalesFunnel: React.FC = () => {
	const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
		dayjs().subtract(7, 'days'),
		dayjs(),
	]);

	// Расчёт конверсий
	const viewsToClicks = ((mockFunnelData[1].value / mockFunnelData[0].value) * 100).toFixed(1);
	const clicksToCart = ((mockFunnelData[2].value / mockFunnelData[1].value) * 100).toFixed(1);
	const cartToOrders = ((mockFunnelData[3].value / mockFunnelData[2].value) * 100).toFixed(1);
	const ordersToPurchases = ((mockFunnelData[4].value / mockFunnelData[3].value) * 100).toFixed(1);
	const overallConversion = ((mockFunnelData[4].value / mockFunnelData[0].value) * 100).toFixed(2);

	const columns = [
		{
			title: 'SKU',
			dataIndex: 'sku',
			key: 'sku',
			width: 120,
			fixed: 'left' as const,
			render: (text: string) => <Text strong>{text}</Text>,
		},
		{
			title: 'Название товара',
			dataIndex: 'name',
			key: 'name',
			width: 250,
		},
		{
			title: 'Показы',
			dataIndex: 'views',
			key: 'views',
			width: 110,
			sorter: (a: any, b: any) => a.views - b.views,
			render: (val: number) => (
				<Flex align="center" gap={6}>
					<EyeOutlined style={{ color: '#007AFF' }} />
					{val.toLocaleString('ru-RU')}
				</Flex>
			),
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
			title: 'В корзину',
			dataIndex: 'cart',
			key: 'cart',
			width: 100,
			sorter: (a: any, b: any) => a.cart - b.cart,
			render: (val: number) => (
				<Flex align="center" gap={6}>
					<ShoppingCartOutlined style={{ color: '#FF9500' }} />
					{val.toLocaleString('ru-RU')}
				</Flex>
			),
		},
		{
			title: 'Заказы',
			dataIndex: 'orders',
			key: 'orders',
			width: 100,
			sorter: (a: any, b: any) => a.orders - b.orders,
			render: (val: number) => (
				<Flex align="center" gap={6}>
					<ShoppingOutlined style={{ color: '#34C759' }} />
					{val.toLocaleString('ru-RU')}
				</Flex>
			),
		},
		{
			title: 'Выкупы',
			dataIndex: 'purchases',
			key: 'purchases',
			width: 100,
			sorter: (a: any, b: any) => a.purchases - b.purchases,
			render: (val: number) => (
				<Flex align="center" gap={6}>
					<CheckCircleOutlined style={{ color: '#AF52DE' }} />
					{val.toLocaleString('ru-RU')}
				</Flex>
			),
		},
		{
			title: 'Конверсия',
			dataIndex: 'conversionRate',
			key: 'conversionRate',
			width: 120,
			sorter: (a: any, b: any) => a.conversionRate - b.conversionRate,
			render: (val: number) => (
				<Tag color={val > 20 ? 'success' : val > 15 ? 'warning' : 'default'}>
					{val}%
				</Tag>
			),
		},
	];

	return (
		<div className="sales-funnel fade-in">
			{/* KPI блоки */}
			<Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
				<Col xs={24} sm={12} lg={6}>
					<KPIBlock
						title="Показы"
						value={mockFunnelData[0].value}
						precision={0}
						icon={<EyeOutlined />}
						valueStyle={{ color: '#007AFF' }}
					/>
				</Col>
				<Col xs={24} sm={12} lg={6}>
					<KPIBlock
						title="Клики"
						value={mockFunnelData[1].value}
						precision={0}
						trend={5.2}
						trendText={`${viewsToClicks}% от показов`}
						icon={<ShoppingCartOutlined />}
						valueStyle={{ color: '#34C759' }}
					/>
				</Col>
				<Col xs={24} sm={12} lg={6}>
					<KPIBlock
						title="Заказы"
						value={mockFunnelData[3].value}
						precision={0}
						trend={8.7}
						trendText={`${cartToOrders}% от корзины`}
						icon={<ShoppingOutlined />}
						valueStyle={{ color: '#FF9500' }}
					/>
				</Col>
				<Col xs={24} sm={12} lg={6}>
					<KPIBlock
						title="Выкупы"
						value={mockFunnelData[4].value}
						precision={0}
						trend={3.1}
						trendText={`${ordersToPurchases}% от заказов`}
						icon={<CheckCircleOutlined />}
						valueStyle={{ color: '#AF52DE' }}
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

			{/* График воронки и конверсии */}
			<Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
				<Col xs={24} lg={12}>
					<Card title="Воронка продаж">
						<FunnelChart data={mockFunnelData} height={400} />
					</Card>
				</Col>
				<Col xs={24} lg={12}>
					<Card title="Конверсии между этапами">
						<Space direction="vertical" size="large" style={{ width: '100%', padding: '20px 0' }}>
							<div>
								<Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
									<Text>Показы → Клики</Text>
									<Text strong style={{ color: '#007AFF' }}>
										{viewsToClicks}%
									</Text>
								</Flex>
								<Progress
									percent={Number(viewsToClicks)}
									strokeColor="#007AFF"
									showInfo={false}
								/>
							</div>

							<div>
								<Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
									<Text>Клики → В корзину</Text>
									<Text strong style={{ color: '#34C759' }}>
										{clicksToCart}%
									</Text>
								</Flex>
								<Progress
									percent={Number(clicksToCart)}
									strokeColor="#34C759"
									showInfo={false}
								/>
							</div>

							<div>
								<Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
									<Text>Корзина → Заказы</Text>
									<Text strong style={{ color: '#FF9500' }}>
										{cartToOrders}%
									</Text>
								</Flex>
								<Progress
									percent={Number(cartToOrders)}
									strokeColor="#FF9500"
									showInfo={false}
								/>
							</div>

							<div>
								<Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
									<Text>Заказы → Выкупы</Text>
									<Text strong style={{ color: '#AF52DE' }}>
										{ordersToPurchases}%
									</Text>
								</Flex>
								<Progress
									percent={Number(ordersToPurchases)}
									strokeColor="#AF52DE"
									showInfo={false}
								/>
							</div>

							<div style={{ marginTop: 16, padding: '16px', background: 'rgba(0, 122, 255, 0.08)', borderRadius: 12 }}>
								<Flex justify="space-between" align="center">
									<Text strong>Общая конверсия</Text>
									<Text strong style={{ fontSize: 24, color: '#007AFF' }}>
										{overallConversion}%
									</Text>
								</Flex>
							</div>
						</Space>
					</Card>
				</Col>
			</Row>

			{/* Динамика воронки */}
			<Card title="Динамика воронки по дням" style={{ marginBottom: 24 }}>
				<LineChart data={mockFunnelTrendData} smooth />
			</Card>

			{/* Таблица по товарам */}
			<Card title="Воронка по товарам">
				<Table
					columns={columns}
					dataSource={mockProductFunnelData}
					scroll={{ x: 1100 }}
					pagination={{
						pageSize: 10,
						showSizeChanger: true,
						showTotal: (total) => `Всего: ${total} товаров`,
					}}
				/>
			</Card>
		</div>
	);
};
