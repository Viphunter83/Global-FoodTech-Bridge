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
    - **SLA Registry**: Логика контрольных точек и допусков температуры (универсальна для любых продуктов).
- **Приоритет**: Расширение API для аналитики.

### 2. Frontend: `portal` (Next.js)
- **Стек**: Next.js 14 (App Router), Lucide, Tailwind.
- **Безопасность**: Firebase Auth + Firestore RBAC (Role Based Access Control).
- **Ключевые папки**:
    - `src/components/passport`: Универсальные компоненты верификации (`TrustMetricBadge`, `MerchantFunnelCTA`).
    - `src/components/providers`: `AuthProvider.tsx` — логика инициализации сессии и ролей.
    - `lib/api.ts`: Центральный слой данных, маппинг метаданных и блокчейн-статусов.

## 🛡 Безопасность и Секреты
Все секреты выведены из кода в переменные среды. Шаблон в [.env.example](.env.example).

### Ключевые переменные:
- `NEXT_PUBLIC_PASSPORT_SERVICE_URL`: URL бэкенда.
- `NEXT_PUBLIC_FIREBASE_API_KEY`: Ключ для Auth/Firestore.
- `DATABASE_URL`: Строка подключения к базе (Postgres).
- `INTERNAL_API_KEY`: Секрет для авторизации запросов между сервисами.

## 📜 Бизнес-логика (Blueprint)
Все детальные спецификации цепочек поставок, жизненного цикла партий и дорожная карта «точек роста» (Templates, Escrow, Compliance) описаны в:
👉 [BUSINESS_LOGIC_BLUEPRINT.md](BUSINESS_LOGIC_BLUEPRINT.md)

## 🚢 Деплой (CI/CD)
- **Backend**: Railway (автодеплой при пуше в `main`).
- **Frontend**: Vercel (автодеплой при пуше в `main`).
- **URL**: `global-foodtech-bridge-production.up.railway.app`

## 🛤 Текущий Roadmap
1. **Universal Portals**: (ЗАВЕРШЕНО) — реализация универсального паспорта продукта с бэйджами доверия.
2. **Merchant Funnels**: (ЗАВЕРШЕНО) — интеграция кнопок покупки для монетизации трафика ритейлеров.
3. **Production Stability**: (ЗАВЕРШЕНО) — рефакторинг макетов Next.js 14 и устранение 404 ошибок.
4. **Map Integration**: Заменить заглушку в `JourneyTimeline` на реальную карту маршрута.
4. **IoT Simulator**: Улучшить симуляцию данных для демонстрации «холодовой цепи» в реальном времени.

---
## 🛠 Технические особенности (Expert Notes)

1. **Expert Layout Pattern**: Для стабильности Next.js 14 используется минимальный `src/app/layout.tsx`. Главные теги `<html>` и `<body>` перенесены в локализованный `src/app/[locale]/layout.tsx`. Это позволяет динамически менять атрибут `lang` для SEO и предотвращает ошибки гидратации (Nested HTML tags).
2. **Security Hardening**: Ключи доступа (например, `INTERNAL_API_KEY`) теперь работают только на сервере. Не используйте префикс `NEXT_PUBLIC_` для секретов, чтобы они не попадали в клиентский бандл.
3. **Diagnostics**: В браузере доступны логи `[GFTB-DIAGNOSTIC]` и `[GFTB-HYDRATION]`. Они помогают мгновенно определить отсутствие переменных окружения или сбои React на клиенте.

**Примечание для следующей сессии**: Система полностью стабилизирована. При создании новых партий обязательно заполнять поля `OriginCountry`, `DestinationCountry` и `ProductionLocation` для корректной работы международного таймлайна.
