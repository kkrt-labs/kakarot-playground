import { useContext } from 'react'

import { disconnect, getStarknet } from 'get-starknet'

import { CairoContext } from 'context/cairoContext'

import { Button } from 'components/ui'

interface Props {
  size?: 'xs' | 'sm' | 'md' | undefined
  className?: string
}

const parseAddres = (accountAddress: string) => {
  return (
    accountAddress.substring(0, 6) +
    '...' +
    accountAddress.substring(accountAddress.length - 4, accountAddress.length)
  )
}
const ConnectButton = ({ ...props }: Props) => {
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
      className="mx-0 py-1 px-2 font-medium"
      {...props}
    >
      {accountAddress ? parseAddres(accountAddress) : 'Connect'}
    </Button>
  )
}

export default ConnectButton
