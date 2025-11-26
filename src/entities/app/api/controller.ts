import { axiosRequest } from '../../../shared/config/axios.ts';
import { useQuery } from '@tanstack/react-query';
import { getOzonHeaders } from '../lib';

// const RestKey = {
// 	listProducts: '/v3/product/list',
// 	infoStocks: '/v4/product/info/stocks',
// 	financeRealization: '/v2/finance/realization',
// } as const;

export function useGetProduct(clientId?: string, apiKey?: string) {
	return useQuery({
		queryKey: ['/v3/product/list'],
		queryFn: async () => {
			const headers = getOzonHeaders(clientId!, apiKey!);
			const body: any = {
				filter: { visibility: 'ALL' },
				limit: 100,
			};
			const { data } = await axiosRequest<{ result: any }>({
				url: '/v3/product/list',
				method: 'POST',
				headers,
				data: body,
			});
			return data.result as {
				items: Array<{
					product_id: number | string;
				}>;
			};
		},
	});
}

export function useGetProduct2(clientId?: string, apiKey?: string) {
	const { data: arr } = useGetProduct(clientId, apiKey);
	const ids = arr?.items.map((it) => it.product_id);
	return useQuery({
		enabled: !!ids?.length,
		queryKey: ['/v3/product/info/list'],
		queryFn: async () => {
			const headers = getOzonHeaders(clientId!, apiKey!);
			const body: any = {
				product_id: ids,
			};
			const { data } = await axiosRequest<{ result: any }>({
				url: '/v3/product/info/list',
				method: 'POST',
				headers,
				data: body,
			});
			return data;
		},
	});
}
export function useFbsPostings(
	clientId?: string,
	apiKey?: string,
	body?: any, // { filter: { date_from, date_to, statuses:[] }, limit, offset }
) {
	return useQuery({
		enabled: !!clientId && !!apiKey,
		queryKey: ['/v3/posting/fbs/list', body],
		queryFn: async () => {
			const headers = getOzonHeaders(clientId!, apiKey!);
			const { data } = await axiosRequest({
				url: '/v3/posting/fbs/list',
				method: 'POST',
				headers,
				data: {
					limit: 1000,
					offset: 0,
					filter: {
						since: '2025-09-01T14:15:22Z',
						to: '2025-10-21T14:15:22Z',
					},
				},
			});
			return data;
		},
	});
}
