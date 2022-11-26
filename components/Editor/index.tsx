import React, {
  Fragment,
  MutableRefObject,
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { decode } from '@kunigi/string-compression'
import cn from 'classnames'
import { useRouter } from 'next/router'
import Select, { OnChangeValue } from 'react-select'
import SCEditor from 'react-simple-code-editor'

import { CairoContext } from 'context/cairoContext'
import { EthereumContext } from 'context/ethereumContext'
import { Setting, SettingsContext } from 'context/settingsContext'

import {
  getBytecodeFromMnemonic,
  getBytecodeLinesFromInstructions,
  getMnemonicFromBytecode,
} from 'util/compiler'
import { codeHighlight, isEmpty, isFullHex, isHex } from 'util/string'

import examples from 'components/Editor/examples'
import InstructionList from 'components/Editor/Instructions'
import { Button, Input } from 'components/ui'

import CairoExecutionState from './CairoExecutionState'
import ExecutionState from './ExecutionState'
import ExecutionStatus from './ExecutionStatus'
import Header from './Header'
import { CodeType, ValueUnit } from './types'

type Props = {
  readOnly?: boolean
}

type SCEditorRef = {
  _input: HTMLTextAreaElement
} & RefObject<React.FC>

const editorHeight = 350
const consoleHeight = 350
const instructionsListHeight = editorHeight + 52 // RunBar
const instructionsListWithExpandHeight = editorHeight + 156 // Advance Mode bar

const unitOptions = Object.keys(ValueUnit).map((value) => ({
  value,
  label: value,
}))

const Editor = ({ readOnly = false }: Props) => {
  const { settingsLoaded, getSetting, setSetting } = useContext(SettingsContext)
  const router = useRouter()

  const {
    transactionData,
    loadInstructions,
    startExecution,
    startTransaction,
    opcodes,
    instructions,
    resetExecution,
    onForkChange,
  } = useContext(EthereumContext)
  const cairoContext = useContext(CairoContext)

  const [code, setCode] = useState('')
  const [compiling, setIsCompiling] = useState(false)
  const [codeType, setCodeType] = useState<string | undefined>()
  const [codeModified, setCodeModified] = useState(false)
  const solcWorkerRef = useRef<null | Worker>(null)
  const instructionsRef = useRef() as MutableRefObject<HTMLDivElement>
  const editorRef = useRef<SCEditorRef>()
  const [callData, setCallData] = useState('')
  const [callValue, setCallValue] = useState('')
  const [unit, setUnit] = useState(ValueUnit.Wei as string)

  const [isExpanded, setIsExpanded] = useState(false)
  const [isDeployDisabled, setIsDeployDisabled] = useState(false)

  const getCallValue = useCallback(() => {
    const _callValue = BigInt(callValue)
    switch (unit) {
      case ValueUnit.Gwei:
        return _callValue * BigInt('1000000000')
      case ValueUnit.Finney:
        return _callValue * BigInt('1000000000000000')
      case ValueUnit.Ether:
        return _callValue * BigInt('1000000000000000000')
      default:
        return _callValue
    }
  }, [callValue, unit])

  const deployByteCode = useCallback(
    async (bc, args = '', callValue) => {
      try {
        if (!callValue) {
          callValue = getCallValue()
        }
        const transaction = await transactionData(bc + args, callValue)
        loadInstructions(bc)
        setIsCompiling(false)

        const result = await startTransaction(transaction)

        return result
      } catch (error) {
        setIsCompiling(false)
      }
    },
    [transactionData, getCallValue, loadInstructions, startTransaction],
  )

  const handleWorkerMessage = useCallback(
    (event: MessageEvent) => {
      const { error, contracts } = event.data
      resetExecution()

      if (error) {
        setIsCompiling(false)
        return
      }

      if (contracts.length > 1) {
        setIsCompiling(false)
        return
      }

      if (!isExpanded) {
        deployByteCode(contracts[0].code, '', undefined)
      } else {
        setIsCompiling(false)
      }
    },
    [resetExecution, isExpanded, deployByteCode],
  )

  useEffect(() => {
    const query = router.query

    if ('callValue' in query && 'unit' in query) {
      setCallValue(query.callValue as string)
      setUnit(query.unit as string)
    }

    if ('callData' in query) {
      setCallData(query.callData as string)
    }

    if ('codeType' in query && 'code' in query) {
      setCodeType(query.codeType as string)
      setCode(JSON.parse('{"a":' + decode(query.code as string) + '}').a)
    } else {
      const initialCodeType: CodeType =
        getSetting(Setting.EditorCodeType) || CodeType.Mnemonic

      setCodeType(initialCodeType)
      setCode(examples[initialCodeType][0])
    }

    if ('fork' in query) {
      onForkChange(query.fork as string)
      setSetting(Setting.VmFork, query.fork as string)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingsLoaded && router.isReady])

  useEffect(() => {
    if (solcWorkerRef && solcWorkerRef.current) {
      // @ts-ignore change the worker message, when value and args changed.
      solcWorkerRef.current?.onmessage = handleWorkerMessage
    }
  }, [solcWorkerRef, handleWorkerMessage])

  const handleCodeChange = (value: string) => {
    setCode(value)
    setCodeModified(true)
  }

  const highlightCode = (value: string) => {
    if (!codeType) {
      return value
    }

    return codeHighlight(value, codeType)
      .value.split('\n')
      .map((line, i) => `<span class='line-number'>${i + 1}</span>${line}`)
      .join('\n')
  }

  const highlightBytecode = (value: string) => {
    return value
  }

  const handleCodeTypeChange = (option: OnChangeValue<any, any>) => {
    const { value } = option
    setCodeType(value)
    setSetting(Setting.EditorCodeType, value)
    setIsExpanded(false)

    if (!codeModified && codeType) {
      setCode(examples[value as CodeType][0])
    } else if (
      value &&
      value === CodeType.Mnemonic &&
      instructions?.length > 0
    ) {
      const code = getBytecodeLinesFromInstructions(instructions)
      setCode(code)
    } else if (
      value &&
      value === CodeType.Bytecode &&
      instructions?.length > 0
    ) {
      const code = getMnemonicFromBytecode(instructions, opcodes)
      setCode(code)
    }

    // NOTE: SCEditor does not expose input ref as public /shrug
    if (editorRef?.current?._input) {
      const input = editorRef?.current?._input

      input.focus()
      input.select()
    }
  }

  const handleRun = useCallback(() => {
    const startExecutions = (byteCode: string, value: bigint, data: string) => {
      startExecution(byteCode, value, data)
      cairoContext.startExecution(byteCode, value, data)
    }
    if (!isEmpty(callValue) && !/^[0-9]+$/.test(callValue)) {
      return
    }

    if (!isEmpty(callData) && !isFullHex(callData)) {
      return
    }

    try {
      const _callData = callData.substr(2)
      const _callValue = getCallValue()

      if (codeType === CodeType.Mnemonic) {
        const bytecode = getBytecodeFromMnemonic(code, opcodes)
        loadInstructions(bytecode)
        startExecutions(bytecode, _callValue, _callData)
      } else {
        if (code.length % 2 !== 0) {
          return
        }
        if (!isHex(code)) {
          return
        }
        loadInstructions(code)
        startExecutions(code, _callValue, _callData)
      }
    } catch (error) {
      console.error(error)
    }
  }, [
    code,
    codeType,
    opcodes,
    callData,
    callValue,
    loadInstructions,
    getCallValue,
    startExecution,
    cairoContext,
  ])

  const handleDeploy = useCallback(() => {
    const deploy = async (byteCode: string) => {
      await cairoContext.deployEvmContract(byteCode)
      setIsDeployDisabled(true)
    }

    try {
      if (codeType === CodeType.Mnemonic) {
        const bytecode = getBytecodeFromMnemonic(code, opcodes)
        deploy(bytecode)
      } else {
        if (code.length % 2 !== 0) {
          return
        }
        if (!isHex(code)) {
          return
        }
        deploy(code)
      }
    } catch (error) {
      console.error(error)
    }
  }, [code, codeType, opcodes, cairoContext])

  const handleExecuteAtAddress = useCallback(() => {
    const executeAtAddress = (
      evmContractAddress: string,
      value: bigint,
      data: string,
    ) => {
      cairoContext.executeAtAddress(evmContractAddress, data, value)
    }
    if (!isEmpty(callValue) && !/^[0-9]+$/.test(callValue)) {
      return
    }

    if (!isEmpty(callData) && !isFullHex(callData)) {
      return
    }

    try {
      const _callData = callData.substr(2)
      const _callValue = getCallValue()

      executeAtAddress(cairoContext.evmContractAddress, _callValue, _callData)
    } catch (error) {
      console.error(error)
    }
  }, [callData, callValue, getCallValue, cairoContext])

  const isRunDisabled = useMemo(() => {
    return compiling || isEmpty(code)
  }, [compiling, code])

  const isBytecode = useMemo(() => codeType === CodeType.Bytecode, [codeType])
  const isCallDataActive = useMemo(
    () => codeType === CodeType.Mnemonic || codeType === CodeType.Bytecode,
    [codeType],
  )

  const unitValue = useMemo(
    () => ({
      value: unit,
      label: unit,
    }),
    [unit],
  )

  return (
    <div className="bg-gray-100 dark:bg-black-700 rounded-lg">
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/2">
          <div className="border-b border-gray-200 dark:border-black-500 flex items-center pl-6 pr-2 h-14 md:border-r">
            <Header
              onCodeTypeChange={handleCodeTypeChange}
              codeType={codeType}
            />
          </div>

          <div>
            <div
              className="relative pane pane-light overflow-auto md:border-r bg-gray-50 dark:bg-black-600 border-gray-200 dark:border-black-500"
              style={{ height: editorHeight }}
            >
              <SCEditor
                // @ts-ignore: SCEditor is not TS-friendly
                ref={editorRef}
                value={code}
                readOnly={readOnly}
                onValueChange={handleCodeChange}
                highlight={isBytecode ? highlightBytecode : highlightCode}
                tabSize={4}
                className={cn('code-editor', {
                  'with-numbers': !isBytecode,
                })}
              />
            </div>

            <Fragment>
              {
                <div className="flex flex-col md:flex-row md:items-center md:justify-between px-4 py-4 md:py-2 md:border-r border-gray-200 dark:border-black-500">
                  <div className="flex flex-col md:flex-row md:gap-x-4 gap-y-2 md:gap-y-0 mb-4 md:mb-0">
                    {isCallDataActive && (
                      <Input
                        placeholder="Calldata in HEX"
                        className="bg-white dark:bg-black-500"
                        value={callData}
                        onChange={(e) => setCallData(e.target.value)}
                      />
                    )}

                    <Input
                      type="number"
                      step="1"
                      placeholder="Value to send"
                      className="bg-white dark:bg-black-500"
                      value={callValue}
                      onChange={(e) => setCallValue(e.target.value)}
                    />

                    <Select
                      onChange={(option: OnChangeValue<any, any>) =>
                        setUnit(option.value)
                      }
                      options={unitOptions}
                      value={unitValue}
                      isSearchable={false}
                      classNamePrefix="select"
                      menuPlacement="auto"
                    />
                  </div>

                  <div className="flex flex-col md:w-28 sm:w-16 gap-2">
                    <Button
                      onClick={handleRun}
                      disabled={isRunDisabled}
                      size="sm"
                      contentClassName="justify-center"
                    >
                      Run
                    </Button>
                    <Button
                      onClick={() => {
                        handleDeploy()
                      }}
                      size="sm"
                      contentClassName="justify-center"
                    >
                      Deploy
                    </Button>
                    <Button
                      onClick={() => {
                        handleExecuteAtAddress()
                      }}
                      size="sm"
                      contentClassName="justify-center"
                    >
                      Execute Contract
                    </Button>
                  </div>
                </div>
              }
            </Fragment>
          </div>
        </div>

        <div className="w-full md:w-1/2">
          <div className="border-t md:border-t-0 border-b border-gray-200 dark:border-black-500 flex items-center pl-4 pr-6 h-14">
            <ExecutionStatus />
          </div>

          <div
            className="pane pane-light overflow-auto bg-gray-50 dark:bg-black-600 h-full"
            ref={instructionsRef}
            style={{
              height: isExpanded
                ? instructionsListWithExpandHeight
                : instructionsListHeight,
            }}
          >
            <InstructionList containerRef={instructionsRef} />
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row-reverse">
        <div className="w-full md:w-1/2">
          <div
            className="pane pane-dark overflow-auto border-t border-black-900/25 bg-gray-800 dark:bg-black-700 text-white px-4 py-3"
            style={{ height: consoleHeight }}
          >
            <span>Kakarot (Cairo zkEVM)</span>
            <CairoExecutionState />
          </div>
        </div>
        <div className="w-full md:w-1/2">
          <div
            className="pane pane-dark overflow-auto border-t border-black-900/25 bg-gray-800 dark:bg-black-700 text-white px-4 py-3"
            style={{ height: consoleHeight }}
          >
            <span>EVM</span>
            <ExecutionState />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Editor
