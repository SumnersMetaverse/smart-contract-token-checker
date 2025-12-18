/**
 * Popup JavaScript for ERC20 Token Inspector Extension
 * Handles UI interactions and token inspection
 */

class TokenInspectorApp {
    constructor() {
        this.inspector = new ERC20Inspector();
        this.wallet = new WalletConnector();
        this.transactionManager = new TransactionManager();
        this.currentTokenContract = null;
        this.currentTokenInfo = null;
        this.recentContracts = [];
        this.maxRecentContracts = 10;
        this.currentNetwork = 'ethereum';
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
        this.initializeWallet();
        this.transactionManager.loadFromStorage();
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
        
        // Wallet elements
        this.walletConnectBtn = document.getElementById('walletConnectBtn');
        this.sendTokenBtn = document.getElementById('sendTokenBtn');
        
        // Send token modal elements
        this.sendTokenModal = document.getElementById('sendTokenModal');
        this.closeSendModal = document.getElementById('closeSendModal');
        this.sendTokenSymbol = document.getElementById('sendTokenSymbol');
        this.sendTokenAddress = document.getElementById('sendTokenAddress');
        this.sendTokenBalance = document.getElementById('sendTokenBalance');
        this.recipientAddress = document.getElementById('recipientAddress');
        this.sendAmount = document.getElementById('sendAmount');
        this.maxAmountBtn = document.getElementById('maxAmountBtn');
        this.estimatedFee = document.getElementById('estimatedFee');
        this.sendErrorMessage = document.getElementById('sendErrorMessage');
        this.cancelSendBtn = document.getElementById('cancelSendBtn');
        this.confirmSendBtn = document.getElementById('confirmSendBtn');
        
        // Transaction history modal elements
        this.transactionHistoryModal = document.getElementById('transactionHistoryModal');
        this.closeHistoryModal = document.getElementById('closeHistoryModal');
        this.transactionList = document.getElementById('transactionList');
        this.clearHistoryBtn = document.getElementById('clearHistoryBtn');
        this.closeHistoryBtn = document.getElementById('closeHistoryBtn');
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
        
        // Wallet connect button
        this.walletConnectBtn.addEventListener('click', () => this.handleWalletConnect());
        
        // Send token button
        this.sendTokenBtn.addEventListener('click', () => this.openSendTokenModal());
        
        // Send token modal
        this.closeSendModal.addEventListener('click', () => this.closeSendTokenModal());
        this.cancelSendBtn.addEventListener('click', () => this.closeSendTokenModal());
        this.confirmSendBtn.addEventListener('click', () => this.handleSendToken());
        this.maxAmountBtn.addEventListener('click', () => this.setMaxAmount());
        
        // Validate recipient address
        this.recipientAddress.addEventListener('input', () => this.validateRecipientAddress());
        this.sendAmount.addEventListener('input', () => this.validateSendAmount());
        
        // Transaction history modal
        if (this.closeHistoryModal) {
            this.closeHistoryModal.addEventListener('click', () => this.closeTransactionHistory());
        }
        if (this.closeHistoryBtn) {
            this.closeHistoryBtn.addEventListener('click', () => this.closeTransactionHistory());
        }
        if (this.clearHistoryBtn) {
            this.clearHistoryBtn.addEventListener('click', () => this.clearTransactionHistory());
        }
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
            return;
        }
        
        if (!this.inspector.isValidAddress(address)) {
            this.showError('Invalid contract address format');
            return;
        }
        
        this.setLoading(true);
        this.hideError();
        this.hideResults();
        
        try {
            const tokenInfo = await this.inspector.inspectToken(address);
            
            if (tokenInfo.success) {
                this.displayTokenInfo(tokenInfo);
                this.addToRecentContracts(tokenInfo.address);
                this.updateRecentSection();
            } else {
                this.showError(tokenInfo.error || 'Failed to inspect token');
            }
        } catch (error) {
            console.error('Inspection error:', error);
            this.showError('Network error. Please try again.');
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
        
        // Store current token info
        this.currentTokenInfo = tokenInfo;
        
        // Show send button if wallet is connected
        if (this.wallet.isConnected()) {
            this.sendTokenBtn.style.display = 'block';
        }
        
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
     * Initialize wallet connection
     */
    async initializeWallet() {
        // Set up wallet event listeners
        this.wallet.onAccountsChanged = (accounts) => {
            if (accounts.length === 0) {
                this.updateWalletUI(false);
            } else {
                this.updateWalletUI(true, accounts[0]);
            }
        };
        
        this.wallet.onChainChanged = (chainId) => {
            console.log('Chain changed to:', chainId);
            // Update network selector if needed
            this.updateNetworkFromChainId(chainId);
        };
        
        this.wallet.onDisconnect = () => {
            this.updateWalletUI(false);
        };
    }
    
    /**
     * Handle wallet connect button click
     */
    async handleWalletConnect() {
        if (this.wallet.isConnected()) {
            // Disconnect wallet
            this.wallet.disconnect();
            this.updateWalletUI(false);
            return;
        }
        
        try {
            const result = await this.wallet.connect();
            if (result.success) {
                this.updateWalletUI(true, result.account);
                
                // Switch to correct network if needed
                const config = this.networkConfigs[this.currentNetwork];
                if (result.chainId !== config.chainId) {
                    await this.wallet.switchNetwork(config.chainId);
                }
            }
        } catch (error) {
            console.error('Wallet connection failed:', error);
            this.showError(error.message);
        }
    }
    
    /**
     * Update wallet UI based on connection status
     */
    updateWalletUI(connected, account = null) {
        const walletStatus = this.walletConnectBtn.querySelector('.wallet-status');
        
        if (connected && account) {
            this.walletConnectBtn.classList.add('connected');
            walletStatus.textContent = `🔗 ${this.formatAddress(account)}`;
            
            // Show send token button if token is displayed
            if (this.currentTokenInfo) {
                this.sendTokenBtn.style.display = 'block';
            }
        } else {
            this.walletConnectBtn.classList.remove('connected');
            walletStatus.textContent = '🔌 Connect';
            this.sendTokenBtn.style.display = 'none';
        }
    }
    
    /**
     * Update network selector from chain ID
     */
    updateNetworkFromChainId(chainId) {
        const networkMap = {
            1: 'ethereum',
            137: 'polygon',
            56: 'bsc'
        };
        
        const network = networkMap[chainId];
        if (network && network !== this.currentNetwork) {
            this.currentNetwork = network;
            this.networkSelect.value = network;
            this.updateNetworkConfig();
        }
    }
    
    /**
     * Open send token modal
     */
    async openSendTokenModal() {
        if (!this.wallet.isConnected()) {
            this.showError('Please connect your wallet first');
            return;
        }
        
        if (!this.currentTokenInfo) {
            this.showError('No token selected');
            return;
        }
        
        // Initialize token contract
        this.currentTokenContract = new TokenContract(
            this.currentTokenInfo.address,
            this.wallet
        );
        
        // Update modal with token info
        this.sendTokenSymbol.textContent = this.currentTokenInfo.symbol;
        this.sendTokenAddress.textContent = this.formatAddress(this.currentTokenInfo.address);
        
        // Get user's token balance
        try {
            const balance = await this.currentTokenContract.balanceOf(this.wallet.getAccount());
            const formattedBalance = this.currentTokenContract.fromTokenAmount(
                balance,
                parseInt(this.currentTokenInfo.decimals)
            );
            this.sendTokenBalance.textContent = `${formattedBalance} ${this.currentTokenInfo.symbol}`;
        } catch (error) {
            console.error('Failed to get balance:', error);
            this.sendTokenBalance.textContent = 'Error loading balance';
        }
        
        // Reset form
        this.recipientAddress.value = '';
        this.sendAmount.value = '';
        this.estimatedFee.textContent = 'Estimating...';
        this.sendErrorMessage.style.display = 'none';
        
        // Show modal
        this.sendTokenModal.classList.add('show');
        this.sendTokenModal.style.display = 'flex';
    }
    
    /**
     * Close send token modal
     */
    closeSendTokenModal() {
        this.sendTokenModal.classList.remove('show');
        this.sendTokenModal.style.display = 'none';
    }
    
    /**
     * Set max amount
     */
    async setMaxAmount() {
        if (!this.currentTokenContract || !this.wallet.isConnected()) {
            return;
        }
        
        try {
            const balance = await this.currentTokenContract.balanceOf(this.wallet.getAccount());
            const formattedBalance = this.currentTokenContract.fromTokenAmount(
                balance,
                parseInt(this.currentTokenInfo.decimals)
            );
            this.sendAmount.value = formattedBalance;
            this.validateSendAmount();
        } catch (error) {
            console.error('Failed to get balance:', error);
        }
    }
    
    /**
     * Validate recipient address
     */
    validateRecipientAddress() {
        const address = this.recipientAddress.value.trim();
        
        this.recipientAddress.classList.remove('error', 'success');
        
        if (address && !this.inspector.isValidAddress(address)) {
            this.recipientAddress.classList.add('error');
        } else if (address && this.inspector.isValidAddress(address)) {
            this.recipientAddress.classList.add('success');
        }
    }
    
    /**
     * Validate send amount
     */
    validateSendAmount() {
        const amount = this.sendAmount.value.trim();
        
        this.sendAmount.classList.remove('error', 'success');
        
        if (amount) {
            try {
                const parsed = parseFloat(amount);
                if (parsed > 0) {
                    this.sendAmount.classList.add('success');
                    this.estimateTransactionFee();
                } else {
                    this.sendAmount.classList.add('error');
                }
            } catch (error) {
                this.sendAmount.classList.add('error');
            }
        }
    }
    
    /**
     * Estimate transaction fee
     */
    async estimateTransactionFee() {
        if (!this.currentTokenContract || !this.wallet.isConnected()) {
            return;
        }
        
        const recipient = this.recipientAddress.value.trim();
        const amount = this.sendAmount.value.trim();
        
        if (!recipient || !amount || !this.inspector.isValidAddress(recipient)) {
            return;
        }
        
        try {
            const tokenAmount = this.currentTokenContract.toTokenAmount(
                amount,
                parseInt(this.currentTokenInfo.decimals)
            );
            
            const txDetails = await this.currentTokenContract.prepareTransfer(recipient, tokenAmount);
            this.estimatedFee.textContent = `~${txDetails.transactionFee} ETH`;
        } catch (error) {
            console.error('Failed to estimate fee:', error);
            this.estimatedFee.textContent = 'Failed to estimate';
        }
    }
    
    /**
     * Handle send token
     */
    async handleSendToken() {
        const recipient = this.recipientAddress.value.trim();
        const amount = this.sendAmount.value.trim();
        
        // Validate inputs
        if (!recipient || !this.inspector.isValidAddress(recipient)) {
            this.showSendError('Invalid recipient address');
            return;
        }
        
        // Check for self-transfer
        if (this.wallet.isConnected() && recipient.toLowerCase() === this.wallet.getAccount().toLowerCase()) {
            this.showSendError('Cannot send tokens to your own address');
            return;
        }
        
        if (!amount || parseFloat(amount) <= 0) {
            this.showSendError('Invalid amount');
            return;
        }
        
        // Disable send button
        this.confirmSendBtn.disabled = true;
        this.confirmSendBtn.textContent = 'Sending...';
        
        try {
            const tokenAmount = this.currentTokenContract.toTokenAmount(
                amount,
                parseInt(this.currentTokenInfo.decimals)
            );
            
            const txHash = await this.currentTokenContract.transfer(recipient, tokenAmount);
            
            // Add transaction to history
            this.transactionManager.addTransaction({
                hash: txHash,
                from: this.wallet.getAccount(),
                to: recipient,
                amount: amount,
                type: 'transfer',
                tokenAddress: this.currentTokenInfo.address,
                tokenSymbol: this.currentTokenInfo.symbol
            });
            
            // Close modal
            this.closeSendTokenModal();
            
            // Show success message
            this.showSuccess(`Transaction sent! Hash: ${txHash.slice(0, 10)}...`);
            
            // Wait for confirmation in background
            this.waitForTransactionConfirmation(txHash);
        } catch (error) {
            console.error('Transaction failed:', error);
            this.showSendError(error.message || 'Transaction failed');
        } finally {
            this.confirmSendBtn.disabled = false;
            this.confirmSendBtn.textContent = 'Send Tokens';
        }
    }
    
    /**
     * Wait for transaction confirmation
     */
    async waitForTransactionConfirmation(txHash) {
        try {
            const receipt = await this.wallet.waitForTransaction(txHash);
            
            if (receipt.status === '0x1') {
                this.transactionManager.updateTransactionStatus(txHash, 'success');
                console.log('Transaction confirmed:', txHash);
            } else {
                this.transactionManager.updateTransactionStatus(txHash, 'failed');
                console.error('Transaction failed:', txHash);
            }
        } catch (error) {
            console.error('Failed to wait for transaction:', error);
            this.transactionManager.updateTransactionStatus(txHash, 'failed');
        }
    }
    
    /**
     * Show send error
     */
    showSendError(message) {
        this.sendErrorMessage.querySelector('.error-text').textContent = message;
        this.sendErrorMessage.style.display = 'block';
    }
    
    /**
     * Open transaction history
     */
    openTransactionHistory() {
        const transactions = this.transactionManager.getAllTransactions();
        
        if (transactions.length === 0) {
            this.transactionList.innerHTML = '<p class="no-transactions">No transactions yet</p>';
        } else {
            this.transactionList.innerHTML = '';
            
            transactions.forEach(tx => {
                const txItem = document.createElement('div');
                txItem.className = 'transaction-item';
                
                const timestamp = new Date(tx.timestamp).toLocaleString();
                
                txItem.innerHTML = `
                    <div class="transaction-header">
                        <span class="transaction-type">${tx.type}</span>
                        <span class="transaction-status ${tx.status}">${tx.status}</span>
                    </div>
                    <div class="transaction-details">
                        <div class="transaction-detail">
                            <span>Amount:</span>
                            <strong>${tx.amount} ${tx.tokenSymbol}</strong>
                        </div>
                        <div class="transaction-detail">
                            <span>To:</span>
                            <strong>${this.formatAddress(tx.to)}</strong>
                        </div>
                        <div class="transaction-detail">
                            <span>Time:</span>
                            <strong>${timestamp}</strong>
                        </div>
                        <div class="transaction-hash" title="Click to view on explorer">
                            ${tx.hash}
                        </div>
                    </div>
                `;
                
                // Add click handler to open in explorer
                const hashElement = txItem.querySelector('.transaction-hash');
                hashElement.addEventListener('click', () => {
                    const config = this.networkConfigs[this.currentNetwork];
                    const url = `${config.explorerUrl}/tx/${tx.hash}`;
                    chrome.tabs.create({ url });
                });
                
                this.transactionList.appendChild(txItem);
            });
        }
        
        this.transactionHistoryModal.classList.add('show');
        this.transactionHistoryModal.style.display = 'flex';
    }
    
    /**
     * Close transaction history
     */
    closeTransactionHistory() {
        this.transactionHistoryModal.classList.remove('show');
        this.transactionHistoryModal.style.display = 'none';
    }
    
    /**
     * Clear transaction history
     */
    async clearTransactionHistory() {
        // Create a custom confirmation dialog
        const confirmDialog = document.createElement('div');
        confirmDialog.className = 'modal show';
        confirmDialog.style.display = 'flex';
        confirmDialog.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <div class="modal-header">
                    <h3>Confirm Clear History</h3>
                </div>
                <div class="modal-body">
                    <p>Are you sure you want to clear all transaction history? This action cannot be undone.</p>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" id="cancelClearHistory">Cancel</button>
                    <button class="btn-primary" id="confirmClearHistory">Clear History</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(confirmDialog);
        
        // Handle cancel
        const cancelBtn = confirmDialog.querySelector('#cancelClearHistory');
        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(confirmDialog);
        });
        
        // Handle confirm
        const confirmBtn = confirmDialog.querySelector('#confirmClearHistory');
        confirmBtn.addEventListener('click', () => {
            this.transactionManager.clearTransactions();
            document.body.removeChild(confirmDialog);
            this.closeTransactionHistory();
        });
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
