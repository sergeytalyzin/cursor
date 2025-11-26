// entities/ozon/api/analytics.ts
import { useQuery } from '@tanstack/react-query';
import { axiosRequest } from '../../../shared/config/axios';
import { getOzonHeaders } from '../lib';
import type { AnalyticsDataRequest, AnalyticsDataResponse } from '../types/analytics';

const initial: AnalyticsDataRequest = {
	date_from: '2025-09-23',
	date_to: '2025-10-23',
	dimension: ['day'],
	metrics: ['revenue', 'ordered_units'],
	limit: 1000,
};

/** /v1/analytics/data */
export function useAnalyticsData(
	request?: AnalyticsDataRequest,
	clientId?: string,
	apiKey?: string,
) {
	return useQuery({
		enabled: !!clientId && !!apiKey,
		queryKey: ['/v1/analytics/data', request],
		queryFn: async (): Promise<AnalyticsDataResponse> => {
			const headers = getOzonHeaders(clientId!, apiKey!);
			const { data } = await axiosRequest<AnalyticsDataResponse>({
				url: '/v1/analytics/data',
				method: 'POST',
				headers,
				data: initial,
			});
			return data;
		},
	});
}
