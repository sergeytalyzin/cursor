import { Table, InputNumber, Space, Tag } from 'antd';
import { useMemo, useState } from 'react';
import { useFboPostings2, useFinanceTransactions } from '../../entities/app/api';

type Row = {
	sku: number;
	name: string;
	quantity: number;
	price: number;
	discount: number;
	commission: number;
	payout: number;
	logistics: number;
	acquiring: number;
	other: number;
	totalOrders?: number;
	delivered: number;
	cancelled: number;
	delivering: number;
	totalCost?: number;
	profit?: number;
	margin?: string;
};

const ProfitTable = () => {
	const { data: postings } = useFboPostings2(
		{
			offset: 0,
			limit: 1000,
			filter: {
				since: '2025-10-01T00:00:00Z',
				to: '2025-10-27T23:59:59Z',
			},
			with: { analytics_data: true, financial_data: true },
		},
		'3088921',
		'c2b734ef-870d-45b5-a975-dc61e723ed9e',
	);
	console.log('postings', postings);
	const { data: finance } = useFinanceTransactions(
		{
			filter: {
				date: { from: '2025-10-25T00:00:00Z', to: '2025-10-29T23:59:59Z' },
				transaction_type: 'all',
			},
			page: 1,
			page_size: 1000,
		},
		'3088921',
		'c2b734ef-870d-45b5-a975-dc61e723ed9e',
	);
	const [costs, setCosts] = useState<Record<number, number>>({});
	const [expenses, setExpenses] = useState<Record<number, number>>({});

	const rows = useMemo<Row[]>(() => {
		if (!postings || !finance) return [];

		const skuMap = new Map<number, Row>();

		for (const p of postings) {
			const finProducts = p.financial_data?.products || [];
			const status = p.status;
			for (const prod of finProducts) {
				const sku = Number(prod.product_id);
				const name = p.products.find((x) => x.sku === sku)?.name || 'Без названия';

				if (!skuMap.has(sku)) {
					skuMap.set(sku, {
						sku,
						name,
						quantity: 0,
						price: 0, //Цена товара с учётом акций, кроме акций за счёт Ozon
						discount: 0,
						commission: 0,
						payout: 0, // Выплата продавцу
						logistics: 0,
						acquiring: 0,
						other: 0,
						totalOrders: 0,
						delivered: 0,
						cancelled: 0,
						delivering: 0,
					});
				}

				const agg = skuMap.get(sku)!;
				agg.quantity += prod.quantity ?? 1;
				agg.price = Number(prod.price ?? 0);
				agg.discount += Number(prod.total_discount_value ?? 0);
				agg.commission += Math.abs(Number(prod.commission_amount ?? 0));
				agg.payout += Number(prod.payout ?? 0);

				if (status && status === 'delivered') agg.delivered += 1;
				if (status === 'delivering') agg.delivering += 1;
				if (status === 'cancelled') agg.cancelled += 1;
			}
		}

		return Array.from(skuMap.values());
	}, [postings, finance]);

	const tableData = rows.map((r) => {
		const cost = costs[r.sku] || 0;
		const totalCost = cost * r.quantity;
		const profit = r.payout - totalCost;
		return { ...r, totalCost, profit };
	});

	const columns = [
		{ title: 'SKU', dataIndex: 'sku', width: 150 },
		{ title: 'Товар', dataIndex: 'name', width: 200, ellipsis: true },
		{ title: 'Кол-во', dataIndex: 'quantity', width: 70 },
		{
			title: 'Цена товара с учётом акций, кроме акций за счёт Ozon',
			dataIndex: 'price',
			render: (v: number) => v.toFixed(0),
			width: 200,
		},
		{
			title: 'Скидка за выбранный период ₽',
			dataIndex: 'discount',
			render: (v: number) => v.toFixed(0),
			width: 200,
		},
		{
			title: 'Комиссия  за выбранный период ₽',
			dataIndex: 'commission',
			render: (v: number) => v.toFixed(0),
			width: 200,
		},
		{ title: 'Прочие ₽', dataIndex: 'other', render: (v: number) => v.toFixed(0), width: 200 },
		{
			title: 'Выплата продавцу ₽',
			dataIndex: 'payout',
			render: (v: number) => v.toFixed(0),
			width: 200,
		},
		{
			title: 'Статусы',
			key: 'statuses',
			render: (_: any, r: Row) => (
				<Space size="small" wrap>
					<Tag color="green">доставлено {r.delivered}</Tag>
					<Tag color="blue">доставляется {r.delivering}</Tag>
					<Tag color="red">отменено {r.cancelled}</Tag>
				</Space>
			),
			width: 280,
		},
		{
			title: 'Себестоимость ₽/шт',
			dataIndex: 'cost',
			render: (_: any, record: Row) => (
				<InputNumber
					min={0}
					value={costs[record.sku] || 0}
					onChange={(v) => setCosts((p) => ({ ...p, [record.sku]: Number(v) || 0 }))}
					size="small"
				/>
			),
			width: 130,
		},
		{
			title: 'Прочие расходы ₽',
			dataIndex: 'extra',
			render: (_: any, record: Row) => (
				<InputNumber
					min={0}
					value={expenses[record.sku] || 0}
					onChange={(v) => setExpenses((p) => ({ ...p, [record.sku]: Number(v) || 0 }))}
					size="small"
				/>
			),
			width: 150,
		},
		{
			title: 'Чистая прибыль ₽',
			dataIndex: 'profit',
			render: (v: number) => (
				<b style={{ color: v >= 0 ? 'limegreen' : 'crimson' }}>{v.toFixed(0)}</b>
			),
			fixed: 'right' as const,
			width: 130,
		},
	];

	return (
		<div style={{ padding: 24 }}>
			<h2>📊 Аналитика прибыли за 29.09–29.10.2025</h2>
			<Table
				rowKey="sku"
				columns={columns}
				dataSource={tableData}
				pagination={false}
				bordered
				size="small"
				scroll={{ x: 1400 }}
			/>
			<p style={{ marginTop: 8, color: '#999' }}>
				* Значения совпадают с Excel (чистыми без рекламы), т.к. учтены все расходы: логистика,
				эквайринг, комиссии и ручные вводы себестоимости и доп. расходов.
			</p>
		</div>
	);
};
export default ProfitTable;

//
// import { Table, InputNumber, Tag, Space } from 'antd';
// import { useMemo, useState } from 'react';
// import { useFboPostings2 } from '../../entities/app/api';
//
// type Row = {
// 	sku: number;
// 	name: string;
// 	// агрегаты
// 	quantity: number;           // суммарно по SKU
// 	price: number;              // суммарная выручка = Σ price*qty
// 	discount: number;           // Σ discount
// 	commission: number;         // Σ commission
// 	payout: number;             // Σ payout
// 	returns: number;            // Σ returns (пока 0 — см. комментарий)
// 	// статусы
// 	totalOrders: number;
// 	delivered: number;
// 	cancelled: number;
// 	delivering: number;
// 	warehouses: string[];       // уникальные склады
// 	// вводимые поля
// 	cost?: number;              // себестоимость за единицу (ручной ввод)
// 	extra?: number;             // прочие расходы за весь объём (ручной ввод)
// 	// расчётные
// 	profit?: number;
// 	margin?: string;
// };
//
// const ProfitTable = () => {
// 	// 📦 Получаем заказы за период
// 	const { data: orders } = useFboPostings2(
// 		{
// 			offset: 0,
// 			limit: 1000,
// 			filter: {
// 				since: '2025-10-01T00:00:00Z',
// 				to: '2025-10-27T23:59:59Z',
// 			},
// 			with: { analytics_data: true, financial_data: true, legal_info: true },
// 		},
// 		'3088921',
// 		'c2b734ef-870d-45b5-a975-dc61e723ed9e'
// 	);
//
// 	// 💾 состояния себестоимости и расходов по SKU
// 	const [costs, setCosts] = useState<Record<number, number>>({});
// 	const [expenses, setExpenses] = useState<Record<number, number>>({});
//
// 	// 📊 Агрегируем данные по каждому SKU
// 	const rows = useMemo<Row[]>(() => {
// 		if (!orders) return [];
//
// 		// sku -> агрегат
// 		const map = new Map<number, {
// 			sku: number;
// 			name: string;
// 			quantity: number;
// 			price: number;
// 			discount: number;
// 			commission: number;
// 			payout: number;
// 			returns: number;
// 			totalOrders: number;
// 			delivered: number;
// 			cancelled: number;
// 			delivering: number;
// 			warehouses: Set<string>;
// 		}>();
//
// 		for (const posting of orders) {
// 			const status = posting.status as 'delivered' | 'cancelled' | 'delivering' | string;
//
// 			// ⚠️ финансы матчим по product_id (он = SKU в твоих данных)
// 			const finProducts: Array<any> = (posting.financial_data?.products as Array<any>) || [];
// 			const finByProductId = new Map<number, any>();
// 			for (const fp of finProducts) {
// 				if (fp && typeof fp.product_id === 'number') {
// 					finByProductId.set(fp.product_id, fp);
// 				}
// 			}
//
// 			const products = posting.products || [];
// 			for (const p of products) {
// 				const sku = Number(p.sku);
// 				const name = p.name;
// 				const qty = Number(p.quantity ?? 1);
//
// 				// найдём финансы этой позиции по product_id = sku
// 				const f = finByProductId.get(sku) || {};
// 				const unitPrice = Number(f.price ?? p.price ?? 0);
// 				const payout = Number(f.payout ?? 0);
// 				const commission = Math.abs(Number(f.commission_amount ?? 0));
// 				const discount = Number(f.total_discount_value ?? 0);
// 				// Возвраты в /posting* отсутствуют; корректно через /v3/finance/transaction/list
// 				const returns = Number(f.returns ?? 0);
//
// 				if (!map.has(sku)) {
// 					map.set(sku, {
// 						sku,
// 						name,
// 						quantity: 0,
// 						price: 0,
// 						discount: 0,
// 						commission: 0,
// 						payout: 0,
// 						returns: 0,
// 						totalOrders: 0,
// 						delivered: 0,
// 						cancelled: 0,
// 						delivering: 0,
// 						warehouses: new Set<string>(),
// 					});
// 				}
// 				const agg = map.get(sku)!;
//
// 				// суммы
// 				agg.quantity += qty;
// 				agg.price += unitPrice * qty; // выручка
// 				agg.discount += discount;
// 				agg.commission += commission;
// 				agg.payout += payout;
// 				agg.returns += returns;
//
// 				// статусы (считаем по каждому товару в отгрузке — как в твоём примере)
// 				agg.totalOrders += 1;
// 				if (status === 'delivered') agg.delivered += 1;
// 				else if (status === 'cancelled') agg.cancelled += 1;
// 				else if (status === 'delivering') agg.delivering += 1;
//
// 				const w = posting.analytics_data?.warehouse_name;
// 				if (w) agg.warehouses.add(w);
// 			}
// 		}
//
// 		// преобразуем Set складов в массив
// 		const out: Row[] = [];
// 		for (const [, v] of map) {
// 			out.push({
// 				sku: v.sku,
// 				name: v.name,
// 				quantity: v.quantity,
// 				price: v.price,
// 				discount: v.discount,
// 				commission: v.commission,
// 				payout: v.payout,
// 				returns: v.returns,
// 				totalOrders: v.totalOrders,
// 				delivered: v.delivered,
// 				cancelled: v.cancelled,
// 				delivering: v.delivering,
// 				warehouses: Array.from(v.warehouses),
// 			});
// 		}
// 		return out;
// 	}, [orders]);
//
// 	// 💰 добавляем пользовательские поля и считаем прибыль/маржу
// 	const tableData: Row[] = rows.map((row) => {
// 		const costPerUnit = costs[row.sku] || 0;
// 		const extra = expenses[row.sku] || 0; // за весь объём
// 		const totalCost = costPerUnit * row.quantity;
// 		const profit = row.payout - totalCost - extra;
// 		const revenue = row.price;
// 		const margin = revenue ? ((profit / revenue) * 100).toFixed(1) : '0';
// 		return { ...row, cost: costPerUnit, extra, profit, margin };
// 	});
//
// 	const columns = [
// 		{ title: 'SKU', dataIndex: 'sku', width: 100 },
// 		{ title: 'Название', dataIndex: 'name', ellipsis: true },
// 		{ title: 'Кол-во', dataIndex: 'quantity', width: 80 },
// 		{ title: 'Выручка ₽', dataIndex: 'price', render: (v: number) => v.toFixed(2) },
// 		{ title: 'Скидка ₽', dataIndex: 'discount', render: (v: number) => v.toFixed(2) },
// 		{ title: 'Комиссия ₽', dataIndex: 'commission', render: (v: number) => v.toFixed(2) },
// 		{ title: 'Возвраты ₽*', dataIndex: 'returns', render: (v: number) => v.toFixed(2) },
// 		{ title: 'Выплата ₽', dataIndex: 'payout', render: (v: number) => v.toFixed(2) },
//
// 		// статусы
// 		{
// 			title: 'Статусы',
// 			key: 'statuses',
// 			render: (_: any, r: Row) => (
// 				<Space size="small" wrap>
// 					<Tag color="green">delivered {r.delivered}</Tag>
// 					<Tag color="blue">delivering {r.delivering}</Tag>
// 					<Tag color="red">cancelled {r.cancelled}</Tag>
// 					<Tag>orders {r.totalOrders}</Tag>
// 				</Space>
// 			),
// 			width: 280,
// 		},
//
// 		// склады
// 		{
// 			title: 'Склады',
// 			dataIndex: 'warehouses',
// 			render: (ws: string[]) => (
// 				<Space size="small" wrap>
// 					{ws.map((w) => (
// 						<Tag key={w}>{w}</Tag>
// 					))}
// 				</Space>
// 			),
// 		},
//
// 		// вводимые поля
// 		{
// 			title: 'Себестоимость /шт ₽',
// 			dataIndex: 'cost',
// 			render: (_: any, record: Row) => (
// 				<InputNumber
// 					min={0}
// 					value={record.cost ?? 0}
// 					onChange={(v) =>
// 						setCosts((prev) => ({ ...prev, [record.sku]: Number(v) || 0 }))
// 					}
// 					size="small"
// 				/>
// 			),
// 			width: 150,
// 		},
// 		{
// 			title: 'Прочие расходы (всего) ₽',
// 			dataIndex: 'extra',
// 			render: (_: any, record: Row) => (
// 				<InputNumber
// 					min={0}
// 					value={record.extra ?? 0}
// 					onChange={(v) =>
// 						setExpenses((prev) => ({ ...prev, [record.sku]: Number(v) || 0 }))
// 					}
// 					size="small"
// 				/>
// 			),
// 			width: 190,
// 		},
//
// 		// расчётные
// 		{
// 			title: 'Чистая прибыль ₽',
// 			dataIndex: 'profit',
// 			render: (v: number) => (
// 				<b style={{ color: v >= 0 ? 'limegreen' : 'crimson' }}>{v.toFixed(2)}</b>
// 			),
// 			fixed: 'right' as const,
// 			width: 150,
// 		},
// 		{
// 			title: 'Маржа (%)',
// 			dataIndex: 'margin',
// 			render: (v: string) => (
// 				<span style={{ color: Number(v) >= 0 ? 'limegreen' : 'crimson' }}>{v}%</span>
// 			),
// 			fixed: 'right' as const,
// 			width: 110,
// 		},
// 	];
//
// 	return (
// 		<div style={{ padding: 24 }}>
// 			<h2>📊 Таблица расчёта чистой прибыли (FBO)</h2>
// 			<Table
// 				rowKey="sku"
// 				columns={columns}
// 				dataSource={tableData}
// 				pagination={false}
// 				bordered
// 				size="small"
// 				scroll={{ x: 1200 }}
// 			/>
// 			<p style={{ marginTop: 8, color: '#888' }}>
// 				* Возвраты по-настоящему корректно считаются из <code>/v3/finance/transaction/list</code>
// 				(операции вида <code>marketplace_service_item_return*</code>). В данных FBO-постингов
// 				поле отсутствует — при необходимости подключим транзакции и прибавим сюда.
// 			</p>
// 		</div>
// 	);
// };
//
// export default ProfitTable;
