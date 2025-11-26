import React from 'react';
import ReactECharts from 'echarts-for-react';
import { useThemeStore } from '../../store/theme';

interface BarChartProps {
	data: {
		labels: string[];
		series: {
			name: string;
			data: number[];
			color?: string;
		}[];
	};
	height?: number;
	horizontal?: boolean;
}

export const BarChart: React.FC<BarChartProps> = ({ 
	data, 
	height = 350,
	horizontal = false,
}) => {
	const { theme } = useThemeStore();
	const isDark = theme === 'dark';

	const option = {
		backgroundColor: 'transparent',
		tooltip: {
			trigger: 'axis',
			backgroundColor: isDark ? 'rgba(28, 28, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
			borderColor: isDark ? '#38383A' : '#E5E5EA',
			textStyle: {
				color: isDark ? '#FFFFFF' : '#1C1C1E',
			},
			padding: 12,
			borderRadius: 8,
			axisPointer: {
				type: 'shadow',
			},
		},
		legend: {
			show: data.series.length > 1,
			top: 0,
			textStyle: {
				color: isDark ? '#FFFFFF' : '#1C1C1E',
			},
		},
		grid: {
			left: '3%',
			right: '4%',
			bottom: '3%',
			top: data.series.length > 1 ? '15%' : '5%',
			containLabel: true,
		},
		[horizontal ? 'yAxis' : 'xAxis']: {
			type: 'category',
			data: data.labels,
			axisLine: {
				lineStyle: {
					color: isDark ? '#38383A' : '#E5E5EA',
				},
			},
			axisLabel: {
				color: isDark ? '#98989D' : '#8E8E93',
			},
		},
		[horizontal ? 'xAxis' : 'yAxis']: {
			type: 'value',
			splitLine: {
				lineStyle: {
					color: isDark ? '#38383A' : '#E5E5EA',
					type: 'dashed',
				},
			},
			axisLabel: {
				color: isDark ? '#98989D' : '#8E8E93',
			},
		},
		series: data.series.map((s) => ({
			name: s.name,
			type: 'bar',
			data: s.data,
			itemStyle: {
				color: s.color || '#007AFF',
				borderRadius: [8, 8, 0, 0],
			},
			emphasis: {
				focus: 'series',
			},
			barMaxWidth: 50,
		})),
	};

	return <ReactECharts option={option} style={{ height }} />;
};
