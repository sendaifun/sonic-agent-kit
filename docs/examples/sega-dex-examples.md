# Sega DEX Integration Examples

This document provides examples of how to use the Sega DEX integration in the sonic-agent-kit.

## Setup

First, initialize the SonicAgentKit:

```typescript
import { SonicAgentKit } from 'sonic-agent-kit';

// Initialize the agent
const privateKey = 'your-private-key'; // Base58 encoded private key
const rpcUrl = 'https://api.mainnet.sonic.game'; // Or your preferred RPC endpoint
const agent = new SonicAgentKit(privateKey, rpcUrl, {});
```

## Token Price Lookup

Get the price of a token in USD:

```typescript
// SOL token address
const solMint = 'So11111111111111111111111111111111111111112';

// Get the price of SOL in USD
const solPrice = await agent.segaGetTokenPrice(solMint);
console.log(`SOL price: $${solPrice}`);
```

## Computing a Swap

Calculate a swap from SOL to USDC:

```typescript
// SOL token address
const solMint = 'So11111111111111111111111111111111111111112';
// USDC token address
const usdcMint = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

// Compute a swap of 1 SOL to USDC
const swapAmount = 1 * 1e9; // 1 SOL in lamports
const swapResult = await agent.segaComputeSwap(
  solMint, 
  usdcMint, 
  swapAmount, 
  'swap-base-in', 
  50, // 0.5% slippage
  'V0'
);

console.log(`Input: ${Number(swapResult.inputAmount) / 1e9} SOL`);
console.log(`Output: ${Number(swapResult.outputAmount) / 1e6} USDC`);
console.log(`Price impact: ${swapResult.priceImpactPct}%`);
```

## Using Smart Routing

Calculate a swap with smart routing for better rates:

```typescript
// SOL token address
const solMint = 'So11111111111111111111111111111111111111112';
// USDC token address
const usdcMint = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

// Compute a smart swap of 1 SOL to USDC
const swapAmount = 1 * 1e9; // 1 SOL in lamports
const swapResult = await agent.segaComputeSmartSwap(
  solMint, 
  usdcMint, 
  swapAmount
);

console.log(`Input: ${Number(swapResult.inputAmount) / 1e9} SOL`);
console.log(`Output: ${Number(swapResult.outputAmount) / 1e6} USDC`);
console.log(`Price impact: ${swapResult.priceImpactPct}%`);
```

## Generating a Swap Transaction

Generate and execute a swap transaction:

```typescript
// Compute the swap first
const swapResult = await agent.segaComputeSwap(
  'So11111111111111111111111111111111111111112', // SOL
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  1 * 1e9 // 1 SOL
);

// Generate the transaction
const transactions = await agent.segaSwapTransaction(
  swapResult,
  'V0', // Transaction version
  '1', // Compute unit price in micro lamports
  true, // Wrap SOL if needed
  true // Unwrap SOL if needed
);

// The transaction(s) can now be signed and sent to the network
// This is a simplified example - in a real application, you would:
// 1. Deserialize the transaction
// 2. Sign it with your wallet
// 3. Send it to the network
console.log(`Generated ${transactions.length} transaction(s)`);
```

## Pool Information

Get information about liquidity pools:

```typescript
// Get pools for SOL-USDC pair
const solMint = 'So11111111111111111111111111111111111111112';
const usdcMint = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

const poolsInfo = await agent.segaGetPoolInfoByMints(solMint, usdcMint);

console.log(`Found ${poolsInfo.count} pools`);
for (const pool of poolsInfo.data) {
  console.log(`Pool ID: ${pool.id}`);
  console.log(`TVL: $${pool.tvl}`);
  console.log(`24h Volume: $${pool.day.volume}`);
  console.log(`Fee APR: ${pool.day.feeApr}%`);
  console.log('---');
}
```

## Token List

Get the default token list:

```typescript
const tokenList = await agent.segaGetDefaultMintList();

console.log(`Found ${tokenList.mintList.length} tokens`);
console.log(`Whitelisted: ${tokenList.whiteList.length} tokens`);
console.log(`Blacklisted: ${tokenList.blackList.length} tokens`);

// Print the first 5 tokens
tokenList.mintList.slice(0, 5).forEach(token => {
  console.log(`${token.symbol}: ${token.name} (${token.address})`);
});
```

## Leaderboard

Get the Sega DEX leaderboard:

```typescript
const leaderboard = await agent.segaGetLeaderboard();

console.log('Top 5 users:');
leaderboard.rows.slice(0, 5).forEach((entry, index) => {
  console.log(`#${index + 1}: ${entry.wallet.slice(0, 6)}... - ${entry.points} points`);
});

if (leaderboard.me) {
  console.log(`Your rank: #${leaderboard.me.rank}`);
  console.log(`Your points: ${leaderboard.me.points}`);
}
```

## User Statistics

Get statistics for your wallet:

```typescript
// Get stats for the last 30 days
const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);
const now = Math.floor(Date.now() / 1000);

const stats = await agent.segaGetSonicStats(thirtyDaysAgo, now);

console.log(`LP Time-Weighted Volume: ${stats.lpTimeWeightedVolume}`);
console.log(`Total Swap Amount in USD: $${stats.totalSwapAmountInUSD}`);
console.log(`My Swap Amount in USD: $${stats.mySwapAmountInUSD}`);
```

## Testnet Faucet

Request tokens from the faucet (testnet/devnet only):

```typescript
// Only works on testnet/devnet
try {
  const result = await agent.segaFaucetRequest();
  console.log(`Faucet tokens sent to ${result.wallet}`);
} catch (error) {
  console.error('Faucet request failed:', error);
}
``` 