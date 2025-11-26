// entities/ozon/types/analytics.ts

/** ====== dimensions ====== */

// Базовые измерения (доступны всем)
export type AnalyticsDimensionCommon =
	| 'unknownDimension'
	| 'sku'
	| 'spu'
	| 'day'
	| 'week'
	| 'month';

// Premium Plus
export type AnalyticsDimensionPremiumPlus =
	| 'year'
	| 'category1'
	| 'category2'
	| 'category3'
	| 'category4'
	| 'brand'
	| 'modelID';

export type AnalyticsDimension = AnalyticsDimensionCommon | AnalyticsDimensionPremiumPlus;

/** ====== metrics ====== */

// Базовые метрики (доступны всем)
export type AnalyticsMetricCommon =
	| 'revenue' // заказано на сумму
	| 'ordered_units'; // заказано товаров

// Premium Plus
export type AnalyticsMetricPremiumPlus =
	| 'unknown_metric'
	| 'hits_view_search'
	| 'hits_view_pdp'
	| 'hits_view'
	| 'hits_tocart_search'
	| 'hits_tocart_pdp'
	| 'hits_tocart'
	| 'session_view_search'
	| 'session_view_pdp'
	| 'session_view'
	| 'conv_tocart_search'
	| 'conv_tocart_pdp'
	| 'conv_tocart'
	| 'returns'
	| 'cancellations'
	| 'delivered_units'
	| 'position_category';

export type AnalyticsMetric = AnalyticsMetricCommon | AnalyticsMetricPremiumPlus;

/** ====== filters / sort ====== */

export type AnalyticsFilterOp = 'EQ' | 'GT' | 'GTE' | 'LT' | 'LTE';

export interface AnalyticsFilter {
	/** Любой атрибут из dimension или metric (кроме brand) */
	key: AnalyticsDimension | AnalyticsMetric | string;
	op?: AnalyticsFilterOp; // по умолчанию EQ
	value: string;
}

export type SortDir = 'ASC' | 'DESC';

export interface AnalyticsSort {
	/** Любой атрибут из dimension или metric (кроме brand) */
	key: AnalyticsDimension | AnalyticsMetric | string;
	order: SortDir;
}

/** ====== request ====== */

export interface AnalyticsDataRequest {
	/** ISO-дата: включительно. Без Premium — не старше 3 месяцев */
	date_from: string; // 'YYYY-MM-DD'
	/** ISO-дата: включительно */
	date_to: string; // 'YYYY-MM-DD'

	/** Группировки (1..n) */
	dimension: AnalyticsDimension[];

	/** Метрики (1..14) */
	metrics: AnalyticsMetric[];

	/** Опционально: фильтры */
	filters?: AnalyticsFilter[];

	/** Сортировки (опц.) */
	sort?: AnalyticsSort[];

	/** Пагинация */
	limit: number; // 1..1000
	offset?: number; // >= 0
}
