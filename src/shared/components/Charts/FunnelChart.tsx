import React from 'react';
import ReactECharts from 'echarts-for-react';
import { useThemeStore } from '../../store/theme';

interface FunnelChartProps {
	data: {
		name: string;
		value: number;
		conversion?: number;
	}[];
	height?: number;
}

export const FunnelChart: React.FC<FunnelChartProps> = ({ data, height = 400 }) => {
	const { theme } = useThemeStore();
	const isDark = theme === 'dark';

	const colors = ['#007AFF', '#34C759', '#FF9500', '#FF3B30', '#AF52DE'];

	const option = {
		backgroundColor: 'transparent',
		tooltip: {
			trigger: 'item',
			backgroundColor: isDark ? 'rgba(28, 28, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
			borderColor: isDark ? '#38383A' : '#E5E5EA',
			textStyle: {
				color: isDark ? '#FFFFFF' : '#1C1C1E',
			},
			padding: 12,
			borderRadius: 8,
			formatter: (params: any) => {
				const conversion = data[params.dataIndex].conversion;
				return `
					<div style="font-weight: 600; margin-bottom: 4px;">${params.name}</div>
					<div>${params.value.toLocaleString('ru-RU')}</div>
					${conversion !== undefined ? `<div style="color: #34C759; margin-top: 4px;">Конверсия: ${conversion}%</div>` : ''}
				`;
			},
		},
		series: [
			{
				type: 'funnel',
				left: '10%',
				top: 40,
				bottom: 40,
				width: '80%',
				min: 0,
				max: data[0]?.value || 100,
				minSize: '0%',
				maxSize: '100%',
				sort: 'descending',
				gap: 2,
				label: {
					show: true,
					position: 'inside',
					formatter: '{b}: {c}',
					color: '#fff',
					fontSize: 14,
					fontWeight: 600,
				},
				labelLine: {
					length: 10,
					lineStyle: {
						width: 1,
						type: 'solid',
					},
				},
				itemStyle: {
					borderColor: '#fff',
					borderWidth: 0,
				},
				emphasis: {
					label: {
						fontSize: 16,
					},
				},
				data: data.map((item, index) => ({
					value: item.value,
					name: item.name,
					itemStyle: {
						color: colors[index % colors.length],
					},
				})),
			},
		],
	};

	return <ReactECharts option={option} style={{ height }} />;
};
