import { useQuery } from '@tanstack/react-query';
import { axiosRequest } from '../../../shared/config/axios';
import { getOzonHeaders } from '../lib';
import type { FinanceCashFlowFilters, FinanceCashFlowResponse } from '../types/finance';
/** /v1/finance/cash-flow-statement/list */
export function useFinanceCashFlow(
	filters: FinanceCashFlowFilters,
	clientId?: string,
	apiKey?: string,
) {
	return useQuery({
		enabled: !!clientId && !!apiKey,
		queryKey: ['/v1/finance/cash-flow-statement/list', filters],
		queryFn: async (): Promise<FinanceCashFlowResponse> => {
			const headers = getOzonHeaders(clientId!, apiKey!);
			const { data } = await axiosRequest<FinanceCashFlowResponse>({
				url: '/v1/finance/cash-flow-statement/list',
				method: 'POST',
				headers,
				data: filters,
			});
			return data;
		},
	});
}
