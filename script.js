(() => {
    const display = document.getElementById('display');
    let current = '';
    let lastResult = '';

    function updateDisplay(text) {
        display.textContent = text || '0';
    }

    function safeEval(expr) {
        
        if (!/^[0-9+\-*/().\s]+$/.test(expr)) return 'Error';
        try {
            
            let res = eval(expr);
            if (typeof res === 'number' && !isFinite(res)) return 'Error';
            
            if (Math.round(res) !== res) res = parseFloat(res.toFixed(10));
            return String(res);
        } catch (e) {
            return 'Error';
        }
    }

    function press(value) {
        if (value === 'C') { current = ''; updateDisplay(current); return; }
        if (value === 'BACK') { current = current.slice(0, -1); updateDisplay(current); return; }
        if (value === '=') {
            const out = safeEval(current);
            updateDisplay(out);
            lastResult = out;
            current = String(out === 'Error' ? '' : out);
            return;
        }
       
        if (value === '.') {
            const parts = current.split(/[\+\-\*\/]/);
            const last = parts[parts.length - 1];
            if (last.includes('.')) return;
        }
        current += value;
        updateDisplay(current);
    }

    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const v = btn.dataset.value;
            const a = btn.dataset.action;
            if (a === 'clear') return press('C');
            if (a === 'back') return press('BACK');
            if (a === 'equals') return press('=');
            press(v);
        });
    });

    
    window.addEventListener('keydown', e => {
        const key = e.key;
        if ((/^[0-9]$/).test(key)) return press(key);
        if (key === 'Enter') return press('=');
        if (key === 'Backspace') return press('BACK');
        if (key === 'Escape') return press('C');
        if (key === '.') return press('.');
        if (key === '+' || key === '-' || key === '*' || key === '/') return press(key);
        
        if (key === '(' || key === ')') return press(key);
    });

    updateDisplay('0');
})();
