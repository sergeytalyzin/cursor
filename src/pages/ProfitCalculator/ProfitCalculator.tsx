import React, { useState, useEffect } from 'react';
import { Row, Col, InputNumber, Typography, Divider, Space, Flex, Statistic } from 'antd';
import {
	DollarOutlined,
	PercentageOutlined,
	RiseOutlined,
	FallOutlined,
} from '@ant-design/icons';
import { Card } from '../../shared/components/Card/Card';
import './ProfitCalculator.css';

const { Title, Text } = Typography;

interface CalculatorData {
	// Входные данные
	costPrice: number; // Себестоимость
	chinaDollar: number; // Доставка по Китаю (CNY)
	cnyToRub: number; // Курс CNY -> RUB
	weight: number; // Вес товара (кг)
	pricePerKg: number; // Цена за кг из Китая
	russiaDelivery: number; // Доставка по России
	packaging: number; // Упаковка
	returnRate: number; // Процент возвратов
	sellingPrice: number; // Цена продажи

	// Константы (можно настраивать)
	taxRate: number; // Налог 7%
	ozonCommission: number; // Комиссия Ozon (%)
	acquiringCommission: number; // Эквайринг (%)
}

const initialData: CalculatorData = {
	costPrice: 1000,
	chinaDollar: 50,
	cnyToRub: 12.5,
	weight: 0.5,
	pricePerKg: 800,
	russiaDelivery: 150,
	packaging: 50,
	returnRate: 5,
	sellingPrice: 3000,
	taxRate: 7,
	ozonCommission: 15,
	acquiringCommission: 2,
};

export const ProfitCalculator: React.FC = () => {
	const [data, setData] = useState<CalculatorData>(initialData);
	const [results, setResults] = useState({
		totalCost: 0,
		revenue: 0,
		netProfit: 0,
		roi: 0,
		margin: 0,
	});

	const calculateProfit = () => {
		// Расчёт всех затрат
		const chinaDeliveryCost = data.chinaDollar * data.cnyToRub;
		const internationalDelivery = data.weight * data.pricePerKg;
		const totalDelivery = chinaDeliveryCost + internationalDelivery + data.russiaDelivery;

		const tax = (data.sellingPrice * data.taxRate) / 100;
		const ozonFee = (data.sellingPrice * data.ozonCommission) / 100;
		const acquiringFee = (data.sellingPrice * data.acquiringCommission) / 100;

		const returnCost = (data.costPrice + totalDelivery) * (data.returnRate / 100);

		const totalCost =
			data.costPrice +
			totalDelivery +
			data.packaging +
			tax +
			ozonFee +
			acquiringFee +
			returnCost;

		const revenue = data.sellingPrice;
		const netProfit = revenue - totalCost;
		const roi = ((netProfit / totalCost) * 100);
		const margin = ((netProfit / revenue) * 100);

		setResults({
			totalCost: Math.round(totalCost),
			revenue: Math.round(revenue),
			netProfit: Math.round(netProfit),
			roi: Math.round(roi * 10) / 10,
			margin: Math.round(margin * 10) / 10,
		});
	};

	useEffect(() => {
		calculateProfit();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data]);

	const handleChange = (field: keyof CalculatorData, value: number | null) => {
		setData((prev) => ({
			...prev,
			[field]: value || 0,
		}));
	};

	const FormField = ({
		label,
		field,
		suffix,
		prefix,
		min = 0,
	}: {
		label: string;
		field: keyof CalculatorData;
		suffix?: string;
		prefix?: string;
		min?: number;
	}) => (
		<div className="form-field">
			<Text type="secondary" className="field-label">
				{label}
			</Text>
			<InputNumber
				value={data[field]}
				onChange={(val) => handleChange(field, val)}
				min={min}
				style={{ width: '100%' }}
				size="large"
				suffix={suffix}
				prefix={prefix}
				formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
				parser={(value) => Number(value?.replace(/\s?/g, ''))}
			/>
		</div>
	);

	const isProfitable = results.netProfit > 0;

	return (
		<div className="profit-calculator fade-in">
			<Row gutter={[24, 24]}>
				{/* Левая колонка - форма ввода */}
				<Col xs={24} lg={14}>
					<Card title="Параметры расчёта" className="calculator-form">
						<Space direction="vertical" size="large" style={{ width: '100%' }}>
							<div>
								<Title level={5}>💰 Основные затраты</Title>
								<Row gutter={[16, 16]}>
									<Col span={12}>
										<FormField
											label="Себестоимость товара"
											field="costPrice"
											suffix="₽"
										/>
									</Col>
									<Col span={12}>
										<FormField
											label="Цена продажи"
											field="sellingPrice"
											suffix="₽"
										/>
									</Col>
								</Row>
							</div>

							<Divider style={{ margin: 0 }} />

							<div>
								<Title level={5}>🚚 Доставка</Title>
								<Row gutter={[16, 16]}>
									<Col span={12}>
										<FormField
											label="Доставка по Китаю (CNY)"
											field="chinaDollar"
											suffix="¥"
										/>
									</Col>
									<Col span={12}>
										<FormField
											label="Курс CNY → RUB"
											field="cnyToRub"
											suffix="₽"
										/>
									</Col>
									<Col span={12}>
										<FormField label="Вес товара (кг)" field="weight" suffix="кг" />
									</Col>
									<Col span={12}>
										<FormField
											label="Цена за кг из Китая"
											field="pricePerKg"
											suffix="₽"
										/>
									</Col>
									<Col span={12}>
										<FormField
											label="Доставка по России"
											field="russiaDelivery"
											suffix="₽"
										/>
									</Col>
									<Col span={12}>
										<FormField label="Упаковка" field="packaging" suffix="₽" />
									</Col>
								</Row>
							</div>

							<Divider style={{ margin: 0 }} />

							<div>
								<Title level={5}>📊 Комиссии и налоги</Title>
								<Row gutter={[16, 16]}>
									<Col span={12}>
										<FormField label="Налог" field="taxRate" suffix="%" />
									</Col>
									<Col span={12}>
										<FormField label="Комиссия Ozon" field="ozonCommission" suffix="%" />
									</Col>
									<Col span={12}>
										<FormField
											label="Комиссия эквайринга"
											field="acquiringCommission"
											suffix="%"
										/>
									</Col>
									<Col span={12}>
										<FormField label="Процент возвратов" field="returnRate" suffix="%" />
									</Col>
								</Row>
							</div>
						</Space>
					</Card>
				</Col>

				{/* Правая колонка - результаты */}
				<Col xs={24} lg={10}>
					<Space direction="vertical" size="middle" style={{ width: '100%' }}>
						{/* Основные показатели */}
						<Card
							className={`result-card ${isProfitable ? 'profitable' : 'unprofitable'}`}
						>
							<Flex vertical gap={16}>
								<div className="result-header">
									<Text type="secondary">Чистая прибыль</Text>
									<Statistic
										value={results.netProfit}
										precision={0}
										suffix=" ₽"
										valueStyle={{
											fontSize: 48,
											fontWeight: 700,
											color: isProfitable ? '#34C759' : '#FF3B30',
										}}
										prefix={
											isProfitable ? (
												<RiseOutlined style={{ fontSize: 40 }} />
											) : (
												<FallOutlined style={{ fontSize: 40 }} />
											)
										}
									/>
								</div>

								<Divider style={{ margin: 0 }} />

								<Row gutter={[16, 16]}>
									<Col span={12}>
										<div className="mini-stat">
											<Text type="secondary">ROI</Text>
											<Statistic
												value={results.roi}
												precision={1}
												suffix="%"
												valueStyle={{
													fontSize: 28,
													fontWeight: 600,
													color: results.roi > 100 ? '#34C759' : '#FF9500',
												}}
												prefix={<PercentageOutlined />}
											/>
										</div>
									</Col>
									<Col span={12}>
										<div className="mini-stat">
											<Text type="secondary">Маржинальность</Text>
											<Statistic
												value={results.margin}
												precision={1}
												suffix="%"
												valueStyle={{
													fontSize: 28,
													fontWeight: 600,
													color: results.margin > 30 ? '#34C759' : '#FF9500',
												}}
												prefix={<DollarOutlined />}
											/>
										</div>
									</Col>
								</Row>
							</Flex>
						</Card>

						{/* Детализация */}
						<Card title="📋 Детализация">
							<Space direction="vertical" size="middle" style={{ width: '100%' }}>
								<Flex justify="space-between">
									<Text type="secondary">Выручка</Text>
									<Text strong style={{ fontSize: 16 }}>
										{results.revenue.toLocaleString('ru-RU')} ₽
									</Text>
								</Flex>
								<Divider style={{ margin: 0 }} />
								<Flex justify="space-between">
									<Text type="secondary">Полная себестоимость</Text>
									<Text strong style={{ fontSize: 16, color: '#FF3B30' }}>
										{results.totalCost.toLocaleString('ru-RU')} ₽
									</Text>
								</Flex>
								<Divider style={{ margin: 0 }} />
								<Flex justify="space-between">
									<Text>Доставка по Китаю</Text>
									<Text>
										{Math.round(data.chinaDollar * data.cnyToRub).toLocaleString('ru-RU')}{' '}
										₽
									</Text>
								</Flex>
								<Flex justify="space-between">
									<Text>Доставка из Китая</Text>
									<Text>
										{Math.round(data.weight * data.pricePerKg).toLocaleString('ru-RU')} ₽
									</Text>
								</Flex>
								<Flex justify="space-between">
									<Text>Доставка по России</Text>
									<Text>{data.russiaDelivery.toLocaleString('ru-RU')} ₽</Text>
								</Flex>
								<Flex justify="space-between">
									<Text>Упаковка</Text>
									<Text>{data.packaging.toLocaleString('ru-RU')} ₽</Text>
								</Flex>
								<Flex justify="space-between">
									<Text>Комиссия Ozon ({data.ozonCommission}%)</Text>
									<Text>
										{Math.round((data.sellingPrice * data.ozonCommission) / 100).toLocaleString('ru-RU')} ₽
									</Text>
								</Flex>
								<Flex justify="space-between">
									<Text>Налог ({data.taxRate}%)</Text>
									<Text>
										{Math.round((data.sellingPrice * data.taxRate) / 100).toLocaleString('ru-RU')} ₽
									</Text>
								</Flex>
								<Flex justify="space-between">
									<Text>Эквайринг ({data.acquiringCommission}%)</Text>
									<Text>
										{Math.round((data.sellingPrice * data.acquiringCommission) / 100).toLocaleString('ru-RU')} ₽
									</Text>
								</Flex>
								<Flex justify="space-between">
									<Text>Возвраты ({data.returnRate}%)</Text>
									<Text>
										{Math.round((data.costPrice + data.weight * data.pricePerKg) * (data.returnRate / 100)).toLocaleString('ru-RU')} ₽
									</Text>
								</Flex>
							</Space>
						</Card>
					</Space>
				</Col>
			</Row>
		</div>
	);
};
