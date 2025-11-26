import React from 'react';
import { Statistic, Flex, Typography } from 'antd';
import { Card } from '../Card/Card';
import type { StatisticProps } from 'antd';
import './KPIBlock.css';

const { Text } = Typography;

interface KPIBlockProps extends Omit<StatisticProps, 'title'> {
	title: string;
	trend?: number;
	trendText?: string;
	icon?: React.ReactNode;
	loading?: boolean;
}

export const KPIBlock: React.FC<KPIBlockProps> = ({
	title,
	trend,
	trendText,
	icon,
	loading = false,
	...statisticProps
}) => {
	const getTrendColor = () => {
		if (!trend) return undefined;
		return trend > 0 ? '#34C759' : '#FF3B30';
	};

	return (
		<Card className="kpi-block" loading={loading}>
			<Flex vertical gap={8}>
				<Flex justify="space-between" align="center">
					<Text type="secondary" className="kpi-title">
						{title}
					</Text>
					{icon && <span className="kpi-icon">{icon}</span>}
				</Flex>
				
				<Statistic
					{...statisticProps}
					valueStyle={{
						fontSize: 32,
						fontWeight: 600,
						lineHeight: 1.2,
						...statisticProps.valueStyle,
					}}
				/>

				{(trend !== undefined || trendText) && (
					<Flex align="center" gap={4}>
						{trend !== undefined && (
							<Text
								style={{
									color: getTrendColor(),
									fontSize: 14,
									fontWeight: 500,
								}}
							>
								{trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
							</Text>
						)}
						{trendText && (
							<Text type="secondary" style={{ fontSize: 12 }}>
								{trendText}
							</Text>
						)}
					</Flex>
				)}
			</Flex>
		</Card>
	);
};
