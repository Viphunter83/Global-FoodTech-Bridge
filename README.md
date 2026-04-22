# Global FoodTech Bridge 🌉

> **Hard-Trust Logistics & Supply Chain Verification Platform**

Global FoodTech Bridge — это универсальная экосистема для обеспечения прозрачности международных поставок продуктов питания. Система объединяет данные IoT-датчиков с неизменяемым реестром блокчейна Polygon для создания «Цифровых Паспортов Доверия».

## 🚀 Текущий статус: Production (Stable)
- **Network**: Polygon Mainnet (`https://polygon.drpc.org`)
- **Frontend**: [global-food-tech-bridge.vercel.app](https://global-food-tech-bridge.vercel.app)
- **Backend Services**: Railway (IoT, Blockchain, Passport)
- **Smart Contract**: `0xF48D6846Ac41AE6764f0747E2A1Cb282467F59E5`
- **Security Check**: Пройден аудит. Внедрена авторизация через `INTERNAL_API_KEY` для межсервисного взаимодействия.

## 🏗 Архитектура (V3 - Hybrid Proxy)
Система использует гибридную модель: Frontend (Vercel) выступает безопасным прокси-слоем для Backend-сервисов (Railway):

1.  **[Portal (Frontend)](./apps/frontend/portal)**: Next.js приложение.
    - **API Proxy**: Маршрутизирует запросы к `/api/blockchain` и `/api/passport`.
    - **Auth Injection**: Автоматически добавляет `INTERNAL_API_KEY` и `X-User-Role` к защищенным запросам.
2.  **[Passport Service](./apps/backend/passport-service)** (Go): Хранит метаданные партий и управляет жизненным циклом паспорта.
3.  **[Blockchain Service](./apps/backend/blockchain-service)** (NestJS): 
    - **IPFS Gateway**: Обрабатывает загрузку сертификатов и метаданных через Pinata.
    - **Polygon Bridge**: Записывает хэши партий в блокчейн.
4.  **[IoT Service](./apps/backend/iot-service)** (Go): Обработка телеметрии в реальном времени.

## 🛡 Безопасность и Доступы
- **Межсервисная связь**: Защищена через `x-api-key`.
- **Роли пользователей**: Управляются через Firestore (`users` collection):
    - `ADMIN`: Полный доступ ко всем сервисам.
    - `MANUFACTURER`: Создание партий и загрузка документов.
    - `LOGISTICS/RETAILER`: Обновление статусов доставки и передача владения.
- **Admin SDK**: Для административных задач используется ключ `global-foodtech-bridge-prod-firebase-adminsdk-*.json` (хранится локально у администратора).

## 📚 Документация
- **[Эталонный Сценарий: Вьетнамское Манго 🥭](./docs/SCENARIO_VIETNAM_MANGO.md)**: Наш маркер качества E2E.
- **[Техническая Инфраструктура](./docs/MCP_INFRASTRUCTURE.md)**: Настройка и управление через MCP.
- **[База Знаний (Knowledge Items)](./.gemini/knowledge/)**: Подробные гайды по миграциям и API.
- **[Бизнес-логика](./BUSINESS_LOGIC_BLUEPRINT.md)**: Описание процессов от фермы до полки.

---
*Global FoodTech Bridge: Переход от веры к доказательствам.*

