
import 'dotenv/config'

import {
  createPublicClient,
  createWalletClient,
  formatEther,
  http,
  parseEther,
} from 'viem'

import { sepolia } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'

async function main() {
  const rpcUrl = process.env.RPC_URL
  const privateKey = process.env.PRIVATE_KEY
  const to = process.env.TO_ADDRESS as `0x${string}` | undefined

  if (!rpcUrl || !privateKey || !to) {
    console.error('RPC_URL, PRIVATE_KEY or TO_ADDRESS is missing in .env')
    process.exit(1)
  }

  if (!privateKey.startsWith('0x')) {
    console.error('PRIVATE_KEY must start with 0x')
    process.exit(1)
  }

  // Create public client
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(rpcUrl),
  })

  // Verify network
  const chainId = await publicClient.getChainId()
  console.log('Connected Chain ID:', chainId)

  if (chainId !== 11155111) {
    console.error('Wrong network! Sepolia is required.')
    process.exit(1)
  }

  // Create account from private key
  const account = privateKeyToAccount(
    privateKey as `0x${string}`,
  )

  // Create wallet client
  const walletClient = createWalletClient({
    account,
    chain: sepolia,
    transport: http(rpcUrl),
  })

  // Check wallet balance
  const balance = await publicClient.getBalance({
    address: account.address,
  })

  console.log('Wallet Address:', account.address)
  console.log('Wallet Balance:', formatEther(balance), 'ETH')

  // Send 0.001 Sepolia ETH
  const hash = await walletClient.sendTransaction({
    to,
    value: parseEther('0.001'),
  })

  console.log('Transaction Hash:', hash)

  // Wait for transaction confirmation
  const receipt = await publicClient.waitForTransactionReceipt({
    hash,
  })

  console.log('Transaction Status:', receipt.status)

  // Calculate transaction fee
  const fee = receipt.gasUsed * receipt.effectiveGasPrice

  console.log('Transaction Fee:', formatEther(fee), 'ETH')

  console.log(
    'Etherscan Link:',
    `https://sepolia.etherscan.io/tx/${hash}`,
  )
}

main().catch((error) => {
  console.error('Error:', error)
  process.exit(1)
})
