class PasswordGenerator {
    constructor() {
        this.uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        this.lowercase = 'abcdefghijklmnopqrstuvwxyz';
        this.numbers = '0123456789';
        this.symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        this.similar = 'il1Lo0O';
        
        this.elements = {
            passwordOutput: document.getElementById('passwordOutput'),
            lengthSlider: document.getElementById('lengthSlider'),
            lengthValue: document.getElementById('lengthValue'),
            quantitySlider: document.getElementById('quantitySlider'),
            quantityValue: document.getElementById('quantityValue'),
            includeUppercase: document.getElementById('includeUppercase'),
            includeLowercase: document.getElementById('includeLowercase'),
            includeNumbers: document.getElementById('includeNumbers'),
            includeSymbols: document.getElementById('includeSymbols'),
            excludeSimilar: document.getElementById('excludeSimilar'),
            generateBtn: document.getElementById('generateBtn'),
            copyBtn: document.getElementById('copyBtn'),
            passwordList: document.getElementById('passwordList'),
            strengthBar: document.getElementById('strengthBar'),
            strengthText: document.getElementById('strengthText'),
            secButtons: document.querySelectorAll('.sec-btn')
        };

        this.setupEventListeners();
        this.generatePasswords();
    }

    setupEventListeners() {
        // Sliders
        this.elements.lengthSlider.addEventListener('input', (e) => {
            this.elements.lengthValue.textContent = e.target.value;
            this.generatePasswords();
        });

        this.elements.quantitySlider.addEventListener('input', (e) => {
            this.elements.quantityValue.textContent = e.target.value;
            this.generatePasswords();
        });

        // Checkboxes
        ['includeUppercase', 'includeLowercase', 'includeNumbers', 'includeSymbols', 'excludeSimilar'].forEach(id => {
            this.elements[id].addEventListener('change', () => this.generatePasswords());
        });

        // Security level buttons
        this.elements.secButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.elements.secButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.setSecurityLevel(btn.dataset.level);
                this.generatePasswords();
            });
        });

        // Generate button
        this.elements.generateBtn.addEventListener('click', () => this.generatePasswords());

        // Copy buttons
        this.elements.copyBtn.addEventListener('click', () => this.copyPassword());
    }

    setSecurityLevel(level) {
        const settings = {
            low: { length: 8, uppercase: true, lowercase: true, numbers: false, symbols: false },
            medium: { length: 12, uppercase: true, lowercase: true, numbers: true, symbols: false },
            high: { length: 20, uppercase: true, lowercase: true, numbers: true, symbols: true }
        };

        const config = settings[level];
        if (config) {
            this.elements.lengthSlider.value = config.length;
            this.elements.lengthValue.textContent = config.length;
            this.elements.includeUppercase.checked = config.uppercase;
            this.elements.includeLowercase.checked = config.lowercase;
            this.elements.includeNumbers.checked = config.numbers;
            this.elements.includeSymbols.checked = config.symbols;
        }
    }

    generatePasswords() {
        const count = parseInt(this.elements.quantitySlider.value);
        const passwords = [];
        
        for (let i = 0; i < count; i++) {
            passwords.push(this.generatePassword());
        }

        this.displayPasswords(passwords);
        if (passwords.length > 0) {
            this.elements.passwordOutput.value = passwords[0];
            this.updateStrength(passwords[0]);
        }
    }

    generatePassword() {
        const length = parseInt(this.elements.lengthSlider.value);
        let chars = '';
        let password = '';

        // Build character set
        if (this.elements.includeUppercase.checked) chars += this.uppercase;
        if (this.elements.includeLowercase.checked) chars += this.lowercase;
        if (this.elements.includeNumbers.checked) chars += this.numbers;
        if (this.elements.includeSymbols.checked) chars += this.symbols;

        // Remove similar characters if needed
        if (this.elements.excludeSimilar.checked) {
            chars = chars.split('').filter(char => !this.similar.includes(char)).join('');
        }

        // Fallback if no character types selected
        if (chars.length === 0) {
            chars = this.lowercase + this.numbers;
        }

        // Generate password
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * chars.length);
            password += chars[randomIndex];
        }

        return password;
    }

    displayPasswords(passwords) {
        const list = this.elements.passwordList;
        list.innerHTML = '';

        passwords.forEach((password, index) => {
            const item = document.createElement('div');
            item.className = 'password-list-item';
            
            const passwordSpan = document.createElement('span');
            passwordSpan.textContent = password;
            
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-item';
            copyBtn.textContent = 'Copiar';
            copyBtn.dataset.password = password;
            copyBtn.addEventListener('click', () => {
                this.copySpecificPassword(password);
            });

            item.appendChild(passwordSpan);
            item.appendChild(copyBtn);
            list.appendChild(item);
        });
    }

    copyPassword() {
        const password = this.elements.passwordOutput.value;
        if (password) {
            this.copyToClipboard(password);
        }
    }

    copySpecificPassword(password) {
        this.copyToClipboard(password);
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            const btn = this.elements.copyBtn;
            const originalText = btn.textContent;
            btn.textContent = '✅';
            setTimeout(() => {
                btn.textContent = originalText;
            }, 2000);
        }).catch(() => {
            // Fallback para navegadores antigos
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        });
    }

    updateStrength(password) {
        let score = 0;
        const length = password.length;
        
        // Length scoring
        if (length >= 8) score += 1;
        if (length >= 12) score += 1;
        if (length >= 16) score += 1;
        if (length >= 20) score += 1;

        // Character variety scoring
        if (/[a-z]/.test(password)) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^a-zA-Z0-9]/.test(password)) score += 1;

        // Determine strength
        let strength, width;
        if (score < 4) {
            strength = 'Fraca';
            width = 'weak';
        } else if (score < 6) {
            strength = 'Média';
            width = 'medium';
        } else {
            strength = 'Forte';
            width = 'strong';
        }

        this.elements.strengthBar.className = `strength-bar ${width}`;
        this.elements.strengthText.textContent = `Força: ${strength}`;
    }
}

// Inicializar o gerador quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    new PasswordGenerator();
});
