/**
 * Background Service Worker for ERC20 Token Inspector Extension
 * Handles extension lifecycle and badge updates
 */

// Set up badge with default state
chrome.runtime.onStartup.addListener(() => {
    chrome.action.setBadgeText({ text: '' });
    chrome.action.setBadgeBackgroundColor({ color: '#FFC107' });
});

chrome.runtime.onInstalled.addListener((details) => {
    // Set initial badge
    chrome.action.setBadgeText({ text: '' });
    chrome.action.setBadgeBackgroundColor({ color: '#FFC107' });
    
    if (details.reason === 'install') {
        console.log('ERC20 Token Inspector Extension installed');
        
        // Open welcome page or show notification
        chrome.tabs.create({
            url: chrome.runtime.getURL('popup.html')
        });
    } else if (details.reason === 'update') {
        console.log('ERC20 Token Inspector Extension updated to version', chrome.runtime.getManifest().version);
    }
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
    // This is handled by the popup, but we can add additional logic here if needed
    console.log('Extension icon clicked on tab:', tab.url);
});

// Handle messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case 'updateBadge':
            updateBadge(request.text, request.color);
            sendResponse({ success: true });
            break;
            
        case 'clearBadge':
            chrome.action.setBadgeText({ text: '' });
            sendResponse({ success: true });
            break;
            
        case 'getStorage':
            chrome.storage.local.get(request.keys, (result) => {
                sendResponse(result);
            });
            return true; // Keep message channel open for async response
            
        case 'setStorage':
            chrome.storage.local.set(request.data, () => {
                sendResponse({ success: true });
            });
            return true; // Keep message channel open for async response
            
        default:
            sendResponse({ error: 'Unknown action' });
    }
});

/**
 * Update extension badge
 * @param {string} text - Badge text
 * @param {string} color - Badge color
 */
function updateBadge(text, color = '#FFC107') {
    chrome.action.setBadgeText({ text: text || '' });
    chrome.action.setBadgeBackgroundColor({ color: color });
}

// Handle tab updates to potentially show relevant information
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        // Check if the tab contains Ethereum addresses
        if (isEthereumRelated(tab.url)) {
            // Could add logic here to detect contract addresses in the page
            // and update badge accordingly
        }
    }
});

/**
 * Check if URL is Ethereum-related
 * @param {string} url - URL to check
 * @returns {boolean} Is Ethereum-related
 */
function isEthereumRelated(url) {
    const ethereumPatterns = [
        'etherscan.io',
        'etherscan.com',
        'bscscan.com',
        'polygonscan.com',
        'arbiscan.io',
        'optimistic.etherscan.io',
        'snowtrace.io',
        'ftmscan.com',
        'cronoscan.com',
        'moonscan.io',
        'gnosisscan.io',
        'basescan.org',
        'lineascan.build',
        'scrollscan.com',
        'mantascan.xyz',
        'blastscan.io',
        'sepolia.etherscan.io',
        'goerli.etherscan.io',
        'sepolia.basescan.org',
        'testnet.bscscan.com',
        'mumbai.polygonscan.com',
        'testnet.arbiscan.io',
        'goerli-optimism.etherscan.io',
        'testnet.snowtrace.io',
        'testnet.ftmscan.com',
        'testnet.cronoscan.com',
        'testnet.moonscan.io',
        'sepolia.gnosisscan.io',
        'sepolia.basescan.org',
        'sepolia.lineascan.build',
        'sepolia.scrollscan.com',
        'sepolia.mantascan.xyz',
        'sepolia.blastscan.io'
    ];
    
    return ethereumPatterns.some(pattern => url.includes(pattern));
}

// Clean up old data periodically
chrome.alarms.create('cleanup', { delayInMinutes: 60, periodInMinutes: 60 * 24 }).catch(error => {
    console.log('Alarm creation failed:', error);
}); // Daily cleanup

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'cleanup') {
        cleanupOldData();
    }
});

/**
 * Clean up old stored data
 */
function cleanupOldData() {
    chrome.storage.local.get(['recentContracts', 'lastCleanup'], (result) => {
        const now = Date.now();
        const lastCleanup = result.lastCleanup || 0;
        const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
        
        // Only cleanup once per week
        if (now - lastCleanup > oneWeekAgo) {
            // Keep only last 5 recent contracts
            const recentContracts = result.recentContracts || [];
            if (recentContracts.length > 5) {
                chrome.storage.local.set({
                    recentContracts: recentContracts.slice(0, 5),
                    lastCleanup: now
                });
            } else {
                chrome.storage.local.set({ lastCleanup: now });
            }
        }
    });
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        updateBadge,
        isEthereumRelated,
        cleanupOldData
    };
}
