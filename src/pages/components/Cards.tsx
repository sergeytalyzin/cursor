import { Card, Statistic, Tag, Flex, Space, Typography, Divider } from 'antd';
import {
	ShoppingOutlined,
	CheckCircleOutlined,
	StopOutlined,
	CarOutlined,
} from '@ant-design/icons';
import React from 'react';
import type { SkuStats } from '../../entities/app/types/common.ts';

const { Title, Text } = Typography;

type Props = {
	data?: Record<number, SkuStats>;
};

export const SkuStatsWidget: React.FC<Props> = ({ data }) => {
	const items = data ? Object.values(data) : [];

	return (
		<div
			style={{
				maxWidth: 1600,
				margin: '0 auto',
				padding: '24px 16px',
				display: 'flex',
				flexDirection: 'column',
				gap: 16,
			}}
		>
			{items.map((item) => (
				<Card
					key={item.sku}
					style={{
						width: '100%',
						borderRadius: 20,
						background: 'linear-gradient(145deg, #f9f9fb, #ececf3)',
						boxShadow:
							'inset 1px 1px 2px #fff, inset -1px -1px 2px rgba(0,0,0,0.05), 4px 4px 15px rgba(0,0,0,0.08)',
					}}
					hoverable
				>
					<Flex justify="space-between" align="start" wrap="wrap" gap={12}>
						{/* Левая часть: инфо */}
						<Space direction="vertical" size={4}>
							<Title level={5} style={{ margin: 0 }}>
								{item.name}
							</Title>
							<Text type="secondary">SKU: {item.sku}</Text>
							<Divider style={{ margin: '8px 0' }} />
							<Flex gap={24}>
								<Statistic
									title="Цена"
									value={item.price}
									prefix="₽"
									valueStyle={{ fontSize: 20 }}
								/>
								<Statistic
									title="Количество"
									value={item.totalQuantity}
									prefix={<ShoppingOutlined />}
									valueStyle={{ fontSize: 20 }}
								/>
							</Flex>
						</Space>

						{/* Правая часть: метрики */}
						<Flex gap={32}>
							<Statistic
								title="Всего заказов"
								value={item.totalOrders}
								prefix={<ShoppingOutlined />}
								valueStyle={{ fontSize: 20 }}
							/>
							<Statistic
								title="Доставлено"
								value={item.delivered}
								prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
								valueStyle={{ fontSize: 20 }}
							/>
							<Statistic
								title="Отменено"
								value={item.cancelled}
								prefix={<StopOutlined style={{ color: '#ff4d4f' }} />}
								valueStyle={{ fontSize: 20 }}
							/>
							<Statistic
								title="В пути"
								value={item.delivering}
								prefix={<CarOutlined style={{ color: '#1677ff' }} />}
								valueStyle={{ fontSize: 20 }}
							/>
						</Flex>
					</Flex>

					<Divider style={{ margin: '12px 0' }} />

					<Text type="secondary">Склады:</Text>
					<Flex wrap="wrap" gap={6} style={{ marginTop: 4 }}>
						{item.warehouses.map((w) => (
							<Tag key={w} color="blue" style={{ borderRadius: 12 }}>
								{w}
							</Tag>
						))}
					</Flex>
				</Card>
			))}
		</div>
	);
};
