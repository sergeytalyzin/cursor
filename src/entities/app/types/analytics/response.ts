// entities/ozon/types/analytics.ts (добавь к файлу с request)

// ===== Response =====

/** Элемент значения измерения в строке ответа */
export interface AnalyticsDimensionValue {
	/** Обычно ID sku/spu/brand/... или дата/неделя/месяц и т.п. в строковом представлении */
	id: string;
	/** Человекочитаемое имя/лейбл значения */
	name: string;
	[k: string]: unknown;
}

/** Строка данных отчёта.
 * ВАЖНО: порядок items в `dimensions` соответствует порядку, переданному в request.dimension.
 * Порядок чисел в `metrics` соответствует порядку, переданному в request.metrics.
 */
export interface AnalyticsDataRow {
	dimensions: AnalyticsDimensionValue[];
	metrics: number[]; // <double>[]
	[k: string]: unknown;
}

/** Тело результата */
export interface AnalyticsDataResult {
	data: AnalyticsDataRow[]; // строки отчёта
	totals: number[]; // агрегаты по всем строкам; порядок = request.metrics
	timestamp: string; // ISO время формирования отчёта
	[k: string]: unknown;
}

/** Корневой ответ */
export interface AnalyticsDataResponse {
	result: AnalyticsDataResult;
}
