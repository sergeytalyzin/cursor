import React, { useState } from 'react';
import { Row, Col, DatePicker, Table, Space, Typography, Flex, Tag } from 'antd';
import {
	DollarOutlined,
	ShoppingOutlined,
	RiseOutlined,
	PercentageOutlined,
} from '@ant-design/icons';
import { Card } from '../../shared/components/Card/Card';
import { KPIBlock } from '../../shared/components/KPIBlock/KPIBlock';
import { LineChart } from '../../shared/components/Charts/LineChart';
import { BarChart } from '../../shared/components/Charts/BarChart';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import './SalesAnalytics.css';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

// Моковые данные для демонстрации
const mockSalesData = {
	labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
	series: [
		{
			name: 'Выручка',
			data: [45000, 52000, 48000, 61000, 58000, 72000, 65000],
			color: '#007AFF',
		},
	],
};

const mockOrdersData = {
	labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
	series: [
		{
			name: 'Заказы',
			data: [145, 182, 167, 203, 189, 241, 218],
			color: '#34C759',
		},
	],
};

const mockSkuData = [
	{
		key: '1',
		sku: 'SKU-001',
		name: 'Наушники Bluetooth TWS',
		orders: 156,
		revenue: 234000,
		conversion: 3.2,
		stock: 845,
		warehouse: 'Москва',
	},
	{
		key: '2',
		sku: 'SKU-002',
		name: 'Умные часы Sport Edition',
		orders: 98,
		revenue: 490000,
		conversion: 2.8,
		stock: 234,
		warehouse: 'СПб',
	},
	{
		key: '3',
		sku: 'SKU-003',
		name: 'Портативная колонка',
		orders: 203,
		revenue: 304500,
		conversion: 4.1,
		stock: 567,
		warehouse: 'Москва',
	},
	{
		key: '4',
		sku: 'SKU-004',
		name: 'Беспроводная зарядка',
		orders: 145,
		revenue: 145000,
		conversion: 3.5,
		stock: 1203,
		warehouse: 'Екатеринбург',
	},
	{
		key: '5',
		sku: 'SKU-005',
		name: 'Чехол для телефона',
		orders: 567,
		revenue: 113400,
		conversion: 5.8,
		stock: 2345,
		warehouse: 'Москва',
	},
];

const mockWarehouseData = {
	labels: ['Москва', 'СПб', 'Екатеринбург', 'Казань', 'Новосибирск'],
	series: [
		{
			name: 'Заказы',
			data: [543, 321, 234, 187, 145],
			color: '#FF9500',
		},
	],
};

export const SalesAnalytics: React.FC = () => {
	const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
		dayjs().subtract(7, 'days'),
		dayjs(),
	]);

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
			width: 280,
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
			title: 'Выручка',
			dataIndex: 'revenue',
			key: 'revenue',
			width: 120,
			sorter: (a: any, b: any) => a.revenue - b.revenue,
			render: (val: number) => (
				<Text strong style={{ color: '#007AFF' }}>
					{val.toLocaleString('ru-RU')} ₽
				</Text>
			),
		},
		{
			title: 'Конверсия',
			dataIndex: 'conversion',
			key: 'conversion',
			width: 120,
			sorter: (a: any, b: any) => a.conversion - b.conversion,
			render: (val: number) => (
				<Tag color={val > 4 ? 'success' : val > 2.5 ? 'warning' : 'default'}>
					{val}%
				</Tag>
			),
		},
		{
			title: 'Остаток',
			dataIndex: 'stock',
			key: 'stock',
			width: 100,
			render: (val: number) => val.toLocaleString('ru-RU'),
		},
		{
			title: 'Склад',
			dataIndex: 'warehouse',
			key: 'warehouse',
			width: 140,
			filters: [
				{ text: 'Москва', value: 'Москва' },
				{ text: 'СПб', value: 'СПб' },
				{ text: 'Екатеринбург', value: 'Екатеринбург' },
			],
			onFilter: (value: any, record: any) => record.warehouse === value,
		},
	];

	return (
		<div className="sales-analytics fade-in">
			{/* KPI блоки */}
			<Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
				<Col xs={24} sm={12} lg={6}>
					<KPIBlock
						title="Выручка"
						value={1373500}
						precision={0}
						suffix=" ₽"
						trend={12.5}
						trendText="vs прошлая неделя"
						icon={<DollarOutlined />}
						valueStyle={{ color: '#007AFF' }}
					/>
				</Col>
				<Col xs={24} sm={12} lg={6}>
					<KPIBlock
						title="Заказы"
						value={1169}
						precision={0}
						trend={8.3}
						trendText="vs прошлая неделя"
						icon={<ShoppingOutlined />}
						valueStyle={{ color: '#34C759' }}
					/>
				</Col>
				<Col xs={24} sm={12} lg={6}>
					<KPIBlock
						title="Средний чек"
						value={1175}
						precision={0}
						suffix=" ₽"
						trend={3.7}
						trendText="vs прошлая неделя"
						icon={<RiseOutlined />}
						valueStyle={{ color: '#FF9500' }}
					/>
				</Col>
				<Col xs={24} sm={12} lg={6}>
					<KPIBlock
						title="ROI"
						value={287}
						precision={0}
						suffix="%"
						trend={-2.1}
						trendText="vs прошлая неделя"
						icon={<PercentageOutlined />}
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

			{/* Графики продаж */}
			<Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
				<Col xs={24} lg={12}>
					<Card title="Выручка по дням">
						<LineChart data={mockSalesData} smooth area />
					</Card>
				</Col>
				<Col xs={24} lg={12}>
					<Card title="Заказы по дням">
						<LineChart data={mockOrdersData} smooth area />
					</Card>
				</Col>
			</Row>

			{/* График по складам */}
			<Card title="Статистика по складам" style={{ marginBottom: 24 }}>
				<BarChart data={mockWarehouseData} />
			</Card>

			{/* Таблица продаж по SKU */}
			<Card title="Продажи по товарам">
				<Table
					columns={columns}
					dataSource={mockSkuData}
					scroll={{ x: 1000 }}
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
