import { useEffect } from 'react';
import { ConfigProvider } from 'antd';
import { useThemeStore } from './shared/store/theme';
import { lightTheme, darkTheme } from './shared/styles/theme';
import { AppLayout } from './components/Layout/AppLayout';
import ruRU from 'antd/locale/ru_RU';
import 'dayjs/locale/ru';
import dayjs from 'dayjs';

dayjs.locale('ru');

function App() {
	const { theme } = useThemeStore();

	useEffect(() => {
		// Применяем класс к body для CSS переменных
		document.body.className = theme;
	}, [theme]);

	return (
		<ConfigProvider
			theme={theme === 'dark' ? darkTheme : lightTheme}
			locale={ruRU}
		>
			<AppLayout />
		</ConfigProvider>
	);
}

export default App;
