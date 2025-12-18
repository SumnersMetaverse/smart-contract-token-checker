/**
 * Popup JavaScript for ERC20 Token Inspector Extension
 * Handles UI interactions and token inspection
 */

class TokenInspectorApp {
    constructor() {
        this.inspector = new ERC20Inspector();
        this.recentContracts = [];
        this.maxRecentContracts = 10;
        this.currentNetwork = 'ethereum';
        this.debugMode = false;
        this.operationLog = [];
        this.networkActivity = [];
        this.networkConfigs = {
            ethereum: {
                name: 'Ethereum',
                rpcUrl: 'https://cloudflare-eth.com',
                explorerUrl: 'https://etherscan.io',
                chainId: 1
            },
            polygon: {
                name: 'Polygon',
                rpcUrl: 'https://polygon-rpc.com',
                explorerUrl: 'https://polygonscan.com',
                chainId: 137
            },
            bsc: {
                name: 'BSC',
                rpcUrl: 'https://bsc-dataseed.binance.org',
                explorerUrl: 'https://bscscan.com',
                chainId: 56
            }
        };
        
        this.initializeElements();
        this.bindEvents();
        this.loadRecentContracts();
        this.updateRecentSection();
        this.loadDebugMode();
        this.logOperation('Application initialized', 'info');
    }

    /**
     * Initialize DOM elements
     */
    initializeElements() {
        this.contractInput = document.getElementById('contractInput');
        this.inspectBtn = document.getElementById('inspectBtn');
        this.networkSelect = document.getElementById('networkSelect');
        this.errorMessage = document.getElementById('errorMessage');
        this.successMessage = document.getElementById('successMessage');
        this.resultsSection = document.getElementById('resultsSection');
        this.recentSection = document.getElementById('recentSection');
        this.recentList = document.getElementById('recentList');
        this.darkModeToggle = document.getElementById('darkModeToggle');
        this.openPopupInNewTab = document.getElementById('openPopupInNewTab');
        
        // Debug mode elements
        this.debugModeToggle = document.getElementById('debugModeToggle');
        this.debugPanel = document.getElementById('debugPanel');
        this.clearLogsBtn = document.getElementById('clearLogsBtn');
        this.exportLogsBtn = document.getElementById('exportLogsBtn');
        
        // Token header elements
        this.tokenIcon = document.getElementById('tokenIcon');
        this.tokenName = document.getElementById('tokenName');
        this.tokenSymbol = document.getElementById('tokenSymbol');
        this.tokenPrice = document.getElementById('tokenPrice');
        this.etherscanBtn = document.getElementById('etherscanBtn');
        this.copyAddressBtn = document.getElementById('copyAddressBtn');
        this.openNewTabBtn = document.getElementById('openNewTabBtn');
        this.openSameTabBtn = document.getElementById('openSameTabBtn');
        
        // Additional token info elements
        this.tokenDescription = document.getElementById('tokenDescription');
        this.tokenWebsite = document.getElementById('tokenWebsite');
        this.tokenTwitter = document.getElementById('tokenTwitter');
        this.tokenTelegram = document.getElementById('tokenTelegram');
        this.tokenGithub = document.getElementById('tokenGithub');
        
        // Basic info elements
        this.tokenNameValue = document.getElementById('tokenNameValue');
        this.tokenSymbolValue = document.getElementById('tokenSymbolValue');
        this.tokenDecimals = document.getElementById('tokenDecimals');
        this.tokenSupply = document.getElementById('tokenSupply');
        this.tokenAddress = document.getElementById('tokenAddress');
        this.tokenNetwork = document.getElementById('tokenNetwork');
        
        // Market info elements
        this.marketInfo = document.getElementById('marketInfo');
        this.tokenPriceValue = document.getElementById('tokenPriceValue');
        this.tokenMarketCap = document.getElementById('tokenMarketCap');
        this.token24hChange = document.getElementById('token24hChange');
        
        // Contract info elements
        this.contractInfo = document.getElementById('contractInfo');
        this.tokenOwner = document.getElementById('tokenOwner');
        this.tokenDeployedBlock = document.getElementById('tokenDeployedBlock');
        this.tokenVerified = document.getElementById('tokenVerified');
        this.tokenStatus = document.getElementById('tokenStatus');
        this.ownerItem = document.getElementById('ownerItem');
        this.deployedBlockItem = document.getElementById('deployedBlockItem');
        this.verifiedItem = document.getElementById('verifiedItem');
        this.statusItem = document.getElementById('statusItem');
        
        // Holders info elements
        this.holdersInfo = document.getElementById('holdersInfo');
        this.tokenHoldersCount = document.getElementById('tokenHoldersCount');
        this.tokenTransfersCount = document.getElementById('tokenTransfersCount');
        this.topHolders = document.getElementById('topHolders');
        this.holdersList = document.getElementById('holdersList');
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Inspect button click
        this.inspectBtn.addEventListener('click', () => this.handleInspect());
        
        // Enter key in input
        this.contractInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleInspect();
            }
        });
        
        // Input validation
        this.contractInput.addEventListener('input', () => this.validateInput());
        
        // Network selection
        this.networkSelect.addEventListener('change', (e) => {
            this.currentNetwork = e.target.value;
            this.updateNetworkConfig();
            this.logOperation(`Network changed to ${this.currentNetwork}`, 'info');
        });
        
        // Action buttons
        this.etherscanBtn.addEventListener('click', () => this.openEtherscan());
        this.copyAddressBtn.addEventListener('click', () => this.copyAddress());
        this.openNewTabBtn.addEventListener('click', () => this.openInNewTab());
        this.openSameTabBtn.addEventListener('click', () => this.openInSameTab());
        
        // Copy buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('copy-btn')) {
                this.handleCopy(e);
            }
        });
        
        // Dark mode toggle
        this.darkModeToggle.addEventListener('click', () => this.toggleDarkMode());
        
        // Open popup in new tab
        this.openPopupInNewTab.addEventListener('click', () => this.openPopupInNewTabHandler());
        
        // Debug mode toggle
        if (this.debugModeToggle) {
            this.debugModeToggle.addEventListener('click', () => this.toggleDebugMode());
        }
        
        // Clear logs button
        if (this.clearLogsBtn) {
            this.clearLogsBtn.addEventListener('click', () => this.clearLogs());
        }
        
        // Export logs button
        if (this.exportLogsBtn) {
            this.exportLogsBtn.addEventListener('click', () => this.exportLogs());
        }
        
        // Debug tabs
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('debug-tab')) {
                this.switchDebugTab(e.target.dataset.tab);
            }
        });
    }

    /**
     * Switch debug panel tabs
     * @param {string} tabName - Tab name to switch to
     */
    switchDebugTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.debug-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            }
        });
        
        // Update tab content
        document.querySelectorAll('.debug-tab-content').forEach(content => {
            content.classList.remove('active');
            if (content.id === `${tabName}-tab`) {
                content.classList.add('active');
            }
        });
    }

    /**
     * Validate input address
     */
    validateInput() {
        const address = this.contractInput.value.trim();
        const isValid = this.inspector.isValidAddress(address);
        
        this.contractInput.classList.remove('error', 'success');
        
        if (address && !isValid) {
            this.contractInput.classList.add('error');
        } else if (address && isValid) {
            this.contractInput.classList.add('success');
        }
    }

    /**
     * Handle inspect button click
     */
    async handleInspect() {
        const address = this.contractInput.value.trim();
        
        if (!address) {
            this.showError('Please enter a contract address');
            this.logOperation('Inspection failed: No address provided', 'warning');
            return;
        }
        
        if (!this.inspector.isValidAddress(address)) {
            this.showError('Invalid contract address format');
            this.logOperation(`Inspection failed: Invalid address format - ${address}`, 'warning');
            return;
        }
        
        this.logOperation(`Starting token inspection for ${address} on ${this.currentNetwork}`, 'info');
        this.setLoading(true);
        this.hideError();
        this.hideResults();
        
        try {
            const tokenInfo = await this.inspector.inspectToken(address);
            
            if (tokenInfo.success) {
                this.displayTokenInfo(tokenInfo);
                this.addToRecentContracts(tokenInfo.address);
                this.updateRecentSection();
                this.logOperation(`Token inspection successful: ${tokenInfo.name} (${tokenInfo.symbol})`, 'success', {
                    address: tokenInfo.address,
                    name: tokenInfo.name,
                    symbol: tokenInfo.symbol
                });
            } else {
                this.showError(tokenInfo.error || 'Failed to inspect token');
                this.logOperation(`Token inspection failed: ${tokenInfo.error}`, 'error');
            }
        } catch (error) {
            console.error('Inspection error:', error);
            this.showError('Network error. Please try again.');
            this.logOperation(`Inspection error: ${error.message}`, 'error', { error: error.toString() });
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Update network configuration
     */
    updateNetworkConfig() {
        const config = this.networkConfigs[this.currentNetwork];
        this.inspector.rpc.providers = [config.rpcUrl];
        this.inspector.rpc.currentProvider = 0;
        this.inspector.rpc.failedProviders.clear();
        this.inspector.rpc.lastSuccessfulProvider = null;
    }

    /**
     * Open Etherscan/explorer
     */
    openEtherscan() {
        const config = this.networkConfigs[this.currentNetwork];
        const address = this.tokenAddress.textContent;
        if (address && address !== '-') {
            const url = `${config.explorerUrl}/token/${address}`;
            chrome.tabs.create({ url });
        }
    }

    /**
     * Copy address to clipboard
     */
    async copyAddress() {
        const address = this.tokenAddress.textContent;
        if (address && address !== '-') {
            try {
                await navigator.clipboard.writeText(address);
                this.showCopyFeedback(this.copyAddressBtn);
            } catch (error) {
                console.error('Copy failed:', error);
            }
        }
    }

    /**
     * Open token in new tab
     */
    openInNewTab() {
        const config = this.networkConfigs[this.currentNetwork];
        const address = this.tokenAddress.textContent;
        if (address && address !== '-') {
            const url = `${config.explorerUrl}/token/${address}`;
            chrome.tabs.create({ url });
        }
    }

    /**
     * Open token in same tab
     */
    openInSameTab() {
        const config = this.networkConfigs[this.currentNetwork];
        const address = this.tokenAddress.textContent;
        if (address && address !== '-') {
            const url = `${config.explorerUrl}/token/${address}`;
            chrome.tabs.update({ url });
        }
    }

    /**
     * Open popup in new tab
     */
    openPopupInNewTabHandler() {
        try {
            // Get the full page URL
            const fullPageUrl = chrome.runtime.getURL('fullpage.html');
            
            // Open in new tab
            chrome.tabs.create({ 
                url: fullPageUrl,
                active: true
            });
            
            // Close the current popup
            window.close();
        } catch (error) {
            console.error('Failed to open popup in new tab:', error);
            // Fallback: try to open a new window
            try {
                window.open('fullpage.html', '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
                window.close();
            } catch (fallbackError) {
                console.error('Fallback also failed:', fallbackError);
            }
        }
    }

    /**
     * Display token information
     * @param {Object} tokenInfo - Token information object
     */
    displayTokenInfo(tokenInfo) {
        const config = this.networkConfigs[this.currentNetwork];
        
        // Update header with logo
        this.updateTokenLogo(tokenInfo.logo);
        this.tokenName.textContent = tokenInfo.name;
        this.tokenSymbol.textContent = tokenInfo.symbol;
        this.tokenPrice.textContent = tokenInfo.price ? `$${tokenInfo.price}` : 'Loading...';
        
        // Update basic info
        this.tokenNameValue.textContent = tokenInfo.name;
        this.tokenSymbolValue.textContent = tokenInfo.symbol;
        this.tokenDecimals.textContent = tokenInfo.decimals;
        this.tokenAddress.textContent = tokenInfo.address;
        this.tokenNetwork.textContent = config.name;
        
        // Format total supply
        const formattedSupply = this.inspector.formatSupply(
            tokenInfo.totalSupply, 
            tokenInfo.decimals
        );
        this.tokenSupply.textContent = formattedSupply;
        
        // Display market information
        this.displayMarketInfo(tokenInfo);
        
        // Display contract information
        this.displayContractInfo(tokenInfo);
        
        // Display holders information
        this.displayHoldersInfo(tokenInfo);
        
        // Display additional token information
        this.displayAdditionalTokenInfo(tokenInfo);
        
        // Show results
        this.resultsSection.style.display = 'block';
        this.resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    /**
     * Display market information
     * @param {Object} tokenInfo - Token information object
     */
    displayMarketInfo(tokenInfo) {
        if (tokenInfo.price || tokenInfo.marketCap || tokenInfo.change24h) {
            this.marketInfo.style.display = 'block';
            
            if (tokenInfo.price) {
                this.tokenPriceValue.textContent = `$${tokenInfo.price}`;
            }
            
            if (tokenInfo.marketCap) {
                this.tokenMarketCap.textContent = `$${this.formatNumber(tokenInfo.marketCap)}`;
            }
            
            if (tokenInfo.change24h !== undefined) {
                const change = tokenInfo.change24h;
                this.token24hChange.textContent = `${change > 0 ? '+' : ''}${change.toFixed(2)}%`;
                this.token24hChange.style.color = change >= 0 ? 'var(--success-color)' : 'var(--danger-color)';
            }
        } else {
            this.marketInfo.style.display = 'none';
        }
    }

    /**
     * Display contract information
     * @param {Object} tokenInfo - Token information object
     */
    displayContractInfo(tokenInfo) {
        const additionalInfo = tokenInfo.additionalInfo || {};
        let hasContractInfo = false;
        
        // Hide all contract info items first
        this.ownerItem.style.display = 'none';
        this.deployedBlockItem.style.display = 'none';
        this.verifiedItem.style.display = 'none';
        this.statusItem.style.display = 'none';
        
        // Display owner if available
        if (additionalInfo.owner) {
            this.tokenOwner.textContent = this.formatAddress(additionalInfo.owner);
            this.ownerItem.style.display = 'block';
            hasContractInfo = true;
        }
        
        // Display deployed block if available
        if (tokenInfo.deployedBlock) {
            this.tokenDeployedBlock.textContent = this.formatNumber(tokenInfo.deployedBlock);
            this.deployedBlockItem.style.display = 'block';
            hasContractInfo = true;
        }
        
        // Display verification status
        if (tokenInfo.verified !== undefined) {
            this.tokenVerified.textContent = tokenInfo.verified ? 'Yes' : 'No';
            this.tokenVerified.style.color = tokenInfo.verified ? 'var(--success-color)' : 'var(--warning-color)';
            this.verifiedItem.style.display = 'block';
            hasContractInfo = true;
        }
        
        // Display contract status
        if (additionalInfo.isPaused !== undefined) {
            this.tokenStatus.textContent = additionalInfo.isPaused ? 'Paused' : 'Active';
            this.tokenStatus.style.color = additionalInfo.isPaused ? 'var(--danger-color)' : 'var(--success-color)';
            this.statusItem.style.display = 'block';
            hasContractInfo = true;
        }
        
        // Show contract info section if we have any contract info
        if (hasContractInfo) {
            this.contractInfo.style.display = 'block';
        } else {
            this.contractInfo.style.display = 'none';
        }
    }

    /**
     * Display holders information
     * @param {Object} tokenInfo - Token information object
     */
    displayHoldersInfo(tokenInfo) {
        if (tokenInfo.holdersCount || tokenInfo.transfersCount || tokenInfo.topHolders) {
            this.holdersInfo.style.display = 'block';
            
            if (tokenInfo.holdersCount) {
                this.tokenHoldersCount.textContent = this.formatNumber(tokenInfo.holdersCount);
            }
            
            if (tokenInfo.transfersCount) {
                this.tokenTransfersCount.textContent = this.formatNumber(tokenInfo.transfersCount);
            }
            
            if (tokenInfo.topHolders && tokenInfo.topHolders.length > 0) {
                this.topHolders.style.display = 'block';
                this.displayTopHolders(tokenInfo.topHolders);
            } else {
                this.topHolders.style.display = 'none';
            }
        } else {
            this.holdersInfo.style.display = 'none';
        }
    }

    /**
     * Display top holders
     * @param {Array} holders - Array of holder objects
     */
    displayTopHolders(holders) {
        this.holdersList.innerHTML = '';
        
        holders.slice(0, 5).forEach((holder, index) => {
            const holderItem = document.createElement('div');
            holderItem.className = 'holder-item';
            
            holderItem.innerHTML = `
                <span class="holder-address">${this.formatAddress(holder.address)}</span>
                <span class="holder-percentage">${holder.percentage.toFixed(2)}%</span>
            `;
            
            this.holdersList.appendChild(holderItem);
        });
    }

    /**
     * Update token logo
     * @param {string} logoUrl - Logo URL from CoinGecko
     */
    updateTokenLogo(logoUrl) {
        if (logoUrl) {
            this.tokenIcon.innerHTML = `<img src="${logoUrl}" alt="Token Logo" style="width: 100%; height: 100%; object-fit: contain; border-radius: 50%;">`;
        } else {
            this.tokenIcon.textContent = '🪙';
        }
    }

    /**
     * Display additional token information
     * @param {Object} tokenInfo - Token information object
     */
    displayAdditionalTokenInfo(tokenInfo) {
        // This method can be expanded to show additional info like description, social links, etc.
        if (tokenInfo.description) {
            console.log('Token description:', tokenInfo.description);
        }
        if (tokenInfo.website) {
            console.log('Token website:', tokenInfo.website);
        }
        if (tokenInfo.twitter) {
            console.log('Token Twitter:', tokenInfo.twitter);
        }
        if (tokenInfo.telegram) {
            console.log('Token Telegram:', tokenInfo.telegram);
        }
        if (tokenInfo.github) {
            console.log('Token GitHub:', tokenInfo.github);
        }
    }

    /**
     * Format large numbers with commas
     * @param {string|number} num - Number to format
     * @returns {string} Formatted number
     */
    formatNumber(num) {
        if (!num || num === 'N/A') return num;
        
        try {
            return Number(num).toLocaleString();
        } catch (error) {
            return num;
        }
    }

    /**
     * Handle copy button click
     * @param {Event} e - Click event
     */
    async handleCopy(e) {
        const targetId = e.target.getAttribute('data-target');
        const targetElement = document.getElementById(targetId);
        const textToCopy = targetElement.textContent;
        
        try {
            await navigator.clipboard.writeText(textToCopy);
            this.showCopyFeedback(e.target);
        } catch (error) {
            console.error('Copy failed:', error);
            // Fallback for older browsers
            this.fallbackCopy(textToCopy);
        }
    }

    /**
     * Fallback copy method for older browsers
     * @param {string} text - Text to copy
     */
    fallbackCopy(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showCopyFeedback(document.querySelector('.copy-btn'));
        } catch (error) {
            console.error('Fallback copy failed:', error);
        } finally {
            document.body.removeChild(textArea);
        }
    }

    /**
     * Show copy feedback
     * @param {HTMLElement} button - Copy button element
     */
    showCopyFeedback(button) {
        const originalText = button.textContent;
        button.textContent = '✓';
        button.classList.add('copied');
        
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copied');
        }, 1000);
    }

    /**
     * Set loading state
     * @param {boolean} loading - Loading state
     */
    setLoading(loading) {
        this.inspectBtn.disabled = loading;
        const btnText = this.inspectBtn.querySelector('.btn-text');
        const spinner = this.inspectBtn.querySelector('.loading-spinner');
        
        if (loading) {
            btnText.style.display = 'none';
            spinner.style.display = 'block';
        } else {
            btnText.style.display = 'block';
            spinner.style.display = 'none';
        }
    }

    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        this.errorMessage.querySelector('.error-text').textContent = message;
        this.errorMessage.style.display = 'block';
        this.successMessage.style.display = 'none';
    }

    /**
     * Show success message
     * @param {string} message - Success message
     */
    showSuccess(message) {
        this.successMessage.querySelector('.success-text').textContent = message;
        this.successMessage.style.display = 'block';
        this.errorMessage.style.display = 'none';
    }

    /**
     * Hide error message
     */
    hideError() {
        this.errorMessage.style.display = 'none';
    }

    /**
     * Hide success message
     */
    hideSuccess() {
        this.successMessage.style.display = 'none';
    }

    /**
     * Hide results section
     */
    hideResults() {
        this.resultsSection.style.display = 'none';
    }

    /**
     * Add contract to recent list
     * @param {string} address - Contract address
     */
    addToRecentContracts(address) {
        // Remove if already exists
        this.recentContracts = this.recentContracts.filter(addr => addr !== address);
        
        // Add to beginning
        this.recentContracts.unshift(address);
        
        // Limit to max recent contracts
        if (this.recentContracts.length > this.maxRecentContracts) {
            this.recentContracts = this.recentContracts.slice(0, this.maxRecentContracts);
        }
        
        // Save to storage
        this.saveRecentContracts();
    }

    /**
     * Load recent contracts from storage
     */
    async loadRecentContracts() {
        try {
            const result = await chrome.storage.local.get(['recentContracts']);
            this.recentContracts = result.recentContracts || [];
        } catch (error) {
            console.error('Failed to load recent contracts:', error);
            this.recentContracts = [];
        }
    }

    /**
     * Save recent contracts to storage
     */
    async saveRecentContracts() {
        try {
            await chrome.storage.local.set({
                recentContracts: this.recentContracts
            });
        } catch (error) {
            console.error('Failed to save recent contracts:', error);
        }
    }

    /**
     * Update recent section display
     */
    updateRecentSection() {
        if (this.recentContracts.length === 0) {
            this.recentSection.style.display = 'none';
            return;
        }
        
        this.recentSection.style.display = 'block';
        this.recentList.innerHTML = '';
        
        this.recentContracts.forEach(address => {
            const item = document.createElement('div');
            item.className = 'recent-item';
            item.textContent = address;
            item.title = `Click to inspect ${address}`;
            
            item.addEventListener('click', () => {
                this.contractInput.value = address;
                this.validateInput();
                this.handleInspect();
            });
            
            this.recentList.appendChild(item);
        });
    }

    /**
     * Format address for display
     * @param {string} address - Full address
     * @returns {string} Formatted address
     */
    formatAddress(address) {
        if (address.length <= 10) return address;
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }

    /**
     * Toggle dark mode
     */
    toggleDarkMode() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        // Add switching animation
        this.darkModeToggle.classList.add('switching');
        
        // Set theme
        document.documentElement.setAttribute('data-theme', newTheme);
        
        // Save preference
        chrome.storage.local.set({ theme: newTheme });
        
        // Remove animation class after animation completes
        setTimeout(() => {
            this.darkModeToggle.classList.remove('switching');
        }, 600);
    }

    /**
     * Load saved theme
     */
    async loadTheme() {
        try {
            const result = await chrome.storage.local.get(['theme']);
            const theme = result.theme || 'light';
            document.documentElement.setAttribute('data-theme', theme);
        } catch (error) {
            console.error('Failed to load theme:', error);
        }
    }

    /**
     * Add tooltips for long values
     */
    addTooltips() {
        const valueElements = [
            this.tokenNameValue,
            this.tokenSymbolValue,
            this.tokenDecimals,
            this.tokenSupply
        ];

        valueElements.forEach(element => {
            if (element && element.textContent.length > 20) {
                element.classList.add('value-tooltip');
                element.setAttribute('data-tooltip', element.textContent);
            }
        });
    }

    /**
     * Log operation for debugging and transparency
     * @param {string} message - Operation message
     * @param {string} type - Log type (info, success, warning, error)
     * @param {Object} data - Additional data
     */
    logOperation(message, type = 'info', data = null) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            message,
            type,
            data,
            network: this.currentNetwork
        };
        
        this.operationLog.push(logEntry);
        
        // Keep only last 100 entries
        if (this.operationLog.length > 100) {
            this.operationLog.shift();
        }
        
        // Always log to console for transparency
        const consoleMethod = type === 'error' ? 'error' : type === 'warning' ? 'warn' : 'log';
        console[consoleMethod](`[${timestamp}] [${type.toUpperCase()}] ${message}`, data || '');
        
        // Update debug panel if visible
        if (this.debugMode) {
            this.updateDebugPanel();
        }
    }

    /**
     * Log network activity
     * @param {string} provider - RPC provider
     * @param {string} method - RPC method
     * @param {string} status - Request status
     * @param {Object} data - Additional data
     */
    logNetworkActivity(provider, method, status, data = null) {
        const timestamp = new Date().toISOString();
        const activityEntry = {
            timestamp,
            provider,
            method,
            status,
            data,
            network: this.currentNetwork
        };
        
        this.networkActivity.push(activityEntry);
        
        // Keep only last 50 entries
        if (this.networkActivity.length > 50) {
            this.networkActivity.shift();
        }
        
        this.logOperation(`Network: ${method} via ${provider} - ${status}`, 
                         status === 'success' ? 'success' : 'warning', data);
    }

    /**
     * Toggle debug mode
     */
    toggleDebugMode() {
        this.debugMode = !this.debugMode;
        chrome.storage.local.set({ debugMode: this.debugMode });
        
        const debugPanel = document.getElementById('debugPanel');
        const debugToggle = document.getElementById('debugModeToggle');
        
        if (this.debugMode) {
            debugPanel.style.display = 'block';
            debugToggle.classList.add('active');
            debugToggle.textContent = '🐛 Debug: ON';
            this.logOperation('Debug mode enabled', 'info');
            this.updateDebugPanel();
        } else {
            debugPanel.style.display = 'none';
            debugToggle.classList.remove('active');
            debugToggle.textContent = '🐛 Debug: OFF';
            this.logOperation('Debug mode disabled', 'info');
        }
    }

    /**
     * Load debug mode setting
     */
    async loadDebugMode() {
        try {
            const result = await chrome.storage.local.get(['debugMode']);
            this.debugMode = result.debugMode || false;
            
            const debugPanel = document.getElementById('debugPanel');
            const debugToggle = document.getElementById('debugModeToggle');
            
            if (debugPanel && debugToggle) {
                if (this.debugMode) {
                    debugPanel.style.display = 'block';
                    debugToggle.classList.add('active');
                    debugToggle.textContent = '🐛 Debug: ON';
                } else {
                    debugPanel.style.display = 'none';
                    debugToggle.textContent = '🐛 Debug: OFF';
                }
            }
        } catch (error) {
            console.error('Failed to load debug mode:', error);
        }
    }

    /**
     * Update debug panel with current logs
     */
    updateDebugPanel() {
        const operationLogElement = document.getElementById('operationLog');
        const networkLogElement = document.getElementById('networkLog');
        const debugNetworkInfo = document.getElementById('debugNetworkInfo');
        
        if (!operationLogElement || !networkLogElement) {
            return;
        }
        
        // Update network info
        if (debugNetworkInfo) {
            const config = this.networkConfigs[this.currentNetwork];
            debugNetworkInfo.textContent = `${config.name} (Chain ID: ${config.chainId})`;
        }
        
        // Update operation log
        const operationLogHTML = this.operationLog.slice(-20).reverse().map(entry => `
            <div class="log-entry log-${entry.type}">
                <span class="log-time">${new Date(entry.timestamp).toLocaleTimeString()}</span>
                <span class="log-message">${entry.message}</span>
                ${entry.data ? `<span class="log-data">${JSON.stringify(entry.data)}</span>` : ''}
            </div>
        `).join('');
        operationLogElement.innerHTML = operationLogHTML || '<div class="log-empty">No operations yet</div>';
        
        // Update network log
        const networkLogHTML = this.networkActivity.slice(-20).reverse().map(entry => `
            <div class="log-entry log-${entry.status}">
                <span class="log-time">${new Date(entry.timestamp).toLocaleTimeString()}</span>
                <span class="log-provider">${entry.provider}</span>
                <span class="log-method">${entry.method}</span>
                <span class="log-status">${entry.status}</span>
            </div>
        `).join('');
        networkLogElement.innerHTML = networkLogHTML || '<div class="log-empty">No network activity yet</div>';
    }

    /**
     * Clear logs
     */
    clearLogs() {
        this.operationLog = [];
        this.networkActivity = [];
        this.updateDebugPanel();
        this.logOperation('Logs cleared', 'info');
    }

    /**
     * Export logs
     */
    exportLogs() {
        const logs = {
            operationLog: this.operationLog,
            networkActivity: this.networkActivity,
            exportedAt: new Date().toISOString(),
            network: this.currentNetwork
        };
        
        const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `token-inspector-logs-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.logOperation('Logs exported', 'success');
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    const app = new TokenInspectorApp();
    await app.loadTheme();
});

// Handle extension installation/update
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('ERC20 Token Inspector installed');
    } else if (details.reason === 'update') {
        console.log('ERC20 Token Inspector updated');
    }
});
