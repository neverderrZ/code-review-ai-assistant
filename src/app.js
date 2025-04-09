import { mockCodeReview } from './mockAI.js';

document.addEventListener('DOMContentLoaded', () => {
    // Элементы интерфейса
    const codeInput = document.getElementById('codeInput');
    const submitBtn = document.getElementById('submitBtn');
    const resultsDiv = document.getElementById('results');
    const loadingIndicator = document.getElementById('loadingIndicator');

    // Обработчик отправки
    submitBtn.addEventListener('click', handleCodeReview);

    async function handleCodeReview() {
        // Сброс состояния
        resetUI();
        
        // Получение кода
        const code = codeInput.value.trim();
        
        // Валидация
        if (!validateInput(code)) return;
        
        // Анализ кода
        await analyzeAndDisplayResults(code);
    }

    function resetUI() {
        resultsDiv.innerHTML = '';
        codeInput.classList.remove('error');
    }

    function validateInput(code) {
        if (!code) {
            showError('Введите код для анализа');
            return false;
        }
        
        if (!isCodeLike(code)) {
            showError('Введённый текст не похож на код');
            return false;
        }
        
        return true;
    }

    function isCodeLike(text) {
        const codePatterns = [
            /\b(function|if|for|while|return|const|let|var)\b/,
            /=>|\(\)|{|}|;|=/
        ];
        return codePatterns.some(pattern => pattern.test(text));
    }

    function showError(message) {
        codeInput.classList.add('error');
        resultsDiv.innerHTML = `
            <div class="error-message">
                ${message}
            </div>
        `;
    }

    async function analyzeAndDisplayResults(code) {
        try {
            showLoading(true);
            
            const response = await mockCodeReview(code);
            const data = JSON.parse(response.choices[0].message.content);
            
            if (data?.issues?.length) {
                displayIssues(data.issues);
            } else {
                showNoIssues();
            }
        } catch (error) {
            console.error('Analysis error:', error);
            showError('Ошибка при анализе кода');
        } finally {
            showLoading(false);
        }
    }

    function displayIssues(issues) {
        issues.forEach(issue => {
            const issueElement = document.createElement('div');
            issueElement.className = `issue ${issue.type}`;
            
            let content = `
                <h3>${issue.title}</h3>
                <p>${issue.message}</p>
            `;
            
            if (issue.line) {
                content += `<p class="line-info">Строка: ${issue.line}</p>`;
            }
            
            if (issue.suggestion) {
                content += `<pre class="suggestion">${issue.suggestion}</pre>`;
            }
            
            issueElement.innerHTML = content;
            resultsDiv.appendChild(issueElement);
        });
    }

    function showNoIssues() {
        resultsDiv.innerHTML = `
            <div class="success-message">
                Код соответствует стандартам качества
            </div>
        `;
    }

    function showLoading(show) {
        loadingIndicator.style.display = show ? 'block' : 'none';
        submitBtn.disabled = show;
    }
});