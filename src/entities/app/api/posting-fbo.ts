import { useQuery } from '@tanstack/react-query';
import { axiosRequest } from '../../../shared/config/axios';
import { getOzonHeaders } from '../lib';
import type { FboPosting, FboPostingListResponse, FboPostingListRequest } from '../types/fbo';
import type { SkuStats } from '../types/common.ts';

export function aggregateOrdersBySku(result: FboPosting[]) {
	const map: Record<number, any> = {};

	for (const order of result) {
		for (const product of order.products) {
			const sku = product.sku;

			if (!map[sku]) {
				map[sku] = {
					sku,
					name: product.name,
					price: Number(product.price),
					totalOrders: 0,
					totalQuantity: 0,
					cancelled: 0,
					delivered: 0,
					delivering: 0,
					warehouses: new Set<string>(),
				};
			}

			const item = map[sku];
			item.totalOrders += 1;
			item.totalQuantity += product.quantity;
			item.price = Number(product.price);
			item.warehouses.add(order.analytics_data?.warehouse_name);

			switch (order.status) {
				case 'cancelled':
					item.cancelled += 1;
					break;
				case 'delivered':
					item.delivered += 1;
					break;
				case 'delivering':
					item.delivering += 1;
					break;
			}
		}
	}

	// преобразуем множества складов в массивы
	for (const sku in map) {
		map[sku].warehouses = Array.from(map[sku].warehouses);
	}

	return map;
}

// FBO postings за период
export function useFboPostings(filter: FboPostingListRequest, clientId?: string, apiKey?: string) {
	return useQuery({
		enabled: !!clientId && !!apiKey,
		queryKey: ['/v2/posting/fbo/list', filter],
		queryFn: async () => {
			const headers = getOzonHeaders(clientId!, apiKey!);
			const { data } = await axiosRequest<FboPostingListResponse>({
				url: '/v2/posting/fbo/list',
				method: 'POST',
				headers,
				data: {
					...filter,
				},
			});
			return aggregateOrdersBySku(data.result) as SkuStats;
		},
	});
}
// FBO postings за период
export function useFboPostings2(filter: FboPostingListRequest, clientId?: string, apiKey?: string) {
	return useQuery({
		enabled: !!clientId && !!apiKey,
		queryKey: ['/v2/posting/fbo/list2', filter],
		queryFn: async () => {
			const headers = getOzonHeaders(clientId!, apiKey!);
			const { data } = await axiosRequest<FboPostingListResponse>({
				url: '/v2/posting/fbo/list',
				method: 'POST',
				headers,
				data: {
					...filter,
				},
			});
			return data.result;
		},
	});
}
export const useFinanceTransactions = (body: any, clientId?: string, apiKey?: string) =>
	useQuery({
		enabled: !!clientId && !!apiKey,
		queryKey: ['/v3/finance/transaction/list', body],
		queryFn: async () => {
			const headers = getOzonHeaders(clientId!, apiKey!);
			const { data } = await axiosRequest<any>({
				url: '/v3/finance/transaction/list',
				method: 'POST',
				headers,
				data: body,
			});
			return data;
		},
	});
