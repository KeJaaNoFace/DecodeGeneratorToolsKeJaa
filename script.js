/**
 * DecryptorCode by KeJaa - Main Script
 * Client-side decryption & encoding tools with Pakasir integration
 */

// Configuration
const CONFIG = {
    PAKASIR_API_KEY: '0U9NxUQJHnMKcROslIzDNjLuxtgdZJsB',
    WEBHOOK_URL: 'https://decryptgeneratorkejaa.vercel.app/api/webhook',
    DOMAIN: 'https://decryptgeneratorkejaa.vercel.app',
    MAX_FREE_USES: 3
};

// Global variables
let usageCount = 0;
let isPremium = false;
let userIP = '';
let userLicense = '';

// Algorithm definitions (sama seperti sebelumnya)
const ALGORITHMS = {
    encoding: [
        { id: 'base64', name: 'Base64', icon: 'fas fa-code' },
        { id: 'base32', name: 'Base32', icon: 'fas fa-hashtag' },
        { id: 'hex', name: 'Hexadecimal', icon: 'fas fa-hashtag' },
        { id: 'binary', name: 'Binary', icon: 'fas fa-digital-tachograph' },
        { id: 'url', name: 'URL Encoding', icon: 'fas fa-link' },
        { id: 'morse', name: 'Morse Code', icon: 'fas fa-wave-square' },
        { id: 'rot13', name: 'ROT13', icon: 'fas fa-rotate' },
        { id: 'ascii', name: 'ASCII', icon: 'fas fa-font' }
    ],
    cipher: [
        { id: 'caesar', name: 'Caesar Cipher', icon: 'fas fa-key' },
        { id: 'vigenere', name: 'Vigenère', icon: 'fas fa-lock' },
        { id: 'xor', name: 'XOR Cipher', icon: 'fas fa-xmark' },
        { id: 'atbash', name: 'Atbash', icon: 'fas fa-exchange-alt' },
        { id: 'aes', name: 'AES', icon: 'fas fa-shield-alt' },
        { id: 'des', name: 'DES', icon: 'fas fa-lock' },
        { id: 'rc4', name: 'RC4', icon: 'fas fa-random' }
    ],
    hash: [
        { id: 'md5', name: 'MD5', icon: 'fas fa-fingerprint' },
        { id: 'sha1', name: 'SHA-1', icon: 'fas fa-fingerprint' },
        { id: 'sha256', name: 'SHA-256', icon: 'fas fa-fingerprint' },
        { id: 'sha512', name: 'SHA-512', icon: 'fas fa-fingerprint' },
        { id: 'crc32', name: 'CRC32', icon: 'fas fa-calculator' }
    ],
    custom: [
        { id: 'custom1', name: 'Custom Algorithm 1', icon: 'fas fa-star' },
        { id: 'custom2', name: 'Custom Algorithm 2', icon: 'fas fa-star' },
        { id: 'custom3', name: 'Custom Algorithm 3', icon: 'fas fa-star' }
    ]
};

// Initialize application
class DecryptorCode {
    constructor() {
        this.init();
    }
    
    async init() {
        // Hide loading screen
        setTimeout(() => {
            document.getElementById('loadingScreen').style.opacity = '0';
            setTimeout(() => {
                document.getElementById('loadingScreen').style.display = 'none';
            }, 500);
        }, 1000);
        
        // Load user data
        await this.loadUserData();
        
        // Setup UI
        this.setupUI();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize algorithm options
        this.renderAlgorithmOptions();
        
        // Render supported algorithms
        this.renderSupportedAlgorithms();
        
        // Update usage display
        this.updateUsageDisplay();
        
        console.log('DecryptorCode initialized with Pakasir integration');
    }
    
    async loadUserData() {
        // Check localStorage for premium status
        const premiumData = localStorage.getItem('decryptorcode_premium');
        if (premiumData) {
            const data = JSON.parse(premiumData);
            isPremium = data.isPremium;
            userLicense = data.licenseKey || '';
            
            if (isPremium) {
                document.getElementById('statusText').textContent = 'Premium User';
                document.getElementById('statusText').style.color = '#ffd700';
                document.getElementById('statusText').innerHTML = '<i class="fas fa-crown"></i> Premium User';
            }
        }
        
        // Get user IP
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            userIP = data.ip;
        } catch (error) {
            userIP = '127.0.0.1';
        }
        
        // Load usage count from localStorage
        const today = new Date().toDateString();
        const usageData = localStorage.getItem(`decryptorcode_usage_${today}_${userIP}`);
        if (usageData) {
            usageCount = parseInt(usageData);
        }
        
        // Check license validity
        if (userLicense) {
            await this.verifyLicense(userLicense);
        }
    }
    
    async verifyLicense(licenseKey) {
        try {
            // In production, verify with your backend
            // For demo, we'll use a simple check
            const response = await fetch(`${CONFIG.DOMAIN}/api/verify-license`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    licenseKey: licenseKey,
                    email: 'user@example.com'
                })
            });
            
            const result = await response.json();
            
            if (result.valid) {
                isPremium = true;
                this.savePremiumStatus(licenseKey);
                this.showNotification('License activated successfully!', 'success');
            } else {
                isPremium = false;
                localStorage.removeItem('decryptorcode_premium');
                this.showNotification('License expired or invalid', 'error');
            }
            
            this.updateUsageDisplay();
            
        } catch (error) {
            console.error('License verification error:', error);
        }
    }
    
    savePremiumStatus(licenseKey) {
        const premiumData = {
            isPremium: true,
            licenseKey: licenseKey,
            activatedAt: new Date().toISOString()
        };
        localStorage.setItem('decryptorcode_premium', JSON.stringify(premiumData));
    }
    
    setupUI() {
        // Update character counter
        const inputText = document.getElementById('inputText');
        const charCount = document.getElementById('charCount');
        
        inputText.addEventListener('input', () => {
            const length = inputText.value.length;
            charCount.textContent = `${length} characters`;
            
            if (document.getElementById('autoDetect').checked && length > 0) {
                this.autoDetectAlgorithm(inputText.value);
            }
        });
        
        // Setup algorithm tabs
        const tabs = document.querySelectorAll('.algo-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const type = e.target.dataset.type;
                
                tabs.forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                
                document.querySelectorAll('.algo-options').forEach(opt => {
                    opt.classList.add('d-none');
                });
                document.getElementById(`${type}Options`).classList.remove('d-none');
            });
        });
        
        // Setup license activation
        document.getElementById('activateBtn').addEventListener('click', () => {
            this.activateLicense();
        });
        
        document.getElementById('licenseKey').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.activateLicense();
            }
        });
    }
    
    setupEventListeners() {
        // Decrypt button
        document.getElementById('decryptBtn').addEventListener('click', () => {
            this.handleDecrypt();
        });
        
        // Encode button
        document.getElementById('encodeBtn').addEventListener('click', () => {
            this.handleEncode();
        });
        
        // History button
        document.getElementById('historyBtn').addEventListener('click', () => {
            this.showHistory();
        });
        
        // Clear button
        document.getElementById('clearBtn').addEventListener('click', () => {
            document.getElementById('inputText').value = '';
            document.getElementById('charCount').textContent = '0 characters';
            document.getElementById('outputText').textContent = 'Hasil decode akan muncul di sini...';
            this.resetAnalysis();
        });
        
        // Paste button
        document.getElementById('pasteBtn').addEventListener('click', async () => {
            try {
                const text = await navigator.clipboard.readText();
                document.getElementById('inputText').value = text;
                document.getElementById('charCount').textContent = `${text.length} characters`;
                
                if (document.getElementById('autoDetect').checked) {
                    this.autoDetectAlgorithm(text);
                }
            } catch (error) {
                this.showNotification('Cannot access clipboard. Please paste manually.', 'error');
            }
        });
        
        // Sample button
        document.getElementById('sampleBtn').addEventListener('click', () => {
            const samples = [
                "SGVsbG8gV29ybGQh", // Base64: Hello World!
                "48656c6c6f20576f726c6421", // Hex: Hello World!
                "U3Vrc2VzIGJlbGFqYXIgUHJlbWl1bSE=", // Base64: Success belajar Premium!
                "44GT44KT44Gr44Gh44Gv" // Base64 (Japanese)
            ];
            const randomSample = samples[Math.floor(Math.random() * samples.length)];
            document.getElementById('inputText').value = randomSample;
            document.getElementById('charCount').textContent = `${randomSample.length} characters`;
            
            if (document.getElementById('autoDetect').checked) {
                this.autoDetectAlgorithm(randomSample);
            }
        });
        
        // Copy result button
        document.getElementById('copyResult').addEventListener('click', () => {
            const output = document.getElementById('outputText').textContent;
            navigator.clipboard.writeText(output).then(() => {
                this.showNotification('Result copied to clipboard!', 'success');
            });
        });
        
        // Download result button
        document.getElementById('downloadResult').addEventListener('click', () => {
            this.downloadResult();
        });
        
        // Share result button
        document.getElementById('shareResult').addEventListener('click', () => {
            this.shareResult();
        });
    }
    
    renderAlgorithmOptions() {
        // Render encoding options
        const encodingContainer = document.getElementById('encodingOptions');
        encodingContainer.innerHTML = ALGORITHMS.encoding.map(algo => `
            <div class="algo-option" data-algo="${algo.id}">
                <i class="${algo.icon}"></i>
                <span>${algo.name}</span>
            </div>
        `).join('');
        
        // Add click listeners
        document.querySelectorAll('.algo-option').forEach(option => {
            option.addEventListener('click', (e) => {
                document.querySelectorAll('.algo-option').forEach(opt => {
                    opt.classList.remove('active');
                });
                e.target.closest('.algo-option').classList.add('active');
                
                const algoId = e.target.closest('.algo-option').dataset.algo;
                this.updateDetectionInfo(algoId);
            });
        });
    }
    
    renderSupportedAlgorithms() {
        const container = document.getElementById('algorithmsGrid');
        const allAlgorithms = [...ALGORITHMS.encoding, ...ALGORITHMS.cipher, ...ALGORITHMS.hash, ...ALGORITHMS.custom];
        
        container.innerHTML = allAlgorithms.map(algo => `
            <div class="algorithm-card">
                <div class="algorithm-icon">
                    <i class="${algo.icon}"></i>
                </div>
                <h5>${algo.name}</h5>
                <p>${this.getAlgorithmDescription(algo.id)}</p>
            </div>
        `).join('');
    }
    
    getAlgorithmDescription(algoId) {
        const descriptions = {
            'base64': 'Encode/decode Base64 format',
            'hex': 'Hexadecimal encoding/decoding',
            'rot13': 'Simple letter substitution cipher',
            'caesar': 'Classical Caesar cipher',
            'aes': 'Advanced Encryption Standard',
            'md5': 'Message Digest algorithm',
            'sha256': 'Secure Hash Algorithm 256-bit'
        };
        return descriptions[algoId] || 'Encoding/decoding algorithm';
    }
    
    async handleDecrypt() {
        // Check usage limit for free users
        if (!isPremium && usageCount >= CONFIG.MAX_FREE_USES) {
            this.showUsageLimitModal();
            return;
        }
        
        const input = document.getElementById('inputText').value.trim();
        if (!input) {
            this.showNotification('Please enter some text to decrypt!', 'error');
            return;
        }
        
        // Get selected algorithm
        const selectedAlgo = document.querySelector('.algo-option.active');
        if (!selectedAlgo && !document.getElementById('autoDetect').checked) {
            this.showNotification('Please select an algorithm!', 'error');
            return;
        }
        
        // Start processing
        this.showProcessing(true);
        
        const startTime = Date.now();
        
        try {
            let result = '';
            const algoId = selectedAlgo ? selectedAlgo.dataset.algo : this.detectAlgorithm(input);
            
            // Check if algorithm requires premium
            if (this.isPremiumAlgorithm(algoId) && !isPremium) {
                result = `Algorithm "${algoId}" requires Premium. Upgrade to unlock!`;
            } else {
                // Process based on algorithm
                result = this.decodeWithAlgorithm(input, algoId);
            }
            
            // Update output
            document.getElementById('outputText').textContent = result;
            
            // Update stats
            const endTime = Date.now();
            document.getElementById('processTime').textContent = `${endTime - startTime}ms`;
            document.getElementById('outputSize').textContent = `${result.length} bytes`;
            document.getElementById('outputStatusText').textContent = 'Success';
            
            // Update analysis
            this.updateAnalysis(input, result);
            
            // Increment usage count for free users
            if (!isPremium) {
                usageCount++;
                const today = new Date().toDateString();
                localStorage.setItem(`decryptorcode_usage_${today}_${userIP}`, usageCount);
                this.updateUsageDisplay();
            }
            
            // Save to history
            this.saveToHistory(input, result, algoId, 'decrypt');
            
        } catch (error) {
            document.getElementById('outputText').textContent = `Error: ${error.message}`;
            document.getElementById('outputStatusText').textContent = 'Failed';
            this.showNotification(`Decryption failed: ${error.message}`, 'error');
        } finally {
            this.showProcessing(false);
        }
    }
    
    handleEncode() {
        // Similar to handleDecrypt but for encoding
        // Implementation would be similar
        this.showNotification('Encode feature coming soon!', 'info');
    }
    
    decodeWithAlgorithm(input, algoId) {
        switch(algoId) {
            case 'base64':
                return this.decodeBase64(input);
            case 'hex':
                return this.decodeHex(input);
            case 'url':
                return decodeURIComponent(input);
            case 'rot13':
                return this.decodeROT13(input);
            case 'caesar':
                return this.decodeCaesar(input);
            case 'binary':
                return this.decodeBinary(input);
            case 'morse':
                return this.decodeMorse(input);
            default:
                return `Algorithm "${algoId}" not implemented in demo. Requires full version.`;
        }
    }
    
    // Decoding functions
    decodeBase64(str) {
        try {
            return atob(str);
        } catch {
            try {
                return atob(str.replace(/-/g, '+').replace(/_/g, '/'));
            } catch {
                return "Invalid Base64 string";
            }
        }
    }
    
    decodeHex(str) {
        // Remove spaces and non-hex characters
        const hex = str.replace(/[^0-9A-Fa-f]/g, '');
        let result = '';
        for (let i = 0; i < hex.length; i += 2) {
            result += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        }
        return result;
    }
    
    decodeBinary(str) {
        const binary = str.replace(/[^01]/g, '');
        let result = '';
        for (let i = 0; i < binary.length; i += 8) {
            const byte = binary.substr(i, 8);
            if (byte.length === 8) {
                result += String.fromCharCode(parseInt(byte, 2));
            }
        }
        return result;
    }
    
    decodeROT13(str) {
        return str.replace(/[a-zA-Z]/g, function(c) {
            return String.fromCharCode(
                (c <= 'Z' ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26
            );
        });
    }
    
    decodeCaesar(str, shift = 3) {
        return str.replace(/[a-zA-Z]/g, function(c) {
            const base = c <= 'Z' ? 65 : 97;
            return String.fromCharCode((c.charCodeAt(0) - base - shift + 26) % 26 + base);
        });
    }
    
    decodeMorse(str) {
        const morseCode = {
            '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E',
            '..-.': 'F', '--.': 'G', '....': 'H', '..': 'I', '.---': 'J',
            '-.-': 'K', '.-..': 'L', '--': 'M', '-.': 'N', '---': 'O',
            '.--.': 'P', '--.-': 'Q', '.-.': 'R', '...': 'S', '-': 'T',
            '..-': 'U', '...-': 'V', '.--': 'W', '-..-': 'X', '-.--': 'Y',
            '--..': 'Z', '-----': '0', '.----': '1', '..---': '2', '...--': '3',
            '....-': '4', '.....': '5', '-....': '6', '--...': '7', '---..': '8',
            '----.': '9', '/': ' '
        };
        
        return str.split(' ').map(code => morseCode[code] || code).join('');
    }
    
    isPremiumAlgorithm(algoId) {
        const premiumAlgorithms = ['aes', 'des', 'rc4', 'vigenere', 'xor', 'custom1', 'custom2', 'custom3'];
        return premiumAlgorithms.includes(algoId);
    }
    
    autoDetectAlgorithm(str) {
        // Simple auto-detection
        if (/^[A-Za-z0-9+/]+=*$/.test(str) && str.length % 4 === 0) {
            this.updateDetectionInfo('base64', 'High');
        } else if (/^[0-9A-Fa-f\s]+$/.test(str)) {
            this.updateDetectionInfo('hex', 'Medium');
        } else if (/^[01\s]+$/.test(str)) {
            this.updateDetectionInfo('binary', 'Medium');
        } else if (str.includes('%')) {
            this.updateDetectionInfo('url', 'High');
        } else if (/^[.\-\s\/]+$/.test(str)) {
            this.updateDetectionInfo('morse', 'Low');
        } else {
            this.updateDetectionInfo('unknown', 'Low');
        }
    }
    
    detectAlgorithm(str) {
        if (/^[A-Za-z0-9+/]+=*$/.test(str)) return 'base64';
        if (/^[0-9A-Fa-f\s]+$/.test(str)) return 'hex';
        if (/^[01\s]+$/.test(str)) return 'binary';
        if (str.includes('%20') || str.includes('%')) return 'url';
        if (/^[.\-\s\/]+$/.test(str)) return 'morse';
        return 'rot13';
    }
    
    updateDetectionInfo(algo, confidence = 'Medium') {
        document.getElementById('detectedAlgo').textContent = algo;
        document.getElementById('detectedType').textContent = this.getAlgorithmType(algo);
        
        const confidenceMap = { High: 90, Medium: 60, Low: 30 };
        const confidenceValue = confidenceMap[confidence] || 50;
        document.getElementById('confidenceBar').style.width = `${confidenceValue}%`;
        document.getElementById('confidenceValue').textContent = `${confidenceValue}%`;
    }
    
    getAlgorithmType(algoId) {
        for (const [type, algorithms] of Object.entries(ALGORITHMS)) {
            if (algorithms.find(a => a.id === algoId)) {
                return type.charAt(0).toUpperCase() + type.slice(1);
            }
        }
        return 'Unknown';
    }
    
    updateAnalysis(input, output) {
        const entropy = this.calculateEntropy(input);
        document.getElementById('entropyBar').style.width = `${Math.min(entropy * 10, 100)}%`;
        document.getElementById('entropyValue').textContent = entropy.toFixed(2);
    }
    
    calculateEntropy(str) {
        const len = str.length;
        if (len === 0) return 0;
        
        const frequencies = {};
        for (const char of str) {
            frequencies[char] = (frequencies[char] || 0) + 1;
        }
        
        let entropy = 0;
        for (const freq of Object.values(frequencies)) {
            const probability = freq / len;
            entropy -= probability * Math.log2(probability);
        }
        
        return isNaN(entropy) ? 0 : entropy;
    }
    
    resetAnalysis() {
        document.getElementById('entropyBar').style.width = '0%';
        document.getElementById('entropyValue').textContent = '0.00';
        document.getElementById('confidenceBar').style.width = '0%';
        document.getElementById('confidenceValue').textContent = '0%';
        document.getElementById('detectedAlgo').textContent = 'Unknown';
        document.getElementById('detectedType').textContent = 'Unknown';
    }
    
    updateUsageDisplay() {
        const usageElement = document.getElementById('usageCount');
        if (isPremium) {
            usageElement.textContent = '∞';
            usageElement.style.color = '#ffd700';
            usageElement.innerHTML = '<i class="fas fa-infinity"></i>';
        } else {
            usageElement.textContent = `${usageCount}/${CONFIG.MAX_FREE_USES}`;
            usageElement.style.color = usageCount >= CONFIG.MAX_FREE_USES ? '#ff4757' : '#00ff88';
        }
    }
    
    async activateLicense() {
        const licenseKey = document.getElementById('licenseKey').value.trim();
        
        if (!licenseKey) {
            this.showNotification('Please enter a license key', 'error');
            return;
        }
        
        // Simple validation
        if (!licenseKey.startsWith('DC-') || licenseKey.length < 10) {
            this.showNotification('Invalid license key format', 'error');
            return;
        }
        
        this.showNotification('Activating license...', 'info');
        
        // Simulate verification (in production, call your backend)
        setTimeout(() => {
            // For demo, accept any key with proper format
            if (licenseKey.includes('-')) {
                isPremium = true;
                this.savePremiumStatus(licenseKey);
                this.updateUsageDisplay();
                this.showNotification('License activated successfully! Premium features unlocked.', 'success');
                document.getElementById('statusText').innerHTML = '<i class="fas fa-crown"></i> Premium User';
                document.getElementById('licenseKey').value = '';
            } else {
                this.showNotification('Invalid license key', 'error');
            }
        }, 1500);
    }
    
    showUsageLimitModal() {
        const modalHTML = `
            <div class="modal fade" id="limitModal">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title"><i class="fas fa-crown"></i> Usage Limit Reached</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <p>You've used all ${CONFIG.MAX_FREE_USES} free decrypts for today (IP: ${userIP}).</p>
                            <p>Upgrade to Premium for unlimited access:</p>
                            <ul>
                                <li><i class="fas fa-infinity"></i> Unlimited decrypts per day</li>
                                <li><i class="fas fa-hammer"></i> Brute force attacks</li>
                                <li><i class="fas fa-bolt"></i> Batch processing</li>
                                <li><i class="fas fa-star"></i> Priority support</li>
                                <li><i class="fas fa-shield-alt"></i> Advanced algorithms</li>
                            </ul>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Continue Free</button>
                            <a href="premium.html" class="btn btn-primary">Upgrade to Premium</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = new bootstrap.Modal(document.getElementById('limitModal'));
        modal.show();
        
        document.getElementById('limitModal').addEventListener('hidden.bs.modal', () => {
            document.getElementById('limitModal').remove();
        });
    }
    
    showProcessing(show) {
        const outputStatus = document.getElementById('outputStatus');
        if (show) {
            outputStatus.textContent = 'Processing...';
            outputStatus.style.color = '#ffa502';
            document.getElementById('outputText').textContent = 'Decrypting...';
        } else {
            outputStatus.textContent = 'Ready';
            outputStatus.style.color = '#00ff88';
        }
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('hide');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    downloadResult() {
        const result = document.getElementById('outputText').textContent;
        const blob = new Blob([result], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `decryptorcode_result_${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.showNotification('Result downloaded!', 'success');
    }
    
    shareResult() {
        const result = document.getElementById('outputText').textContent;
        if (navigator.share) {
            navigator.share({
                title: 'DecryptorCode Result',
                text: result.substring(0, 100) + (result.length > 100 ? '...' : ''),
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(result).then(() => {
                this.showNotification('Result copied to clipboard for sharing!', 'success');
            });
        }
    }
    
    saveToHistory(input, output, algorithm, type) {
        const history = JSON.parse(localStorage.getItem('decryptorcode_history') || '[]');
        history.unshift({
            timestamp: new Date().toISOString(),
            type: type,
            input: input.substring(0, 100) + (input.length > 100 ? '...' : ''),
            output: output.substring(0, 100) + (output.length > 100 ? '...' : ''),
            algorithm: algorithm,
            premium: isPremium
        });
        
        if (history.length > 50) history.pop();
        localStorage.setItem('decryptorcode_history', JSON.stringify(history));
    }
    
    showHistory() {
        const history = JSON.parse(localStorage.getItem('decryptorcode_history') || '[]');
        
        if (history.length === 0) {
            this.showNotification('No history yet. Start decrypting!', 'info');
            return;
        }
        
        let historyHTML = '<div class="history-modal"><h4><i class="fas fa-history"></i> Recent Activity</h4>';
        
        history.forEach((item, index) => {
            historyHTML += `
                <div class="history-item">
                    <div class="history-header">
                        <span class="history-time">${new Date(item.timestamp).toLocaleString()}</span>
                        <span class="history-type ${item.type}">${item.type}</span>
                    </div>
                    <div class="history-algo">Algorithm: ${item.algorithm}</div>
                    <div class="history-input">Input: ${item.input}</div>
                    <div class="history-output">Output: ${item.output}</div>
                </div>
            `;
        });
        
        historyHTML += '</div>';
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'history-modal-overlay';
        modal.innerHTML = historyHTML;
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        document.body.appendChild(modal);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.decryptor = new DecryptorCode();
});

// Add CSS for notifications and history modal
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(21, 21, 32, 0.95);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        padding: 1rem 1.5rem;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        backdrop-filter: blur(10px);
        max-width: 400px;
    }
    
    .notification-success {
        border-left: 4px solid #00ff88;
    }
    
    .notification-info {
        border-left: 4px solid #4d7cfe;
    }
    
    .notification-error {
        border-left: 4px solid #ff4757;
    }
    
    .notification i {
        font-size: 1.2rem;
    }
    
    .notification-success i {
        color: #00ff88;
    }
    
    .notification-info i {
        color: #4d7cfe;
    }
    
    .notification-error i {
        color: #ff4757;
    }
    
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    .notification.hide {
        animation: slideOut 0.3s ease forwards;
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .history-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(5px);
    }
    
    .history-modal {
        background: rgba(21, 21, 32, 0.95);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 15px;
        padding: 2rem;
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
        backdrop-filter: blur(20px);
    }
    
    .history-modal h4 {
        margin-bottom: 1.5rem;
        color: var(--color-cyan);
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .history-item {
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        padding: 1rem;
        margin-bottom: 1rem;
    }
    
    .history-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
    }
    
    .history-time {
        color: rgba(255, 255, 255, 0.6);
        font-size: 0.9rem;
    }
    
    .history-type {
        background: rgba(77, 124, 254, 0.2);
        color: var(--color-cyan);
        padding: 3px 8px;
        border-radius: 5px;
        font-size: 0.8rem;
        font-weight: 600;
    }
    
    .history-type.decrypt {
        background: rgba(0, 212, 255, 0.2);
    }
    
    .history-type.encode {
        background: rgba(255, 71, 87, 0.2);
    }
    
    .history-algo, .history-input, .history-output {
        font-size: 0.9rem;
        margin-bottom: 5px;
        color: rgba(255, 255, 255, 0.8);
    }
    
    .license-box {
        background: rgba(0, 0, 0, 0.3);
        border-radius: var(--radius-medium);
        padding: 1.5rem;
        margin-top: 2rem;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .license-box h5 {
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .license-form {
        display: flex;
        gap: 10px;
        margin-bottom: 10px;
    }
    
    .license-form input {
        flex: 1;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: white;
        padding: 10px;
        border-radius: var(--radius-small);
    }
    
    .btn-activate {
        background: var(--gradient-blue);
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: var(--radius-small);
        font-weight: 600;
        cursor: pointer;
        transition: var(--transition-normal);
    }
    
    .btn-activate:hover {
        opacity: 0.9;
    }
    
    .license-note {
        font-size: 0.8rem;
        color: rgba(255, 255, 255, 0.6);
        margin: 0;
    }
`;
document.head.appendChild(style);