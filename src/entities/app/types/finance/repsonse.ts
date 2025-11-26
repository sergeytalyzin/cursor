/* ---------------- Периоды ---------------- */
export interface FinanceCashFlowPeriod {
	id: number;
	begin: string; // ISO date-time
	end: string; // ISO date-time
}

/* ---------------- Общие элементы для вложенных списков ---------------- */
export interface FinanceServiceItem {
	name: string;
	price: number;
}

/* ---------------- Детализированные разделы ---------------- */
export interface FinanceDelivery {
	total: number;
	amount: number;
	delivery_services: {
		total: number;
		items: FinanceServiceItem[];
	};
}

export interface FinanceReturn {
	total: number;
	amount: number;
	return_services: {
		total: number;
		items: FinanceServiceItem[];
	};
}

export interface FinanceRfbs {
	total: number;
	transfer_delivery: number;
	transfer_delivery_return: number;
	compensation_delivery_return: number;
	partial_compensation: number;
	partial_compensation_return: number;
}

export interface FinanceServices {
	total: number;
	items: FinanceServiceItem[];
}

export interface FinanceOthers {
	total: number;
	items: FinanceServiceItem[];
}

/* ---------------- Детали ---------------- */
export interface FinanceCashFlowDetails {
	period: FinanceCashFlowPeriod;
	payments: {
		payment: number;
		currency_code: string;
	}[];
	begin_balance_amount: number;
	delivery: FinanceDelivery;
	return: FinanceReturn;
	loan: number;
	invoice_transfer: number;
	rfbs: FinanceRfbs;
	services: FinanceServices;
	others: FinanceOthers;
	end_balance_amount: number;
}

/* ---------------- Основной блок ---------------- */
export interface FinanceCashFlowItem {
	period: FinanceCashFlowPeriod;
	orders_amount: number;
	returns_amount: number;
	commission_amount: number;
	services_amount: number;
	item_delivery_and_return_amount: number;
	currency_code: string;
}

/* ---------------- Общий ответ ---------------- */
export interface FinanceCashFlowResult {
	cash_flows: FinanceCashFlowItem[];
	details: FinanceCashFlowDetails;
	page_count: number;
}

export interface FinanceCashFlowResponse {
	result: FinanceCashFlowResult;
}
