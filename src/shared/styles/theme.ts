import type { ThemeConfig } from 'antd';

export const lightTheme: ThemeConfig = {
	token: {
		colorPrimary: '#007AFF',
		colorSuccess: '#34C759',
		colorWarning: '#FF9500',
		colorError: '#FF3B30',
		colorInfo: '#007AFF',
		borderRadius: 12,
		fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
		fontSize: 14,
		colorBgContainer: '#FFFFFF',
		colorBgElevated: '#FFFFFF',
		colorBorder: '#E5E5EA',
		colorText: '#1C1C1E',
		colorTextSecondary: '#8E8E93',
		boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
		boxShadowSecondary: '0 4px 16px rgba(0, 0, 0, 0.08)',
	},
	components: {
		Card: {
			borderRadiusLG: 16,
			boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
			paddingLG: 24,
		},
		Button: {
			borderRadius: 10,
			controlHeight: 40,
			fontWeight: 500,
		},
		Input: {
			borderRadius: 10,
			controlHeight: 40,
		},
		Select: {
			borderRadius: 10,
			controlHeight: 40,
		},
		Table: {
			borderRadius: 12,
			headerBg: '#F9F9F9',
		},
		Tabs: {
			itemActiveColor: '#007AFF',
			itemHoverColor: '#007AFF',
			inkBarColor: '#007AFF',
		},
	},
};

export const darkTheme: ThemeConfig = {
	token: {
		colorPrimary: '#0A84FF',
		colorSuccess: '#32D74B',
		colorWarning: '#FF9F0A',
		colorError: '#FF453A',
		colorInfo: '#0A84FF',
		borderRadius: 12,
		fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
		fontSize: 14,
		colorBgContainer: '#1C1C1E',
		colorBgElevated: '#2C2C2E',
		colorBorder: '#38383A',
		colorText: '#FFFFFF',
		colorTextSecondary: '#98989D',
		boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
		boxShadowSecondary: '0 4px 16px rgba(0, 0, 0, 0.4)',
	},
	components: {
		Card: {
			borderRadiusLG: 16,
			boxShadow: '0 2px 12px rgba(0, 0, 0, 0.3)',
			paddingLG: 24,
		},
		Button: {
			borderRadius: 10,
			controlHeight: 40,
			fontWeight: 500,
		},
		Input: {
			borderRadius: 10,
			controlHeight: 40,
		},
		Select: {
			borderRadius: 10,
			controlHeight: 40,
		},
		Table: {
			borderRadius: 12,
			headerBg: '#2C2C2E',
		},
		Tabs: {
			itemActiveColor: '#0A84FF',
			itemHoverColor: '#0A84FF',
			inkBarColor: '#0A84FF',
		},
	},
};
