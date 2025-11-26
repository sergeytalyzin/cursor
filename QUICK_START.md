# 🚀 Быстрый старт

## Запуск проекта

### 1. Установка зависимостей
```bash
npm install
```

### 2. Запуск dev-сервера
```bash
npm run dev
```

Откроется по адресу: `http://localhost:5173`

### 3. Сборка для production
```bash
npm run build
```

### 4. Preview production build
```bash
npm run preview
```

## 🎨 Основные возможности

После запуска вы увидите:

1. **Фиксированный header** с:
   - Логотипом и названием "Ozon Analytics"
   - Переключателем тёмной/светлой темы

2. **Липкие табы** с тремя разделами:
   - 📊 Аналитика продаж
   - 💰 Калькулятор прибыли
   - 🎯 Воронка продаж

3. **Полностью интерактивный интерфейс**

## 📊 Навигация по разделам

### Аналитика продаж
- Посмотрите KPI метрики вверху
- Измените диапазон дат
- Изучите графики по дням
- Отсортируйте таблицу по разным колонкам
- Отфильтруйте по складам

### Калькулятор прибыли
- Введите любые значения в левой части
- Результаты пересчитываются автоматически
- Посмотрите детализацию справа
- Обратите внимание на цветовое кодирование (зелёный = прибыль, красный = убыток)

### Воронка продаж
- Изучите визуализацию воронки
- Посмотрите конверсии между этапами
- Проанализируйте динамику по дням
- Сравните товары в таблице

## 🌓 Тёмная тема

Переключите тему:
- Кликом на переключатель в header
- Выбор сохранится в localStorage
- Все компоненты адаптируются автоматически

## 📱 Адаптивность

Попробуйте:
- Изменить размер окна браузера
- Открыть на мобильном устройстве
- Интерфейс адаптируется под любой размер экрана

## 🔧 Настройка под ваш API

### 1. Обновите endpoints

Файлы в `/src/entities/app/api/`:
- `analytics.ts` - аналитика продаж
- `posting-fbo.ts` - заказы
- `finance.ts` - финансы

### 2. Настройте axios

Файл `/src/shared/config/axios.ts`:
```typescript
// Добавьте свои headers, авторизацию, base URL
```

### 3. Замените моковые данные

В файлах страниц:
- `/src/pages/SalesAnalytics/SalesAnalytics.tsx`
- `/src/pages/SalesFunnel/SalesFunnel.tsx`

Замените `mock*Data` на реальные API вызовы:

```typescript
// Было:
const mockSalesData = { ... };

// Станет:
const { data: salesData } = useQuery({
  queryKey: ['sales'],
  queryFn: () => fetchSalesData()
});
```

## 📋 Типы данных

Все типы уже описаны в `/src/entities/app/types/`:
- `common.ts` - общие типы
- `analytics/` - типы для аналитики
- `fbo/` - типы для заказов
- `finance/` - типы для финансов

## 🎯 Структура API ответов

### Для графиков
```typescript
{
  labels: string[];  // ['Пн', 'Вт', ...]
  series: {
    name: string;
    data: number[];
    color?: string;
  }[];
}
```

### Для таблиц
```typescript
{
  key: string;
  sku: string;
  name: string;
  // ... другие поля
}[]
```

### Для воронки
```typescript
{
  name: string;
  value: number;
  conversion?: number;
}[]
```

## 🚀 Расширение функционала

### Добавление новой вкладки

1. Создайте страницу в `/src/pages/YourPage/`
2. Добавьте в `/src/components/Layout/AppLayout.tsx`:

```typescript
const tabs = [
  // ... существующие табы
  {
    key: 'your-page',
    label: <span><YourIcon />Ваша страница</span>,
    children: <YourPage />,
  },
];
```

### Добавление нового компонента

1. Создайте в `/src/shared/components/YourComponent/`
2. Добавьте файлы:
   - `YourComponent.tsx`
   - `YourComponent.css`
   - `index.ts` (экспорт)

### Добавление нового графика

Используйте готовые компоненты:
```typescript
import { LineChart, BarChart, FunnelChart } from '@/shared/components/Charts';

<LineChart data={yourData} smooth area />
```

## 📚 Полезные ссылки

- [Ant Design Components](https://ant.design/components/overview)
- [ECharts Documentation](https://echarts.apache.org/en/option.html)
- [React Query](https://tanstack.com/query/latest)
- [Zustand](https://github.com/pmndrs/zustand)
- [Ozon Seller API](https://docs.ozon.ru/api/seller/)

## 💡 Советы

1. **Используйте DevTools**:
   - React DevTools для отладки компонентов
   - Redux DevTools для Zustand (если добавите middleware)

2. **Оптимизация**:
   - Используйте React.memo для тяжёлых компонентов
   - Добавьте виртуализацию для больших списков
   - Настройте code splitting

3. **Тестирование**:
   - Добавьте Jest + React Testing Library
   - Напишите unit-тесты для расчётов
   - E2E тесты с Playwright/Cypress

## ❓ FAQ

**Q: Как изменить цвета?**  
A: В `/src/shared/styles/theme.ts` настройте `lightTheme` и `darkTheme`

**Q: Как добавить больше языков?**  
A: Установите `i18next` и создайте файлы переводов

**Q: Как сделать SSR?**  
A: Мигрируйте на Next.js или используйте Vite SSR

**Q: Где моковые данные?**  
A: Внутри компонентов страниц, начинаются с `mock*`

## 🐛 Troubleshooting

**Проблема**: Не запускается dev-сервер  
**Решение**: Проверьте версию Node.js (нужна >= 18)

**Проблема**: Ошибки TypeScript  
**Решение**: Запустите `npm run build` для проверки

**Проблема**: Тёмная тема не работает  
**Решение**: Очистите localStorage и перезагрузите страницу

---

🎉 **Готово! Ваш современный Ozon Analytics запущен!**

Если нужна помощь, создайте issue в репозитории.
