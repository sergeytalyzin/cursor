import './App.css';
import { useFboPostings } from './entities/app/api';
import { SkuStatsWidget } from './pages/components/Cards.tsx';
import { AnalyticsSummary } from './pages/components/AnalyticsSummary.tsx';
import { FinanceCashFlowWidget } from './pages/components/FinanceCashFlowWidget.tsx';

import 'dayjs/locale/ru';
import dayjs from 'dayjs';
import ProfitTable from './pages/components/Profit.tsx';
dayjs.locale('ru');

function App() {
	const { data: order } = useFboPostings(
		{
			offset: 0,
			limit: 1000,
			filter: {
				since: '2025-10-01T00:00:00Z',
				to: '2025-10-27T23:59:59Z',
			},
			with: { analytics_data: true, financial_data: true, legal_info: true },
		},
		'3088921',
		'c2b734ef-870d-45b5-a975-dc61e723ed9e',
	);
	console.log('order', order);
	return (
		<>
			<ProfitTable />
			<AnalyticsSummary />
			<div className="app-background">{order && <SkuStatsWidget data={order} />}</div>
			<FinanceCashFlowWidget />
		</>
	);
}

export default App;
