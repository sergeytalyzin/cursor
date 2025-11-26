# 🔍 Как проверить работу Performance API

## Ваши credentials установлены

```typescript
CLIENT_ID: '90423286-1764181130845@advertising.performance.ozon.ru'
CLIENT_SECRET: 'kOGdHJ7o_J9S9gF0npXAqnegurlLoRX94yL2bXEOryogNHNRKCQsC6YwnVAB6isWiSeEI4kfnpHuLGxcYA'
```

---

## 🚀 Шаги для проверки

### 1. Запустите проект:
```bash
npm run dev
```

### 2. Откройте браузер:
```
http://localhost:5173
```

### 3. Откройте DevTools (F12):
- Вкладка **Console**
- Вкладка **Network**

### 4. Перейдите на вкладку "Реклама" (4-я вкладка)

### 5. Смотрите что происходит:

#### В консоли увидите:
```javascript
Campaigns Data: { list: [...] }  // Данные кампаний
Campaigns Error: null            // Или описание ошибки
Ad Products Data: { ... }        // Данные товаров
Ad Products Error: null          // Или ошибка
```

#### На странице увидите:
- ✅ Зелёный Alert - данные загружены
- ❌ Красный Alert - ошибка
- ℹ️ Синий Alert - нет кампаний
- Моковые данные - если API недоступен

---

## 🔍 Отладка в Network

### Откройте вкладку Network в DevTools

Вы должны увидеть запросы:

#### 1. Запрос токена:
```
POST /api/client/token
Host: api-performance.ozon.ru
Status: 200 OK (если успешно)

Response:
{
  "access_token": "eyJhbGc...",
  "expires_in": 1800
}
```

#### 2. Запрос кампаний:
```
GET /api/client/campaign
Host: api-performance.ozon.ru
Authorization: Bearer eyJhbGc...
Status: 200 OK (если успешно)

Response:
{
  "list": [
    { "id": 12345, "title": "...", ... }
  ]
}
```

---

## ⚠️ Возможные ошибки

### Ошибка 401 Unauthorized
```json
{
  "code": 401,
  "message": "Unauthorized"
}
```

**Причины:**
- Неверный client_id или client_secret
- Аккаунт не активен
- Ключ отозван

**Решение:**
1. Проверьте credentials в личном кабинете
2. Убедитесь что ключ активен
3. Попробуйте создать новый ключ

---

### Ошибка CORS
```
Access to fetch has been blocked by CORS policy
```

**Причины:**
- API не разрешает запросы из браузера
- Нужен прокси сервер

**Решение:**
Добавьте прокси в `vite.config.ts`:

```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api-performance': {
        target: 'https://api-performance.ozon.ru',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-performance/, '')
      }
    }
  }
});
```

Затем измените в `/src/entities/app/api/performance.ts`:
```typescript
// Было:
const PERFORMANCE_API_BASE = 'https://api-performance.ozon.ru';

// Станет:
const PERFORMANCE_API_BASE = '/api-performance';
```

---

### Пустой список кампаний
```json
{
  "list": []
}
```

**Причины:**
- Нет созданных кампаний
- Кампании не активны
- Доступ только к определённым кампаниям

**Решение:**
1. Зайдите в рекламный кабинет Ozon
2. Создайте хотя бы одну кампанию
3. Активируйте её
4. Обновите страницу

---

## 📊 Что должно отображаться

### С реальными данными:

#### KPI блоки:
```
Расходы на рекламу: [из API] ₽
ROI рекламы: [расчётный] %
Доля от выручки: [расчётный] %
Стоимость заказа: [расчётный] ₽
```

#### Таблица кампаний:
- Реальные названия ваших кампаний
- Реальные расходы
- Реальные показы/клики
- Реальные статусы

### С моковыми данными:

#### Вы увидите:
```
Продвижение в поиске - Электроника
Трафареты - Аксессуары
Баннеры на главной
Спецразмещение - Топ товары
```

Это означает что API не вернул данные.

---

## 🔧 Как исправить если не работает

### Вариант 1: Проверить API вручную

Используйте Postman или curl:

```bash
# 1. Получите токен
curl -X POST https://api-performance.ozon.ru/api/client/token \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "90423286-1764181130845@advertising.performance.ozon.ru",
    "client_secret": "kOGdHJ7o_J9S9gF0npXAqnegurlLoRX94yL2bXEOryogNHNRKCQsC6YwnVAB6isWiSeEI4kfnpHuLGxcYA",
    "grant_type": "client_credentials"
  }'

# 2. Используйте токен для запроса кампаний
curl -X GET https://api-performance.ozon.ru/api/client/campaign \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Вариант 2: Создать backend прокси

Если CORS блокирует:
1. Создайте простой Node.js сервер
2. Проксируйте запросы через него
3. Или используйте serverless функции (Vercel, Netlify)

### Вариант 3: Используйте моковые данные

Для разработки UI можно временно использовать моковые данные.
Они отображаются автоматически если API недоступен.

---

## 📝 Логи для проверки

Откройте консоль и найдите:

```javascript
// Успешная загрузка:
Campaigns Data: {
  list: [
    { id: 12345, title: "Моя кампания", ... }
  ]
}
Campaigns Error: null

// Ошибка:
Campaigns Data: undefined
Campaigns Error: Error: Request failed with status code 401

// Нет данных:
Campaigns Data: { list: [] }
Campaigns Error: null
```

---

## 🎯 Ожидаемое поведение

### Правильная работа:

1. **Загрузка:**
   - Spinner "Загрузка данных из Performance API..."
   - 2-3 секунды

2. **Успех:**
   - Зелёный Alert "✅ Данные загружены"
   - Реальные названия кампаний
   - Реальные цифры

3. **Нет кампаний:**
   - Синий Alert "ℹ️ Нет данных"
   - Моковые данные для демонстрации

4. **Ошибка:**
   - Красный Alert с описанием ошибки
   - Моковые данные для демонстрации

---

## 🎉 Проверьте прямо сейчас!

```bash
npm run dev
# Откройте консоль (F12)
# Вкладка "Реклама"
# Смотрите логи в консоли
```

**Если видите логи - значит код работает!**
**Если видите ошибку - смотрите её описание!**
**Если видите данные - всё супер!** ✨
