# Testing Guide for Wallet Integration and Token Sending

This document provides a comprehensive testing guide for the new wallet integration and token sending features.

## Prerequisites

Before testing, ensure you have:

1. **Chrome Browser**: Latest version of Chrome or Chromium-based browser
2. **MetaMask Extension**: Installed and configured
3. **Test Wallet**: A wallet with small amounts of test tokens (DO NOT use your main wallet)
4. **Test Tokens**: Some ERC20 tokens on test networks (Goerli, Mumbai, etc.) OR small amounts on mainnet

## Safety First! ⚠️

**IMPORTANT TESTING GUIDELINES:**
- Always test on test networks (Goerli, Mumbai, BSC Testnet) first
- Use a separate test wallet, NOT your main wallet
- Only send very small amounts when testing on mainnet
- Double-check all addresses before confirming transactions
- Never share your private keys or seed phrases

## Test Networks

For safe testing, use these test networks:

### Goerli Testnet (Ethereum)
- Network Name: Goerli
- Chain ID: 5
- RPC URL: https://goerli.infura.io/v3/YOUR_KEY
- Explorer: https://goerli.etherscan.io

### Mumbai Testnet (Polygon)
- Network Name: Mumbai
- Chain ID: 80001
- RPC URL: https://rpc-mumbai.maticvigil.com
- Explorer: https://mumbai.polygonscan.com

### BSC Testnet
- Network Name: BSC Testnet
- Chain ID: 97
- RPC URL: https://data-seed-prebsc-1-s1.binance.org:8545
- Explorer: https://testnet.bscscan.com

## Testing Checklist

### 1. Extension Installation

- [ ] Load extension in Chrome (chrome://extensions/)
- [ ] Enable Developer Mode
- [ ] Click "Load unpacked" and select extension folder
- [ ] Verify extension icon appears in toolbar
- [ ] Verify no console errors in background page

### 2. Basic Functionality (Without Wallet)

- [ ] Open extension popup
- [ ] Verify UI loads correctly
- [ ] Wallet connect button shows "🔌 Connect"
- [ ] Select different networks (Ethereum, Polygon, BSC)
- [ ] Enter a valid token contract address
- [ ] Click "Check Token"
- [ ] Verify token information displays correctly
- [ ] Send token button is NOT visible (wallet not connected)

### 3. Wallet Connection

#### 3.1 Initial Connection
- [ ] Click "Connect" button
- [ ] MetaMask popup appears
- [ ] Select account and click "Connect"
- [ ] Wallet button changes to "🔗 0x1234...5678"
- [ ] Button color changes to green
- [ ] Console shows connection success

#### 3.2 Account Switching
- [ ] Switch accounts in MetaMask
- [ ] Extension detects account change
- [ ] Wallet button updates with new address
- [ ] No errors in console

#### 3.3 Network Switching
- [ ] Switch network in MetaMask
- [ ] Extension detects network change
- [ ] Network selector updates (if applicable)
- [ ] No errors in console

#### 3.4 Disconnection
- [ ] Click wallet button when connected
- [ ] Wallet disconnects
- [ ] Button returns to "🔌 Connect" state
- [ ] Send token button disappears if visible

### 4. Token Inspection (With Wallet)

- [ ] Connect wallet
- [ ] Enter a token address you own
- [ ] Click "Check Token"
- [ ] Token information displays correctly
- [ ] Send token button (💸) appears
- [ ] Your balance is accessible

### 5. Send Token Modal

#### 5.1 Opening Modal
- [ ] Click send token button
- [ ] Modal appears with animation
- [ ] Token symbol and address display correctly
- [ ] Your balance loads and displays
- [ ] All form fields are empty
- [ ] Estimated fee shows "Estimating..."

#### 5.2 Form Validation
- [ ] Enter invalid recipient address
- [ ] Input field turns red
- [ ] Enter valid recipient address
- [ ] Input field turns green
- [ ] Enter negative amount
- [ ] Input field turns red
- [ ] Enter zero amount
- [ ] Input field turns red
- [ ] Enter valid amount
- [ ] Input field turns green

#### 5.3 MAX Button
- [ ] Click MAX button
- [ ] Amount field fills with your full balance
- [ ] Amount is properly formatted
- [ ] Validation succeeds

#### 5.4 Gas Estimation
- [ ] Enter valid recipient and amount
- [ ] Wait a moment
- [ ] Estimated fee updates from "Estimating..."
- [ ] Fee shows in ETH/MATIC/BNB
- [ ] Fee is reasonable (not 0, not too high)

#### 5.5 Self-Transfer Prevention
- [ ] Enter your own wallet address as recipient
- [ ] Enter valid amount
- [ ] Click "Send Tokens"
- [ ] Error message: "Cannot send tokens to your own address"
- [ ] Transaction does NOT proceed

#### 5.6 Closing Modal
- [ ] Click X button
- [ ] Modal closes
- [ ] Click Cancel button
- [ ] Modal closes
- [ ] Click outside modal (if implemented)
- [ ] Modal closes

### 6. Token Sending

#### 6.1 Successful Transfer (Test Network)
- [ ] Open send token modal
- [ ] Enter valid recipient address (different from yours)
- [ ] Enter small amount (e.g., 0.001 tokens)
- [ ] Review estimated fee
- [ ] Click "Send Tokens"
- [ ] MetaMask popup appears
- [ ] Transaction details are correct
- [ ] Click "Confirm" in MetaMask
- [ ] Success message appears in extension
- [ ] Modal closes
- [ ] Transaction hash is shown briefly

#### 6.2 Transaction Rejection
- [ ] Open send token modal
- [ ] Enter valid details
- [ ] Click "Send Tokens"
- [ ] Click "Reject" in MetaMask
- [ ] Error message appears
- [ ] Modal remains open
- [ ] Can retry or cancel

#### 6.3 Insufficient Balance
- [ ] Open send token modal
- [ ] Enter amount greater than your balance
- [ ] Click "Send Tokens"
- [ ] MetaMask shows error or insufficient balance
- [ ] Transaction fails gracefully
- [ ] Clear error message in extension

#### 6.4 Network Issues
- [ ] Disconnect internet
- [ ] Try to send tokens
- [ ] Error message appears
- [ ] No console errors crash the app
- [ ] Reconnect internet
- [ ] Can retry successfully

### 7. Transaction History

#### 7.1 Viewing History
- [ ] After sending a transaction
- [ ] View transaction list (if accessible)
- [ ] Transaction appears with "pending" status
- [ ] All transaction details are correct:
  - [ ] Token symbol
  - [ ] Amount
  - [ ] Recipient address
  - [ ] Timestamp
  - [ ] Transaction hash

#### 7.2 Transaction Status Updates
- [ ] Wait for transaction to confirm
- [ ] Status updates to "success"
- [ ] Green indicator appears
- [ ] Click transaction hash
- [ ] Block explorer opens in new tab
- [ ] Transaction is visible on explorer

#### 7.3 Failed Transactions
- [ ] Create a transaction that will fail (insufficient gas, etc.)
- [ ] Transaction status updates to "failed"
- [ ] Red indicator appears
- [ ] Transaction details are still visible

#### 7.4 Clearing History
- [ ] Click "Clear History" button
- [ ] Confirmation dialog appears (custom modal)
- [ ] Click "Cancel"
- [ ] History remains
- [ ] Click "Clear History" again
- [ ] Click "Confirm"
- [ ] All transactions are removed
- [ ] "No transactions yet" message appears

### 8. Error Handling

#### 8.1 No MetaMask Installed
- [ ] Test in browser without MetaMask
- [ ] Click "Connect"
- [ ] Error message: "No Web3 provider found"
- [ ] User-friendly guidance provided

#### 8.2 MetaMask Locked
- [ ] Lock MetaMask
- [ ] Try to connect
- [ ] MetaMask prompts to unlock
- [ ] After unlock, connection succeeds

#### 8.3 Wrong Network
- [ ] Connect on Ethereum network
- [ ] Try to send Polygon token
- [ ] Extension prompts to switch network
- [ ] Network switch dialog appears in MetaMask
- [ ] After switching, can proceed

#### 8.4 Invalid Token Contract
- [ ] Enter invalid contract address
- [ ] Try to send tokens
- [ ] Appropriate error message
- [ ] No crashes

### 9. UI/UX Testing

#### 9.1 Visual Design
- [ ] All buttons are styled correctly
- [ ] Wallet button has proper gradient colors
- [ ] Modal has proper shadows and animations
- [ ] Form fields have clear labels
- [ ] Icons are clear and appropriate
- [ ] Colors match extension theme

#### 9.2 Responsive Design
- [ ] Resize browser window
- [ ] Modal remains centered
- [ ] Text doesn't overflow
- [ ] Buttons remain accessible
- [ ] Scrolling works in modal body

#### 9.3 Animations
- [ ] Modal opens with slide-up animation
- [ ] Modal closes smoothly
- [ ] Loading states are clear
- [ ] Button hover effects work
- [ ] Transitions are smooth

#### 9.4 Dark Mode
- [ ] Toggle dark mode
- [ ] Wallet button colors adapt
- [ ] Modal colors adapt
- [ ] Form fields are readable
- [ ] All text has good contrast

### 10. Performance Testing

#### 10.1 Load Time
- [ ] Extension popup opens quickly
- [ ] Wallet connection is fast
- [ ] Token inspection is responsive
- [ ] Modal opens without delay

#### 10.2 Gas Estimation Speed
- [ ] Gas estimation completes in < 3 seconds
- [ ] Multiple estimations don't slow down UI
- [ ] No memory leaks over time

#### 10.3 Transaction Tracking
- [ ] Can track multiple pending transactions
- [ ] History loads quickly
- [ ] No performance issues with 100+ transactions

### 11. Storage Testing

#### 11.1 Transaction Persistence
- [ ] Send a transaction
- [ ] Close extension
- [ ] Reopen extension
- [ ] Transaction history persists
- [ ] All details are intact

#### 11.2 Storage Limits
- [ ] Add 100+ transactions to history
- [ ] Verify only last 100 are kept
- [ ] Older transactions are removed
- [ ] No errors occur

#### 11.3 Data Privacy
- [ ] Check Chrome storage
- [ ] Verify no private keys stored
- [ ] Verify no sensitive data stored
- [ ] Only public transaction data stored

### 12. Integration Testing

#### 12.1 Token Inspection + Sending
- [ ] Inspect a token
- [ ] Connect wallet
- [ ] Send button appears
- [ ] Send transaction
- [ ] Return to inspection
- [ ] Can inspect another token
- [ ] Can send that token too

#### 12.2 Network Switching + Sending
- [ ] Start on Ethereum
- [ ] Inspect Ethereum token
- [ ] Switch to Polygon in extension
- [ ] MetaMask prompts network switch
- [ ] After switching, can inspect Polygon token
- [ ] Can send Polygon token

#### 12.3 Multiple Tokens
- [ ] Inspect token A
- [ ] Send token A
- [ ] Inspect token B (without closing)
- [ ] Send button updates for token B
- [ ] Send token B
- [ ] Both transactions in history

## Test Scenarios

### Scenario 1: First-Time User
1. Install extension
2. Connect MetaMask
3. Inspect a token
4. Send a small amount to friend
5. View transaction in history
6. Click hash to see on explorer

### Scenario 2: Advanced User
1. Connect wallet
2. Switch between multiple networks
3. Inspect multiple tokens
4. Send tokens on different networks
5. View comprehensive transaction history
6. Clear history

### Scenario 3: Error Recovery
1. Start sending tokens
2. Reject transaction
3. Try again and confirm
4. Disconnect internet
5. Try to send (should fail gracefully)
6. Reconnect and retry
7. Success

## Bug Reporting

When reporting bugs, include:
- Chrome version
- MetaMask version
- Network being used
- Steps to reproduce
- Expected behavior
- Actual behavior
- Console errors (if any)
- Screenshots (if applicable)

## Test Results Template

```markdown
## Test Session: [Date]

### Environment
- Browser: Chrome [version]
- MetaMask: [version]
- Network: [Ethereum/Polygon/BSC]
- Test/Mainnet: [specify]

### Test Results
- Total Tests: X
- Passed: X
- Failed: X
- Blocked: X

### Failed Tests
1. [Test name]
   - Expected: [...]
   - Actual: [...]
   - Error: [...]

### Notes
[Any additional observations]
```

## Continuous Testing

Recommended testing frequency:
- After each code change: Run basic functionality tests
- Before each release: Run full test suite
- Weekly: Run security and performance tests
- Monthly: Test on different browsers and versions

## Automated Testing (Future)

Consider implementing:
- Unit tests for wallet connector
- Unit tests for contract interactions
- Integration tests for transaction flow
- E2E tests with test networks
- Automated security scans

## Conclusion

This testing guide ensures comprehensive coverage of all wallet integration and token sending features. Always prioritize safety and test thoroughly before using real funds.

For questions or issues, refer to the WALLET_INTEGRATION.md documentation.
