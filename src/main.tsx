import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import './shared/styles/global.css';

const client = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: 1,
			staleTime: 5 * 60 * 1000, // 5 минут
		},
	},
});

createRoot(document.getElementById('root')!).render(
	<QueryClientProvider client={client}>
		<App />
	</QueryClientProvider>,
);
