/**
 * Smart Contract Validator and Verification System
 * Handles validation of smart contracts and manages verification process
 */

class ContractValidator {
    constructor() {
        this.validationRules = {
            addressFormat: /^0x[a-fA-F0-9]{40}$/,
            minDecimals: 0,
            maxDecimals: 18
        };
        
        this.verificationStates = {
            PENDING: 'pending',
            VALIDATING: 'validating',
            VERIFIED: 'verified',
            FAILED: 'failed',
            INVALID: 'invalid'
        };
    }

    /**
     * Validate a single smart contract
     * @param {string} contractAddress - Contract address to validate
     * @param {string} network - Network name (ethereum, polygon, bsc)
     * @returns {Promise<Object>} Validation result with status and details
     */
    async validateContract(contractAddress, network = 'ethereum') {
        console.log(`Starting validation for contract ${contractAddress} on ${network}`);
        
        const validationResult = {
            address: contractAddress,
            network: network,
            isValid: false,
            errors: [],
            warnings: [],
            validatedAt: new Date().toISOString(),
            status: this.verificationStates.VALIDATING
        };

        // Step 1: Validate address format
        if (!this.validateAddressFormat(contractAddress)) {
            validationResult.errors.push('Invalid address format');
            validationResult.status = this.verificationStates.INVALID;
            return validationResult;
        }

        // Step 2: Normalize address
        const normalizedAddress = this.normalizeAddress(contractAddress);
        validationResult.address = normalizedAddress;

        // Step 3: Check network compatibility
        if (!this.isValidNetwork(network)) {
            validationResult.errors.push('Unsupported network');
            validationResult.status = this.verificationStates.INVALID;
            return validationResult;
        }

        // Step 4: Validate ERC20 compliance (basic check)
        try {
            const erc20Check = await this.checkERC20Compliance(normalizedAddress);
            
            if (!erc20Check.isCompliant) {
                validationResult.warnings.push('Contract may not be ERC20 compliant');
                validationResult.complianceDetails = erc20Check;
            } else {
                validationResult.complianceDetails = erc20Check;
            }

            // Step 5: Validate decimals range
            if (erc20Check.decimals) {
                const decimalsInt = parseInt(erc20Check.decimals);
                if (decimalsInt < this.validationRules.minDecimals || decimalsInt > this.validationRules.maxDecimals) {
                    validationResult.warnings.push(`Unusual decimals value: ${decimalsInt}`);
                }
            }

            // Step 6: Validate total supply
            if (erc20Check.totalSupply === '0' || !erc20Check.totalSupply) {
                validationResult.warnings.push('Zero or missing total supply');
            }

            // Mark as valid if no critical errors
            if (validationResult.errors.length === 0) {
                validationResult.isValid = true;
                validationResult.status = this.verificationStates.VERIFIED;
            } else {
                validationResult.status = this.verificationStates.FAILED;
            }

        } catch (error) {
            console.error('Validation error:', error);
            validationResult.errors.push(`Validation failed: ${error.message}`);
            validationResult.status = this.verificationStates.FAILED;
        }

        return validationResult;
    }

    /**
     * Validate multiple contracts in batch
     * @param {Array} contracts - Array of {address, network} objects
     * @returns {Promise<Object>} Batch validation results
     */
    async validateMultipleContracts(contracts) {
        console.log(`Starting batch validation for ${contracts.length} contracts`);
        
        const batchResult = {
            total: contracts.length,
            validated: 0,
            valid: 0,
            invalid: 0,
            failed: 0,
            results: [],
            startedAt: new Date().toISOString(),
            completedAt: null
        };

        const validationPromises = contracts.map(async (contract) => {
            try {
                const result = await this.validateContract(contract.address, contract.network);
                batchResult.validated++;
                
                if (result.isValid) {
                    batchResult.valid++;
                } else if (result.status === this.verificationStates.INVALID) {
                    batchResult.invalid++;
                } else {
                    batchResult.failed++;
                }
                
                return result;
            } catch (error) {
                console.error(`Batch validation error for ${contract.address}:`, error);
                batchResult.validated++;
                batchResult.failed++;
                return {
                    address: contract.address,
                    network: contract.network,
                    isValid: false,
                    errors: [error.message],
                    status: this.verificationStates.FAILED
                };
            }
        });

        batchResult.results = await Promise.all(validationPromises);
        batchResult.completedAt = new Date().toISOString();

        console.log('Batch validation completed:', batchResult);
        return batchResult;
    }

    /**
     * Validate address format
     * @param {string} address - Address to validate
     * @returns {boolean} Is valid format
     */
    validateAddressFormat(address) {
        if (!address) return false;
        
        const normalizedAddress = address.toLowerCase().startsWith('0x') 
            ? address.toLowerCase() 
            : '0x' + address.toLowerCase();
            
        return this.validationRules.addressFormat.test(normalizedAddress);
    }

    /**
     * Normalize Ethereum address
     * @param {string} address - Address to normalize
     * @returns {string} Normalized address
     */
    normalizeAddress(address) {
        if (!address) return '';
        
        const normalized = address.toLowerCase().startsWith('0x') 
            ? address.toLowerCase() 
            : '0x' + address.toLowerCase();
            
        return normalized;
    }

    /**
     * Check if network is supported
     * @param {string} network - Network name
     * @returns {boolean} Is supported
     */
    isValidNetwork(network) {
        const supportedNetworks = ['ethereum', 'polygon', 'bsc'];
        return supportedNetworks.includes(network.toLowerCase());
    }

    /**
     * Check ERC20 compliance
     * @param {string} contractAddress - Contract address
     * @returns {Promise<Object>} Compliance check result
     */
    async checkERC20Compliance(contractAddress) {
        // Use the existing ERC20Inspector if available
        if (typeof ERC20Inspector !== 'undefined') {
            const inspector = new ERC20Inspector();
            
            try {
                const tokenInfo = await inspector.inspectToken(contractAddress);
                
                const hasName = tokenInfo.name && tokenInfo.name !== 'Unknown';
                const hasSymbol = tokenInfo.symbol && tokenInfo.symbol !== 'UNKNOWN';
                const hasDecimals = tokenInfo.decimals && tokenInfo.decimals !== '0';
                const hasTotalSupply = tokenInfo.totalSupply && tokenInfo.totalSupply !== '0';
                
                return {
                    isCompliant: hasName && hasSymbol && hasDecimals,
                    hasName,
                    hasSymbol,
                    hasDecimals,
                    hasTotalSupply,
                    name: tokenInfo.name,
                    symbol: tokenInfo.symbol,
                    decimals: tokenInfo.decimals,
                    totalSupply: tokenInfo.totalSupply
                };
            } catch (error) {
                console.error('ERC20 compliance check failed:', error);
                return {
                    isCompliant: false,
                    error: error.message
                };
            }
        }
        
        // Fallback if ERC20Inspector is not available
        return {
            isCompliant: false,
            error: 'ERC20Inspector not available'
        };
    }

    /**
     * Generate unique identifier for a contract
     * @param {string} contractAddress - Contract address
     * @param {string} network - Network name
     * @returns {string} Unique identifier
     */
    generateContractIdentifier(contractAddress, network) {
        const normalized = this.normalizeAddress(contractAddress);
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `${network}_${normalized}_${timestamp}_${random}`;
    }
}

/**
 * Contract Verification Manager
 * Manages the verification process and stores contract data privately
 */
class ContractVerificationManager {
    constructor() {
        this.storageKey = 'validatedContracts';
        this.verificationKey = 'verificationQueue';
        this.validator = new ContractValidator();
    }

    /**
     * Store validated contract in private data
     * @param {Object} validationResult - Validation result from ContractValidator
     * @returns {Promise<Object>} Storage result with identifier
     */
    async storeValidatedContract(validationResult) {
        try {
            // Generate unique identifier
            const identifier = this.validator.generateContractIdentifier(
                validationResult.address,
                validationResult.network
            );

            // Get existing validated contracts
            const stored = await this.getValidatedContracts();
            
            // Create contract record
            const contractRecord = {
                identifier,
                address: validationResult.address,
                network: validationResult.network,
                isValid: validationResult.isValid,
                status: validationResult.status,
                errors: validationResult.errors,
                warnings: validationResult.warnings,
                complianceDetails: validationResult.complianceDetails,
                validatedAt: validationResult.validatedAt,
                storedAt: new Date().toISOString()
            };

            // Check if contract already exists
            const existingIndex = stored.contracts.findIndex(
                c => c.address.toLowerCase() === validationResult.address.toLowerCase() && 
                     c.network === validationResult.network
            );

            if (existingIndex >= 0) {
                // Update existing record
                stored.contracts[existingIndex] = contractRecord;
            } else {
                // Add new record
                stored.contracts.unshift(contractRecord);
            }

            // Limit to 100 contracts
            if (stored.contracts.length > 100) {
                stored.contracts = stored.contracts.slice(0, 100);
            }

            stored.lastUpdated = new Date().toISOString();

            // Save to storage
            await chrome.storage.local.set({ [this.storageKey]: stored });

            console.log(`Contract stored with identifier: ${identifier}`);

            return {
                success: true,
                identifier,
                contractRecord
            };
        } catch (error) {
            console.error('Failed to store validated contract:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Store multiple validated contracts
     * @param {Array} validationResults - Array of validation results
     * @returns {Promise<Object>} Batch storage result
     */
    async storeMultipleContracts(validationResults) {
        const results = {
            total: validationResults.length,
            stored: 0,
            failed: 0,
            identifiers: [],
            errors: []
        };

        for (const result of validationResults) {
            try {
                const storeResult = await this.storeValidatedContract(result);
                if (storeResult.success) {
                    results.stored++;
                    results.identifiers.push(storeResult.identifier);
                } else {
                    results.failed++;
                    results.errors.push({
                        address: result.address,
                        error: storeResult.error
                    });
                }
            } catch (error) {
                results.failed++;
                results.errors.push({
                    address: result.address,
                    error: error.message
                });
            }
        }

        return results;
    }

    /**
     * Get all validated contracts from private storage
     * @returns {Promise<Object>} Stored contracts data
     */
    async getValidatedContracts() {
        try {
            const result = await chrome.storage.local.get([this.storageKey]);
            return result[this.storageKey] || {
                contracts: [],
                lastUpdated: null
            };
        } catch (error) {
            console.error('Failed to retrieve validated contracts:', error);
            return {
                contracts: [],
                lastUpdated: null
            };
        }
    }

    /**
     * Get contract by identifier
     * @param {string} identifier - Contract identifier
     * @returns {Promise<Object|null>} Contract record or null
     */
    async getContractByIdentifier(identifier) {
        const stored = await this.getValidatedContracts();
        return stored.contracts.find(c => c.identifier === identifier) || null;
    }

    /**
     * Get contracts by status
     * @param {string} status - Verification status
     * @returns {Promise<Array>} Filtered contracts
     */
    async getContractsByStatus(status) {
        const stored = await this.getValidatedContracts();
        return stored.contracts.filter(c => c.status === status);
    }

    /**
     * Initiate verification process for a contract
     * @param {string} contractAddress - Contract address
     * @param {string} network - Network name
     * @returns {Promise<Object>} Verification initiation result
     */
    async initiateVerification(contractAddress, network) {
        console.log(`Initiating verification for ${contractAddress} on ${network}`);
        
        try {
            // Step 1: Validate the contract
            const validationResult = await this.validator.validateContract(contractAddress, network);
            
            // Step 2: Store in private data
            const storeResult = await this.storeValidatedContract(validationResult);
            
            // Step 3: Add to verification queue
            if (storeResult.success) {
                await this.addToVerificationQueue(storeResult.identifier);
            }
            
            return {
                success: storeResult.success,
                identifier: storeResult.identifier,
                validationResult,
                message: storeResult.success 
                    ? 'Verification initiated successfully' 
                    : 'Failed to initiate verification'
            };
        } catch (error) {
            console.error('Failed to initiate verification:', error);
            return {
                success: false,
                error: error.message,
                message: 'Verification initiation failed'
            };
        }
    }

    /**
     * Initiate verification for multiple contracts
     * @param {Array} contracts - Array of {address, network} objects
     * @returns {Promise<Object>} Batch verification result
     */
    async initiateMultipleVerifications(contracts) {
        console.log(`Initiating batch verification for ${contracts.length} contracts`);
        
        const results = {
            total: contracts.length,
            initiated: 0,
            failed: 0,
            identifiers: [],
            details: []
        };

        for (const contract of contracts) {
            try {
                const result = await this.initiateVerification(contract.address, contract.network);
                
                if (result.success) {
                    results.initiated++;
                    results.identifiers.push(result.identifier);
                } else {
                    results.failed++;
                }
                
                results.details.push(result);
            } catch (error) {
                results.failed++;
                results.details.push({
                    address: contract.address,
                    network: contract.network,
                    success: false,
                    error: error.message
                });
            }
        }

        return results;
    }

    /**
     * Add contract to verification queue
     * @param {string} identifier - Contract identifier
     * @returns {Promise<void>}
     */
    async addToVerificationQueue(identifier) {
        try {
            const result = await chrome.storage.local.get([this.verificationKey]);
            const queue = result[this.verificationKey] || [];
            
            if (!queue.includes(identifier)) {
                queue.push(identifier);
                await chrome.storage.local.set({ [this.verificationKey]: queue });
            }
        } catch (error) {
            console.error('Failed to add to verification queue:', error);
        }
    }

    /**
     * Get verification queue
     * @returns {Promise<Array>} Queue of identifiers
     */
    async getVerificationQueue() {
        try {
            const result = await chrome.storage.local.get([this.verificationKey]);
            return result[this.verificationKey] || [];
        } catch (error) {
            console.error('Failed to get verification queue:', error);
            return [];
        }
    }

    /**
     * Clear verification queue
     * @returns {Promise<void>}
     */
    async clearVerificationQueue() {
        try {
            await chrome.storage.local.set({ [this.verificationKey]: [] });
        } catch (error) {
            console.error('Failed to clear verification queue:', error);
        }
    }

    /**
     * Export validated contracts data
     * @returns {Promise<string>} JSON string of validated contracts
     */
    async exportValidatedContracts() {
        const stored = await this.getValidatedContracts();
        return JSON.stringify(stored, null, 2);
    }

    /**
     * Get validation statistics
     * @returns {Promise<Object>} Statistics
     */
    async getValidationStats() {
        const stored = await this.getValidatedContracts();
        
        const stats = {
            total: stored.contracts.length,
            verified: 0,
            pending: 0,
            failed: 0,
            invalid: 0,
            byNetwork: {},
            lastUpdated: stored.lastUpdated
        };

        stored.contracts.forEach(contract => {
            // Count by status
            if (contract.status === 'verified') stats.verified++;
            else if (contract.status === 'pending' || contract.status === 'validating') stats.pending++;
            else if (contract.status === 'failed') stats.failed++;
            else if (contract.status === 'invalid') stats.invalid++;
            
            // Count by network
            if (!stats.byNetwork[contract.network]) {
                stats.byNetwork[contract.network] = 0;
            }
            stats.byNetwork[contract.network]++;
        });

        return stats;
    }
}

// Export for use in other files
if (typeof window !== 'undefined') {
    window.ContractValidator = ContractValidator;
    window.ContractVerificationManager = ContractVerificationManager;
}
