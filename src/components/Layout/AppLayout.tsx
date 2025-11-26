import React, { useState } from 'react';
import { Layout, Tabs, Switch, Flex, Typography } from 'antd';
import {
	BarChartOutlined,
	CalculatorOutlined,
	FunnelPlotOutlined,
	SunOutlined,
	MoonOutlined,
} from '@ant-design/icons';
import { useThemeStore } from '../../shared/store/theme';
import { SalesAnalytics } from '../../pages/SalesAnalytics/SalesAnalytics';
import { ProfitCalculator } from '../../pages/ProfitCalculator/ProfitCalculator';
import { SalesFunnel } from '../../pages/SalesFunnel/SalesFunnel';
import './AppLayout.css';

const { Header, Content } = Layout;
const { Title } = Typography;

type TabKey = 'analytics' | 'calculator' | 'funnel';

export const AppLayout: React.FC = () => {
	const [activeTab, setActiveTab] = useState<TabKey>('analytics');
	const { theme, toggleTheme } = useThemeStore();

	const tabs = [
		{
			key: 'analytics',
			label: (
				<span>
					<BarChartOutlined />
					Аналитика продаж
				</span>
			),
			children: <SalesAnalytics />,
		},
		{
			key: 'calculator',
			label: (
				<span>
					<CalculatorOutlined />
					Калькулятор прибыли
				</span>
			),
			children: <ProfitCalculator />,
		},
		{
			key: 'funnel',
			label: (
				<span>
					<FunnelPlotOutlined />
					Воронка продаж
				</span>
			),
			children: <SalesFunnel />,
		},
	];

	return (
		<Layout className="app-layout">
			<Header className="app-header">
				<div className="header-content">
					<Flex align="center" gap={12}>
						<div className="logo">
							<svg width="32" height="32" viewBox="0 0 32 32" fill="none">
								<rect width="32" height="32" rx="8" fill="url(#gradient)" />
								<path
									d="M16 8L22 12V20L16 24L10 20V12L16 8Z"
									fill="white"
									fillOpacity="0.9"
								/>
								<defs>
									<linearGradient
										id="gradient"
										x1="0"
										y1="0"
										x2="32"
										y2="32"
										gradientUnits="userSpaceOnUse"
									>
										<stop stopColor="#007AFF" />
										<stop offset="1" stopColor="#5856D6" />
									</linearGradient>
								</defs>
							</svg>
						</div>
						<Title level={3} className="app-title">
							Ozon Analytics
						</Title>
					</Flex>

					<Flex align="center" gap={12}>
						<Switch
							checked={theme === 'dark'}
							onChange={toggleTheme}
							checkedChildren={<MoonOutlined />}
							unCheckedChildren={<SunOutlined />}
							className="theme-switch"
						/>
					</Flex>
				</div>
			</Header>

			<div className="tabs-wrapper">
				<Tabs
					activeKey={activeTab}
					onChange={(key) => setActiveTab(key as TabKey)}
					items={tabs}
					className="app-tabs"
					centered
					size="large"
				/>
			</div>

			<Content className="app-content">
				{activeTab === 'analytics' && <SalesAnalytics />}
				{activeTab === 'calculator' && <ProfitCalculator />}
				{activeTab === 'funnel' && <SalesFunnel />}
			</Content>
		</Layout>
	);
};
