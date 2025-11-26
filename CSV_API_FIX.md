# 🔧 Исправление парсинга данных Performance API

## Проблема
API Ozon Performance возвращает данные в **формате CSV**, а не JSON! 

### Пример ответа API:
```
ID;Название;Статус;Тип продвижения;Места размещения;Дневной бюджет, ₽;Недельный будж��т, ₽;Расход, ₽;Показы;Клики;В корзину;Средняя ставка, ₽;Ср. цена 1000 показов, ₽;CTR;Ср. цена клика, ₽;Заказы, шт.;Заказы, ₽;ДРР
17498946;WD;running;search-and-category;;0;5750;21273.07594;132435;2619;242;7.653646;160.630316;0,02;8.122594;60;225740;9,42
17552622;Тошиба;running;search-and-category;;0;3450;14932.971627;84366;1731;199;7.37741;177.002247;0,02;8.626788;61;236473;6,31
```

## Что исправлено ✅

### 1. Парсинг CSV в `src/entities/app/api/performance.ts`
```typescript
// Добавлена функция парсинга CSV
function parseCSVStats(csvText: string): CampaignStats[] {
	const lines = csvText.trim().split('\n');
	if (lines.length < 2) return [];
	
	// Пропускаем заголовок
	const dataLines = lines.slice(1);
	
	return dataLines.map(line => {
		const parts = line.split(';');
		
		// Парсим числа с запятой как десятичным разделителем
		const parseNumber = (str: string) => {
			if (!str || str === '') return 0;
			return parseFloat(str.replace(',', '.'));
		};
		
		return {
			id: parts[0],
			name: parts[1],
			status: parts[2],
			type: parts[3],
			expense: parseNumber(parts[7]),  // Расход
			views: parseNumber(parts[8]),     // Показы
			clicks: parseNumber(parts[9]),    // Клики
			orders: parseNumber(parts[15]),   // Заказы
			revenue: parseNumber(parts[16]),  // Выручка
			// ... остальные поля
		};
	});
}
```

### 2. Обновлён хук `usePerformanceProductReport`
```typescript
export function usePerformanceProductReport(...) {
	return useQuery<CampaignStats[]>({
		queryFn: async () => {
			const { data } = await axios.get<string>(
				`${PERFORMANCE_API_BASE}/api/client/statistics/campaign/product`,
				{
					params: { dateFrom, dateTo },
					headers: {
						'Authorization': `Bearer ${token}`,
						'Accept': 'text/csv',
					},
					responseType: 'text', // ← Важно! Не JSON
				}
			);
			
			// Парсим CSV
			return parseCSVStats(data);
		},
	});
}
```

### 3. Обновлена логика в `AdSpending.tsx`
Теперь используем распарсенные данные из CSV:
```typescript
const adData = useMemo(() => {
	// Используем adProductsData - это уже распарсенный массив CampaignStats
	if (adProductsData && Array.isArray(adProductsData) && adProductsData.length > 0) {
		const campaigns = adProductsData.map((stats: any) => ({
			id: stats.id,
			name: stats.name,
			spent: stats.expense,  // ← Из CSV
			views: stats.views,     // ← Из CSV
			clicks: stats.clicks,   // ← Из CSV
			orders: stats.orders,   // ← Из CSV
			roi: ((stats.revenue - stats.expense) / stats.expense * 100),
		}));
		
		// Агрегируем общую статистику
		const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0);
		// ...
	}
}, [adProductsData, campaignsLoading, adProductsLoading, dateRange]);
```

## Структура данных

### CSV поля (в порядке следования):
1. **ID** - ID кампании
2. **Название** - Название кампании
3. **Статус** - running/planned/stopped
4. **Тип продвижения** - search-and-category/sku
5. **Места размещения** - (может быть пустым)
6. **Дневной бюджет, ₽**
7. **Недельный бюджет, ₽** 
8. **Расход, ₽** ← используем для `spent`
9. **Показы** ← `views`
10. **Клики** ← `clicks`
11. **В корзину** ← `addToCart`
12. **Средняя ставка, ₽**
13. **Ср. цена 1000 показов, ₽**
14. **CTR**
15. **Ср. цена клика, ₽**
16. **Заказы, шт.** ← `orders`
17. **Заказы, ₽** ← `revenue`
18. **ДРР** ← доля рекламных расходов

## Как проверить 🔍

1. Откройте браузер на странице "Реклама"
2. Откройте DevTools (F12) → вкладка Console
3. Должны увидеть:
   ```
   CSV Response: ID;Название;Статус;...
   17498946;WD;running;...
   17552622;Тошиба;running;...
   
   Parsed Stats: Array(2)
     0: {id: "17498946", name: "WD", expense: 21273.07594, ...}
     1: {id: "17552622", name: "Тошиба", expense: 14932.97, ...}
   ```

4. На странице должны отображаться:
   - **Общий расход**: 36,206₽ (21,273 + 14,933)
   - **Показы**: 216,801 (132,435 + 84,366)
   - **Клики**: 4,350 (2,619 + 1,731)
   - **Заказы**: 121 шт. (60 + 61)
   - **Средняя цена клика**: ~8.32₽
   - **CTR**: ~2%

5. В таблице кампаний должно быть 2 строки:
   - WD: расход 21,273₽, 132,435 показов, 2,619 кликов
   - Тошиба: расход 14,933₽, 84,366 показов, 1,731 кликов

## Важные моменты ⚠️

1. **Формат чисел в CSV**: Используется запятая `,` как десятичный разделитель (европейский стандарт)
   - `21273.07594` → сохраняется как есть
   - `0,02` → конвертируется в `0.02`

2. **Период данных**: Берётся из DatePicker (по умолчанию последние 30 дней)

3. **Daily stats**: API не возвращает разбивку по дням, поэтому создаём примерное распределение

## Отладка 🐛

Если данные всё равно не отображаются:

1. Проверьте в Console логи:
   ```javascript
   console.log('CSV Response:', data);
   console.log('Parsed Stats:', stats);
   console.log('Ad Products Data:', adProductsData);
   ```

2. Проверьте вкладку Network:
   - Запрос к `/api/client/token` → должен вернуть `access_token`
   - Запрос к `/api/client/statistics/campaign/product?dateFrom=...&dateTo=...`
   - Response Type должен быть `text/csv`

3. Если видите ошибку CORS - используйте Vite proxy (см. `HOW_TO_DEBUG.md`)

4. Если CSV пустой - проверьте период дат в DatePicker

## Тестовые данные

На основе ваших реальных данных:
- **WD**: 21,273₽ расхода, 60 заказов, 225,740₽ выручки
- **Тошиба**: 14,933₽ расхода, 61 заказов, 236,473₽ выручки
- **Итого**: 36,206₽ расхода, 121 заказов, 462,213₽ выручки
- **ROI общий**: ~1,177% ((462,213 - 36,206) / 36,206 * 100)
