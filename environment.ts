export type Chains = {
  mainnet: string
  goerli: string
}

interface Environment {
  gatewayUrl: string
  l1ExplorerUrl: Chains
  l2ExplorerUrl: Chains
  kakarotContract: string
  etherscanAPI: Chains
  etherscanAPIKey: string | undefined
}

const etherscanAPIKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY
const devnet: Environment = {
  kakarotContract: '',
  l1ExplorerUrl: {
    mainnet: 'https://etherscan.io',
    goerli: 'https://goerli.etherscan.io',
  },
  l2ExplorerUrl: {
    mainnet: 'https://starkscan.co',
    goerli: 'https://testnet.starkscan.co',
  },
  gatewayUrl: 'http://localhost:5000/',
  etherscanAPI: {
    mainnet: 'https://api.etherscan.io/api',
    goerli: 'https://api-goerli.etherscan.io/api',
  },
  etherscanAPIKey,
}

const testnet: Environment = {
  kakarotContract:
    '0x031ddf73d0285cc2f08bd4a2c93229f595f2f6e64b25846fc0957a2faa7ef7bb',
  l1ExplorerUrl: {
    mainnet: 'https://etherscan.io',
    goerli: 'https://goerli.etherscan.io',
  },
  l2ExplorerUrl: {
    mainnet: 'https://starkscan.co',
    goerli: 'https://testnet.starkscan.co',
  },
  gatewayUrl: '',
  etherscanAPI: {
    mainnet: 'https://api.etherscan.io/api',
    goerli: 'https://api-goerli.etherscan.io/api',
  },
  etherscanAPIKey,
}

const mainnet: Environment = {
  kakarotContract: '',
  l1ExplorerUrl: {
    mainnet: 'https://etherscan.io',
    goerli: 'https://goerli.etherscan.io',
  },
  l2ExplorerUrl: {
    mainnet: 'https://starkscan.co',
    goerli: 'https://testnet.starkscan.co',
  },
  gatewayUrl: '',
  etherscanAPI: {
    mainnet: 'https://api.etherscan.io/api',
    goerli: 'https://api-goerli.etherscan.io/api',
  },
  etherscanAPIKey,
}

// eslint-disable-next-line import/no-mutable-exports
let environment: Environment

switch (process.env.NEXT_PUBLIC_NETWORK_ENV) {
  case 'mainnet':
    environment = mainnet
    break
  case 'testnet':
    environment = testnet
    break
  case 'devnet':
    environment = devnet
    break
  default:
    environment = devnet
    break
}

export default environment
