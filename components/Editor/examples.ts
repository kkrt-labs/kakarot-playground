import { ExampleCode } from './types'

const examples: ExampleCode = {
  Bytecode: ['6010600052601160002000'],
  Mnemonic: [
    `PUSH1 10
PUSH1 00
MSTORE
PUSH1 11
PUSH1 00
SHA3
STOP`,
  ],
}

export default examples
