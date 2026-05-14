# Global FoodTech Bridge - Technical Passport (Handover)

Этот документ предназначен для обеспечения непрерывности разработки платформы Global FoodTech Bridge в новых сессиях или при передаче проекта другому специалисту.

## 🌟 Обзор проекта
Платформа для отслеживания цепочек поставок продуктов питания (Global Food Traceability). 
- **Основная ценность**: Прозрачный маршрут от производителя до ритейлера, подтвержденный IoT-датчиками и блокчейном.
- **Масштаб**: Поддержка международных торговых путей (например, Вьетнам -> США).

## 🏗 Архитектура системы

### 1. Backend: `passport-service` (Go)
- **Стек**: Go, chi (router), pgx (Postgres).
- **Ключевой функционал**:
    - Управление партиями (`Batch`).
    - Хранение `blockchain_hash` для подтверждения транзакций.
    - **SLA Registry**: Логика контрольных точек и допусков температуры.
- **Приоритет**: Расширение API для аналитики.

### 2. Frontend: `portal` (Next.js)
- **Стек**: Next.js 14 (App Router), Lucide, Tailwind.
- **Безопасность**: Firebase Auth + Firestore RBAC (Role Based Access Control).
- **Ключевые папки**:
    - `src/components/blockchain`: Компоненты жизненного цикла блокчейна (`ViolationState`, `ManufacturerActions`).
    - `src/hooks`: `useBlockchainOperations.ts` — централизованная логика транзакций с поддержкой Auth Token.
    - `lib/api.ts`: Центральный слой данных, маппинг метаданных и блокчейн-статусов.

## 🛡 Безопасность и Секреты
Все секреты выведены из кода в переменные среды. Шаблон в [.env.example](.env.example).

### Ключевые переменные:
- `NEXT_PUBLIC_PASSPORT_SERVICE_URL`: URL бэкенда.
- `NEXT_PUBLIC_FIREBASE_API_KEY`: Ключ для Auth/Firestore.
- `INTERNAL_API_KEY`: Секрет для авторизации запросов между фронтендом и бэкендом.
- `RAILWAY_TOKEN`: Необходим для корректной работы инфраструктурных инструментов.

## 📜 Бизнес-логика (Blueprint)
Все детальные спецификации цепочек поставок описаны в:
👉 [BUSINESS_LOGIC_BLUEPRINT.md](BUSINESS_LOGIC_BLUEPRINT.md)

## 🚢 Деплой (CI/CD)
- **Backend**: Railway (автодеплой при пуше в `main`).
- **Frontend**: Vercel (автодеплой при пуше в `main`).

## 🛤 Текущий Roadmap
1. **Production Stability**: (ЗАВЕРШЕНО) — рефакторинг макетов Next.js 14, устранение 404 ошибок и исправление авторизации в блокчейн-прокси.
2. **Blockchain RPC Stabilization**: (ЗАВЕРШЕНО) — внедрен динамический расчет диапазона блоков в `getBatchHistory` для обхода лимитов провайдеров (10,000 блоков).
3. **IoT Pro & Multi-Sensor Support**: (ЗАВЕРШЕНО) — реализована поддержка привязки массива датчиков (`sensor_ids`), улучшен UI модального окна привязки и добавлен переключатель режима IoT.
4. **Localization & i18n (Admin)**: (ЗАВЕРШЕНО) — полный перевод админ-панели на русский и английский языки с использованием `next-intl`.
5. **Map Integration**: Заменить заглушку в `JourneyTimeline` на реальную карту маршрута (Google Maps / Leaflet).
6. **Font & Performance Optimization**: (ЗАВЕРШЕНО) — устранение ошибок в конфигурации Google Fonts (`Outfit`) и чистка JSON-словарей.

---
## 🛠 Технические особенности (Expert Notes)

1. **Authentication Flow**: При вызове API блокчейна через фронтенд-прокси (`/api/blockchain/*`) необходимо всегда передавать Bearer Token от Firebase. Без него бэкенд вернет 401.
2. **Localization (next-intl)**: Все новые компоненты в `apps/frontend/portal` должны использовать `useTranslations`. Словари находятся в `messages/*.json`. Избегайте хардкода строк.
3. **Font Constraints**: Шрифт `Outfit` используется только с подмножествами `latin` и `latin-ext`. Не добавляйте `cyrillic`, так как это вызывает ошибки сборки.
4. **State Management**: Система использует комбинацию `DemoStateProvider` (localStorage) и серверного статуса. Если "Reset State" не помогает, значит статус нарушения зафиксирован в БД на бэкенде.
5. **Blockchain Queries**: Функция `getBatchHistory` использует безопасный диапазон в 10,000 блоков. При возникновении ошибок RPC 400 проверьте переменную `POLYGON_START_BLOCK` в `blockchain-service`.

**Примечание для следующей сессии**: Система полностью локализована и готова к деплою. Следующий фокус: интеграция карт и визуализация данных с нескольких датчиков одновременно.
