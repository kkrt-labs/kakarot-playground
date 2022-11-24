import { useRouter } from 'next/router'

import { GITHUB_REPO_URL } from 'util/constants'

import { Icon } from 'components/ui'

const useActions = () => {
  const router = useRouter()

  return [
    {
      id: 'playground',
      name: 'Playground',
      shortcut: ['p'],
      keywords: 'editor play',
      section: 'Navigation',
      perform: () => router.push('/'),
      subtitle: 'Play with EVM in real-time',
      icon: <Icon name="home-2-line" />,
    },
    {
      id: 'opcodes',
      name: 'Opcodes',
      shortcut: ['o'],
      keywords: 'home opcodes back',
      section: 'Navigation',
      perform: () => router.push('/opcodes'),
      subtitle: 'Opcodes reference',
      icon: <Icon name="play-circle-line" />,
    },
    {
      id: 'precompiled',
      name: 'Precompiled',
      shortcut: ['a'],
      keywords: 'precompiled contracts',
      section: 'Navigation',
      subtitle: 'Precompiled contracts reference',
      perform: () => router.push('/precompiled'),
      icon: <Icon name="information-line" />,
    },
    {
      id: 'about',
      name: 'About',
      shortcut: ['a'],
      keywords: 'about EVM',
      section: 'Navigation',
      subtitle: 'About EVM and its internals',
      perform: () => router.push('/about'),
      icon: <Icon name="information-line" />,
    },
    {
      id: 'github',
      name: 'GitHub',
      shortcut: ['g'],
      keywords: 'contribute GitHub issues',
      section: 'Navigation',
      subtitle: 'Contribute on GitHub',
      perform: () => window.open(GITHUB_REPO_URL, '_blank'),
      icon: <Icon name="github-fill" />,
    },
  ]
}

export default useActions
