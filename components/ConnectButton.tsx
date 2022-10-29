import { useContext } from 'react'

import { disconnect, getStarknet } from 'get-starknet'

import { CairoContext } from 'context/cairoContext'

import { Button } from 'components/ui'

const ConnectButton = () => {
  const { accountAddress, setAccountAddress, contract } =
    useContext(CairoContext)

  const onClick = async () => {
    if (getStarknet().isConnected) {
      disconnect()
    }
    const selected = await getStarknet().enable({ showModal: true })
    setAccountAddress(selected[0])
    if (getStarknet().isConnected) {
      contract?.connect(getStarknet().account)
    }
  }

  return (
    <Button
      size="xs"
      onClick={onClick}
      className="mx-4 py-1 px-2 font-medium"
      transparent
      outline
      padded={false}
    >
      {accountAddress ? accountAddress.substring(0, 8) : 'Connect'}
    </Button>
  )
}

export default ConnectButton
