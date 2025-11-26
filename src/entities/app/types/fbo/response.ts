export interface FboPostingListResponse {
	result: FboPosting[];
}

/** ====== вложенные сущности ====== */

export type CurrencyCode = 'RUB' | 'BYN' | 'KZT' | 'EUR' | 'USD' | 'CNY';

export type FboAvailableAction =
	| 'arbitration'
	| 'awaiting_delivery'
	| 'can_create_chat'
	| 'cancel'
	| 'click_track_number'
	| 'customer_phone_available'
	| 'has_weight_products'
	| 'hide_region_and_city'
	| 'invoice_get'
	| 'invoice_send'
	| 'invoice_update'
	| 'label_download_big'
	| 'label_download_small'
	| 'label_download'
	| 'non_int_delivered'
	| 'non_int_delivering'
	| 'non_int_last_mile'
	| 'product_cancel'
	| 'set_cutoff'
	| 'set_timeslot'
	| 'set_track_number'
	| 'ship_async_in_process'
	| 'ship_async_retry'
	| 'ship_async'
	| 'ship_with_additional_info'
	| 'ship'
	| 'update_cis';

export interface FboBarcodes {
	lower_barcode?: string;
	upper_barcode?: string;
	[k: string]: unknown;
}

export type CancellationInitiator =
	| 'Продавец'
	| 'Клиент'
	| 'покупатель'
	| 'Ozon'
	| 'Система'
	| 'Служба доставки';

export type CancellationType = 'seller' | 'client' | 'customer' | 'ozon' | 'system' | 'delivery';

export interface FboCancellation {
	affect_cancellation_rating?: boolean;
	cancel_reason?: string;
	cancel_reason_id?: number;
	cancellation_initiator?: CancellationInitiator;
	cancellation_type?: CancellationType;
	cancelled_after_ship?: boolean;
	[k: string]: unknown;
}

export interface FboCustomerAddress {
	address?: {
		address_tail?: string;
		city?: string;
		comment?: string;
		country?: string;
		district?: string;
		latitude?: number;
		longitude?: number;
		provider_pvz_code?: string;
		pvz_code?: number;
		region?: string;
		zip_code?: string;
		[k: string]: unknown;
	};
	[k: string]: unknown;
}

export interface FboCustomer extends FboCustomerAddress {
	customer_id?: number;
	name?: string;
	phone?: string; // всегда "" (подменный номер через другой метод)
	[k: string]: unknown;
}

export interface FboAddressee {
	name?: string;
	phone?: string;
	[k: string]: unknown;
}

export interface FboDeliveryMethod {
	[k: string]: unknown;
}

export interface FboLegalInfo {
	company_name?: string;
	inn?: string;
	kpp?: string;
	[k: string]: unknown;
}

export interface FboProduct {
	name: string;
	offer_id: string;
	price: string; // строкой
	quantity: number;
	sku: number;
	currency_code?: CurrencyCode;
	is_blr_traceable?: boolean;
	is_marketplace_buyout?: boolean;
	imei?: string[];
	prr_option?: 'lift' | 'stairs' | 'none' | 'delivery_default';
	quantum_id?: number;
	[k: string]: unknown;
}

export interface FboRequirements {
	products_requiring_change_country?: string[]; // SKU[]
	products_requiring_gtd?: string[]; // SKU[]
	products_requiring_country?: string[]; // SKU[]
	products_requiring_mandatory_mark?: string[]; // SKU[]
	products_requiring_jw_uin?: string[];
	products_requiring_rnpt?: string[];
	products_requiring_weight?: string[];
	products_requiring_imei?: string[];
	[k: string]: unknown;
}

export type TplIntegrationType =
	| 'ozon'
	| '3pl_tracking'
	| 'non_integrated'
	| 'aggregator'
	| 'hybryd';

export interface FboTariffication {
	current_tariff_rate?: number;
	current_tariff_type?: string; // discount/surcharge и т.д.
	current_tariff_charge?: string;
	current_tariff_charge_currency_code?: CurrencyCode;

	next_tariff_rate?: number;
	next_tariff_type?: string;
	next_tariff_charge?: string;
	next_tariff_starts_at?: string; // ISO
	next_tariff_charge_currency_code?: CurrencyCode;

	[k: string]: unknown;
}

/** ====== основной объект отправления ====== */

type FboPostingStatus =
	| 'acceptance_in_progress'
	| 'arbitration'
	| 'awaiting_approve'
	| 'awaiting_deliver'
	| 'awaiting_packaging'
	| 'awaiting_registration'
	| 'awaiting_verification'
	| 'cancelled'
	| 'cancelled_from_split_pending'
	| 'client_arbitration'
	| 'delivering'
	| 'delivered'
	| 'driver_pickup'
	| 'not_accepted';

export type FboPostingSubstatus =
	| 'posting_acceptance_in_progress'
	| 'posting_in_arbitration'
	| 'posting_created'
	| 'posting_in_carriage'
	| 'posting_not_in_carriage'
	| 'posting_registered'
	| 'posting_transferring_to_delivery' // для разных status
	| 'posting_awaiting_passport_data'
	| 'posting_awaiting_registration'
	| 'posting_registration_error'
	| 'posting_split_pending'
	| 'posting_canceled'
	| 'posting_in_client_arbitration'
	| 'posting_delivered'
	| 'posting_received'
	| 'posting_conditionally_delivered'
	| 'posting_in_courier_service'
	| 'posting_in_pickup_point'
	| 'posting_on_way_to_city'
	| 'posting_on_way_to_pickup_point'
	| 'posting_returned_to_warehouse'
	| 'posting_transferred_to_courier_service'
	| 'posting_driver_pick_up'
	| 'posting_not_in_sort_center';

export interface FboPosting {
	posting_number: string;
	order_id: number;
	order_number?: string;
	parent_posting_number?: string;

	status: FboPostingStatus;
	substatus?: FboPostingSubstatus;

	created_at?: string; // ISO
	in_process_at?: string; // ISO
	delivering_date?: string; // ISO

	shipment_date?: string; // ISO
	shipment_date_without_delay?: string; // ISO

	available_actions?: FboAvailableAction[];

	barcodes?: FboBarcodes;
	cancellation?: FboCancellation;

	customer?: FboCustomer;
	addressee?: FboAddressee;

	delivery_method?: FboDeliveryMethod;
	is_express?: boolean;
	is_multibox?: boolean;
	multi_box_qty?: number;

	legal_info?: FboLegalInfo;

	products: FboProduct[];
	optional?: Record<string, unknown>;
	products_with_possible_mandatory_mark?: unknown[];

	cluster_from?: string;
	cluster_to?: string;

	analytics_data?: Record<string, unknown>;
	financial_data?: any;

	requirements?: FboRequirements;

	tpl_integration_type?: TplIntegrationType;
	tracking_number?: string;

	tariffication?: FboTariffication;

	[k: string]: unknown;
}
