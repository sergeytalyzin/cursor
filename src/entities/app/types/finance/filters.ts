export interface FinanceCashFlowFilters {
	date: {
		from: string; // ISO date-time
		to: string; // ISO date-time
	};
	page: number;
	page_size: number;
	with_details?: boolean;
}
