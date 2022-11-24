import React, { PropsWithChildren, useEffect, useState } from 'react'

import { getStarknet } from 'get-starknet'
import { Contract, Provider } from 'starknet'
import { BigNumberish } from 'starknet/dist/utils/number'
import { uint256ToBN } from 'starknet/dist/utils/uint256'
import { IExecutionState } from 'types'

export const starknetSequencerProvider = new Provider({
  baseUrl: 'https://alpha4-2.starknet.io',
})

type ContextProps = {
  accountAddress: string
  setAccountAddress: (address: string) => void
  executionState: IExecutionState
  startExecution: (byteCode: string, value: bigint, data: string) => void
  deployEvmContract: (byteCode: string) => Promise<void> | undefined
  executeAtAddress: (
    evmContractAddress: string,
    callData: string,
    value: bigint,
  ) => Promise<void> | undefined
  contract: Contract | undefined
  evmContractAddress: string
  setEvmContractAddress: (newEvmContractAddress: string) => void
}

const initialExecutionState = {
  stack: [],
  storage: [],
  memory: undefined,
  programCounter: undefined,
  totalGas: undefined,
  currentGas: undefined,
  returnValue: undefined,
}

const KAKAROT_ADDRESS =
  '0x031ddf73d0285cc2f08bd4a2c93229f595f2f6e64b25846fc0957a2faa7ef7bb'

export const CairoContext = React.createContext<ContextProps>({
  accountAddress: '',
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setAccountAddress: () => {},
  executionState: initialExecutionState,
  startExecution: () => undefined,
  deployEvmContract: () => undefined,
  executeAtAddress: () => undefined,
  contract: undefined,
  evmContractAddress: '',
  setEvmContractAddress: () => undefined,
})

export const CairoProvider = ({ children }: PropsWithChildren<{}>) => {
  const [accountAddress, setAccountAddress] = useState<string>(
    getStarknet().account.address,
  )
  const [executionState, setExecutionState] = useState<IExecutionState>(
    initialExecutionState,
  )
  const [contractAddress] = useState<string>(KAKAROT_ADDRESS)

  const [contract, setContract] = useState<Contract>()

  const [evmContractAddress, setEvmContractAddress] = useState<string>('')

  useEffect(() => {
    starknetSequencerProvider.getCode(KAKAROT_ADDRESS).then((response) => {
      if (
        response === undefined ||
        !Array.isArray(response?.abi) ||
        (Array.isArray(response.abi) && response.abi.length === 0)
      ) {
        return
      }

      setContract(
        new Contract(response.abi, contractAddress, starknetSequencerProvider),
      )
    })
  }, [contractAddress])

  const hex2bytes = (hexString: string) =>
    hexString
      .match(/[0-9a-f]{2}/gi)
      ?.map((byte) => parseInt(byte, 16).toString()) || []

  const startExecution = async (
    byteCode: string,
    value: bigint,
    data: string,
  ) => {
    contract?.functions['execute'](
      // TODO: remove hardcoded zero value in execute call context
      0,
      hex2bytes(byteCode),
      hex2bytes(data),
    ).then((response) => {
      setExecutionState({
        stack: response.stack
          .map(uint256ToBN)
          .map((n: BigNumberish) => n.toString(16))
          .reverse(),
        storage: [],
        memory: response.memory
          .map((byte: BigNumberish) => byte.toString(16).padStart(2, '0'))
          .join(''),
        programCounter: undefined,
        totalGas: undefined,
        currentGas: undefined,
        returnValue: undefined,
      })
    })
  }

  const deployEvmContract = async (byteCode: string) => {
    await contract?.functions['deploy'](hex2bytes(byteCode))
  }

  const executeAtAddress = async (
    _evmContractAddress: string,
    callData: string,
    value: bigint,
  ) => {
    console.log(value)
    console.log(contract?.address)
    const response = await contract?.functions['execute_at_address'](
      _evmContractAddress,
      // TODO: remove hardcoded zero value in execute call context
      0,
      hex2bytes(callData),
    )
    const trace = await starknetSequencerProvider.getTransactionTrace(
      response?.transaction_hash,
    )
    const result = trace.function_invocation.result
    const stack = result.slice(1, parseInt(result[0], 16) * 2 + 1)
    const memory = result.slice(
      parseInt(result[0], 16) * 2 + 1,
      result.length - 1,
    )
    console.log(stack)
    console.log(memory)
    setExecutionState({
      stack: stack[0],
      storage: [],
      memory: memory
        .map((hexString: string) => hexString.padStart(2, '0'))
        .join(''),
      programCounter: undefined,
      totalGas: undefined,
      currentGas: undefined,
      returnValue: undefined,
    })
    return response.transaction_hash
  }

  return (
    <CairoContext.Provider
      value={{
        accountAddress,
        setAccountAddress,
        executionState,
        startExecution,
        deployEvmContract,
        executeAtAddress,
        contract,
        evmContractAddress,
        setEvmContractAddress,
      }}
    >
      {children}
    </CairoContext.Provider>
  )
}
