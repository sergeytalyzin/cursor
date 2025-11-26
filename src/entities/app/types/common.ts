export type SkuStats = {
	sku: number;
	name: string;
	price: number;
	totalOrders: number;
	cancelled: number;
	delivered: number;
	delivering: number;
	totalQuantity: number;
	warehouses: string[];
};
