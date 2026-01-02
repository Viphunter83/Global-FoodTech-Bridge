export type Language = 'en' | 'ru' | 'ar';

export type TranslationKey =
    | 'app_title_suffix'
    | 'hero_title'
    | 'hero_subtitle'
    | 'track_placeholder'
    | 'track_button'
    | 'try_demo'
    | 'business_dashboard'
    | 'feature_traceability_title'
    | 'feature_traceability_desc'
    | 'feature_iot_title'
    | 'feature_iot_desc'
    | 'feature_blockchain_title'
    | 'feature_blockchain_desc'
    | 'dashboard_active_batches'
    | 'dashboard_new'
    | 'status_blockchain'
    | 'status_connection_secured'
    | 'status_connection_pending'
    | 'location_current'
    | 'location_updated_iot'
    | 'temp_title'
    | 'temp_optimal'
    | 'live_tracking'
    | 'live_tracking_desc'
    | 'action_center'
    | 'action_desc'
    | 'role_manufacturer'
    | 'role_logistics'
    | 'role_retailer'
    | 'how_title'
    | 'how_subtitle'
    | 'back_to_app'
    | 'step_production'
    | 'step_logistics'
    | 'step_handover'
    | 'step_verify'
    | 'passport_creation'
    | 'passport_desc'
    | 'iot_monitoring'
    | 'iot_desc'
    | 'crypto_handover'
    | 'crypto_desc'
    | 'consumer_trust'
    | 'consumer_desc'
    | 'try_live_demo'
    | 'prev_step'
    | 'next_step'
    | 'verified_badge'
    | 'menu_create_batch'
    | 'menu_how_it_works'
    | 'role_persona';

export const translations: Record<Language, Record<TranslationKey, string>> = {
    en: {
        app_title_suffix: 'Supply Chain Manager',
        hero_title: 'Trust Your Supply Chain.',
        hero_subtitle: 'End-to-end traceability for global food trade. Secured by Blockchain, Verified by IoT.',
        track_placeholder: 'Enter Batch UUID (e.g. 902f1...)',
        track_button: 'Track',
        try_demo: 'Try demo ID:',
        business_dashboard: 'Business Dashboard',
        feature_traceability_title: 'Global Traceability',
        feature_traceability_desc: 'Real-time location tracking from manufacturer to final destination.',
        feature_iot_title: 'IoT Monitoring',
        feature_iot_desc: 'Automated temperature compliance checks stored in immutable history.',
        feature_blockchain_title: 'Blockchain Verified',
        feature_blockchain_desc: 'Every batch is notarized on Polygon network for absolute trust.',
        dashboard_active_batches: 'Active Batches',
        dashboard_new: 'New',
        status_blockchain: 'Blockchain Status',
        status_connection_secured: 'Secured',
        status_connection_pending: 'Pending',
        location_current: 'Current Location',
        location_updated_iot: 'Updated via IoT',
        temp_title: 'Temperature',
        temp_optimal: 'Range: < -18°C (Optimal)',
        live_tracking: 'Live Tracking',
        live_tracking_desc: 'Real-time telemetry and location.',
        action_center: 'Action Center',
        action_desc: 'Manage batch lifecycle events.',
        role_manufacturer: 'Manufacturer',
        role_logistics: 'Logistics',
        role_retailer: 'Retailer',
        how_title: 'How Global FoodTech Bridge Works',
        how_subtitle: 'Ensuring food safety, Halal compliance, and transparency from farm to table using Blockchain and IoT technologies.',
        back_to_app: 'Back to App',
        step_production: 'Production',
        step_logistics: 'Smart Logistics',
        step_handover: 'Trusted Handover',
        step_verify: 'Consumer Verify',
        passport_creation: 'Digital Passport Creation',
        passport_desc: 'When a batch is produced, we generate a unique UUID. Ingredients, certifications (Halal), and expiry dates are hashed and stored on the Blockchain.',
        iot_monitoring: 'IoT Monitoring',
        iot_desc: 'Smart containers report temperature every 5 minutes. If the temp rises above -18°C, the smart contract automatically flags the batch as VIOLATED.',
        crypto_handover: 'Cryptographic Handover',
        crypto_desc: 'The retailer signs a digital receipt. Payment is only released if the blockchain confirms Ownership Transferred and No Violations Recorded.',
        consumer_trust: 'Consumer Trust',
        consumer_desc: 'Consumers scan the QR code on the package. They see the full, immutable history from farm to fork—verified by the Polygon network.',
        try_live_demo: 'Try Live Demo',
        prev_step: 'Previous',
        next_step: 'Next Step',
        verified_badge: 'VERIFIED',
        menu_create_batch: 'Create Batch',
        menu_how_it_works: 'How it Works',
        role_persona: 'Persona:'
    },
    ru: {
        app_title_suffix: 'Менеджер по цепочкам поставок',
        hero_title: 'Доверяйте свои поставки.',
        hero_subtitle: 'Сквозная прослеживаемость для глобальной торговли продуктами питания. Защищено блокчейном, проверено IoT.',
        track_placeholder: 'Введите UUID партии (напр. 902f1...)',
        track_button: 'Отследить',
        try_demo: 'Попробуйте демо ID:',
        business_dashboard: 'Бизнес-панель',
        feature_traceability_title: 'Глобальная прослеживаемость',
        feature_traceability_desc: 'Отслеживание местоположения в реальном времени от производителя до конечного пункта назначения.',
        feature_iot_title: 'IoT Мониторинг',
        feature_iot_desc: 'Автоматическая проверка соблюдения температурного режима, сохраненная в неизменяемой истории.',
        feature_blockchain_title: 'Проверено блокчейном',
        feature_blockchain_desc: 'Каждая партия нотариально заверяется в сети Polygon для абсолютного доверия.',
        dashboard_active_batches: 'Активные партии',
        dashboard_new: 'Новая',
        status_blockchain: 'Статус блокчейна',
        status_connection_secured: 'Защищено',
        status_connection_pending: 'Ожидание',
        location_current: 'Текущее местоположение',
        location_updated_iot: 'Обновлено через IoT',
        temp_title: 'Температура',
        temp_optimal: 'Норма: < -18°C (Оптимально)',
        live_tracking: 'Живое отслеживание',
        live_tracking_desc: 'Телеметрия и местоположение в реальном времени.',
        action_center: 'Центр действий',
        action_desc: 'Управление жизненным циклом партии.',
        role_manufacturer: 'Производитель',
        role_logistics: 'Логистика',
        role_retailer: 'Ритейлер',
        how_title: 'Как работает Global FoodTech Bridge',
        how_subtitle: 'Обеспечение безопасности пищевых продуктов, соответствия Халяль и прозрачности от фермы до стола с использованием технологий блокчейн и IoT.',
        back_to_app: 'Вернуться в приложение',
        step_production: 'Производство',
        step_logistics: 'Умная логистика',
        step_handover: 'Надежная передача',
        step_verify: 'Проверка потребителем',
        passport_creation: 'Создание цифрового паспорта',
        passport_desc: 'При производстве партии мы генерируем уникальный UUID. Ингредиенты, сертификаты (Халяль) и сроки годности хешируются и сохраняются в блокчейне.',
        iot_monitoring: 'IoT Мониторинг',
        iot_desc: 'Умные контейнеры сообщают температуру каждые 5 минут. Если температура поднимается выше -18°C, смарт-контракт автоматически помечает партию как НАРУШЕННУЮ.',
        crypto_handover: 'Криптографическая передача',
        crypto_desc: 'Ритейлер подписывает цифровую квитанцию. Оплата производится только в том случае, если блокчейн подтверждает передачу права собственности и отсутствие нарушений.',
        consumer_trust: 'Доверие потребителей',
        consumer_desc: 'Потребители сканируют QR-код на упаковке. Они видят полную, неизменную историю от фермы до вилки, проверенную сетью Polygon.',
        try_live_demo: 'Попробовать демо',
        prev_step: 'Назад',
        next_step: 'Далее',
        verified_badge: 'ПРОВЕРЕНО',
        menu_create_batch: 'Создать партию',
        menu_how_it_works: 'Как это работает',
        role_persona: 'Роль:'
    },
    ar: {
        app_title_suffix: 'مدير سلسلة التوريد',
        hero_title: 'ثق بسلسلة التوريد الخاصة بك.',
        hero_subtitle: 'تتبع شامل لتجارة المواد الغذائية العالمية. مؤمن بواسطة Blockchain ، تم التحقق منه بواسطة IoT.',
        track_placeholder: 'أدخل معرف الدفعة (أو 902f1...)',
        track_button: 'تتبع',
        try_demo: 'جرب المعرف التجريبي:',
        business_dashboard: 'لوحة التحكم للأعمال',
        feature_traceability_title: 'تتبع عالمي',
        feature_traceability_desc: 'تتبع الموقع في الوقت الفعلي من الشركة المصنعة إلى الوجهة النهائية.',
        feature_iot_title: 'مراقبة إنترنت الأشياء',
        feature_iot_desc: 'فحوصات الامتثال لدرجة الحرارة الآلية المخزنة في تاريخ غير قابل للتغيير.',
        feature_blockchain_title: 'مؤمن بواسطة Blockchain',
        feature_blockchain_desc: 'يتم توثيق كل دفعة في شبكة Polygon لثقة مطلقة.',
        dashboard_active_batches: 'الدفاعات النشطة',
        dashboard_new: 'جديد',
        status_blockchain: 'حالة البلوكشين',
        status_connection_secured: 'مؤمن',
        status_connection_pending: 'قيد الانتظار',
        location_current: 'الموقع الحالي',
        location_updated_iot: 'تم التحديث عبر إنترنت الأشياء',
        temp_title: 'درجة الحرارة',
        temp_optimal: 'النطاق: < -18°C (مستحسن)',
        live_tracking: 'تتبع مباشر',
        live_tracking_desc: 'القياس عن بعد والموقع في الوقت الفعلي.',
        action_center: 'مركز الإجراءات',
        action_desc: 'إدارة أحداث دورة حياة الدفعة.',
        role_manufacturer: 'الشركة المصنعة',
        role_logistics: 'اللوجستيات',
        role_retailer: 'بائع التجزئة',
        how_title: 'كيف يعمل Global FoodTech Bridge',
        how_subtitle: 'ضمان سلامة الغذاء، والامتثال للحلال، والشفافية من المزرعة إلى المائدة باستخدام تقنيات Blockchain و IoT.',
        back_to_app: 'العودة للتطبيق',
        step_production: 'الإنتاج',
        step_logistics: 'اللوجستيات الذكية',
        step_handover: 'تسليم موثوق',
        step_verify: 'تحقق المستهلك',
        passport_creation: 'إنشاء الجواز الرقمي',
        passport_desc: 'عند إنتاج دفعة، نقوم بإنشاء UUID فريد. يتم تجزئة المكونات والشهادات (مثل الحلال) وتواريخ انتهاء الصلاحية وتخزينها على Blockchain.',
        iot_monitoring: 'مراقبة إنترنت الأشياء',
        iot_desc: 'تقوم الحاويات الذكية بالإبلاغ عن درجة الحرارة كل 5 دقائق. إذا ارتفعت درجة الحرارة عن -18 درجة مئوية، يقوم العقد الذكي تلقائيًا بوضع علامة على الدفعة على أنها منتهكة.',
        crypto_handover: 'تسليم مشفر',
        crypto_desc: 'يقوم بائع التجزئة بالتوقيع على إيصال رقمي. يتم إصدار الدفعة فقط إذا أكدت سلسلة الكتل نقل الملكية وعدم تسجيل أي انتهاكات.',
        consumer_trust: 'ثقة المستهلك',
        consumer_desc: 'يقوم المستهلكون بمسح رمز الاستجابة السريعة على العبوة. يرون التاريخ الكامل غير القابل للتغيير من المزرعة إلى الشوكة — تم التحقق منه بواسطة شبكة Polygon.',
        try_live_demo: 'جرب العرض المباشر',
        prev_step: 'السابق',
        next_step: 'الخطوة التالية',
        verified_badge: 'تم التحقق',
        menu_create_batch: 'إنشاء دفعة',
        menu_how_it_works: 'كيف يعمل',
        role_persona: 'الدور:'
    }
};
