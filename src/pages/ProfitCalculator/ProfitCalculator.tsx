import React, { useState, useEffect } from 'react';
import { Row, Col, InputNumber, Typography, Divider, Space, Flex, Statistic } from 'antd';
import {
	DollarOutlined,
	PercentageOutlined,
} from '@ant-design/icons';
import { Card } from '../../shared/components/Card/Card';
import './ProfitCalculator.css';

const { Title, Text } = Typography;

interface CalculatorData {
	// Входные данные
	purchasePrice: number; // Закупочная цена товара
	chinaDelivery: number; // Доставка из Китая (за единицу)
	russiaDelivery: number; // Доставка по России (за единицу)
	packaging: number; // Упаковка
	
	// Налоги и комиссии (в рублях или процентах)
	taxAmount: number; // Налог (фиксированная сумма на товар)
	ozonCommission: number; // Комиссия Ozon (%)
	acquiringCommission: number; // Эквайринг (%)
	
	// Прочие расходы
	otherExpenses: number; // Прочие расходы
	returnRate: number; // Процент возвратов
	
	// Желаемая прибыль
	desiredProfit: number; // Желаемая прибыль на единицу товара
}

const initialData: CalculatorData = {
	purchasePrice: 1000,
	chinaDelivery: 800,
	russiaDelivery: 150,
	packaging: 50,
	taxAmount: 70,
	ozonCommission: 15,
	acquiringCommission: 2,
	otherExpenses: 0,
	returnRate: 5,
	desiredProfit: 500,
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
		// Шаг 1: Базовая себестоимость (без комиссий от цены продажи)
		const baseDelivery = data.chinaDelivery + data.russiaDelivery;
		const baseCost = 
			data.purchasePrice + 
			baseDelivery + 
			data.packaging + 
			data.taxAmount + 
			data.otherExpenses;

		// Шаг 2: Учёт возвратов (увеличивает себестоимость)
		const returnCost = baseCost * (data.returnRate / 100);
		const costWithReturns = baseCost + returnCost;

		// Шаг 3: Цена продажи = Себестоимость + Желаемая прибыль
		// Но нужно учесть комиссии Ozon и эквайринг, которые берутся от цены продажи
		// Формула: ЦенаПродажи = (СебестоимостьСВозвратами + ЖелаемаяПрибыль) / (1 - КомиссияOzon/100 - Эквайринг/100)
		const commissionRate = (data.ozonCommission + data.acquiringCommission) / 100;
		const sellingPriceBeforeCommissions = costWithReturns + data.desiredProfit;
		const sellingPrice = sellingPriceBeforeCommissions / (1 - commissionRate);

		// Шаг 4: Рассчитываем реальные комиссии от цены продажи
		const ozonFee = (sellingPrice * data.ozonCommission) / 100;
		const acquiringFee = (sellingPrice * data.acquiringCommission) / 100;

		// Шаг 5: Полная себестоимость (включая комиссии)
		const totalCost = costWithReturns + ozonFee + acquiringFee;

		// Шаг 6: Чистая прибыль
		const netProfit = sellingPrice - totalCost;

		// Шаг 7: Метрики
		const roi = ((netProfit / totalCost) * 100);
		const margin = ((netProfit / sellingPrice) * 100);

		setResults({
			totalCost: Math.round(totalCost),
			revenue: Math.round(sellingPrice),
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

	return (
		<div className="profit-calculator fade-in">
			<Row gutter={[24, 24]}>
				{/* Левая колонка - форма ввода */}
				<Col xs={24} lg={14}>
					<Card title="Параметры расчёта" className="calculator-form">
						<Space direction="vertical" size="large" style={{ width: '100%' }}>
							<div>
								<Title level={5}>🛒 Закупка товара</Title>
								<Row gutter={[16, 16]}>
									<Col span={24}>
										<FormField
											label="Закупочная цена товара"
											field="purchasePrice"
											suffix="₽"
										/>
									</Col>
								</Row>
							</div>

							<Divider style={{ margin: 0 }} />

							<div>
								<Title level={5}>🚚 Доставка и упаковка</Title>
								<Row gutter={[16, 16]}>
									<Col span={12}>
										<FormField
											label="Доставка из Китая"
											field="chinaDelivery"
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
									<Col span={12}>
										<FormField
											label="Прочие расходы"
											field="otherExpenses"
											suffix="₽"
										/>
									</Col>
								</Row>
							</div>

							<Divider style={{ margin: 0 }} />

							<div>
								<Title level={5}>📊 Налоги и комиссии</Title>
								<Row gutter={[16, 16]}>
									<Col span={12}>
										<FormField label="Налог на товар" field="taxAmount" suffix="₽" />
									</Col>
									<Col span={12}>
										<FormField label="Процент возвратов" field="returnRate" suffix="%" />
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
								</Row>
							</div>

							<Divider style={{ margin: 0 }} />

							<div>
								<Title level={5}>💎 Желаемая прибыль</Title>
								<Row gutter={[16, 16]}>
									<Col span={24}>
										<FormField
											label="Желаемая прибыль на единицу товара"
											field="desiredProfit"
											suffix="₽"
										/>
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
						<Card className="result-card">
							<Flex vertical gap={16}>
								<div className="result-header">
									<Text type="secondary">Себестоимость товара</Text>
									<Statistic
										value={results.totalCost}
										precision={0}
										suffix=" ₽"
										valueStyle={{
											fontSize: 48,
											fontWeight: 700,
											color: '#FF3B30',
										}}
										prefix={<DollarOutlined style={{ fontSize: 40 }} />}
									/>
									<div style={{ marginTop: 16, padding: '12px', background: 'rgba(0, 122, 255, 0.08)', borderRadius: 8 }}>
										<Flex justify="space-between" align="center">
											<Text>+ Желаемая прибыль</Text>
											<Text strong style={{ fontSize: 18, color: '#34C759' }}>
												{data.desiredProfit.toLocaleString('ru-RU')} ₽
											</Text>
										</Flex>
										<Divider style={{ margin: '8px 0' }} />
										<Flex justify="space-between" align="center">
											<Text strong>= Продавать за</Text>
											<Text strong style={{ fontSize: 24, color: '#007AFF' }}>
												{results.revenue.toLocaleString('ru-RU')} ₽
											</Text>
										</Flex>
									</div>
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
						<Card title="📋 Детализация расчёта">
							<Space direction="vertical" size="middle" style={{ width: '100%' }}>
								<div style={{ background: 'rgba(0, 122, 255, 0.08)', padding: '12px', borderRadius: 8 }}>
									<Flex justify="space-between">
										<Text strong>Рекомендуемая цена продажи</Text>
										<Text strong style={{ fontSize: 18, color: '#007AFF' }}>
											{results.revenue.toLocaleString('ru-RU')} ₽
										</Text>
									</Flex>
								</div>
								
								<Divider style={{ margin: 0 }} />
								
								<Text type="secondary" strong>Из них:</Text>
								
								<Flex justify="space-between">
									<Text>Закупочная цена</Text>
									<Text>{data.purchasePrice.toLocaleString('ru-RU')} ₽</Text>
								</Flex>
								
								<Flex justify="space-between">
									<Text>Доставка из Китая</Text>
									<Text>{data.chinaDelivery.toLocaleString('ru-RU')} ₽</Text>
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
									<Text>Налог</Text>
									<Text>{data.taxAmount.toLocaleString('ru-RU')} ₽</Text>
								</Flex>
								
								{data.otherExpenses > 0 && (
									<Flex justify="space-between">
										<Text>Прочие расходы</Text>
										<Text>{data.otherExpenses.toLocaleString('ru-RU')} ₽</Text>
									</Flex>
								)}
								
								<Flex justify="space-between">
									<Text>Комиссия Ozon ({data.ozonCommission}%)</Text>
									<Text>
										{Math.round((results.revenue * data.ozonCommission) / 100).toLocaleString('ru-RU')} ₽
									</Text>
								</Flex>
								
								<Flex justify="space-between">
									<Text>Эквайринг ({data.acquiringCommission}%)</Text>
									<Text>
										{Math.round((results.revenue * data.acquiringCommission) / 100).toLocaleString('ru-RU')} ₽
									</Text>
								</Flex>
								
								<Flex justify="space-between">
									<Text>Возвраты ({data.returnRate}%)</Text>
									<Text>
										{Math.round((data.purchasePrice + data.chinaDelivery + data.russiaDelivery + data.packaging + data.taxAmount + data.otherExpenses) * (data.returnRate / 100)).toLocaleString('ru-RU')} ₽
									</Text>
								</Flex>
								
								<Divider style={{ margin: 0 }} />
								
								<Flex justify="space-between">
									<Text strong style={{ color: '#FF3B30' }}>Полная себестоимость</Text>
									<Text strong style={{ fontSize: 16, color: '#FF3B30' }}>
										{results.totalCost.toLocaleString('ru-RU')} ₽
									</Text>
								</Flex>
								
								<Flex justify="space-between">
									<Text strong style={{ color: '#34C759' }}>Желаемая прибыль</Text>
									<Text strong style={{ fontSize: 16, color: '#34C759' }}>
										{data.desiredProfit.toLocaleString('ru-RU')} ₽
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
