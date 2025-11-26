# 💰 Страница "Доля рекламных расходов"

## ✅ Что создано

Новая страница **"Реклама"** для анализа рекламных расходов на Ozon с интеграцией Performance API.

---

## 📊 Что показывает страница

### 1. KPI Метрики

#### Расходы на рекламу
- Общая сумма затрат на рекламу за период
- Из Performance API (campaigns.expense)

#### ROI рекламы
- Возврат инвестиций в рекламу
- Формула: `((Выручка - Расходы) / Расходы) × 100%`
- Зелёный если > 100%, оранжевый если < 100%

#### Доля от выручки
- Процент рекламных расходов от общей выручки
- Формула: `(Расходы на рекламу / Выручка) × 100%`
- Показывает эффективность маркетинга

#### Стоимость заказа
- Средняя стоимость привлечения одного заказа
- Формула: `Расходы / Количество заказов с рекламы`

---

### 2. Дополнительные метрики

- **Показы объявлений** - сколько раз показывались ваши объявления
- **Клики** - количество кликов по объявлениям
- **CTR** - Click-Through Rate (Клики / Показы × 100%)
- **Конверсия в заказ** - процент кликов, которые привели к заказу

---

### 3. Графики

#### Расходы на рекламу по дням
- LineChart с динамикой расходов
- Помогает видеть тренды и пики расходов
- Area fill для лучшей визуализации

#### Заказы с рекламы по дням
- LineChart с количеством заказов
- Корреляция с расходами

#### Расходы по кампаниям
- Горизонтальный BarChart
- Сравнение всех активных кампаний
- Видно какая кампания самая затратная

---

### 4. Таблица кампаний

**Колонки:**
1. **Название кампании** - название из Performance API
2. **Тип** - тип кампании (Оплата за клик/заказ/показы)
3. **Статус** - Активна/Приостановлена
4. **Расход** - потраченная сумма
5. **Показы** - количество показов
6. **Клики** - количество кликов
7. **Заказы** - заказы с рекламы
8. **ROI** - эффективность кампании

**Возможности:**
- Сортировка по всем колонкам
- Цветовое кодирование ROI
- Пагинация

---

## 🔧 Ozon Performance API

### Используемые endpoints:

#### 1. **POST /api/client/token** - Получение токена
```typescript
POST https://api-performance.ozon.ru/api/client/token
{
  "client_id": "XYZ@advertising.performance.ozon.ru",
  "client_secret": "your_secret",
  "grant_type": "client_credentials"
}

Ответ:
{
  "access_token": "eyJhbGc...",
  "expires_in": 1800,
  "token_type": "Bearer"
}
```

#### 2. **GET /api/client/campaign** - Список кампаний
```typescript
GET https://api-performance.ozon.ru/api/client/campaign
Headers: Authorization: Bearer {token}

Ответ:
{
  "list": [
    {
      "id": 12345,
      "title": "Название кампании",
      "state": "CAMPAIGN_STATE_RUNNING",
      "advObjectType": "SEARCH_PROMO",
      ...
    }
  ]
}
```

#### 3. **POST /api/client/statistics** - Статистика по кампаниям
```typescript
POST https://api-performance.ozon.ru/api/client/statistics
Headers: Authorization: Bearer {token}
{
  "campaigns": [12345, 67890],
  "dateFrom": "2025-01-01",
  "dateTo": "2025-01-31",
  "groupBy": "DATE"
}

Ответ:
{
  "rows": [
    {
      "date": "2025-01-01",
      "views": 12450,
      "clicks": 345,
      "expense": 4562.50,
      "orders": 23,
      ...
    }
  ]
}
```

#### 4. **GET /api/client/statistics/campaign/product** - Статистика по товарам
```typescript
GET https://api-performance.ozon.ru/api/client/statistics/campaign/product
Headers: Authorization: Bearer {token}
Params:
  dateFrom: 2025-01-01
  dateTo: 2025-01-31

Ответ:
{
  "items": [
    {
      "sku": 123456789,
      "name": "Название товара",
      "expense": 1234.56,
      "revenue": 5678.90,
      ...
    }
  ]
}
```

---

## 🔑 Настройка API credentials

### Шаг 1: Получите credentials в личном кабинете

1. Войдите в личный кабинет Ozon
2. Перейдите в **Настройки → API-ключи**
3. Создайте или выберите сервисный аккаунт
4. Нажмите **Добавить новый ключ**
5. Скопируйте `client_id` и `client_secret`

### Шаг 2: Обновите код

В файле `/src/pages/AdSpending/AdSpending.tsx` замените:

```typescript
// Было:
const PERFORMANCE_CLIENT_ID = 'XYZ@advertising.performance.ozon.ru';
const PERFORMANCE_CLIENT_SECRET = 'your_client_secret_here';

// Стало (ваши реальные данные):
const PERFORMANCE_CLIENT_ID = 'ВАШ_CLIENT_ID@advertising.performance.ozon.ru';
const PERFORMANCE_CLIENT_SECRET = 'ВАШ_CLIENT_SECRET';
```

### Формат client_id:
```
{номер_сервисного_аккаунта}@advertising.performance.ozon.ru

Например:
90423286@advertising.performance.ozon.ru
```

---

## 💡 Как работает интеграция

### 1. Получение токена
```typescript
// В файле: /src/entities/app/api/performance.ts
export async function getPerformanceToken(clientId, clientSecret) {
  const { data } = await axios.post(
    'https://api-performance.ozon.ru/api/client/token',
    { client_id, client_secret, grant_type: 'client_credentials' }
  );
  return data.access_token;
}
```

### 2. Запрос данных с токеном
```typescript
export function usePerformanceCampaigns(clientId, clientSecret) {
  return useQuery({
    queryFn: async () => {
      const token = await getPerformanceToken(clientId, clientSecret);
      const { data } = await axios.get(
        'https://api-performance.ozon.ru/api/client/campaign',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data;
    }
  });
}
```

### 3. Токен действует 1800 секунд (30 минут)
- React Query автоматически кеширует результаты
- При истечении токена автоматически получается новый

---

## 📊 Расчёт метрик

### ROI рекламы
```typescript
const adSpent = // Из Performance API (campaign.expense)
const revenue = // Из Seller API (payout)
const adROI = ((revenue - adSpent) / adSpent) * 100
```

### Доля рекламы от выручки
```typescript
const adSharePercent = (adSpent / revenue) * 100
```

### CTR (Click-Through Rate)
```typescript
const ctr = (clicks / views) * 100
```

### Конверсия
```typescript
const conversion = (orders / clicks) * 100
```

### Средняя стоимость заказа
```typescript
const avgOrderCost = adSpent / orders
```

---

## 🎨 Структура файлов

```
src/
├── entities/app/api/
│   └── performance.ts          # API методы для Performance API
│
├── pages/AdSpending/
│   ├── AdSpending.tsx          # Главный компонент страницы
│   ├── AdSpending.css          # Стили страницы
│   └── index.ts               # Экспорт
│
└── components/Layout/
    └── AppLayout.tsx           # Обновлён (добавлена вкладка)
```

---

## 🚀 Как использовать

### 1. Настройте credentials (см. выше)

### 2. Запустите проект
```bash
npm run dev
```

### 3. Откройте вкладку "Реклама"

### 4. Выберите период
- Используйте фильтр дат
- Данные автоматически обновятся

---

## ⚠️ Текущее состояние

### Пока без реальных credentials:
- Показываются **демонстрационные данные**
- Отображается предупреждение сверху
- Все графики и таблицы работают с моковыми данными

### После настройки credentials:
- Будут загружаться **реальные данные** из Ozon
- Предупреждение исчезнет
- Все метрики будут рассчитываться на основе реальных кампаний

---

## 📊 Моковые данные (для демонстрации)

Сейчас показываются:
- 4 рекламные кампании
- Общий бюджет: 145,230 ₽
- 1,245,000 показов
- 34,560 кликов
- 890 заказов
- Графики за 30 дней

---

## 🔄 Интеграция с другими страницами

### Связь с "Аналитикой продаж":
- Берём выручку из Seller API
- Сравниваем с расходами на рекламу
- Вычисляем ROI

### Данные для "Калькулятора прибыли":
- Учитываем расходы на рекламу в себестоимости
- Более точный расчёт прибыльности

---

## 📚 Документация Ozon Performance API

**Официальная документация:**
https://docs.ozon.ru/api/performance/

**Основные разделы:**
- Авторизация (получение токена)
- Кампании (создание, управление)
- Статистика (данные по кампаниям)
- Лимиты (ограничения на запросы)

---

## ✅ Что готово

- ✅ API методы для Performance API
- ✅ Получение токена
- ✅ Hooks для данных кампаний
- ✅ Hooks для статистики
- ✅ Страница с графиками
- ✅ KPI метрики
- ✅ Таблица кампаний
- ✅ Интеграция с данными о продажах
- ✅ Расчёт ROI и доли рекламы
- ✅ Фильтр по датам
- ✅ Адаптивный дизайн
- ✅ Тёмная/светлая тема

---

## 🎯 Что можно добавить

1. **Управление кампаниями**
   - Включение/выключение
   - Изменение ставок
   - Создание новых кампаний

2. **Детальная аналитика**
   - По каждому товару
   - По ключевым словам
   - По регионам

3. **Прогнозы**
   - Прогноз расходов
   - Рекомендации по ставкам

4. **Экспорт**
   - Отчёты в Excel
   - PDF с графиками

---

## 🎉 Готово!

Страница **"Доля рекламных расходов"** создана и готова к использованию!

### Следующие шаги:
1. Получите credentials в личном кабинете Ozon
2. Обновите код (замените client_id и client_secret)
3. Запустите проект
4. Наслаждайтесь реальной аналитикой рекламы!

---

**Все API endpoints описаны и готовы к работе!** ✨
