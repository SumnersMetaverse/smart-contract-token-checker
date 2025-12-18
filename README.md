# 🔍 Advanced Token Inspector

A comprehensive Chrome extension for inspecting ERC20 token contracts across multiple blockchain networks. Get complete token information including market data, holders analysis, and contract details with a beautiful, modern interface.

## ✨ Features

- **🌐 Multi-Chain Support**: Ethereum, Polygon, BSC (Binance Smart Chain)
- **📊 Complete Token Analysis**: Name, symbol, decimals, total supply, and more
- **💰 Market Information**: Real-time price, market cap, and 24h change
- **👥 Holders Analysis**: Holders count, transfers count, and top 5 holders
- **🔗 Contract Details**: Owner, deployed block, verification status
- **📦 Batch Verification**: Check multiple contracts at once
- **💾 Save Contracts**: Manage and organize your contract addresses
- **📤 Export Results**: Download batch verification results as CSV
- **🎨 Modern UI**: Beautiful dark theme with golden accents
- **⚡ Fast & Reliable**: Multiple RPC providers with automatic failover
- **🔒 Privacy-First**: 100% client-side, no data collection
- **🌍 Explorer Integration**: Direct links to Etherscan, Polygonscan, BSCScan

## 🚀 Installation

### From Chrome Web Store
1. Visit the [Chrome Web Store listing](https://chrome.google.com/webstore/detail/advanced-token-inspector/...)
2. Click "Add to Chrome"
3. Pin the extension to your toolbar for easy access

### Manual Installation (Developer Mode)
1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The extension will appear in your extensions list

## 📖 How to Use

### Single Contract Verification
1. **Select Network**: Choose from Ethereum, Polygon, or BSC
2. **Enter Contract Address**: Input the token contract address (0x...)
3. **Click "Check Token"**: Retrieve comprehensive token information
4. **View Results**:
   - **Token Header**: Name, symbol, and current price
   - **Basic Info**: Decimals, total supply, contract address, network
   - **Market Data**: Price, market cap, 24h change
   - **Contract Info**: Owner, deployed block, verification status
   - **Holders Data**: Holders count, transfers count, top 5 holders
5. **Save Contract**: Click the save button (💾) to add to your saved contracts
6. **Quick Actions**: Copy address, open in explorer

### Batch Verification
1. **Switch to "Batch Check" Tab**: Click on the "Batch Check" tab
2. **Enter Multiple Addresses**: Input contract addresses, one per line
3. **Click "Check All Tokens"**: Verify all contracts at once
4. **View Results Table**: See status, name, symbol, and more for each contract
5. **Export Results**: Download results as CSV for further analysis
6. **Save Individual Contracts**: Click "Save" on any successful verification

### My Contracts
1. **Switch to "My Contracts" Tab**: Click on the "My Contracts" tab
2. **View Saved Contracts**: See all your saved contract addresses
3. **Add New Contract**: Enter address and optional label, click "Add Contract"
4. **Verify Individual**: Click "Verify" on any contract to check it
5. **Verify All**: Click "Verify All" to batch verify all saved contracts
6. **Remove Contract**: Click "Remove" to delete a saved contract

## 🔧 Supported Networks

### Ethereum
- **RPC**: Cloudflare, PublicNode, Ankr, LlamaRPC
- **Explorer**: Etherscan.io
- **Chain ID**: 1

### Polygon
- **RPC**: Polygon RPC
- **Explorer**: Polygonscan.com
- **Chain ID**: 137

### BSC (Binance Smart Chain)
- **RPC**: BSC DataSeed
- **Explorer**: BSCScan.com
- **Chain ID**: 56

## 📊 Information Displayed

### Basic Token Information
- **Name**: Full token name (e.g., "Tether USD")
- **Symbol**: Token symbol (e.g., "USDT")
- **Decimals**: Number of decimal places (e.g., 6)
- **Total Supply**: Total token supply with formatting
- **Contract Address**: Full contract address with copy button
- **Network**: Current blockchain network

### Market Information
- **Price (USD)**: Current token price in USD
- **Market Cap**: Total market capitalization
- **24h Change**: Price change percentage

### Contract Information
- **Owner/Creator**: Contract owner address
- **Deployed Block**: Block number when contract was deployed
- **Verified**: Contract verification status
- **Status**: Active or paused status

### Holders Information
- **Holders Count**: Total number of token holders
- **Transfers Count**: Total number of transfers
- **Top 5 Holders**: Addresses and percentage ownership

## 🛠️ Technical Details

### ERC20 Standard Functions
- `name()` - Token name
- `symbol()` - Token symbol
- `decimals()` - Number of decimals
- `totalSupply()` - Total token supply
- `balanceOf(address)` - Balance of specific address
- `transfer(address, uint256)` - Transfer tokens
- `approve(address, uint256)` - Approve spending
- `allowance(address, address)` - Check allowance

### Additional Functions
- `owner()` - Contract owner
- `admin()` - Contract admin
- `cap()` - Maximum supply cap
- `paused()` - Pause status
- `tokenURI()` - Token metadata URI
- `baseURI()` - Base URI for metadata

### Alternative Function Names
The extension tries multiple function selectors to ensure compatibility:
- **Name**: `name()`, `tokenName()`, `NAME()`, `_name()`
- **Symbol**: `symbol()`, `tokenSymbol()`, `SYMBOL()`, `_symbol()`

## 🔒 Privacy & Security

- **100% Client-Side**: All operations performed in your browser
- **No Data Collection**: No personal information is stored or transmitted
- **No API Keys**: Uses only public RPC endpoints
- **Local Storage**: Recent contracts stored locally on your device
- **Secure**: No external servers or tracking

## 🚀 Performance

- **Fast Loading**: Optimized for quick token inspection
- **Multiple RPC Providers**: Automatic failover for reliability
- **Caching**: Recent contracts cached for faster access
- **Efficient**: Minimal resource usage

## 📱 User Interface

### Design Features
- **Dark Theme**: Easy on the eyes with golden accents
- **Responsive**: Works on all screen sizes
- **Modern**: Clean, professional interface
- **Accessible**: Clear typography and contrast

### Color Scheme
- **Primary**: Golden (#ffd700)
- **Secondary**: Orange (#ff6b35)
- **Background**: Dark (#1a1a1a)
- **Text**: White/light gray for readability

## 🔧 Development

### Project Structure
```
smart-contract-token-checker/
├── popup.html          # Main UI
├── popup.js           # UI logic
├── popup.css          # Styles
├── background.js      # Background script
├── manifest.json      # Extension manifest
├── lib/
│   └── rpc.js         # RPC communication
└── icons/             # Extension icons
```

### Building
1. Clone the repository
2. No build process required - pure HTML/CSS/JS
3. Load as unpacked extension in Chrome

## 📝 Version History

### [3.1.0] - Batch Verification & Contract Management
- **Added**: Batch contract verification - check multiple contracts at once
- **Added**: "My Contracts" feature - save and manage your contract addresses
- **Added**: CSV export for batch verification results
- **Added**: Three-tab interface (Single Check, Batch Check, My Contracts)
- **Added**: Save button for individual contracts
- **Added**: Verify All button for saved contracts
- **Enhanced**: Improved workflow for managing multiple contracts
- **Improved**: Better organization and accessibility of contract data

### [3.0.0] - Complete Redesign
- **Added**: Multi-chain support (Ethereum, Polygon, BSC)
- **Added**: Market information (price, market cap, 24h change)
- **Added**: Holders analysis (count, transfers, top holders)
- **Added**: Contract details (owner, deployed block, verification)
- **Added**: Explorer integration (Etherscan, Polygonscan, BSCScan)
- **Redesigned**: Complete UI overhaul with dark theme
- **Enhanced**: Better error handling and user feedback
- **Improved**: Performance and reliability

### [2.0.0] - Enhanced Features
- **Added**: Additional contract information extraction
- **Added**: Multiple RPC provider support
- **Added**: Improved error handling
- **Added**: Enhanced UI with additional info display
- **Added**: Better compatibility with non-standard tokens

### [1.0.0] - Initial Release
- **Added**: Basic ERC20 token inspection
- **Added**: Name, symbol, decimals, total supply extraction
- **Added**: Simple UI with copy functionality
- **Added**: Recent contracts storage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: Report bugs or request features on GitHub
- **Documentation**: Check this README for usage instructions
- **Community**: Join discussions in GitHub Discussions

## 🙏 Acknowledgments

- **Ethereum Community**: For the ERC20 standard
- **RPC Providers**: For free public endpoints
- **CoinGecko**: For price data API
- **Block Explorers**: For contract verification data

---

**Made with ❤️ for the crypto community**