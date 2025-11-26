import axios, { AxiosError, type AxiosRequestConfig, type Method } from 'axios';

const $api = axios.create({
	withCredentials: true,
	baseURL: 'https://api-seller.ozon.ru',
});
$api.defaults.headers.get['Accept'] = 'application/json';
$api.defaults.headers.post['Accept'] = 'application/json';

axios.defaults.headers.get['Accept'] = 'application/json';
axios.defaults.headers.post['Accept'] = 'application/json';
axios.defaults.withCredentials = true;

export type UppercaseMethod = Extract<Method, Uppercase<Method>>;

export async function axiosRequest<T>({
	url,
	method,
	data,
	params,
	headers,
	responseType,
	showError = true,
	paramsSerializer,
}: {
	url: string;
	method: UppercaseMethod;
	data?: AxiosRequestConfig['data'];
	params?: AxiosRequestConfig['params'];
	headers?: AxiosRequestConfig['headers'];
	responseType?: AxiosRequestConfig['responseType'];
	paramsSerializer?: AxiosRequestConfig['paramsSerializer'];
	showError?: boolean;
	normalizePagination?: boolean;
}): Promise<{ data: T }> {
	try {
		const result = await $api({
			url,
			method,
			data,
			params,
			headers,
			paramsSerializer,
			responseType,
		});

		return { data: result.data };
	} catch (axiosError) {
		const err = axiosError as AxiosError;
		const error = {
			status: err.response?.status,
			data: err.response?.data || err.message,
		} as { status: number; data: { message: string } | string };

		if (showError) {
			console.log('error.data', error.data);
		}
		throw error;
	}
}
