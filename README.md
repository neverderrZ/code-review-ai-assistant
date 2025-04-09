# AI Code Review Assistant


## 📝 Описание

Прототип системы для автоматического анализа кода с AI-ассистентом. Позволяет:
- Проверять JavaScript-код на соответствие best practices
- Обнаруживать потенциальные уязвимости
- Получать рекомендации по улучшению кода

## 🛠 Технологии

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Backend**: Node.js, Express (для мок-сервера)
- **Анализ кода**: Кастомные правила + ESLint-подобные проверки
- **API**: Совместимость с OpenAI API (мок-реализация)

## 🚀 Быстрый старт

1. **Клонируйте репозиторий:
   git clone https://github.com/ваш-username/code-review-ai-assistant.git
   cd ai-code-review
2. ##Установите зависимости:
npm install

3. ##Запустите сервер:
npm start

4. ##Откройте в браузере:
http://localhost:3000


## 📂 Структура проекта

code-review-ai-assistant/

├── public/           # Статические файлы

│   ├── index.html/n

│   └── styles.css/n

├── src/              # Исходный код

│   ├── app.js        # Логика интерфейса

│   └── mockAI.js     # Мок-анализатор

├── server.js         # Сервер Node.js

└── package.json      # Зависимости


## 🧪 Тестирование
Запуск тестов (реализуется):
npm test


## Покрытие сценариев:
Корректный код → ✅ Успешный анализ

Уязвимый код → ⚠️ Предупреждения

Пустой ввод → 🛑 Ошибка валидации
