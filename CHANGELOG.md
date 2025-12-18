# Changelog

All notable changes to the Advanced Token Inspector extension will be documented in this file.

## [3.1.0] - 2024-12-XX

### Added - Wallet Integration & Token Sending
- **Wallet Connection**: MetaMask integration for Web3 wallet connection
- **Token Sending**: Send ERC20 tokens directly from the extension interface
- **Transaction History**: Complete transaction tracking and history management
- **Balance Checking**: Real-time balance checking for connected wallet addresses
- **Gas Estimation**: Automatic gas estimation for token transfer transactions
- **Transaction Status Monitoring**: Track pending, successful, and failed transactions
- **Send Token Modal**: Beautiful modal interface for sending tokens with validation
- **Transaction History Modal**: View and manage all past token transfers
- **Wallet Status Indicator**: Visual indicator in header showing connection status
- **Network Synchronization**: Automatic detection and switching of wallet network
- **MAX Button**: Quick button to send entire token balance
- **Transaction Confirmation**: Wait for transaction confirmations in background

### Enhanced - Security & Validation
- **Address Validation**: Comprehensive validation of recipient addresses before sending
- **Amount Validation**: Ensures amounts are positive and properly formatted
- **Transaction Safety**: All transactions require explicit MetaMask confirmation
- **Error Handling**: User-friendly error messages for all transaction failures
- **Input Validation**: Real-time validation feedback for form inputs

### Technical Improvements
- **WalletConnector Class**: Complete wallet management system (`lib/wallet.js`)
- **TokenContract Class**: ERC20 contract interaction layer (`lib/contracts.js`)
- **TransactionManager Class**: Transaction history and tracking system
- **Background Script Enhancement**: Transaction storage and retrieval handlers
- **Event Listeners**: Wallet account and network change detection
- **Gas Calculation**: Accurate transaction fee estimation
- **Balance Queries**: Token balance checking via contract calls
- **Transaction Encoding**: Proper encoding of ERC20 transfer function calls

### UI/UX Improvements
- **Wallet Connect Button**: Prominent header button with connection status
- **Send Token Button**: Easy access button for sending tokens (💸 icon)
- **Modal Dialogs**: Professional modal interfaces for sending and history
- **Loading States**: Clear feedback during transaction processing
- **Success/Error Messages**: Clear visual feedback for all operations
- **Formatted Addresses**: Shortened address display (0x1234...5678)
- **Transaction List**: Clean, organized transaction history display
- **Responsive Design**: Modal dialogs work well on all screen sizes

### Compatibility
- **MetaMask Support**: Full integration with MetaMask browser extension
- **Multi-Network**: Works with Ethereum, Polygon, and BSC networks
- **ERC20 Standard**: Complete support for standard ERC20 token transfers
- **Chrome Extension**: Maintains Manifest V3 compliance

### Security Features
- **No Private Key Storage**: Never stores or requests private keys
- **Local Transaction History**: All history stored locally on user's device
- **Permission Management**: Proper Chrome extension permissions
- **Transaction Validation**: All transactions validated before submission

## [3.0.0] - 2024-01-XX

### Added
- **Multi-Chain Support**: Full support for Ethereum, Polygon, and BSC networks
- **Market Information**: Real-time price data, market cap, and 24h change percentage
- **Holders Analysis**: Complete holders count, transfers count, and top 5 holders display
- **Contract Details**: Owner address, deployed block number, and verification status
- **Explorer Integration**: Direct links to Etherscan, Polygonscan, and BSCScan
- **Network Selector**: Easy switching between supported blockchain networks
- **Price API Integration**: CoinGecko API for real-time market data
- **Enhanced UI**: Complete redesign with dark theme and golden accents
- **Token Header Card**: Beautiful token display with icon, name, symbol, and price
- **Action Buttons**: Quick copy address and open explorer functionality
- **Information Sections**: Organized display of basic, market, contract, and holders info
- **Top Holders Display**: Visual representation of top 5 token holders
- **Market Cap Calculation**: Automatic calculation based on price and supply

### Enhanced
- **UI/UX**: Complete visual overhaul with modern design
- **Performance**: Optimized for faster loading and better responsiveness
- **Error Handling**: Improved error messages and user feedback
- **Network Management**: Better RPC provider management per network
- **Data Display**: More organized and comprehensive information presentation
- **Accessibility**: Better contrast and readability

### Technical Improvements
- **Multi-Network RPC**: Separate RPC configurations for each supported network
- **API Integration**: CoinGecko API for market data
- **Modular Design**: Better separation of concerns in code structure
- **Enhanced Styling**: CSS variables and modern styling approach
- **Responsive Design**: Better mobile and desktop compatibility

### Compatibility
- **Chrome Extension Manifest V3**: Full compatibility with latest Chrome standards
- **Multiple Networks**: Support for major blockchain networks
- **Cross-Platform**: Works on all Chrome-supported platforms

## [2.0.0] - 2024-01-XX

### Added
- **Additional Contract Information**: Owner, admin, max supply, and contract status
- **Multiple RPC Providers**: Automatic failover for better reliability
- **Enhanced Error Handling**: Better error detection and user-friendly messages
- **Alternative Function Names**: Support for non-standard token implementations
- **Recent Contracts**: Quick access to previously inspected tokens
- **Improved UI**: Additional information display with better organization

### Enhanced
- **Token Name Extraction**: Multiple fallback methods for better compatibility
- **Token Symbol Extraction**: Alternative function selectors for non-standard tokens
- **RPC Communication**: More robust error handling and retry mechanisms
- **User Experience**: Better visual feedback and loading states

### Technical Improvements
- **Extended Selectors**: Support for common non-ERC20 functions
- **Address Decoding**: Proper hex-to-address conversion
- **Boolean Decoding**: Support for boolean contract functions
- **Parallel Processing**: Concurrent data fetching for better performance

## [1.0.0] - 2024-01-XX

### Added
- **Basic ERC20 Inspection**: Name, symbol, decimals, and total supply extraction
- **Simple UI**: Clean interface with copy functionality
- **Address Validation**: Basic Ethereum address format validation
- **Error Handling**: Basic error detection and user feedback
- **Recent Contracts**: Local storage for previously inspected tokens
- **Dark Mode**: Toggle between light and dark themes

### Technical Details
- **Client-Side Processing**: All operations performed in the browser
- **RPC Communication**: Direct communication with Ethereum nodes
- **Hex Decoding**: Conversion of RPC responses to human-readable format
- **Local Storage**: Browser-based storage for recent contracts