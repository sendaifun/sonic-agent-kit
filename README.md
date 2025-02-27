<div align="center">

# Sonic Agent Kit

![Sonic Agent Kit Cover 1 (3)](https://i.imgur.com/Y9Ph6wE.png)

![NPM Downloads](https://img.shields.io/npm/dm/@sendaifun/sonic-agent-kit?style=for-the-badge)
![GitHub forks](https://img.shields.io/github/forks/sendaifun/sonic-agent-kit?style=for-the-badge)
![GitHub License](https://img.shields.io/github/license/sendaifun/sonic-agent-kit?style=for-the-badge)

</div>

An open-source toolkit for connecting AI agents to Sonic protocols. Now, any agent, using any model can autonomously perform Sonic actions:

- Launch new tokens
- Mint NFTs
- Create images
- Deploy collections
- Get wallet address
- Get token balances
- Transfer assets
- And more...

Anyone - whether an SF-based AI researcher or a crypto-native builder - can bring their AI agents trained with any model and seamlessly integrate with Sonic.

## 🔧 Core Blockchain Features

- **Token Operations**
  - Deploy SPL tokens by Metaplex
  - Transfer assets
  - Balance checks

- **NFT Management via Metaplex**
  - Collection deployment
  - NFT minting
  - Metadata management
  - Royalty configuration

## 🤖 AI Integration Features

- **LangChain Integration**
  - Ready-to-use LangChain tools for blockchain operations
  - Autonomous agent support with React framework
  - Memory management for persistent interactions
  - Streaming responses for real-time feedback

- **Vercel AI SDK Integration**
  - Vercel AI SDK for AI agent integration
  - Framework agnostic support
  - Quick and easy toolkit setup

- **Autonomous Modes**
  - Interactive chat mode for guided operations
  - Autonomous mode for independent agent actions
  - Configurable action intervals
  - Built-in error handling and recovery

- **AI Tools**
  - DALL-E integration for NFT artwork generation
  - Natural language processing for blockchain commands

## 📦 Installation

```bash
npm install @sendaifun/sonic-agent-kit
```

## Quick Start

```typescript
import { SonicAgentKit, createSonicTools } from "@sendaifun/sonic-agent-kit";

// Initialize with private key and optional RPC URL
const agent = new SonicAgentKit(
  "your-wallet-private-key-as-base58",
  "https://api.testnet.sonic.game",
  "your-openai-api-key"
);

// Create LangChain tools
const tools = createSonicTools(agent);
```

## Usage Examples

### Deploy a New Token

```typescript
const result = await agent.deployToken(
  "my ai token", // name
  "uri", // uri
  "token", // symbol
  9, // decimals
  1000000 // initial supply
);

console.log("Token Mint Address:", result.mint.toString());
```

### Create NFT Collection

```typescript
const collection = await agent.deployCollection({
  name: "My NFT Collection",
  uri: "https://arweave.net/metadata.json",
  royaltyBasisPoints: 500, // 5%
  creators: [
    {
      address: "creator-wallet-address",
      percentage: 100,
    },
  ],
});
```

### Close Empty Token Accounts

``` typescript

const { signature } = await agent.closeEmptyTokenAccounts();
```

## Dependencies

The toolkit relies on several key Solana and Metaplex libraries:

- @solana/web3.js
- @solana/spl-token
- @metaplex-foundation/digital-asset-standard-api
- @metaplex-foundation/mpl-token-metadata
- @metaplex-foundation/mpl-core
- @metaplex-foundation/umi

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
Refer to [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines on how to contribute to this project.

## Contributors

<a href="https://github.com/sendaifun/sonic-agent-kit/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=sendaifun/sonic-agent-kit" />
</a>

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=sendaifun/sonic-agent-kit&type=Date)](https://star-history.com/#sendaifun/sonic-agent-kit&Date)

## License

Apache-2 License

## Security

This toolkit handles private keys and transactions. Always ensure you're using it in a secure environment and never share your private keys.
