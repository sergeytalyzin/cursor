// Направление сортировки
export type SortDir = 'asc' | 'desc';

// Полный перечень статусов из доки
export type FboPostingStatus =
	| 'awaiting_registration'
	| 'acceptance_in_progress'
	| 'awaiting_approve'
	| 'awaiting_packaging'
	| 'awaiting_deliver'
	| 'arbitration'
	| 'client_arbitration'
	| 'delivering'
	| 'driver_pickup'
	| 'delivered'
	| 'cancelled'
	| 'not_accepted'
	| 'sent_by_seller';

// Период последнего изменения статуса
export interface LastChangedStatusDate {
	from: string; // ISO UTC, e.g. 2025-09-01T00:00:00Z
	to: string; // ISO UTC
}

// WITH-поля (в доке список периодически расширяют, поэтому Partial<Record<...>>)
export type WithOptionsFields = 'financial_data' | 'analytics_data' | 'legal_info';

export type WithOptions = Partial<Record<WithOptionsFields, boolean>>;

// Фильтр
export interface FboPostingListFilter {
	since: string; // ISO UTC
	to: string; // ISO UTC

	// опциональные поля из доки
	order_id?: number;
	status?: FboPostingStatus;
	is_quantum?: boolean;

	delivery_method_id?: number[]; // int64[]
	provider_id?: number[]; // int64[]
	warehouse_id?: number[]; // int64[]

	last_changed_status_date?: LastChangedStatusDate;
}

// Тело запроса
export interface FboPostingListRequest {
	dir?: SortDir;
	filter: FboPostingListFilter;
	limit: number; // 1..1000
	offset: number; // >= 0
	with?: WithOptions;
}
