/**
 * Smart Contract Interactions for ERC20 Token Operations
 * Handles token transfers, approvals, and contract calls
 */

class TokenContract {
    constructor(contractAddress, walletConnector) {
        this.contractAddress = contractAddress;
        this.wallet = walletConnector;
        
        // ERC20 function selectors and ABIs
        this.selectors = {
            // Read functions
            name: '0x06fdde03',
            symbol: '0x95d89b41',
            decimals: '0x313ce567',
            totalSupply: '0x18160ddd',
            balanceOf: '0x70a08231',
            allowance: '0xdd62ed3e',
            
            // Write functions
            transfer: '0xa9059cbb',
            approve: '0x095ea7b3',
            transferFrom: '0x23b872dd'
        };
    }

    /**
     * Encode address parameter
     * @param {string} address - Address to encode
     * @returns {string} Encoded address (32 bytes)
     */
    encodeAddress(address) {
        // Remove 0x prefix if present
        const addr = address.toLowerCase().replace('0x', '');
        // Pad to 32 bytes (64 hex characters)
        return addr.padStart(64, '0');
    }

    /**
     * Encode uint256 parameter
     * @param {string} value - Value to encode
     * @returns {string} Encoded uint256 (32 bytes)
     */
    encodeUint256(value) {
        const bigIntValue = BigInt(value);
        const hex = bigIntValue.toString(16);
        // Pad to 32 bytes (64 hex characters)
        return hex.padStart(64, '0');
    }

    /**
     * Decode uint256 from hex
     * @param {string} hex - Hex string
     * @returns {string} Decoded value
     */
    decodeUint256(hex) {
        if (!hex || hex === '0x' || hex === '0x0') return '0';
        const hexValue = hex.replace('0x', '');
        return BigInt('0x' + hexValue).toString();
    }

    /**
     * Get token balance of an address
     * @param {string} address - Address to check
     * @returns {Promise<string>} Balance in token's smallest unit
     */
    async balanceOf(address) {
        const data = this.selectors.balanceOf + this.encodeAddress(address);
        
        const result = await this.wallet.provider.request({
            method: 'eth_call',
            params: [{
                to: this.contractAddress,
                data: data
            }, 'latest']
        });

        return this.decodeUint256(result);
    }

    /**
     * Get token allowance
     * @param {string} owner - Owner address
     * @param {string} spender - Spender address
     * @returns {Promise<string>} Allowance amount
     */
    async allowance(owner, spender) {
        const data = this.selectors.allowance + 
                    this.encodeAddress(owner) + 
                    this.encodeAddress(spender);
        
        const result = await this.wallet.provider.request({
            method: 'eth_call',
            params: [{
                to: this.contractAddress,
                data: data
            }, 'latest']
        });

        return this.decodeUint256(result);
    }

    /**
     * Transfer tokens to an address
     * @param {string} to - Recipient address
     * @param {string} amount - Amount to transfer (in token's smallest unit)
     * @returns {Promise<string>} Transaction hash
     */
    async transfer(to, amount) {
        if (!this.wallet.isConnected()) {
            throw new Error('Wallet not connected');
        }

        // Encode function call
        const data = this.selectors.transfer + 
                    this.encodeAddress(to) + 
                    this.encodeUint256(amount);

        const transaction = {
            from: this.wallet.getAccount(),
            to: this.contractAddress,
            data: data,
            value: '0x0'
        };

        console.log('Sending transfer transaction:', transaction);

        try {
            const txHash = await this.wallet.sendTransaction(transaction);
            console.log('Transfer transaction sent:', txHash);
            return txHash;
        } catch (error) {
            console.error('Transfer failed:', error);
            throw new Error(`Transfer failed: ${error.message}`);
        }
    }

    /**
     * Approve spender to use tokens
     * @param {string} spender - Spender address
     * @param {string} amount - Amount to approve (in token's smallest unit)
     * @returns {Promise<string>} Transaction hash
     */
    async approve(spender, amount) {
        if (!this.wallet.isConnected()) {
            throw new Error('Wallet not connected');
        }

        // Encode function call
        const data = this.selectors.approve + 
                    this.encodeAddress(spender) + 
                    this.encodeUint256(amount);

        const transaction = {
            from: this.wallet.getAccount(),
            to: this.contractAddress,
            data: data,
            value: '0x0'
        };

        console.log('Sending approve transaction:', transaction);

        try {
            const txHash = await this.wallet.sendTransaction(transaction);
            console.log('Approve transaction sent:', txHash);
            return txHash;
        } catch (error) {
            console.error('Approve failed:', error);
            throw new Error(`Approve failed: ${error.message}`);
        }
    }

    /**
     * Transfer tokens from one address to another (requires approval)
     * @param {string} from - Source address
     * @param {string} to - Destination address
     * @param {string} amount - Amount to transfer (in token's smallest unit)
     * @returns {Promise<string>} Transaction hash
     */
    async transferFrom(from, to, amount) {
        if (!this.wallet.isConnected()) {
            throw new Error('Wallet not connected');
        }

        // Encode function call
        const data = this.selectors.transferFrom + 
                    this.encodeAddress(from) + 
                    this.encodeAddress(to) + 
                    this.encodeUint256(amount);

        const transaction = {
            from: this.wallet.getAccount(),
            to: this.contractAddress,
            data: data,
            value: '0x0'
        };

        console.log('Sending transferFrom transaction:', transaction);

        try {
            const txHash = await this.wallet.sendTransaction(transaction);
            console.log('TransferFrom transaction sent:', txHash);
            return txHash;
        } catch (error) {
            console.error('TransferFrom failed:', error);
            throw new Error(`TransferFrom failed: ${error.message}`);
        }
    }

    /**
     * Convert amount from human-readable format to token's smallest unit
     * @param {string} amount - Amount in human-readable format
     * @param {number} decimals - Token decimals
     * @returns {string} Amount in smallest unit
     */
    toTokenAmount(amount, decimals) {
        const parts = amount.split('.');
        const wholePart = parts[0] || '0';
        const decimalPart = (parts[1] || '0').padEnd(decimals, '0').slice(0, decimals);
        
        const tokenAmount = BigInt(wholePart) * BigInt(10 ** decimals) + BigInt(decimalPart);
        return tokenAmount.toString();
    }

    /**
     * Convert amount from token's smallest unit to human-readable format
     * @param {string} amount - Amount in smallest unit
     * @param {number} decimals - Token decimals
     * @returns {string} Amount in human-readable format
     */
    fromTokenAmount(amount, decimals) {
        const amountBigInt = BigInt(amount);
        const divisor = BigInt(10 ** decimals);
        
        const wholePart = amountBigInt / divisor;
        const fractionalPart = amountBigInt % divisor;
        
        if (fractionalPart === 0n) {
            return wholePart.toString();
        }
        
        const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
        const trimmedFractional = fractionalStr.replace(/0+$/, '');
        
        return `${wholePart}.${trimmedFractional}`;
    }

    /**
     * Estimate gas for a transaction
     * @param {Object} transaction - Transaction object
     * @returns {Promise<string>} Estimated gas
     */
    async estimateGas(transaction) {
        const DEFAULT_GAS_LIMIT = '0x186a0'; // 100,000 gas
        
        try {
            const gas = await this.wallet.provider.request({
                method: 'eth_estimateGas',
                params: [transaction]
            });
            return gas;
        } catch (error) {
            console.error('Gas estimation failed:', error);
            // Return a default gas limit if estimation fails
            return DEFAULT_GAS_LIMIT;
        }
    }

    /**
     * Get current gas price
     * @returns {Promise<string>} Gas price in wei
     */
    async getGasPrice() {
        try {
            const gasPrice = await this.wallet.provider.request({
                method: 'eth_gasPrice',
                params: []
            });
            return gasPrice;
        } catch (error) {
            console.error('Failed to get gas price:', error);
            throw error;
        }
    }

    /**
     * Calculate transaction fee
     * @param {string} gasLimit - Gas limit
     * @param {string} gasPrice - Gas price
     * @returns {string} Transaction fee in ETH
     */
    calculateTransactionFee(gasLimit, gasPrice) {
        const gasLimitBigInt = BigInt(gasLimit);
        const gasPriceBigInt = BigInt(gasPrice);
        const fee = gasLimitBigInt * gasPriceBigInt;
        
        return this.wallet.weiToEther(fee.toString());
    }

    /**
     * Prepare transfer transaction with gas estimation
     * @param {string} to - Recipient address
     * @param {string} amount - Amount to transfer
     * @returns {Promise<Object>} Transaction details with gas estimation
     */
    async prepareTransfer(to, amount) {
        const data = this.selectors.transfer + 
                    this.encodeAddress(to) + 
                    this.encodeUint256(amount);

        const transaction = {
            from: this.wallet.getAccount(),
            to: this.contractAddress,
            data: data,
            value: '0x0'
        };

        // Estimate gas
        const gasLimit = await this.estimateGas(transaction);
        const gasPrice = await this.getGasPrice();
        const transactionFee = this.calculateTransactionFee(gasLimit, gasPrice);

        return {
            transaction,
            gasLimit,
            gasPrice,
            transactionFee
        };
    }

    /**
     * Prepare approve transaction with gas estimation
     * @param {string} spender - Spender address
     * @param {string} amount - Amount to approve
     * @returns {Promise<Object>} Transaction details with gas estimation
     */
    async prepareApprove(spender, amount) {
        const data = this.selectors.approve + 
                    this.encodeAddress(spender) + 
                    this.encodeUint256(amount);

        const transaction = {
            from: this.wallet.getAccount(),
            to: this.contractAddress,
            data: data,
            value: '0x0'
        };

        // Estimate gas
        const gasLimit = await this.estimateGas(transaction);
        const gasPrice = await this.getGasPrice();
        const transactionFee = this.calculateTransactionFee(gasLimit, gasPrice);

        return {
            transaction,
            gasLimit,
            gasPrice,
            transactionFee
        };
    }
}

/**
 * Transaction Manager
 * Handles transaction tracking and history
 */
class TransactionManager {
    constructor() {
        this.transactions = [];
        this.maxTransactions = 100;
    }

    /**
     * Add transaction to history
     * @param {Object} transaction - Transaction details
     */
    addTransaction(transaction) {
        const txData = {
            hash: transaction.hash,
            from: transaction.from,
            to: transaction.to,
            amount: transaction.amount,
            timestamp: Date.now(),
            status: 'pending',
            type: transaction.type || 'transfer',
            tokenAddress: transaction.tokenAddress,
            tokenSymbol: transaction.tokenSymbol
        };

        this.transactions.unshift(txData);

        // Limit history size
        if (this.transactions.length > this.maxTransactions) {
            this.transactions = this.transactions.slice(0, this.maxTransactions);
        }

        // Save to storage
        this.saveToStorage();
    }

    /**
     * Update transaction status
     * @param {string} hash - Transaction hash
     * @param {string} status - New status
     */
    updateTransactionStatus(hash, status) {
        const tx = this.transactions.find(t => t.hash === hash);
        if (tx) {
            tx.status = status;
            this.saveToStorage();
        }
    }

    /**
     * Get transaction by hash
     * @param {string} hash - Transaction hash
     * @returns {Object|null} Transaction or null
     */
    getTransaction(hash) {
        return this.transactions.find(t => t.hash === hash) || null;
    }

    /**
     * Get all transactions
     * @returns {Array} All transactions
     */
    getAllTransactions() {
        return this.transactions;
    }

    /**
     * Get pending transactions
     * @returns {Array} Pending transactions
     */
    getPendingTransactions() {
        return this.transactions.filter(t => t.status === 'pending');
    }

    /**
     * Clear all transactions
     */
    clearTransactions() {
        this.transactions = [];
        this.saveToStorage();
    }

    /**
     * Save transactions to storage
     */
    async saveToStorage() {
        try {
            await chrome.storage.local.set({
                transactions: this.transactions
            });
        } catch (error) {
            console.error('Failed to save transactions:', error);
        }
    }

    /**
     * Load transactions from storage
     */
    async loadFromStorage() {
        try {
            const result = await chrome.storage.local.get(['transactions']);
            this.transactions = result.transactions || [];
        } catch (error) {
            console.error('Failed to load transactions:', error);
            this.transactions = [];
        }
    }
}

// Export for use in other files
if (typeof window !== 'undefined') {
    window.TokenContract = TokenContract;
    window.TransactionManager = TransactionManager;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        TokenContract,
        TransactionManager
    };
}
