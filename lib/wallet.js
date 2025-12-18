/**
 * Wallet Integration for Web3 Wallet Connection (MetaMask, etc.)
 * Handles wallet connection and transaction signing
 */

class WalletConnector {
    constructor() {
        this.provider = null;
        this.account = null;
        this.chainId = null;
        this.connected = false;
    }

    /**
     * Check if MetaMask or Web3 provider is available
     * @returns {boolean} True if provider is available
     */
    isWeb3Available() {
        return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
    }

    /**
     * Connect to Web3 wallet (MetaMask)
     * @returns {Promise<Object>} Connection result with account and chainId
     */
    async connect() {
        if (!this.isWeb3Available()) {
            throw new Error('No Web3 provider found. Please install MetaMask or another Web3 wallet.');
        }

        try {
            this.provider = window.ethereum;

            // Request account access
            const accounts = await this.provider.request({
                method: 'eth_requestAccounts'
            });

            if (!accounts || accounts.length === 0) {
                throw new Error('No accounts found. Please unlock your wallet.');
            }

            this.account = accounts[0];

            // Get chain ID
            const chainId = await this.provider.request({
                method: 'eth_chainId'
            });
            this.chainId = parseInt(chainId, 16);

            this.connected = true;

            // Set up event listeners
            this.setupEventListeners();

            console.log('Wallet connected:', {
                account: this.account,
                chainId: this.chainId
            });

            return {
                success: true,
                account: this.account,
                chainId: this.chainId
            };
        } catch (error) {
            console.error('Wallet connection failed:', error);
            this.connected = false;
            throw new Error(`Failed to connect wallet: ${error.message}`);
        }
    }

    /**
     * Disconnect wallet
     */
    disconnect() {
        this.account = null;
        this.chainId = null;
        this.connected = false;
        this.removeEventListeners();
    }

    /**
     * Setup event listeners for wallet events
     */
    setupEventListeners() {
        if (!this.provider) return;

        // Account changed
        this.provider.on('accountsChanged', (accounts) => {
            console.log('Accounts changed:', accounts);
            if (accounts.length === 0) {
                this.disconnect();
                this.onAccountsChanged([]);
            } else {
                this.account = accounts[0];
                this.onAccountsChanged(accounts);
            }
        });

        // Chain changed
        this.provider.on('chainChanged', (chainId) => {
            console.log('Chain changed:', chainId);
            this.chainId = parseInt(chainId, 16);
            this.onChainChanged(this.chainId);
            // Note: You may want to prompt the user or update the UI instead of reloading
            // window.location.reload();
        });

        // Disconnected
        this.provider.on('disconnect', (error) => {
            console.log('Provider disconnected:', error);
            this.disconnect();
            this.onDisconnect();
        });
    }

    /**
     * Remove event listeners
     */
    removeEventListeners() {
        if (!this.provider) return;
        
        this.provider.removeAllListeners('accountsChanged');
        this.provider.removeAllListeners('chainChanged');
        this.provider.removeAllListeners('disconnect');
    }

    /**
     * Event handler for accounts changed (override in implementation)
     */
    onAccountsChanged(accounts) {
        console.log('Accounts changed event:', accounts);
    }

    /**
     * Event handler for chain changed (override in implementation)
     */
    onChainChanged(chainId) {
        console.log('Chain changed event:', chainId);
    }

    /**
     * Event handler for disconnect (override in implementation)
     */
    onDisconnect() {
        console.log('Disconnect event');
    }

    /**
     * Get current account
     * @returns {string|null} Current account address
     */
    getAccount() {
        return this.account;
    }

    /**
     * Get current chain ID
     * @returns {number|null} Current chain ID
     */
    getChainId() {
        return this.chainId;
    }

    /**
     * Check if wallet is connected
     * @returns {boolean} True if connected
     */
    isConnected() {
        return this.connected && this.account !== null;
    }

    /**
     * Switch to a different network
     * @param {number} chainId - Target chain ID
     * @returns {Promise<boolean>} True if switched successfully
     */
    async switchNetwork(chainId) {
        if (!this.provider) {
            throw new Error('No provider available');
        }

        const chainIdHex = '0x' + chainId.toString(16);

        try {
            await this.provider.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: chainIdHex }]
            });
            return true;
        } catch (error) {
            // This error code indicates that the chain has not been added to MetaMask
            if (error.code === 4902) {
                console.log('Network not found, attempting to add...');
                await this.addNetwork(chainId);
                return true;
            }
            console.error('Failed to switch network:', error);
            throw error;
        }
    }

    /**
     * Add a network to MetaMask
     * @param {number} chainId - Chain ID to add
     */
    async addNetwork(chainId) {
        const networks = {
            1: {
                chainId: '0x1',
                chainName: 'Ethereum Mainnet',
                nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
                rpcUrls: ['https://cloudflare-eth.com'],
                blockExplorerUrls: ['https://etherscan.io']
            },
            137: {
                chainId: '0x89',
                chainName: 'Polygon Mainnet',
                nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
                rpcUrls: ['https://polygon-rpc.com'],
                blockExplorerUrls: ['https://polygonscan.com']
            },
            56: {
                chainId: '0x38',
                chainName: 'BNB Smart Chain',
                nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
                rpcUrls: ['https://bsc-dataseed.binance.org'],
                blockExplorerUrls: ['https://bscscan.com']
            }
        };

        const network = networks[chainId];
        if (!network) {
            throw new Error(`Network ${chainId} not supported`);
        }

        await this.provider.request({
            method: 'wallet_addEthereumChain',
            params: [network]
        });
    }

    /**
     * Get balance of an address
     * @param {string} address - Address to check
     * @returns {Promise<string>} Balance in wei
     */
    async getBalance(address) {
        if (!this.provider) {
            throw new Error('No provider available');
        }

        const balance = await this.provider.request({
            method: 'eth_getBalance',
            params: [address, 'latest']
        });

        return balance;
    }

    /**
     * Sign a message
     * @param {string} message - Message to sign
     * @returns {Promise<string>} Signature
     */
    async signMessage(message) {
        if (!this.provider || !this.account) {
            throw new Error('Wallet not connected');
        }

        const signature = await this.provider.request({
            method: 'personal_sign',
            params: [message, this.account]
        });

        return signature;
    }

    /**
     * Send a transaction
     * @param {Object} transaction - Transaction object
     * @returns {Promise<string>} Transaction hash
     */
    async sendTransaction(transaction) {
        if (!this.provider || !this.account) {
            throw new Error('Wallet not connected');
        }

        // Ensure from address is set
        if (!transaction.from) {
            transaction.from = this.account;
        }

        try {
            const txHash = await this.provider.request({
                method: 'eth_sendTransaction',
                params: [transaction]
            });

            console.log('Transaction sent:', txHash);
            return txHash;
        } catch (error) {
            console.error('Transaction failed:', error);
            throw error;
        }
    }

    /**
     * Wait for transaction confirmation
     * @param {string} txHash - Transaction hash
     * @param {number} confirmations - Number of confirmations to wait for
     * @returns {Promise<Object>} Transaction receipt
     */
    async waitForTransaction(txHash, confirmations = 1) {
        if (!this.provider) {
            throw new Error('No provider available');
        }

        let receipt = null;
        let attempts = 0;
        const maxAttempts = 60; // 5 minutes max wait time

        while (attempts < maxAttempts) {
            try {
                receipt = await this.provider.request({
                    method: 'eth_getTransactionReceipt',
                    params: [txHash]
                });

                if (receipt && receipt.blockNumber) {
                    // Transaction mined
                    if (confirmations <= 1) {
                        return receipt;
                    }

                    // Wait for additional confirmations
                    const currentBlock = await this.provider.request({
                        method: 'eth_blockNumber',
                        params: []
                    });

                    const currentBlockNum = parseInt(currentBlock, 16);
                    const txBlockNum = parseInt(receipt.blockNumber, 16);
                    const confirmedBlocks = currentBlockNum - txBlockNum;

                    if (confirmedBlocks >= confirmations) {
                        return receipt;
                    }
                }
            } catch (error) {
                console.error('Error checking transaction:', error);
            }

            // Wait 5 seconds before checking again
            await new Promise(resolve => setTimeout(resolve, 5000));
            attempts++;
        }

        throw new Error('Transaction confirmation timeout');
    }

    /**
     * Format address for display
     * @param {string} address - Full address
     * @returns {string} Formatted address
     */
    formatAddress(address) {
        if (!address || address.length < 10) return address;
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }

    /**
     * Convert wei to ether
     * @param {string} wei - Amount in wei
     * @returns {string} Amount in ether
     */
    weiToEther(wei) {
        const weiBigInt = BigInt(wei);
        const etherBigInt = weiBigInt / BigInt(10 ** 18);
        const remainder = weiBigInt % BigInt(10 ** 18);
        
        if (remainder === 0n) {
            return etherBigInt.toString();
        }
        
        const remainderStr = remainder.toString().padStart(18, '0');
        const trimmedRemainder = remainderStr.replace(/0+$/, '');
        
        return `${etherBigInt}.${trimmedRemainder}`;
    }

    /**
     * Convert ether to wei
     * @param {string} ether - Amount in ether
     * @returns {string} Amount in wei
     */
    etherToWei(ether) {
        const parts = ether.split('.');
        const wholePart = parts[0] || '0';
        const decimalPart = (parts[1] || '0').padEnd(18, '0').slice(0, 18);
        
        const wei = BigInt(wholePart) * BigInt(10 ** 18) + BigInt(decimalPart);
        return wei.toString();
    }
}

// Export for use in other files
if (typeof window !== 'undefined') {
    window.WalletConnector = WalletConnector;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = WalletConnector;
}
