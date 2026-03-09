/**
 * CodeAlpha Calculator Logic
 * Handles arithmetic operations, theme toggling, keyboard input, and history.
 */

class Calculator {
    constructor(previousOperandTextElement, currentOperandTextElement) {
        this.previousOperandTextElement = previousOperandTextElement;
        this.currentOperandTextElement = currentOperandTextElement;
        this.clear();
        this.history = [];
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.shouldResetScreen = false;
    }

    delete() {
        if (this.currentOperand === '0') return;
        if (this.currentOperand.length === 1 || (this.currentOperand.length === 2 && this.currentOperand.startsWith('-'))) {
            this.currentOperand = '0';
        } else {
            this.currentOperand = this.currentOperand.toString().slice(0, -1);
        }
    }

    appendNumber(number) {
        if (this.shouldResetScreen) {
            this.currentOperand = '';
            this.shouldResetScreen = false;
        }
        if (number === '.' && this.currentOperand.includes('.')) return;
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number.toString();
        } else {
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }
    }

    chooseOperation(operation) {
        if (this.currentOperand === '' && operation !== '-') return;
        
        // Handle negative numbers for empty operand
        if (this.currentOperand === '' && operation === '-') {
            this.currentOperand = '-';
            return;
        }

        if (this.currentOperand === '-') return;

        if (this.previousOperand !== '') {
            this.compute();
        }
        
        // Map operations to symbols
        const opMap = {
            'add': '+',
            'subtract': '-',
            'multiply': '×',
            'divide': '÷'
        };
        
        this.operation = opMap[operation] || operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '';
    }

    percent() {
        if (this.currentOperand === '') return;
        const current = parseFloat(this.currentOperand);
        if (isNaN(current)) return;
        
        // Simple percent of current value
        this.currentOperand = (current / 100).toString();
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        if (isNaN(prev) || isNaN(current)) return;
        
        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '×':
                computation = prev * current;
                break;
            case '÷':
                if (current === 0) {
                    alert('Cannot divide by zero');
                    this.clear();
                    return;
                }
                computation = prev / current;
                break;
            default:
                return;
        }
        
        // Fix floating point precision issues
        computation = Math.round(computation * 10000000000) / 10000000000;
        
        this.addToHistory(`${prev} ${this.operation} ${current}`, computation);
        
        this.currentOperand = computation.toString();
        this.operation = undefined;
        this.previousOperand = '';
        this.shouldResetScreen = true;
    }

    addToHistory(expression, result) {
        this.history.unshift({ expression, result });
        if (this.history.length > 20) this.history.pop();
        this.updateHistoryUI();
    }

    clearHistory() {
        this.history = [];
        this.updateHistoryUI();
    }

    updateHistoryUI() {
        const historyList = document.getElementById('history-list');
        historyList.innerHTML = '';
        this.history.forEach(item => {
            const li = document.createElement('li');
            li.classList.add('history-item');
            li.innerHTML = `
                <div class="expr">${item.expression} =</div>
                <div class="res">${item.result}</div>
            `;
            // Click to reuse
            li.addEventListener('click', () => {
                this.currentOperand = item.result.toString();
                this.shouldResetScreen = true;
                this.updateDisplay();
                document.getElementById('history-panel').classList.remove('active');
            });
            historyList.appendChild(li);
        });
    }

    getDisplayNumber(number) {
        if (number === '-') return '-';
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        let integerDisplay;
        
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
        }
        
        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    updateDisplay() {
        this.currentOperandTextElement.innerText = this.getDisplayNumber(this.currentOperand);
        
        // Dynamically reduce font size for large numbers
        if (this.currentOperand.length > 10) {
            this.currentOperandTextElement.style.fontSize = '2rem';
        } else {
            this.currentOperandTextElement.style.fontSize = '3.5rem';
        }

        if (this.operation != null) {
            this.previousOperandTextElement.innerText = 
                `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
        } else {
            this.previousOperandTextElement.innerText = '';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const previousOperandTextElement = document.getElementById('previous-operand');
    const currentOperandTextElement = document.getElementById('current-operand');
    
    // Initialize Calculator
    const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement);

    // Number Buttons
    document.querySelectorAll('.number').forEach(button => {
        button.addEventListener('click', () => {
            applyPressAnimation(button);
            calculator.appendNumber(button.dataset.value);
            calculator.updateDisplay();
        });
    });

    // Operation Buttons
    document.querySelectorAll('.operator').forEach(button => {
        button.addEventListener('click', () => {
            applyPressAnimation(button);
            const action = button.dataset.action;
            
            if (action === 'clear') {
                calculator.clear();
            } else if (action === 'delete') {
                calculator.delete();
            } else if (action === 'percent') {
                calculator.percent();
            } else {
                calculator.chooseOperation(action);
            }
            calculator.updateDisplay();
        });
    });

    // Equals Button
    const equalsBtn = document.querySelector('.equals');
    equalsBtn.addEventListener('click', () => {
        applyPressAnimation(equalsBtn);
        calculator.compute();
        calculator.updateDisplay();
    });

    // Keyboard Support
    document.addEventListener('keydown', e => {
        if (e.key >= '0' && e.key <= '9' || e.key === '.') {
            calculator.appendNumber(e.key);
            calculator.updateDisplay();
        }
        if (e.key === '=' || e.key === 'Enter') {
            e.preventDefault();
            calculator.compute();
            calculator.updateDisplay();
        }
        if (e.key === 'Backspace') {
            calculator.delete();
            calculator.updateDisplay();
        }
        if (e.key === 'Escape') {
            calculator.clear();
            calculator.updateDisplay();
        }
        if (e.key === '+' || e.key === '-') {
            calculator.chooseOperation(e.key === '+' ? 'add' : 'subtract');
            calculator.updateDisplay();
        }
        if (e.key === '*' || e.key === '/') {
            e.preventDefault();
            calculator.chooseOperation(e.key === '*' ? 'multiply' : 'divide');
            calculator.updateDisplay();
        }
        if (e.key === '%') {
            calculator.percent();
            calculator.updateDisplay();
        }
    });

    // Button Press Animation Helper
    function applyPressAnimation(button) {
        button.style.animation = 'none';
        button.offsetHeight; /* trigger reflow */
        button.style.animation = 'buttonPress 0.2s ease-out';
    }

    // Theme Toggle
    const themeToggle = document.getElementById('theme-toggle');
    const htmlEl = document.documentElement;
    const toggleIcon = themeToggle.querySelector('i');

    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        htmlEl.setAttribute('data-theme', 'light');
        toggleIcon.className = 'fas fa-moon toggle-icon';
    }

    themeToggle.addEventListener('click', () => {
        if (htmlEl.getAttribute('data-theme') === 'dark') {
            htmlEl.setAttribute('data-theme', 'light');
            toggleIcon.className = 'fas fa-moon toggle-icon';
        } else {
            htmlEl.setAttribute('data-theme', 'dark');
            toggleIcon.className = 'fas fa-sun toggle-icon';
        }
    });

    // History Toggle
    const historyToggle = document.getElementById('history-toggle');
    const historyPanel = document.getElementById('history-panel');
    const clearHistoryBtn = document.getElementById('clear-history');

    historyToggle.addEventListener('click', () => {
        historyPanel.classList.toggle('hidden');
        // A tiny delay to allow display:block to apply before animating opacity/transform via 'active' class
        setTimeout(() => {
            historyPanel.classList.toggle('active');
        }, 10);
    });

    clearHistoryBtn.addEventListener('click', () => {
        calculator.clearHistory();
    });
});
