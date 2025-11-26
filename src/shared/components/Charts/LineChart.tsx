import React from 'react';
import ReactECharts from 'echarts-for-react';
import { useThemeStore } from '../../store/theme';

interface LineChartProps {
	data: {
		labels: string[];
		series: {
			name: string;
			data: number[];
			color?: string;
		}[];
	};
	height?: number;
	smooth?: boolean;
	area?: boolean;
}

export const LineChart: React.FC<LineChartProps> = ({ 
	data, 
	height = 350,
	smooth = true,
	area = false,
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
		xAxis: {
			type: 'category',
			boundaryGap: false,
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
		yAxis: {
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
			type: 'line',
			smooth: smooth,
			data: s.data,
			itemStyle: {
				color: s.color || '#007AFF',
			},
			lineStyle: {
				width: 3,
			},
			areaStyle: area ? {
				color: {
					type: 'linear',
					x: 0,
					y: 0,
					x2: 0,
					y2: 1,
					colorStops: [
						{
							offset: 0,
							color: s.color ? `${s.color}40` : 'rgba(0, 122, 255, 0.25)',
						},
						{
							offset: 1,
							color: s.color ? `${s.color}00` : 'rgba(0, 122, 255, 0)',
						},
					],
				},
			} : undefined,
			emphasis: {
				focus: 'series',
			},
		})),
	};

	return <ReactECharts option={option} style={{ height }} />;
};
