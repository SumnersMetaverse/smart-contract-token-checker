/**
 * Verification Library for Mempool.space and Meta-Earth Repository Integration
 * Handles verification of contracts and assets across blockchain networks
 */

class AssetVerification {
    constructor() {
        // Mempool.space API endpoints
        this.mempoolApiBase = 'https://mempool.space/api';
        this.mempoolTestnetBase = 'https://mempool.space/testnet/api';
        
        // Meta-earth repository configuration
        // Note: This repository should be created and maintained with verified asset data
        // You can fork this class and change these values to point to your own repository
        // or configure it after instantiation via setMetaEarthRepo() method
        this.metaEarthRepo = {
            owner: 'SumnersMetaverse',
            repo: 'meta-earth',
            branch: 'main',
            assetsPath: 'assets'
        };
        
        // GitHub raw content base URL
        this.githubRawBase = 'https://raw.githubusercontent.com';
        
        // Cache for verified assets
        this.verificationCache = new Map();
        this.metaEarthAssets = null;
    }

    /**
     * Set custom meta-earth repository configuration
     * @param {Object} config - Repository configuration
     */
    setMetaEarthRepo(config) {
        this.metaEarthRepo = {
            ...this.metaEarthRepo,
            ...config
        };
        // Clear cached assets when config changes
        this.metaEarthAssets = null;
    }

    /**
     * Fetch data from mempool.space API
     * @param {string} endpoint - API endpoint
     * @param {boolean} testnet - Use testnet API
     * @returns {Promise<any>} API response data
     */
    async fetchMempoolData(endpoint, testnet = false) {
        const baseUrl = testnet ? this.mempoolTestnetBase : this.mempoolApiBase;
        const url = `${baseUrl}${endpoint}`;
        
        try {
            console.log(`Fetching mempool.space data: ${url}`);
            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                if (response.status === 404) {
                    return null;
                }
                throw new Error(`Mempool API failed: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Mempool.space fetch error:', error.message);
            return null;
        }
    }

    /**
     * Fetch meta-earth repository assets
     * @returns {Promise<Object>} Meta-earth assets catalog
     */
    async fetchMetaEarthAssets() {
        // Return cached version if available
        if (this.metaEarthAssets) {
            return this.metaEarthAssets;
        }
        
        try {
            const { owner, repo, branch, assetsPath } = this.metaEarthRepo;
            const catalogUrl = `${this.githubRawBase}/${owner}/${repo}/${branch}/${assetsPath}/catalog.json`;
            
            console.log(`Fetching meta-earth assets catalog: ${catalogUrl}`);
            
            const response = await fetch(catalogUrl);
            
            if (!response.ok) {
                if (response.status === 404) {
                    console.log('Meta-earth catalog not found, creating empty catalog');
                    // Return empty catalog if file doesn't exist yet
                    this.metaEarthAssets = {
                        version: '1.0.0',
                        lastUpdated: new Date().toISOString(),
                        networks: {},
                        assets: []
                    };
                    return this.metaEarthAssets;
                }
                throw new Error(`Meta-earth fetch failed: ${response.status}`);
            }
            
            const data = await response.json();
            this.metaEarthAssets = data;
            
            console.log(`Loaded ${data.assets?.length || 0} assets from meta-earth`);
            return data;
        } catch (error) {
            console.error('Meta-earth fetch error:', error.message);
            // Return empty catalog on error
            this.metaEarthAssets = {
                version: '1.0.0',
                lastUpdated: new Date().toISOString(),
                networks: {},
                assets: []
            };
            return this.metaEarthAssets;
        }
    }

    /**
     * Verify contract address in mempool.space
     * @param {string} address - Contract address to verify
     * @param {string} network - Network name (ethereum, bitcoin, etc.)
     * @returns {Promise<Object>} Verification result
     */
    async verifyInMempool(address, network = 'ethereum') {
        // Check cache first
        const cacheKey = `${network}:${address}`;
        if (this.verificationCache.has(cacheKey)) {
            return this.verificationCache.get(cacheKey);
        }
        
        try {
            let mempoolData = null;
            let isApplicable = true;
            let notApplicableReason = null;
            
            // For Bitcoin network, use mempool.space Bitcoin API
            if (network === 'bitcoin' || network === 'btc') {
                mempoolData = await this.fetchMempoolData(`/address/${address}`);
            } else {
                // For EVM chains, mempool.space doesn't directly support them
                isApplicable = false;
                notApplicableReason = 'Mempool.space primarily supports Bitcoin network';
            }
            
            const result = {
                found: mempoolData !== null && isApplicable,
                applicable: isApplicable,
                network: network,
                address: address,
                data: mempoolData,
                reason: notApplicableReason,
                timestamp: new Date().toISOString()
            };
            
            // Cache result
            this.verificationCache.set(cacheKey, result);
            
            return result;
        } catch (error) {
            console.error('Mempool verification error:', error);
            return {
                found: false,
                applicable: false,
                network: network,
                address: address,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Verify and match contract in meta-earth repository
     * @param {string} address - Contract address
     * @param {string} network - Network name
     * @param {Object} tokenInfo - Token information from inspection
     * @returns {Promise<Object>} Match result
     */
    async matchInMetaEarth(address, network, tokenInfo = {}) {
        try {
            const metaEarthData = await this.fetchMetaEarthAssets();
            
            // Normalize address for comparison
            const normalizedAddress = address.toLowerCase();
            
            // Search for matching asset
            const matchedAsset = metaEarthData.assets?.find(asset => 
                asset.address?.toLowerCase() === normalizedAddress &&
                asset.network?.toLowerCase() === network.toLowerCase()
            );
            
            if (matchedAsset) {
                return {
                    matched: true,
                    network: network,
                    address: address,
                    asset: matchedAsset,
                    verified: matchedAsset.verified || false,
                    timestamp: new Date().toISOString()
                };
            }
            
            return {
                matched: false,
                network: network,
                address: address,
                reason: 'Asset not found in meta-earth catalog',
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Meta-earth matching error:', error);
            return {
                matched: false,
                network: network,
                address: address,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Perform comprehensive verification
     * @param {string} address - Contract address
     * @param {string} network - Network name
     * @param {Object} tokenInfo - Token information
     * @returns {Promise<Object>} Complete verification result
     */
    async performComprehensiveVerification(address, network, tokenInfo = {}) {
        console.log(`Starting comprehensive verification for ${address} on ${network}`);
        
        try {
            // Run verifications in parallel
            const [mempoolResult, metaEarthResult] = await Promise.all([
                this.verifyInMempool(address, network),
                this.matchInMetaEarth(address, network, tokenInfo)
            ]);
            
            // Calculate overall verification status
            const verificationStatus = this.calculateVerificationStatus(
                mempoolResult,
                metaEarthResult,
                tokenInfo
            );
            
            return {
                address: address,
                network: network,
                mempool: mempoolResult,
                metaEarth: metaEarthResult,
                status: verificationStatus,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Comprehensive verification error:', error);
            return {
                address: address,
                network: network,
                error: error.message,
                status: {
                    verified: false,
                    level: 'error',
                    message: 'Verification failed'
                },
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Calculate verification status based on all checks
     * @param {Object} mempoolResult - Mempool verification result
     * @param {Object} metaEarthResult - Meta-earth match result
     * @param {Object} tokenInfo - Token information
     * @returns {Object} Verification status
     */
    calculateVerificationStatus(mempoolResult, metaEarthResult, tokenInfo) {
        let level = 'unknown';
        let message = 'Verification status unknown';
        let verified = false;
        let badges = [];
        
        // Check meta-earth verification
        if (metaEarthResult.matched && metaEarthResult.verified) {
            level = 'verified';
            message = 'Verified in meta-earth repository';
            verified = true;
            badges.push('meta-earth-verified');
        } else if (metaEarthResult.matched && !metaEarthResult.verified) {
            level = 'listed';
            message = 'Listed in meta-earth repository (unverified)';
            badges.push('meta-earth-listed');
        }
        
        // Check mempool verification
        if (mempoolResult.found) {
            badges.push('mempool-verified');
            if (level === 'unknown') {
                level = 'partial';
                message = 'Found in mempool.space';
            } else {
                message += ' and mempool.space';
            }
        }
        
        // Check if contract is verified on block explorer
        if (tokenInfo.verified) {
            badges.push('explorer-verified');
            if (level === 'unknown') {
                level = 'partial';
                message = 'Verified on block explorer';
            }
        }
        
        // If no verification found
        if (level === 'unknown') {
            level = 'unverified';
            message = 'Not verified in any source';
        }
        
        return {
            verified: verified,
            level: level,
            message: message,
            badges: badges
        };
    }

    /**
     * Clear verification cache
     */
    clearCache() {
        this.verificationCache.clear();
        this.metaEarthAssets = null;
    }

    /**
     * Get verification statistics
     * @returns {Object} Statistics about cached verifications
     */
    getStatistics() {
        return {
            cacheSize: this.verificationCache.size,
            metaEarthLoaded: this.metaEarthAssets !== null,
            metaEarthAssetCount: this.metaEarthAssets?.assets?.length || 0
        };
    }
}

// Export for use in other files
window.AssetVerification = AssetVerification;
