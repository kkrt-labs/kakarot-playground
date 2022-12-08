import { ethers } from 'ethers'

import environment from '../environment'

// const { etherscanAPIKey } = environment;

export function fetchABI(
  contractAddress: string,
  chain: string,
): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const apiEndpoint = environment.etherscanAPI[chain]
  return fetch(
    `${apiEndpoint}?module=contract&action=getabi&address=${contractAddress}`,
  )
    .then((response) => response.json())
    .then((data) => data.result)
}

export function fetchBytecode(
  contractAddress: string,
  chain: string,
): Promise<string> {
  return ethers.getDefaultProvider(chain).getCode(contractAddress)
}
