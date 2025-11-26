import { Card, Flex, Statistic, Typography } from 'antd';
import { DollarOutlined, ShoppingOutlined } from '@ant-design/icons';
import { useAnalyticsData } from '../../entities/app/api';

const { Title } = Typography;

export const AnalyticsSummary = () => {
	const { data } = useAnalyticsData(undefined, '3088921', 'c2b734ef-870d-45b5-a975-dc61e723ed9e');
	if (!data?.result?.totals) return null;

	const [revenue, orders] = data.result.totals;

	return (
		<Card
			style={{
				width: '100%',
				maxWidth: 1600,
				margin: '0 auto 24px',
				borderRadius: 20,
				background: 'rgba(255, 255, 255, 0.6)',
				backdropFilter: 'blur(25px) saturate(180%)',
				WebkitBackdropFilter: 'blur(25px) saturate(180%)',
				border: '1px solid rgba(255, 255, 255, 0.35)',
				boxShadow: '0 10px 25px rgba(150, 180, 255, 0.25), inset 0 0 20px rgba(255, 255, 255, 0.5)',
			}}
		>
			<Flex justify="space-between" align="center" wrap="wrap" style={{ padding: '12px 8px' }}>
				<Title
					level={4}
					style={{
						margin: 0,
						color: '#2b2b2d',
						fontWeight: 500,
						letterSpacing: 0.5,
					}}
				>
					📊 Общая статистика продаж
				</Title>

				<Flex gap={48} align="center">
					<Statistic
						title="Выручка"
						value={revenue}
						prefix={<DollarOutlined />}
						valueStyle={{ fontSize: 28, fontWeight: 600, color: '#1677ff' }}
						suffix="₽"
					/>
					<Statistic
						title="Продано товаров"
						value={orders}
						prefix={<ShoppingOutlined />}
						valueStyle={{ fontSize: 28, fontWeight: 600, color: '#52c41a' }}
						suffix="шт"
					/>
				</Flex>
			</Flex>
		</Card>
	);
};
