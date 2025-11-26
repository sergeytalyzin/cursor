import { Card, Flex, Statistic, Typography, Divider, Spin } from 'antd';
import {
	ArrowDownOutlined,
	ArrowUpOutlined,
	ShoppingOutlined,
	WalletOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useFinanceCashFlow } from '../../entities/app/api';

const { Text, Title } = Typography;

export const FinanceCashFlowWidget = () => {
	const { data, isLoading } = useFinanceCashFlow(
		{
			date: { from: '2025-09-22T00:00:00Z', to: '2025-10-26T00:00:00Z' },
			page: 1,
			page_size: 10,
			with_details: false,
		},
		'3088921',
		'c2b734ef-870d-45b5-a975-dc61e723ed9e',
	);
	const list = data?.result?.cash_flows || [];

	return (
		<Spin spinning={isLoading}>
			<div
				style={{
					maxWidth: 1600,
					margin: '0 auto',
					display: 'flex',
					flexDirection: 'column',
					gap: 16,
					paddingBottom: 40,
				}}
			>
				{list.map((item, idx) => {
					const begin = dayjs(item.period.begin).format('DD MMM');
					const end = dayjs(item.period.end).format('DD MMM');
					const revenue =
						item.orders_amount +
						item.returns_amount +
						item.commission_amount +
						item.services_amount +
						item.item_delivery_and_return_amount;

					return (
						<Card
							key={idx}
							style={{
								width: '100%',
								borderRadius: 20,
								background: 'rgba(255,255,255,0.6)',
								backdropFilter: 'blur(25px) saturate(180%)',
								WebkitBackdropFilter: 'blur(25px) saturate(180%)',
								border: '1px solid rgba(255,255,255,0.35)',
								boxShadow:
									'0 10px 25px rgba(150, 180, 255, 0.25), inset 0 0 20px rgba(255,255,255,0.5)',
								padding: '16px 20px',
							}}
						>
							<Flex justify="space-between" align="center" wrap="wrap">
								<Flex vertical>
									<Title level={5} style={{ marginBottom: 0 }}>
										Период: {begin} — {end}
									</Title>
									<Text type="secondary">Валюта: {item.currency_code}</Text>
								</Flex>

								<Statistic
									title="Итог за неделю"
									value={revenue.toFixed(2)}
									prefix={
										revenue >= 0 ? (
											<ArrowUpOutlined style={{ color: '#52c41a' }} />
										) : (
											<ArrowDownOutlined style={{ color: '#ff4d4f' }} />
										)
									}
									suffix="₽"
									valueStyle={{
										fontSize: 24,
										fontWeight: 600,
										color: revenue >= 0 ? '#52c41a' : '#ff4d4f',
									}}
								/>
							</Flex>

							<Divider style={{ margin: '12px 0' }} />

							<Flex justify="space-between" wrap="wrap" gap={16}>
								<Statistic
									title="Продажи"
									value={item.orders_amount}
									prefix={<ShoppingOutlined />}
									suffix="₽"
									valueStyle={{ color: '#1677ff', fontSize: 18 }}
								/>
								<Statistic
									title="Возвраты"
									value={item.returns_amount}
									prefix={<ArrowDownOutlined />}
									suffix="₽"
									valueStyle={{ color: '#ff4d4f', fontSize: 18 }}
								/>
								<Statistic
									title="Комиссия"
									value={item.commission_amount}
									prefix={<WalletOutlined />}
									suffix="₽"
									valueStyle={{ color: '#faad14', fontSize: 18 }}
								/>
								<Statistic
									title="Услуги"
									value={item.services_amount}
									suffix="₽"
									valueStyle={{ color: '#faad14', fontSize: 18 }}
								/>
								<Statistic
									title="Логистика"
									value={item.item_delivery_and_return_amount}
									suffix="₽"
									valueStyle={{ color: '#722ed1', fontSize: 18 }}
								/>
							</Flex>
						</Card>
					);
				})}
			</div>
		</Spin>
	);
};
