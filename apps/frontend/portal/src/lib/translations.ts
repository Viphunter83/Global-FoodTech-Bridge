export type Language = 'en' | 'ru' | 'ar' | 'vi';

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
    | 'menu_create_batch'
    | 'menu_how_it_works'
    | 'role_persona'
    | 'chart_title'
    | 'chart_desc'
    | 'chart_no_data'
    | 'map_loading'
    | 'bc_processing'
    | 'bc_violation_title'
    | 'bc_violation_details'
    | 'bc_handover_title'
    | 'bc_handover_desc'
    | 'bc_secured_title'
    | 'bc_secured_desc'
    | 'btn_report'
    | 'retailer_checkpoint'
    | 'btn_accept_handover'
    | 'btn_notarize'
    | 'bc_waiting_manufacturer'
    | 'back_dashboard'
    | 'batch_id'
    | 'batch_target_temp'
    | 'sla_violations_title'
    | 'sla_violations_desc'
    | 'map_interface_placeholder'
    | 'map_last_known'
    | 'location_tracking_title'
    | 'bc_validation_title'
    | 'tx_hash_label'
    | 'notary_authority_label'
    | 'smart_contract_name'
    | 'view_explorer_link'
    | 'scan_share'
    | 'verify_page_title'
    | 'verified_badge'
    | 'product_details_tab'
    | 'provenance_tab'
    | 'ingredients_label'
    | 'nutrition_label'
    | 'halal_cert_label'
    | 'report_issue_btn'
    | 'consumer_feedback_title'
    | 'btn_download_report'
    | 'btn_print_qr'
    | 'btn_accept_custody'
    | 'btn_dispatch_truck'
    | 'btn_transfer_retailer'
    | 'btn_transfer_logistics'
    | 'alert_dispatched'
    | 'bc_waiting_logistics'
    | 'create_batch_title'
    | 'create_batch_subtitle'
    | 'form_manufacturer_id'
    | 'form_product_type'
    | 'form_batch_size'
    | 'form_ingredients'
    | 'form_product_details_ipfs'
    | 'form_production_date'
    | 'form_expiration_date'
    | 'form_certificates'
    | 'form_certificates_sub'
    | 'btn_upload_file'
    | 'msg_batch_created'
    | 'msg_track_status'
    | 'msg_create_another'
    | 'pick_date'
    | 'permission_warning'
    | 'permission_warning_desc'
    | 'recent_batches_title'
    | 'ipfs_section_title'
    | 'ipfs_certificates_header'
    | 'ipfs_no_documents'
    | 'form_production_location'
    | 'form_production_location'
    | 'form_origin_location'
    | 'form_destination_country'
    | 'form_unit_of_measure'
    | 'unit_kg'
    | 'unit_lbs'
    | 'unit_units'
    | 'live_tracking_active'
    | 'timeline_departed_origin'
    | 'timeline_arrived_port'
    | 'timeline_loaded_vessel'
    | 'timeline_customs_clearance'
    | 'timeline_arrived_destination'
    | 'timeline_update_checkpoint'
    | 'batch_route'
    | 'monitoring_title'
    | 'monitoring_subtitle'
    | 'monitoring_refresh'
    | 'monitoring_project_label'
    | 'monitoring_updated_at'
    | 'monitoring_health_check'
    | 'monitoring_uptime_label'
    | 'monitoring_uptime_value'
    | 'monitoring_cpu_usage'
    | 'monitoring_memory_usage'
    | 'monitoring_endpoint_link'
    | 'monitoring_trust_index_title'
    | 'monitoring_trust_index_desc'
    | 'monitoring_avg_uptime'
    | 'monitoring_active_services'
    | 'monitoring_railway_connected'
    | 'monitoring_no_data'
    | 'admin_companies'
    | 'admin_monitoring'
    | 'admin_back_to_app'
    | 'admin_operator_title'
    | 'menu_admin'
    | 'form_select_template'
    | 'template_label_ambient'
    | 'template_label_cold'
    | 'status_verified'
    | 'required'
    | 'farm_to_fork_journey';

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
        menu_create_batch: 'Create Batch',
        menu_how_it_works: 'How it Works',
        menu_admin: 'Admin',
        role_persona: 'Persona:',
        chart_title: 'Temperature History',
        chart_desc: 'Real-time sensor readings (°C)',
        chart_no_data: 'No telemetry data available.',
        map_loading: '[ Interactive Supply Chain Map Loading... ]',
        bc_processing: 'Processing Blockchain Tx...',
        bc_violation_title: 'Compliance Violation Recorded',
        bc_violation_details: 'Details:',
        bc_handover_title: 'Handover Completed & Verified',
        bc_handover_desc: 'Product successfully accepted by Retailer.',
        bc_secured_title: 'Secured on Polygon',
        bc_secured_desc: 'Batch passport is immutable.',
        btn_report: 'Report Incident',
        retailer_checkpoint: 'Retailer Checkpoint',
        btn_accept_handover: 'Accept & Finalize Handover',
        btn_notarize: 'Notarize on Blockchain',
        bc_waiting_manufacturer: 'Waiting for Manufacturer to notarize...',
        back_dashboard: 'Back to Dashboard',
        batch_id: 'Batch ID:',
        batch_target_temp: 'Target: {min}°C to {max}°C',
        sla_violations_title: 'Attention: SLA Violations Detected',
        sla_violations_desc: 'Compliance violations recorded in blockchain history.',
        location_tracking_title: 'Location Tracking',
        map_interface_placeholder: 'Map Interface',
        map_last_known: 'Last known:',
        bc_validation_title: 'Blockchain Validation',
        tx_hash_label: 'Transaction Hash',
        notary_authority_label: 'Notary Authority',
        smart_contract_name: 'Global FoodTech Bridge Smart Contract',
        view_explorer_link: 'View on Block Explorer →',
        scan_share: 'Scan to Share',
        verify_page_title: 'Product Verification',
        verified_badge: 'Authentic & Verified',
        product_details_tab: 'Product Details',
        provenance_tab: 'Journey',
        ingredients_label: 'Ingredients',
        nutrition_label: 'Nutrition Facts',
        halal_cert_label: 'Halal Certificate',
        report_issue_btn: 'Report Quality Issue',
        consumer_feedback_title: 'Consumer Feedback',
        btn_download_report: 'Download Compliance Report',
        btn_print_qr: 'Print Label / QR',
        btn_accept_custody: 'Accept Custody from Producer',
        btn_dispatch_truck: 'Dispatch Truck',
        btn_transfer_retailer: 'Transfer to Retailer',
        btn_transfer_logistics: 'Transfer to Logistics',
        alert_dispatched: 'Truck Dispatched! Status updated to In Transit.',
        bc_waiting_logistics: 'Waiting for Logistics provider...',
        create_batch_title: 'Create New Batch',
        create_batch_subtitle: 'Enter production details below',
        form_manufacturer_id: 'Manufacturer ID',
        form_product_type: 'Product Type',
        form_batch_size: 'Batch Size',
        form_ingredients: 'Ingredients List',
        form_product_details_ipfs: 'Product Authentication Data (IPFS)',
        form_select_template: 'Select Supply Chain Template',
        template_label_ambient: 'Ambient Goods Export',
        template_label_cold: 'Standard Cold Chain',
        form_production_date: 'Production Date',
        form_expiration_date: 'Expiration Date',
        form_certificates: 'Certificates (PDF/JPG)',
        form_certificates_sub: 'Click to upload or drag and drop',
        template_label_cold: 'Standard Cold Chain',
        status_verified: 'Verified',
        required: 'Required',
        farm_to_fork_journey: 'Product Life Journey',
        msg_track_status: 'Track Batch Status',
        msg_create_another: 'Create Another',
        pick_date: 'Pick a date',
        permission_warning: 'Permission Warning',
        permission_warning_desc: 'Only MANUFACTURER can create new batches.',
        recent_batches_title: 'Recently Created Batches (Local)',
        ipfs_section_title: 'Digital Product Passport (IPFS)',
        ipfs_certificates_header: 'Certificates & Documents',
        ipfs_no_documents: 'No documents uploaded.',
        form_production_location: 'Production Location (City, Country)',
        form_origin_location: 'Dispatch Location (Port/Warehouse)',
        form_destination_country: 'Destination Country',
        form_unit_of_measure: 'Unit of Measure',
        unit_kg: 'Kilograms (kg)',
        unit_lbs: 'Pounds (lbs)',
        unit_units: 'Units (pcs)',
        live_tracking_active: 'Live Tracking Active',
        timeline_departed_origin: 'Departed Origin',
        timeline_arrived_port: 'Arrived at Port',
        timeline_loaded_vessel: 'Loaded on Vessel',
        timeline_customs_clearance: 'Customs Clearance',
        timeline_arrived_destination: 'Arrived at Destination',
        timeline_update_checkpoint: 'Update Logistics Checkpoint',
        batch_route: 'Trade Route',
        monitoring_title: 'Infrastructure Monitoring',
        monitoring_subtitle: 'Real-time status of Global FoodTech Bridge services on Railway.',
        monitoring_refresh: 'Refresh Status',
        monitoring_project_label: 'Project:',
        monitoring_updated_at: 'Updated',
        monitoring_health_check: 'Health Check',
        monitoring_uptime_label: 'Uptime',
        monitoring_uptime_value: '{value}% Uptime',
        monitoring_cpu_usage: 'CPU Usage',
        monitoring_memory_usage: 'Memory',
        monitoring_endpoint_link: 'View Service endpoint →',
        monitoring_trust_index_title: 'Infrastructure Trust Index',
        monitoring_trust_index_desc: 'Our platform maintains high availability through automated recovery and multi-region deployment.',
        monitoring_avg_uptime: 'Average Uptime',
        monitoring_active_services: 'Active Services',
        monitoring_railway_connected: 'Railway Connected',
        monitoring_no_data: 'No infrastructure data available.',
        admin_companies: 'Companies',
        admin_monitoring: 'Monitoring',
        admin_back_to_app: 'Back to App',
        admin_operator_title: 'Platform Operator'
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
        menu_create_batch: 'Создать партию',
        menu_how_it_works: 'Как это работает',
        menu_admin: 'Админ',
        role_persona: 'Роль:',
        chart_title: 'История температур',
        chart_desc: 'Показания датчиков в реальном времени (°C)',
        chart_no_data: 'Нет данных телеметрии.',
        map_loading: '[ Загрузка интерактивной карты поставок... ]',
        bc_processing: 'Обработка транзакции...',
        bc_violation_title: 'Зафиксировано нарушение',
        bc_violation_details: 'Подробности:',
        bc_handover_title: 'Передача завершена и проверена',
        bc_handover_desc: 'Товар успешно принят ритейлером.',
        bc_secured_title: 'Защищено в Polygon',
        bc_secured_desc: 'Паспорт партии неизменен.',
        btn_report: 'Сообщить об инциденте',
        retailer_checkpoint: 'Контрольная точка ритейлера',
        btn_accept_handover: 'Принять и завершить передачу',
        btn_notarize: 'Нотаризировать в блокчейне',
        bc_waiting_manufacturer: 'Ожидание нотаризации производителем...',
        back_dashboard: 'Назад в дашборд',
        batch_id: 'ID партии:',
        batch_target_temp: 'Цель: от {min}°C до {max}°C',
        sla_violations_title: 'Внимание: Нарушения SLA',
        sla_violations_desc: 'Нарушения зафиксированы в истории блокчейна.',
        location_tracking_title: 'Отслеживание местоположения',
        map_interface_placeholder: 'Интерфейс карты',
        map_last_known: 'Последнее известно:',
        bc_validation_title: 'Валидация блокчейна',
        tx_hash_label: 'Хеш транзакции',
        notary_authority_label: 'Нотариус',
        smart_contract_name: 'Смарт-контракт Global FoodTech Bridge',
        view_explorer_link: 'Смотреть в Block Explorer →',
        scan_share: 'Сканируйте чтобы поделиться',
        verify_page_title: 'Проверка подлинности',
        verified_badge: 'Подлинно и проверено',
        product_details_tab: 'О продукте',
        provenance_tab: 'Путь (История)',
        ingredients_label: 'Состав',
        nutrition_label: 'Пищевая ценность',
        halal_cert_label: 'Сертификат Халяль',
        report_issue_btn: 'Сообщить о проблеме',
        consumer_feedback_title: 'Обратная связь',
        btn_download_report: 'Скачать отчет о соответствии (PDF)',
        btn_print_qr: 'Печать этикетки / QR',
        btn_accept_custody: 'Принять груз от производителя',
        btn_dispatch_truck: 'Отправить грузовик',
        btn_transfer_retailer: 'Передать ритейлеру',
        btn_transfer_logistics: 'Передать в логистику',
        alert_dispatched: 'Грузовик отправлен! Статус обновлен на "В пути".',
        bc_waiting_logistics: 'Ожидание логистического оператора...',
        create_batch_title: 'Создать новую партию',
        create_batch_subtitle: 'Введите детали производства',
        form_manufacturer_id: 'ID Производителя',
        form_product_type: 'Тип Продукта',
        form_batch_size: 'Размер Партии',
        form_ingredients: 'Список Ингредиентов',
        form_product_details_ipfs: 'Данные аутентификации продукта (IPFS)',
        form_select_template: 'Выберите шаблон цепочки поставок',
        template_label_ambient: 'Экспорт обычных товаров',
        template_label_cold: 'Стандартная холодовая цепь',
        form_production_date: 'Дата Производства',
        form_expiration_date: 'Дата Истечения',
        form_certificates: 'Сертификаты (PDF/JPG)',
        form_certificates_sub: 'Нажмите для загрузки или перетащите',
        template_label_cold: 'Стандартная холодовая цепь',
        status_verified: 'Проверено',
        required: 'Требуется',
        farm_to_fork_journey: 'Жизненный путь продукта',
        msg_track_status: 'Отследить статус',
        msg_create_another: 'Создать еще',
        pick_date: 'Выберите дату',
        permission_warning: 'Предупреждение о правах',
        permission_warning_desc: 'Только ПРОИЗВОДИТЕЛЬ может создавать партии.',
        recent_batches_title: 'Недавно созданные партии (Локально)',
        ipfs_section_title: 'Цифровой паспорт продукта (IPFS)',
        ipfs_certificates_header: 'Сертификаты и документы',
        ipfs_no_documents: 'Документы не загружены.',
        form_production_location: 'Место производства (Город, Страна)',
        form_origin_location: 'Место отгрузки (Порт/Склад)',
        form_destination_country: 'Страна назначения',
        form_unit_of_measure: 'Единица измерения',
        unit_kg: 'Килограммы (кг)',
        unit_lbs: 'Фунты (lbs)',
        unit_units: 'Штуки (шт)',
        live_tracking_active: 'Активное отслеживание',
        timeline_departed_origin: 'Отправлено из пункта отправления',
        timeline_arrived_port: 'Прибыло в порт',
        timeline_loaded_vessel: 'Погружено на судно',
        timeline_customs_clearance: 'Таможенная очистка',
        timeline_arrived_destination: 'Прибыло в пункт назначения',
        timeline_update_checkpoint: 'Обновить контрольную точку',
        batch_route: 'Торговый маршрут',
        monitoring_title: 'Мониторинг инфраструктуры',
        monitoring_subtitle: 'Статус сервисов Global FoodTech Bridge на Railway в реальном времени.',
        monitoring_refresh: 'Обновить статус',
        monitoring_project_label: 'Проект:',
        monitoring_updated_at: 'Обновлено',
        monitoring_health_check: 'Проверка здоровья',
        monitoring_uptime_label: 'Аптайм',
        monitoring_uptime_value: '{value}% Аптайм',
        monitoring_cpu_usage: 'Загрузка CPU',
        monitoring_memory_usage: 'Память',
        monitoring_endpoint_link: 'Перейти к сервису →',
        monitoring_trust_index_title: 'Индекс доверия инфраструктуры',
        monitoring_trust_index_desc: 'Наша платформа поддерживает высокую доступность благодаря автоматическому восстановлению и развертыванию в нескольких регионах.',
        monitoring_avg_uptime: 'Средний аптайм',
        monitoring_active_services: 'Активные сервисы',
        monitoring_railway_connected: 'Подключено к Railway',
        monitoring_no_data: 'Данные об инфраструктуре отсутствуют.',
        admin_companies: 'Компании',
        admin_monitoring: 'Мониторинг',
        admin_back_to_app: 'Вернуться в приложение',
        admin_operator_title: 'Оператор платформы'
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
        menu_create_batch: 'إنشاء دفعة',
        menu_how_it_works: 'كيف يعمل',
        menu_admin: 'مشرف',
        role_persona: 'الدور:',
        chart_title: 'تاريخ درجة الحرارة',
        chart_desc: 'قراءات المستشعر في الوقت الفعلي (°C)',
        chart_no_data: 'لا توجد بيانات للقياس عن بعد.',
        map_loading: '[ تحميل خريطة سلسلة التوريد التفاعلية... ]',
        bc_processing: 'معالجة معاملة Blockchain...',
        bc_violation_title: 'تم تسجيل انتهاك للامتثال',
        bc_violation_details: 'التفاصيل:',
        bc_handover_title: 'اكتمل التسليم والتحقق منه',
        bc_handover_desc: 'تم قبول المنتج بنجاح من قبل بائع التجزئة.',
        bc_secured_title: 'مؤمن على Polygon',
        bc_secured_desc: 'جواز سفر الدفعة غير قابل للتغيير.',
        btn_report: 'الإبلاغ عن حادث',
        retailer_checkpoint: 'نقطة تفتيش بائع التجزئة',
        btn_accept_handover: 'القبول وإنهاء التسليم',
        btn_notarize: 'توثيق في Blockchain',
        bc_waiting_manufacturer: 'في انتظار الشركة المصنعة للتوثيق...',
        back_dashboard: 'العودة إلى لوحة القيادة',
        batch_id: 'معرف الدفعة:',
        batch_target_temp: 'الهدف: {min}°C إلى {max}°C',
        sla_violations_title: 'تنبيه: تم اكتشاف انتهاكات SLA',
        sla_violations_desc: 'تم تسجيل انتهاكات الامتثال في تاريخ blockchain.',
        location_tracking_title: 'تتبع الموقع',
        map_interface_placeholder: 'واجهة الخريطة',
        map_last_known: 'آخر موقع معروف:',
        bc_validation_title: 'التحقق من صحة Blockchain',
        tx_hash_label: 'تجزئة المعاملة',
        notary_authority_label: 'سلطة التوثيق',
        smart_contract_name: 'العقد الذكي Global FoodTech Bridge',
        view_explorer_link: 'عرض في Block Explorer ←',
        scan_share: 'مسح للمشاركة',
        verify_page_title: 'التحقق من المنتج',
        verified_badge: 'أصلي وموثق',
        product_details_tab: 'تفاصيل المنتج',
        provenance_tab: 'الرحلة',
        ingredients_label: 'المكونات',
        nutrition_label: 'حقائق غذائية',
        halal_cert_label: 'شهادة الحلال',
        report_issue_btn: 'الإبلاغ عن مشكلة جودة',
        consumer_feedback_title: 'ملاحظات المستهلك',
        btn_download_report: 'تحميل تقرير الامتثال',
        btn_print_qr: 'طباعة الملصق / QR',
        btn_accept_custody: 'قبول العهدة من المنتج',
        btn_dispatch_truck: 'إرسال الشاحنة',
        btn_transfer_retailer: 'نقل إلى بائع التجزئة',
        btn_transfer_logistics: 'نقل إلى اللوجستيات',
        alert_dispatched: 'تم إرسال الشاحنة! تم تحديث الحالة إلى "في الطريق".',
        bc_waiting_logistics: 'في انتظار مزود الخدمات اللوجستية...',
        create_batch_title: 'إنشاء دفعة جديدة',
        create_batch_subtitle: 'أدخل تفاصيل الإنتاج أدناه',
        form_manufacturer_id: 'معرف الشركة المصنعة',
        form_product_type: 'نوع المنتج',
        form_batch_size: 'حجم الدفعة',
        form_ingredients: 'قائمة المكونات',
        form_product_details_ipfs: 'بيانات مصادقة المنتج (IPFS)',
        form_select_template: 'اختر قالب سلسلة التوريد',
        template_label_ambient: 'تصدير السلع العادية',
        template_label_cold: 'سلسلة التبريد القياسية',
        form_production_date: 'تاريخ الإنتاج',
        form_expiration_date: 'تاريخ انتهاء الصلاحية',
        form_certificates: 'الشهادات (PDF/JPG)',
        form_certificates_sub: 'انقر للتحميل أو اسحب وأسقط',
        template_label_cold: 'سلسلة التبريد القياسية',
        status_verified: 'تم التحقق',
        required: 'مطلوب',
        farm_to_fork_journey: 'رحلة المنتج من المنتج للمستهلك',
        msg_track_status: 'تتبع حالة الدفعة',
        msg_create_another: 'إنشاء أخرى',
        pick_date: 'اختر تاريخًا',
        permission_warning: 'تحذير الإذن',
        permission_warning_desc: 'يمكن للشركة المصنعة فقط إنشاء دفعات جديدة.',
        recent_batches_title: 'الدفعات التي تم إنشاؤها مؤخرًا (محليًا)',
        ipfs_section_title: 'جواز السفر الرقمي للمنتج (IPFS)',
        ipfs_certificates_header: 'الشهادات والوثائق',
        ipfs_no_documents: 'لم يتم تحميل أي مستندات.',
        form_production_location: 'موقع الإنتاج (المدينة ، البلد)',
        form_origin_location: 'موقع الإرسال (الميناء / المستودع)',
        form_destination_country: 'بلد الوجهة',
        form_unit_of_measure: 'وحدة القياس',
        unit_kg: 'كيلوغرام (kg)',
        unit_lbs: 'رطل (lbs)',
        unit_units: 'وحدات (pcs)',
        live_tracking_active: 'التتبع المباشر نشط',
        timeline_departed_origin: 'غادرت المنشأ',
        timeline_arrived_port: 'وصلت إلى الميناء',
        timeline_loaded_vessel: 'تم التحميل على السفينة',
        timeline_customs_clearance: 'التخليص الجمركي',
        timeline_arrived_destination: 'وصلت إلى الوجهة',
        timeline_update_checkpoint: 'تحديث نقطة التفتيش',
        batch_route: 'مسار التجارة',
        monitoring_title: 'مراقبة البنية التحتية',
        monitoring_subtitle: 'حالة خدمات Global FoodTech Bridge على Railway في الوقت الفعلي.',
        monitoring_refresh: 'تحديث الحالة',
        monitoring_project_label: 'المشروع:',
        monitoring_updated_at: 'تم التحديث',
        monitoring_health_check: 'فحص الحالة',
        monitoring_uptime_label: 'وقت التشغيل',
        monitoring_uptime_value: '{value}% وقت التشغيل',
        monitoring_cpu_usage: 'استخدام المعالج',
        monitoring_memory_usage: 'الذاكرة',
        monitoring_endpoint_link: 'عرض نقطة نهاية الخدمة ←',
        monitoring_trust_index_title: 'مؤشر الثقة في البنية التحتية',
        monitoring_trust_index_desc: 'تحافظ منصتنا على توفر عالٍ من خلال الاسترداد الآلي والنشر في مناطق متعددة.',
        monitoring_avg_uptime: 'متوسط وقت التشغيل',
        monitoring_active_services: 'الخدمات النشطة',
        monitoring_railway_connected: 'متصل بـ Railway',
        monitoring_no_data: 'لا توجد بيانات للبنية التحتية متاحة.',
        admin_companies: 'الشركات',
        admin_monitoring: 'المراقبة',
        admin_back_to_app: 'العودة للتطبيق',
        admin_operator_title: 'مشغل المنصة'
    },
    vi: {
        app_title_suffix: 'Quản lý Chuỗi cung ứng',
        hero_title: 'Tin tưởng Chuỗi cung ứng của bạn.',
        hero_subtitle: 'Truy xuất nguồn gốc từ đầu đến cuối cho thương mại thực phẩm toàn cầu. Bảo mật bởi Blockchain, Xác minh bởi IoT.',
        track_placeholder: 'Nhập mã lô hàng UUID (vd: 902f1...)',
        track_button: 'Theo dõi',
        try_demo: 'Thử mã demo:',
        business_dashboard: 'Bảng điều khiển Doanh nghiệp',
        feature_traceability_title: 'Truy xuất Toàn cầu',
        feature_traceability_desc: 'Theo dõi vị trí thời gian thực từ nhà sản xuất đến điểm đến cuối cùng.',
        feature_iot_title: 'Giám sát IoT',
        feature_iot_desc: 'Tự động kiểm tra tuân thủ nhiệt độ được lưu trữ trong lịch sử bất biến.',
        feature_blockchain_title: 'Xác minh Blockchain',
        feature_blockchain_desc: 'Mỗi lô hàng được công chứng trên mạng Polygon để tạo sự tin tưởng tuyệt đối.',
        dashboard_active_batches: 'Lô hàng Đang hoạt động',
        dashboard_new: 'Mới',
        status_blockchain: 'Trạng thái Blockchain',
        status_connection_secured: 'Bảo mật',
        status_connection_pending: 'Đang chờ',
        location_current: 'Vị trí Hiện tại',
        location_updated_iot: 'Cập nhật qua IoT',
        temp_title: 'Nhiệt độ',
        temp_optimal: 'Phạm vi: < -18°C (Tối ưu)',
        live_tracking: 'Theo dõi Trực tiếp',
        live_tracking_desc: 'Dữ liệu đo lường và vị trí thời gian thực.',
        action_center: 'Trung tâm Hành động',
        action_desc: 'Quản lý các sự kiện vòng đời lô hàng.',
        role_manufacturer: 'Nhà sản xuất',
        role_logistics: 'Logistics',
        role_retailer: 'Nhà bán lẻ',
        how_title: 'Global FoodTech Bridge Hoạt động như thế nào',
        how_subtitle: 'Đảm bảo an toàn thực phẩm, tuân thủ Halal và sự minh bạch từ nông trại đến bàn ăn bằng công nghệ Blockchain và IoT.',
        back_to_app: 'Quay lại Ứng dụng',
        step_production: 'Sản xuất',
        step_logistics: 'Logistics Thông minh',
        step_handover: 'Bàn giao Tin cậy',
        step_verify: 'Người dùng Xác minh',
        passport_creation: 'Tạo Hộ chiếu Số',
        passport_desc: 'Khi một lô hàng được sản xuất, chúng tôi tạo một mã UUID duy nhất. Thành phần, chứng chỉ (Halal), và ngày hết hạn được mã hóa và lưu trữ trên Blockchain.',
        iot_monitoring: 'Giám sát IoT',
        iot_desc: 'Container thông minh báo cáo nhiệt độ mỗi 5 phút. Nếu nhiệt độ vượt quá -18°C, hợp đồng thông minh sẽ tự động đánh dấu lô hàng là VI PHẠM.',
        crypto_handover: 'Bàn giao Mã hóa',
        crypto_desc: 'Nhà bán lẻ ký biên nhận kỹ thuật số. Thanh toán chỉ được giải phóng nếu blockchain xác nhận Quyền sở hữu đã Chuyển giao và Không ghi nhận Vi phạm.',
        consumer_trust: 'Niềm tin Người tiêu dùng',
        consumer_desc: 'Người tiêu dùng quét mã QR trên bao bì. Họ thấy toàn bộ lịch sử không thể thay đổi từ trang trại đến bàn ăn—được xác minh bởi mạng Polygon.',
        try_live_demo: 'Thử Bản Demo Trực tiếp',
        prev_step: 'Trước đó',
        next_step: 'Bước Tiếp theo',
        menu_create_batch: 'Tạo Lô hàng',
        menu_how_it_works: 'Cách hoạt động',
        menu_admin: 'Quản trị',
        role_persona: 'Vai trò:',
        chart_title: 'Lịch sử Nhiệt độ',
        chart_desc: 'Số đo cảm biến thời gian thực (°C)',
        chart_no_data: 'Không có dữ liệu đo lường.',
        map_loading: '[ Đang tải bản đồ chuỗi cung ứng... ]',
        bc_processing: 'Đang xử lý giao dịch Blockchain...',
        bc_violation_title: 'Ghi nhận Vi phạm Tuân thủ',
        bc_violation_details: 'Chi tiết:',
        bc_handover_title: 'Bàn giao Đã hoàn tất & Xác minh',
        bc_handover_desc: 'Sản phẩm đã được Nhà bán lẻ chấp nhận thành công.',
        bc_secured_title: 'Bảo mật trên Polygon',
        bc_secured_desc: 'Hộ chiếu lô hàng là bất biến.',
        btn_report: 'Báo cáo Sự cố',
        retailer_checkpoint: 'Điểm kiểm tra Nhà bán lẻ',
        btn_accept_handover: 'Chấp nhận & Hoàn tất Bàn giao',
        btn_notarize: 'Công chứng trên Blockchain',
        bc_waiting_manufacturer: 'Đang chờ Nhà sản xuất công chứng...',
        back_dashboard: 'Quay lại Bảng điều khiển',
        batch_id: 'Mã Lô hàng:',
        batch_target_temp: 'Mục tiêu: {min}°C đến {max}°C',
        sla_violations_title: 'Chú ý: Phát hiện Vi phạm SLA',
        sla_violations_desc: 'Vi phạm tuân thủ được ghi lại trong lịch sử blockchain.',
        location_tracking_title: 'Theo dõi Vị trí',
        map_interface_placeholder: 'Giao diện Bản đồ',
        map_last_known: 'Cập nhật cuối:',
        bc_validation_title: 'Xác thực Blockchain',
        tx_hash_label: 'Mã băm giao dịch',
        notary_authority_label: 'Cơ quan công chứng',
        smart_contract_name: 'Hợp đồng thông minh Global FoodTech Bridge',
        view_explorer_link: 'Xem trên trình duyệt khối →',
        scan_share: 'Quét để chia sẻ',
        verify_page_title: 'Xác minh Sản phẩm',
        verified_badge: 'Chính hãng & Đã xác minh',
        product_details_tab: 'Chi tiết Sản phẩm',
        provenance_tab: 'Hành trình',
        ingredients_label: 'Thành phần',
        nutrition_label: 'Thông tin Dinh dưỡng',
        halal_cert_label: 'Chứng chỉ Halal',
        report_issue_btn: 'Báo cáo Vấn đề Chất lượng',
        consumer_feedback_title: 'Phản hồi Người tiêu dùng',
        btn_download_report: 'Tải Báo cáo Tuân thủ',
        btn_print_qr: 'In Nhãn / QR',
        btn_accept_custody: 'Chấp nhận Ủy thác từ Sản xuất',
        btn_dispatch_truck: 'Điều động Xe tải',
        btn_transfer_retailer: 'Chuyển cho Nhà bán lẻ',
        btn_transfer_logistics: 'Chuyển cho Logistics',
        alert_dispatched: 'Xe tải đã xuất phát! Trạng thái cập nhật: Đang vận chuyển.',
        bc_waiting_logistics: 'Đang chờ nhà cung cấp Logistics...',
        create_batch_title: 'Tạo Lô hàng Mới',
        create_batch_subtitle: 'Nhập chi tiết sản xuất bên dưới',
        form_manufacturer_id: 'Mã Nhà sản xuất',
        form_product_type: 'Loại Sản phẩm',
        form_batch_size: 'Kích thước Lô',
        form_ingredients: 'Danh sách Thành phần',
        form_product_details_ipfs: 'Dữ liệu xác thực sản phẩm (IPFS)',
        form_select_template: 'Chọn mẫu chuỗi cung ứng',
        template_label_ambient: 'Xuất khẩu hàng thường',
        template_label_cold: 'Chuỗi cung ứng lạnh tiêu chuẩn',
        form_production_date: 'Ngày Sản xuất',
        form_expiration_date: 'Ngày Hết hạn',
        form_certificates: 'Chứng chỉ (PDF/JPG)',
        form_certificates_sub: 'Nhấp để tải lên hoặc kéo thả',
        template_label_cold: 'Chuỗi cung ứng lạnh tiêu chuẩn',
        status_verified: 'Đã xác minh',
        required: 'Yêu cầu',
        farm_to_fork_journey: 'Hành trình từ Trang trại đến Bàn ăn',
        msg_track_status: 'Theo dõi Trạng thái Lô hàng',
        msg_create_another: 'Tạo lô khác',
        pick_date: 'Chọn ngày',
        permission_warning: 'Cảnh báo Quyền hạn',
        permission_warning_desc: 'Chỉ NHÀ SẢN XUẤT mới có thể tạo lô hàng mới.',
        recent_batches_title: 'Các lô hàng tạo gần đây (Cục bộ)',
        ipfs_section_title: 'Hộ chiếu Sản phẩm Số (IPFS)',
        ipfs_certificates_header: 'Chứng chỉ & Tài liệu',
        ipfs_no_documents: 'Chưa có tài liệu nào được tải lên.',
        form_production_location: 'Địa điểm Sản xuất (Thành phố, Quốc gia)',
        form_origin_location: 'Địa điểm Xuất phát (Cảng/Kho)',
        form_destination_country: 'Quốc gia Đến',
        form_unit_of_measure: 'Đơn vị Đo lường',
        unit_kg: 'Kilôgam (kg)',
        unit_lbs: 'Pao (lbs)',
        unit_units: 'Đơn vị (pcs)',
        live_tracking_active: 'Theo dõi Trực tiếp Hoạt động',
        timeline_departed_origin: 'Đã xuất phát từ điểm đóng gói',
        timeline_arrived_port: 'Đã đến Cảng xuất',
        timeline_loaded_vessel: 'Đã xếp lên tàu/máy bay',
        timeline_customs_clearance: 'Thông quan Hải quan',
        timeline_arrived_destination: 'Đã đến kho điểm đích',
        timeline_update_checkpoint: 'Cập nhật trạm kiểm soát mới',
        batch_route: 'Tuyến đường thương mại',
        monitoring_title: 'Giám sát Hạ tầng',
        monitoring_subtitle: 'Trạng thái thời gian thực của các dịch vụ Global FoodTech Bridge trên Railway.',
        monitoring_refresh: 'Làm mới Trạng thái',
        monitoring_project_label: 'Dự án:',
        monitoring_updated_at: 'Cập nhật',
        monitoring_health_check: 'Kiểm tra Sức khỏe',
        monitoring_uptime_label: 'Thời gian hoạt động',
        monitoring_uptime_value: '{value}% Thời gian hoạt động',
        monitoring_cpu_usage: 'Sử dụng CPU',
        monitoring_memory_usage: 'Bộ nhớ',
        monitoring_endpoint_link: 'Xem điểm cuối dịch vụ →',
        monitoring_trust_index_title: 'Chỉ số Tin cậy Hạ tầng',
        monitoring_trust_index_desc: 'Nền tảng của chúng tôi duy trì tính khả dụng cao thông qua khôi phục tự động và triển khai đa khu vực.',
        monitoring_avg_uptime: 'Thời gian hoạt động Trung bình',
        monitoring_active_services: 'Dịch vụ Đang hoạt động',
        monitoring_railway_connected: 'Đã kết nối Railway',
        monitoring_no_data: 'Không có dữ liệu hạ tầng.',
        admin_companies: 'Công ty',
        admin_monitoring: 'Giám sát',
        admin_back_to_app: 'Quay lại Ứng dụng',
        admin_operator_title: 'Điều hành Nền tảng'
    }
};
