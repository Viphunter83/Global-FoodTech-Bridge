# Global FoodTech Bridge 🌉

> **Hard-Trust Logistics & Supply Chain Verification Platform**

Global FoodTech Bridge — это универсальная экосистема для обеспечения прозрачности международных поставок продуктов питания. Система объединяет данные IoT-датчиков с неизменяемым реестром блокчейна Polygon для создания «Цифровых Паспортов Доверия».

## 🚀 Текущий статус: Production Ready
- **Network**: Polygon Mainnet (`https://polygon.drpc.org`)
- **Smart Contract**: `0xF48D6846Ac41AE6764f0747E2A1Cb282467F59E5`
- **Security Check**: Пройден аудит (Апрель 2026). Внедрена модель единого защищенного кастодиального кошелька.

## 🏗 Архитектура (V3 - Event-Driven)
Проект переведен на высокопроизводительную событийно-ориентированную архитектуру для обеспечения минимальной задержки при обработке телеметрии:

1.  **[IoT Service](./apps/backend/iot-service)** (Go): Принимает данные датчиков и мгновенно публикует события нарушений в **Redis Streams**.
2.  **Redis 7** (Message Broker): Выступает центральной шиной обмена сообщениями, гарантируя доставку и соблюдение порядка событий.
3.  **[Blockchain Service](./apps/backend/blockchain-service)** (Node.js/NestJS): Асинхронно считывает события из Redis и выполняет нотариацию в Polygon Mainnet.
4.  **[Passport Service](./apps/backend/passport-service)** (Go): Управление жизненным циклом и метаданными «Цифровых Паспортов».
5.  **[Portal](./apps/frontend/portal)** (Next.js): Единый интерфейс для мониторинга поставок и верификации.

## 📚 Документация
- **[Бизнес-логика (Blueprint)](./BUSINESS_LOGIC_BLUEPRINT.md)**: Полное описание миссии и процессов.
- **[Руководство по развертыванию](./DEPLOYMENT.md)**: Инструкция для Railway и Vercel.
- **[Smart Contract V2 (Roadmap)](./docs/SMART_CONTRACT_V2.md)**: Описание следующего поколения инфраструктуры доверия.
- **[MCP Infrastructure Guide](./docs/MCP_INFRASTRUCTURE.md)**: Настройка и управление проектом через ИИ-агентов.

## 🛡 Безопасность
- Все секреты хранятся в переменных окружения (Railway/Vercel).
- Firebase Storage защищен правилами доступа (Auth-Only).
- Мониторинг "Dirty Migrations" и целостности БД настроен.

---
*Global FoodTech Bridge: Переход от веры к доказательствам.*
