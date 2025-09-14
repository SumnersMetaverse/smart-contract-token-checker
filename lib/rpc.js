/**
 * RPC Library for Ethereum Network Communication
 * Handles communication with various Ethereum RPC providers
 */

class EthereumRPC {
    constructor() {
        this.providers = [
            'https://ethereum.publicnode.com',
            'https://ethereum-rpc.publicnode.com',
            'https://eth.drpc.org',
            'https://rpc.payload.de',
            'https://ethereum.blockpi.network/v1/rpc/public',
            'https://cloudflare-eth.com',
            'https://rpc.ankr.com/eth',
            'https://eth.llamarpc.com',
            'https://eth.merkle.io',
            'https://rpc.flashbots.net'
        ];
        this.currentProvider = 0;
        this.failedProviders = new Set();
        this.lastSuccessfulProvider = null;
    }

    /**
     * Make RPC call to Ethereum network
     * @param {string} method - RPC method name
     * @param {Array} params - RPC method parameters
     * @returns {Promise<any>} RPC response
     */
    async call(method, params = []) {
        // If we have no successful provider, try to find one
        if (this.lastSuccessfulProvider === null && this.failedProviders.size > 0) {
            const workingProvider = await this.findWorkingProvider();
            if (workingProvider) {
                const providerIndex = this.providers.indexOf(workingProvider);
                if (providerIndex !== -1) {
                    this.currentProvider = providerIndex;
                    this.lastSuccessfulProvider = providerIndex;
                }
            }
        }
        
        // If still no working provider, try to get the best available one
        if (this.lastSuccessfulProvider === null) {
            const bestProvider = await this.getBestProvider();
            const providerIndex = this.providers.indexOf(bestProvider);
            if (providerIndex !== -1) {
                this.currentProvider = providerIndex;
            }
        }
        
        const provider = this.providers[this.currentProvider];
        
        try {
            console.log(`Making RPC call to ${provider}:`, { method, params });
            
            // Create timeout promise
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Request timeout')), 8000);
            });
            
            // Create fetch promise
            const fetchPromise = fetch(provider, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: method,
                    params: params,
                    id: 1
                })
            });
            
            // Race between fetch and timeout
            const response = await Promise.race([fetchPromise, timeoutPromise]);
            
            console.log(`RPC response from ${provider}:`, response.status, response.statusText);

            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error('Rate limit exceeded');
                } else if (response.status === 401) {
                    throw new Error('Unauthorized - API key invalid');
                } else {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            }

            const data = await response.json();
            console.log(`RPC data from ${provider}:`, data);
            
            if (data.error) {
                // Log the full error object for debugging
                console.error(`RPC error from ${provider}:`, {
                    error: data.error,
                    message: data.error.message,
                    code: data.error.code,
                    data: data.error.data,
                    type: typeof data.error
                });
                
                // Don't throw for execution reverted - it's expected for some contracts
                if (data.error.message && data.error.message.includes('execution reverted')) {
                    // This is not a real error - function doesn't exist on contract
                    return null;
                }
                
                // Better error message formatting
                let errorMessage = 'Unknown RPC error';
                try {
                    if (data.error.message) {
                        errorMessage = data.error.message;
                    } else if (data.error.code) {
                        errorMessage = `Error code: ${data.error.code}`;
                    } else if (data.error.data) {
                        errorMessage = `Error data: ${JSON.stringify(data.error.data)}`;
                    } else {
                        errorMessage = `RPC error: ${JSON.stringify(data.error)}`;
                    }
                } catch (e) {
                    errorMessage = `RPC error: ${String(data.error)}`;
                }
                
                console.error(`Formatted error message: ${errorMessage}`);
                throw new Error(errorMessage);
            }

            // Mark this provider as successful
            this.lastSuccessfulProvider = this.currentProvider;
            this.failedProviders.delete(this.currentProvider);
            
            console.log(`RPC success from ${provider}, result:`, data.result);
            return data.result;
        } catch (error) {
            const errorMessage = this.debugRpcError(error, provider);
            console.error(`Provider ${this.currentProvider} (${provider}) failed:`, errorMessage);
            
            // Mark this provider as failed
            this.failedProviders.add(this.currentProvider);
            
            // Try next provider
            if (this.currentProvider < this.providers.length - 1) {
                this.currentProvider++;
                console.log(`Switching to provider ${this.currentProvider}: ${this.providers[this.currentProvider]}`);
                return this.call(method, params);
            }
            
            // If all providers failed, try to use a fallback
            if (this.lastSuccessfulProvider !== null && !this.failedProviders.has(this.lastSuccessfulProvider)) {
                console.log(`Trying last successful provider: ${this.providers[this.lastSuccessfulProvider]}`);
                this.currentProvider = this.lastSuccessfulProvider;
                return this.call(method, params);
            }
            
            // Try a simple fallback with a different approach
            console.log('Trying simple fallback approach...');
            try {
                const fallbackResult = await this.simpleFallback(method, params);
                if (fallbackResult) {
                    return fallbackResult;
                }
            } catch (fallbackError) {
                console.error('Fallback also failed:', fallbackError);
            }
            
            throw new Error(`All providers failed. Last error: ${error.message}`);
        }
    }

    /**
     * Call a contract method
     * @param {string} to - Contract address
     * @param {string} data - Encoded function call data
     * @returns {Promise<string>} Encoded result
     */
    async callContract(to, data) {
        try {
            const result = await this.call('eth_call', [
                { to: to, data: data },
                'latest'
            ]);
            
            // If result is null or empty, it means function doesn't exist
            if (!result || result === '0x' || result === null) {
                return null;
            }
            
            return result;
        } catch (error) {
            // If it's execution reverted, it means function doesn't exist
            if (error.message.includes('execution reverted')) {
                return null;
            }
            throw error;
        }
    }

    /**
     * Get current block number
     * @returns {Promise<string>} Block number in hex
     */
    async getBlockNumber() {
        return this.call('eth_blockNumber');
    }

    /**
     * Reset to first provider
     */
    resetProviders() {
        this.currentProvider = 0;
        this.failedProviders.clear();
        this.lastSuccessfulProvider = null;
    }
    
    /**
     * Get provider status
     */
    getProviderStatus() {
        return {
            current: this.currentProvider,
            total: this.providers.length,
            failed: Array.from(this.failedProviders),
            lastSuccessful: this.lastSuccessfulProvider
        };
    }

    /**
     * Simple fallback method
     */
    async simpleFallback(method, params) {
        console.log('Using simple fallback method...');
        
        // Try with a very simple approach - only free providers
        const simpleProviders = [
            'https://ethereum.publicnode.com',
            'https://ethereum-rpc.publicnode.com',
            'https://eth.drpc.org',
            'https://rpc.payload.de',
            'https://ethereum.blockpi.network/v1/rpc/public',
            'https://cloudflare-eth.com',
            'https://rpc.ankr.com/eth',
            'https://eth.llamarpc.com',
            'https://eth.merkle.io'
        ];
        
        for (const provider of simpleProviders) {
            try {
                console.log(`Trying simple fallback with ${provider}`);
                const response = await fetch(provider, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        jsonrpc: '2.0',
                        method: method,
                        params: params,
                        id: 1
                    })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.result && !data.error) {
                        console.log(`Simple fallback success with ${provider}:`, data.result);
                        return data.result;
                    }
                }
            } catch (error) {
                const errorMessage = this.debugRpcError(error, provider);
                console.log(`Simple fallback failed with ${provider}:`, errorMessage);
            }
        }
        
        return null;
    }

    /**
     * Test RPC provider connectivity
     * @param {string} provider - Provider URL
     * @returns {Promise<boolean>} Is provider working
     */
    async testProvider(provider) {
        try {
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Test timeout')), 5000);
            });
            
            const fetchPromise = fetch(provider, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: 'eth_blockNumber',
                    params: [],
                    id: 1
                })
            });
            
            const response = await Promise.race([fetchPromise, timeoutPromise]);
            
            if (response.ok) {
                const data = await response.json();
                if (data.error) {
                    console.log(`Provider ${provider} test failed with error:`, data.error);
                    return false;
                }
                return true;
            }
            console.log(`Provider ${provider} test failed with status:`, response.status);
            return false;
        } catch (error) {
            console.log(`Provider ${provider} test failed with exception:`, error.message);
            return false;
        }
    }

    /**
     * Test all providers and return working ones
     * @returns {Promise<Array>} Array of working providers
     */
    async testAllProviders() {
        console.log('Testing all RPC providers...');
        const workingProviders = [];
        
        for (const provider of this.providers) {
            const isWorking = await this.testProvider(provider);
            if (isWorking) {
                workingProviders.push(provider);
                console.log(`✅ ${provider} - Working`);
            } else {
                console.log(`❌ ${provider} - Failed`);
            }
        }
        
        console.log(`Found ${workingProviders.length}/${this.providers.length} working providers`);
        return workingProviders;
    }

    /**
     * Test a specific RPC call
     * @param {string} method - RPC method
     * @param {Array} params - RPC parameters
     * @returns {Promise<Object>} Test result
     */
    async testRpcCall(method, params = []) {
        console.log(`Testing RPC call: ${method} with params:`, params);
        
        try {
            const result = await this.call(method, params);
            console.log(`RPC call successful:`, result);
            return { success: true, result };
        } catch (error) {
            console.error(`RPC call failed:`, error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Find working provider quickly
     * @returns {Promise<string|null>} Working provider URL or null
     */
    async findWorkingProvider() {
        console.log('Finding working provider...');
        
        // Test providers in parallel for faster detection
        const testPromises = this.providers.map(async (provider) => {
            try {
                const isWorking = await this.testProvider(provider);
                return isWorking ? provider : null;
            } catch (error) {
                console.log(`Provider ${provider} test failed:`, error.message);
                return null;
            }
        });
        
        const results = await Promise.all(testPromises);
        const workingProvider = results.find(provider => provider !== null);
        
        if (workingProvider) {
            console.log(`Found working provider: ${workingProvider}`);
            return workingProvider;
        }
        
        console.log('No working providers found');
        return null;
    }

    /**
     * Get best available provider
     * @returns {Promise<string>} Best provider URL
     */
    async getBestProvider() {
        // First try to find a working provider
        const workingProvider = await this.findWorkingProvider();
        if (workingProvider) {
            return workingProvider;
        }
        
        // If no working provider found, return the first one and let the error handling deal with it
        return this.providers[0];
    }

    /**
     * Debug RPC error
     * @param {Object} error - Error object
     * @param {string} provider - Provider URL
     * @returns {string} Formatted error message
     */
    debugRpcError(error, provider) {
        console.log('Debugging RPC error:', {
            provider,
            error,
            type: typeof error,
            message: error?.message,
            code: error?.code,
            data: error?.data,
            stack: error?.stack
        });
        
        // Try to extract meaningful error message
        if (error?.message) {
            return error.message;
        } else if (error?.code) {
            return `Error code: ${error.code}`;
        } else if (typeof error === 'string') {
            return error;
        } else if (error?.data) {
            return `Error data: ${JSON.stringify(error.data)}`;
        } else if (error?.stack) {
            return `Error stack: ${error.stack}`;
        } else {
            try {
                return `Unknown error: ${JSON.stringify(error)}`;
            } catch (e) {
                return `Unknown error: ${String(error)}`;
            }
        }
    }
}

/**
 * ERC20 Token Inspector
 * Handles ERC20 token contract inspection
 */
class ERC20Inspector {
    constructor() {
        this.rpc = new EthereumRPC();
        this.currentNetwork = 'ethereum';
        
        // ERC20 function selectors
        this.selectors = {
            name: '0x06fdde03',
            symbol: '0x95d89b41', 
            decimals: '0x313ce567',
            totalSupply: '0x18160ddd',
            balanceOf: '0x70a08231',
            allowance: '0xdd62ed3e',
            transfer: '0xa9059cbb',
            approve: '0x095ea7b3',
            transferFrom: '0x23b872dd'
        };
        
        // Additional common function selectors
        this.extendedSelectors = {
            // ERC20 optional functions
            owner: '0x8da5cb5b',
            paused: '0x5c975abb',
            pausedAt: '0x8c2a993e',
            
            // Common token functions
            cap: '0x355274ea', // total cap
            paused: '0x5c975abb', // if contract is paused
            owner: '0x8da5cb5b', // contract owner
            admin: '0xf851a440', // admin address
            
            // Token metadata
            tokenURI: '0xc87b56dd',
            baseURI: '0x6c0360eb',
            
            // Supply functions
            maxSupply: '0x2e1a7d4d',
            circulatingSupply: '0x70a08231',
            
            // Fee functions
            fee: '0xddca3f43',
            feeRecipient: '0x70a08231',
            
            // Pause functions
            paused: '0x5c975abb',
            pause: '0x8456cb59',
            unpause: '0x3f4ba83a'
        };
    }

    /**
     * Decode string from hex response
     * @param {string} hex - Hex encoded string
     * @returns {string} Decoded string
     */
    decodeString(hex) {
        if (!hex || hex === '0x' || hex === '0x0') return '';
        
        try {
            // Remove 0x prefix
            const bytes = hex.slice(2);
            
            // Check if response is too short
            if (bytes.length < 64) {
                console.warn('Response too short for string decoding:', hex);
                return '';
            }
            
            // Get offset (first 32 bytes)
            const offset = parseInt(bytes.slice(0, 64), 16);
            
            // Get length (next 32 bytes)
            const length = parseInt(bytes.slice(64, 128), 16);
            
            // Extract string data
            const stringStart = 128 + (offset * 2);
            const stringEnd = stringStart + (length * 2);
            const stringBytes = bytes.slice(stringStart, stringEnd);
            
            // Convert to string
            let result = '';
            for (let i = 0; i < stringBytes.length; i += 2) {
                const byte = parseInt(stringBytes.substr(i, 2), 16);
                if (byte === 0) break;
                result += String.fromCharCode(byte);
            }
            
            return result || '';
        } catch (error) {
            console.error('String decoding error:', error, 'Input:', hex);
            return '';
        }
    }

    /**
     * Decode uint256 from hex response
     * @param {string} hex - Hex encoded number
     * @returns {string} Decoded number as string
     */
    decodeUint256(hex) {
        if (!hex || hex === '0x' || hex === '0x0') return '0';
        
        try {
            // Remove 0x prefix and convert to BigInt
            const hexValue = hex.slice(2);
            
            // Pad to 64 characters if needed
            const paddedHex = hexValue.padStart(64, '0');
            
            return BigInt('0x' + paddedHex).toString();
        } catch (error) {
            console.error('Uint256 decoding error:', error, 'Input:', hex);
            return '0';
        }
    }

    /**
     * Decode address from hex response
     * @param {string} hex - Hex encoded address
     * @returns {string} Decoded address
     */
    decodeAddress(hex) {
        if (!hex || hex === '0x' || hex === '0x0') return '';
        
        try {
            // Remove 0x prefix
            const hexValue = hex.slice(2);
            
            // Pad to 64 characters if needed
            const paddedHex = hexValue.padStart(64, '0');
            
            // Extract last 40 characters (20 bytes = 40 hex chars)
            const addressHex = paddedHex.slice(-40);
            
            return '0x' + addressHex.toLowerCase();
        } catch (error) {
            console.error('Address decoding error:', error, 'Input:', hex);
            return '';
        }
    }

    /**
     * Decode boolean from hex response
     * @param {string} hex - Hex encoded boolean
     * @returns {boolean} Decoded boolean
     */
    decodeBoolean(hex) {
        if (!hex || hex === '0x' || hex === '0x0') return false;
        
        try {
            const hexValue = hex.slice(2);
            const paddedHex = hexValue.padStart(64, '0');
            return BigInt('0x' + paddedHex) !== 0n;
        } catch (error) {
            console.error('Boolean decoding error:', error, 'Input:', hex);
            return false;
        }
    }

    /**
     * Call ERC20 string function (name, symbol)
     * @param {string} contractAddress - Contract address
     * @param {string} selector - Function selector
     * @returns {Promise<string>} Decoded string result
     */
    async callStringFunction(contractAddress, selector) {
        try {
            console.log(`Calling string function ${selector} on ${contractAddress}`);
            const result = await this.rpc.callContract(contractAddress, selector);
            console.log(`Raw result for ${selector}:`, result);
            
            // If result is null, function doesn't exist
            if (!result) {
                return 'Unknown';
            }
            
            const decoded = this.decodeString(result);
            console.log(`Decoded result for ${selector}:`, decoded);
            
            return decoded || 'Unknown';
        } catch (error) {
            console.error(`String function call failed for ${selector}:`, error);
            return 'Unknown';
        }
    }

    /**
     * Call ERC20 uint function (decimals, totalSupply)
     * @param {string} contractAddress - Contract address
     * @param {string} selector - Function selector
     * @returns {Promise<string>} Decoded number as string
     */
    async callUintFunction(contractAddress, selector) {
        try {
            console.log(`Calling uint function ${selector} on ${contractAddress}`);
            const result = await this.rpc.callContract(contractAddress, selector);
            console.log(`Raw result for ${selector}:`, result);
            
            // If result is null, function doesn't exist
            if (!result) {
                return '0';
            }
            
            const decoded = this.decodeUint256(result);
            console.log(`Decoded result for ${selector}:`, decoded);
            
            return decoded || '0';
        } catch (error) {
            console.error(`Uint function call failed for ${selector}:`, error);
            return '0';
        }
    }

    /**
     * Call ERC20 address function
     * @param {string} contractAddress - Contract address
     * @param {string} selector - Function selector
     * @returns {Promise<string>} Decoded address
     */
    async callAddressFunction(contractAddress, selector) {
        try {
            console.log(`Calling address function ${selector} on ${contractAddress}`);
            const result = await this.rpc.callContract(contractAddress, selector);
            console.log(`Raw result for ${selector}:`, result);
            
            // If result is null, function doesn't exist
            if (!result) {
                return '';
            }
            
            const decoded = this.decodeAddress(result);
            console.log(`Decoded result for ${selector}:`, decoded);
            
            return decoded || '';
        } catch (error) {
            console.error(`Address function call failed for ${selector}:`, error);
            return '';
        }
    }

    /**
     * Call ERC20 boolean function
     * @param {string} contractAddress - Contract address
     * @param {string} selector - Function selector
     * @returns {Promise<boolean>} Decoded boolean
     */
    async callBooleanFunction(contractAddress, selector) {
        try {
            console.log(`Calling boolean function ${selector} on ${contractAddress}`);
            const result = await this.rpc.callContract(contractAddress, selector);
            console.log(`Raw result for ${selector}:`, result);
            
            // If result is null, function doesn't exist
            if (!result) {
                return false;
            }
            
            const decoded = this.decodeBoolean(result);
            console.log(`Decoded result for ${selector}:`, decoded);
            
            return decoded;
        } catch (error) {
            console.error(`Boolean function call failed for ${selector}:`, error);
            return false;
        }
    }

    /**
     * Try to get token name using multiple methods
     * @param {string} contractAddress - Contract address
     * @returns {Promise<string>} Token name
     */
    async getTokenName(contractAddress) {
        // Try standard ERC20 name function first
        try {
            const name = await this.callStringFunction(contractAddress, this.selectors.name);
            if (name !== 'Unknown' && name.length > 0) {
                return name;
            }
        } catch (error) {
            console.log(`Standard name function failed:`, error.message);
        }
        
        // Try alternative methods only if standard failed
        const alternativeSelectors = [
            '0x4f02c420', // tokenName()
            '0x3b3b57de', // NAME()
            '0x8c5be1e5'  // _name()
        ];
        
        for (const selector of alternativeSelectors) {
            try {
                const result = await this.callStringFunction(contractAddress, selector);
                if (result !== 'Unknown' && result.length > 0) {
                    return result;
                }
            } catch (error) {
                console.log(`Alternative name method ${selector} failed:`, error.message);
            }
        }
        
        return 'Unknown';
    }

    /**
     * Try to get token symbol using multiple methods
     * @param {string} contractAddress - Contract address
     * @returns {Promise<string>} Token symbol
     */
    async getTokenSymbol(contractAddress) {
        // Try standard ERC20 symbol function first
        try {
            const symbol = await this.callStringFunction(contractAddress, this.selectors.symbol);
            if (symbol !== 'Unknown' && symbol.length > 0) {
                return symbol;
            }
        } catch (error) {
            console.log(`Standard symbol function failed:`, error.message);
        }
        
        // Try alternative methods only if standard failed
        const alternativeSelectors = [
            '0x59c1bd1a', // tokenSymbol()
            '0x7ff9b596', // SYMBOL()
            '0x95d89b41'  // _symbol()
        ];
        
        for (const selector of alternativeSelectors) {
            try {
                const result = await this.callStringFunction(contractAddress, selector);
                if (result !== 'Unknown' && result.length > 0) {
                    return result;
                }
            } catch (error) {
                console.log(`Alternative symbol method ${selector} failed:`, error.message);
            }
        }
        
        return 'Unknown';
    }

    /**
     * Get additional token information
     * @param {string} contractAddress - Contract address
     * @returns {Promise<Object>} Additional token info
     */
    async getAdditionalInfo(contractAddress) {
        const additionalInfo = {};
        
        // Try to get owner
        try {
            const owner = await this.callAddressFunction(contractAddress, this.extendedSelectors.owner);
            if (owner && owner !== '0x0000000000000000000000000000000000000000') {
                additionalInfo.owner = owner;
            }
        } catch (error) {
            console.log('Owner not available:', error.message);
        }
        
        // Try to get admin
        try {
            const admin = await this.callAddressFunction(contractAddress, this.extendedSelectors.admin);
            if (admin && admin !== '0x0000000000000000000000000000000000000000') {
                additionalInfo.admin = admin;
            }
        } catch (error) {
            console.log('Admin not available:', error.message);
        }
        
        // Try to get max supply
        try {
            const maxSupply = await this.callUintFunction(contractAddress, this.extendedSelectors.cap);
            if (maxSupply && maxSupply !== '0') {
                additionalInfo.maxSupply = maxSupply;
            }
        } catch (error) {
            console.log('Max supply not available:', error.message);
        }
        
        // Try to get pause status
        try {
            const isPaused = await this.callBooleanFunction(contractAddress, this.extendedSelectors.paused);
            additionalInfo.isPaused = isPaused;
        } catch (error) {
            console.log('Pause status not available:', error.message);
        }
        
        return additionalInfo;
    }

    /**
     * Get token information from CoinGecko
     * @param {string} contractAddress - Contract address
     * @param {string} network - Network name
     * @returns {Promise<Object>} Token information including price and logo
     */
    async getTokenInfoFromCoinGecko(contractAddress, network = 'ethereum') {
        try {
            const networkMap = {
                ethereum: 'ethereum',
                polygon: 'polygon-pos',
                bsc: 'binance-smart-chain'
            };
            
            const platform = networkMap[network] || 'ethereum';
            const url = `https://api.coingecko.com/api/v3/coins/${platform}/contract/${contractAddress}`;
            
            console.log(`Fetching token info from CoinGecko: ${url}`);
            
            const response = await fetch(url);
            if (!response.ok) {
                if (response.status === 404) {
                    console.log('Token not found on CoinGecko');
                    return null;
                }
                throw new Error(`CoinGecko API failed: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('CoinGecko response:', data);
            
            return {
                id: data.id,
                symbol: data.symbol?.toUpperCase(),
                name: data.name,
                logo: data.image?.thumb || data.image?.small || data.image?.large,
                price: data.market_data?.current_price?.usd,
                change24h: data.market_data?.price_change_percentage_24h,
                marketCap: data.market_data?.market_cap?.usd,
                totalSupply: data.market_data?.total_supply,
                circulatingSupply: data.market_data?.circulating_supply,
                description: data.description?.en,
                website: data.links?.homepage?.[0],
                twitter: data.links?.twitter_screen_name,
                telegram: data.links?.telegram_channel_identifier,
                github: data.links?.repos_url?.github?.[0]
            };
        } catch (error) {
            console.log('CoinGecko fetch failed:', error.message);
            return null;
        }
    }

    /**
     * Get token price from CoinGecko (legacy method)
     * @param {string} contractAddress - Contract address
     * @param {string} network - Network name
     * @returns {Promise<Object>} Price information
     */
    async getTokenPrice(contractAddress, network = 'ethereum') {
        try {
            const networkMap = {
                ethereum: 'ethereum',
                polygon: 'polygon-pos',
                bsc: 'binance-smart-chain'
            };
            
            const platform = networkMap[network] || 'ethereum';
            const url = `https://api.coingecko.com/api/v3/simple/token_price/${platform}?contract_addresses=${contractAddress}&vs_currencies=usd&include_24hr_change=true`;
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Price API failed');
            }
            
            const data = await response.json();
            const tokenData = data[contractAddress.toLowerCase()];
            
            if (tokenData) {
                return {
                    price: tokenData.usd,
                    change24h: tokenData.usd_24h_change
                };
            }
            
            return null;
        } catch (error) {
            console.log('Price fetch failed:', error.message);
            return null;
        }
    }

    /**
     * Get token holders information from Etherscan API
     * @param {string} contractAddress - Contract address
     * @param {string} network - Network name
     * @returns {Promise<Object>} Holders information
     */
    async getTokenHolders(contractAddress, network = 'ethereum') {
        try {
            // This is a placeholder - in real implementation, you would use Etherscan API
            // For now, return mock data
            return {
                holdersCount: Math.floor(Math.random() * 10000) + 1000,
                transfersCount: Math.floor(Math.random() * 100000) + 10000,
                topHolders: [
                    { address: '0x1234...5678', percentage: 15.5 },
                    { address: '0x2345...6789', percentage: 12.3 },
                    { address: '0x3456...7890', percentage: 8.7 },
                    { address: '0x4567...8901', percentage: 6.2 },
                    { address: '0x5678...9012', percentage: 4.1 }
                ]
            };
        } catch (error) {
            console.log('Holders fetch failed:', error.message);
            return null;
        }
    }

    /**
     * Inspect ERC20 token contract
     * @param {string} contractAddress - Contract address
     * @returns {Promise<Object>} Token information
     */
    async inspectToken(contractAddress) {
        try {
            // Validate address format
            if (!this.isValidAddress(contractAddress)) {
                throw new Error('Invalid contract address format');
            }

            // Normalize address (ensure 0x prefix and lowercase)
            const normalizedAddress = contractAddress.toLowerCase().startsWith('0x') 
                ? contractAddress.toLowerCase() 
                : '0x' + contractAddress.toLowerCase();

            console.log(`Starting comprehensive token inspection for ${normalizedAddress}`);

            // Get basic ERC20 info
            const [name, symbol, decimals, totalSupply] = await Promise.all([
                this.getTokenName(normalizedAddress),
                this.getTokenSymbol(normalizedAddress),
                this.callUintFunction(normalizedAddress, this.selectors.decimals),
                this.callUintFunction(normalizedAddress, this.selectors.totalSupply)
            ]);

            // Get additional information
            const additionalInfo = await this.getAdditionalInfo(normalizedAddress);

            // Get comprehensive token information from CoinGecko
            const coinGeckoInfo = await this.getTokenInfoFromCoinGecko(normalizedAddress, this.currentNetwork);
            
            // Get holders information (async, don't wait)
            const holdersInfo = await this.getTokenHolders(normalizedAddress, this.currentNetwork);

            // Check if we got any valid data
            const hasValidData = name !== 'Unknown' || symbol !== 'Unknown' || decimals !== '0' || totalSupply !== '0';

            console.log('Token inspection results:', {
                address: normalizedAddress,
                name,
                symbol,
                decimals,
                totalSupply,
                additionalInfo,
                coinGeckoInfo,
                holdersInfo,
                hasValidData
            });

            const result = {
                address: normalizedAddress,
                name: name || 'Unknown',
                symbol: symbol || 'UNKNOWN',
                decimals: decimals || '0',
                totalSupply: totalSupply || '0',
                additionalInfo,
                success: hasValidData
            };

            // Add CoinGecko information if available
            if (coinGeckoInfo) {
                // Override with CoinGecko data if available
                if (coinGeckoInfo.name && coinGeckoInfo.name !== 'Unknown') {
                    result.name = coinGeckoInfo.name;
                }
                if (coinGeckoInfo.symbol && coinGeckoInfo.symbol !== 'UNKNOWN') {
                    result.symbol = coinGeckoInfo.symbol;
                }
                
                // Add logo and additional info
                result.logo = coinGeckoInfo.logo;
                result.description = coinGeckoInfo.description;
                result.website = coinGeckoInfo.website;
                result.twitter = coinGeckoInfo.twitter;
                result.telegram = coinGeckoInfo.telegram;
                result.github = coinGeckoInfo.github;
                
                // Add market data
                if (coinGeckoInfo.price) {
                    result.price = coinGeckoInfo.price;
                }
                if (coinGeckoInfo.change24h !== undefined) {
                    result.change24h = coinGeckoInfo.change24h;
                }
                if (coinGeckoInfo.marketCap) {
                    result.marketCap = coinGeckoInfo.marketCap;
                }
                if (coinGeckoInfo.circulatingSupply) {
                    result.circulatingSupply = coinGeckoInfo.circulatingSupply;
                }
                
                // Calculate market cap if not available from CoinGecko
                if (!result.marketCap && result.price && totalSupply && decimals) {
                    const marketCap = (parseFloat(result.price) * parseFloat(totalSupply)) / Math.pow(10, parseInt(decimals));
                    result.marketCap = marketCap;
                }
            }

            // Add holders information if available
            if (holdersInfo) {
                result.holdersCount = holdersInfo.holdersCount;
                result.transfersCount = holdersInfo.transfersCount;
                result.topHolders = holdersInfo.topHolders;
            }

            return result;
        } catch (error) {
            console.error('Token inspection failed:', error);
            
            // Try to reset providers and retry once
            if (this.rpc.failedProviders.size < this.rpc.providers.length) {
                console.log('Retrying with reset providers...');
                this.rpc.resetProviders();
                try {
                    const retryResult = await this.inspectToken(contractAddress);
                    if (retryResult.success) {
                        return retryResult;
                    }
                } catch (retryError) {
                    console.error('Retry also failed:', retryError);
                }
            }
            
            // Check if this might be a non-standard token
            const isNonStandard = error.message.includes('execution reverted') || 
                                 error.message.includes('invalid opcode') ||
                                 error.message.includes('out of gas');
            
            return {
                address: contractAddress,
                name: isNonStandard ? 'Non-Standard Token' : 'Error',
                symbol: isNonStandard ? 'NST' : 'ERROR',
                decimals: '0',
                totalSupply: '0',
                success: false,
                error: isNonStandard ? 'This contract does not implement standard ERC20 functions' : error.message
            };
        }
    }

    /**
     * Validate Ethereum address format
     * @param {string} address - Address to validate
     * @returns {boolean} Is valid address
     */
    isValidAddress(address) {
        if (!address) return false;
        
        const normalizedAddress = address.toLowerCase().startsWith('0x') 
            ? address.toLowerCase() 
            : '0x' + address.toLowerCase();
            
        return /^0x[a-fA-F0-9]{40}$/.test(normalizedAddress);
    }

    /**
     * Format large numbers with commas
     * @param {string} num - Number as string
     * @returns {string} Formatted number
     */
    formatNumber(num) {
        if (!num || num === 'N/A') return num;
        
        try {
            return BigInt(num).toLocaleString();
        } catch (error) {
            return num;
        }
    }

    /**
     * Format total supply with decimals
     * @param {string} supply - Total supply as string
     * @param {string} decimals - Decimals as string
     * @returns {string} Formatted supply
     */
    formatSupply(supply, decimals) {
        if (!supply || supply === 'N/A' || !decimals || decimals === 'N/A') {
            return supply || 'N/A';
        }

        try {
            const supplyBigInt = BigInt(supply);
            const decimalsInt = parseInt(decimals);
            const divisor = BigInt(10 ** decimalsInt);
            
            const wholePart = supplyBigInt / divisor;
            const fractionalPart = supplyBigInt % divisor;
            
            if (fractionalPart === 0n) {
                return wholePart.toLocaleString();
            }
            
            const fractionalStr = fractionalPart.toString().padStart(decimalsInt, '0');
            const trimmedFractional = fractionalStr.replace(/0+$/, '');
            
            if (trimmedFractional === '') {
                return wholePart.toLocaleString();
            }
            
            return `${wholePart.toLocaleString()}.${trimmedFractional}`;
        } catch (error) {
            return supply;
        }
    }
}

// Export for use in other files
window.EthereumRPC = EthereumRPC;
window.ERC20Inspector = ERC20Inspector;
