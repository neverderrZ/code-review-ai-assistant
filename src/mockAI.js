export async function mockCodeReview(code) {
    // Имитация задержки API
    await new Promise(resolve => setTimeout(resolve, 800));

    const issues = [];
    const lines = code.split('\n');
    const fullCode = lines.join('\n');
    const timestamp = new Date().toISOString();

    // ======================
    // 1. Валидация входных данных
    // ======================
    if (!code.trim()) {
        return formatResponse([{
            type: 'error',
            title: 'Пустой ввод',
            message: 'Вы не предоставили код для анализа',
            line: 1
        }], timestamp);
    }

    // ======================
    // 2. Синтаксические проверки (построчные)
    // ======================
    lines.forEach((line, index) => {
        const lineNumber = index + 1;
        const trimmedLine = line.trim();

        // Пропуск пустых строк и комментариев
        if (!trimmedLine || trimmedLine.startsWith('//')) return;

        checkForVar(line, lineNumber, issues);
        checkForLooseEquality(line, lineNumber, issues);
        checkForConsoleLog(line, lineNumber, issues);
        checkForMissingTypes(line, lineNumber, issues); // Новая проверка
    });

    // ======================
    // 3. Структурные проверки
    // ======================
    checkForUnusedVariables(fullCode, issues); // Новая проверка
    checkForTryWithoutCatch(fullCode, issues);
    checkForInfiniteLoops(fullCode, issues);

    // ======================
    // 4. Проверки безопасности
    // ======================
    checkForEval(fullCode, issues);
    checkForInnerHtml(fullCode, issues);

    // ======================
    // 5. Успешный случай
    // ======================
    if (issues.length === 0) {
        issues.push({
            type: 'success',
            title: 'Анализ завершён',
            message: 'Код соответствует лучшим практикам'
        });
    }

    return formatResponse(issues, timestamp);
}

// ======================
// Вспомогательные функции проверок
// ======================

function checkForVar(line, lineNumber, issues) {
    if (line.includes('var ')) {
        issues.push({
            type: 'error',
            title: 'Устаревший синтаксис',
            message: 'Используйте const/let вместо var',
            line: lineNumber,
            suggestion: line.replace('var ', 'const ')
        });
    }
}

function checkForLooseEquality(line, lineNumber, issues) {
    if (line.includes(' == ') && !line.includes(' == null')) {
        issues.push({
            type: 'warning',
            title: 'Нестрогое сравнение',
            message: 'Рекомендуется использовать ===',
            line: lineNumber,
            suggestion: line.replace(' == ', ' === ')
        });
    }
}

function checkForConsoleLog(line, lineNumber, issues) {
    if (line.includes('console.log(')) {
        issues.push({
            type: 'warning',
            title: 'Отладочный вывод',
            message: 'Удалите console.log перед коммитом',
            line: lineNumber
        });
    }
}

function checkForMissingTypes(line, lineNumber, issues) {
    if (line.match(/(let|const)\s+\w+\s*(=|[;\)])/) && !line.includes(':')) {
        issues.push({
            type: 'warning',
            title: 'Отсутствие типа',
            message: 'Рекомендуется указать тип переменной',
            line: lineNumber,
            suggestion: line.replace(/(let|const)\s+(\w+)/, '$1 $2: type')
        });
    }
}

function checkForUnusedVariables(fullCode, issues) {
    const variableRegex = /(?:let|const|var)\s+(\w+)\s*=/g;
    const usedVariables = new Set();
    let match;

    // Собираем использованные переменные
    while ((match = variableRegex.exec(fullCode)) !== null) {
        const varName = match[1];
        const usageRegex = new RegExp(`\\b${varName}\\b`, 'g');
        const usages = fullCode.match(usageRegex) || [];
        if (usages.length <= 1) {
            const line = getLineNumber(fullCode, `${match[0]}`);
            issues.push({
                type: 'warning',
                title: 'Неиспользуемая переменная',
                message: `Переменная "${varName}" объявлена, но не используется`,
                line: line
            });
        }
    }
}

function checkForTryWithoutCatch(fullCode, issues) {
    if (/try\s*\{[^}]*\}(?!\s*catch)/g.test(fullCode)) {
        issues.push({
            type: 'error',
            title: 'Необработанные ошибки',
            message: 'Блок try должен иметь catch или finally',
            line: getLineNumber(fullCode, 'try {')
        });
    }
}

function checkForInfiniteLoops(fullCode, issues) {
    if (/for\s*\(\s*;\s*;\s*\)/.test(fullCode)) {
        issues.push({
            type: 'error',
            title: 'Бесконечный цикл',
            message: 'Обнаружен потенциально бесконечный цикл for(;;)',
            line: getLineNumber(fullCode, 'for(;;)')
        });
    }
}

function checkForEval(fullCode, issues) {
    if (/eval\(/.test(fullCode)) {
        issues.push({
            type: 'error',
            title: 'Опасный код',
            message: 'Избегайте eval() из-за уязвимостей',
            line: getLineNumber(fullCode, 'eval('),
            suggestion: '// Замените на Function() или другие методы'
        });
    }
}

function checkForInnerHtml(fullCode, issues) {
    if (/innerHTML\s*=/.test(fullCode)) {
        issues.push({
            type: 'error',
            title: 'XSS-уязвимость',
            message: 'Используйте textContent вместо innerHTML',
            line: getLineNumber(fullCode, 'innerHTML'),
            suggestion: 'element.textContent = safeValue;'
        });
    }
}

// ======================
// Сервисные функции
// ======================

function formatResponse(issues, timestamp) {
    return {
        choices: [{
            message: {
                role: "assistant",
                content: JSON.stringify({
                    issues,
                    metadata: {
                        timestamp,
                        analysisTimeMs: 800,
                        issuesCount: issues.length,
                        rulesChecked: 10 // Количество реализованных проверок
                    }
                })
            }
        }]
    };
}

function getLineNumber(code, pattern) {
    const lines = code.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(pattern)) {
            return i + 1;
        }
    }
    return null;
}