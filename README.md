# Global FoodTech Bridge 🌉

> **Hard-Trust Logistics & Supply Chain Verification Platform**

Global FoodTech Bridge — это универсальная экосистема для обеспечения прозрачности международных поставок продуктов питания. Система объединяет данные IoT-датчиков с неизменяемым реестром блокчейна Polygon для создания «Цифровых Паспортов Доверия».

## 🚀 Текущий статус: Production Ready
- **Network**: Polygon Mainnet (`https://polygon.drpc.org`)
- **Smart Contract**: `0xF48D6846Ac41AE6764f0747E2A1Cb282467F59E5`
- **Security Check**: Пройден аудит (Апрель 2026). Внедрена модель единого защищенного кастодиального кошелька.

## 🏗 Архитектура
Проект построен на базе микросервисной архитектуры:

- **[Passport Service](./apps/backend/passport-service)** (Go): Управление цифровыми паспортами партий.
- **[IoT Service](./apps/backend/iot-service)** (Go): Сбор и анализ телеметрии (температура, влажность).
- **[Blockchain Service](./apps/backend/blockchain-service)** (Node.js/NestJS): Шлюз для транзакций в Polygon.
- **[Portal](./apps/frontend/portal)** (Next.js): Единый интерфейс для потребителей и бизнеса.

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
