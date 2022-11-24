import type { NextPage } from 'next'
import Head from 'next/head'

import Editor from 'components/Editor'
import HomeLayout from 'components/layouts/Home'
import { Container } from 'components/ui'

const HomePage = () => {
  return (
    <>
      <html lang="en"></html>
      <Head>
        <meta property="og:type" content="website" />
        <title>Kakarot Playground - Playground</title>
        <meta
          name="description"
          content="Kakarot Playground is an interactive tool for comparing kakarot output with the standard EVM."
        />
      </Head>

      <Container className="pb-10">
        <p className="pb-2">
          Kakarot is a zk-EVM written in Cairo. It leverages STARK proofs to
          enable provability of execution. More information{' '}
          <a
            className="font-bold"
            target="_blank"
            rel="noreferrer"
            href="https://kakarot.org"
          >
            here
          </a>
          .
        </p>
        <p className="pb-2">
          This playground helps you compare execution between the standard evm
          and kakarot.
        </p>
        <p className="pb-2">
          How to use: Write or paste bytecode or a sequence of opcodes
          (mnemonic) and hit execute. Left panel will give you the standard EVM
          output and right one the kakarot output.
        </p>
      </Container>

      <Container>
        <Editor />
      </Container>
    </>
  )
}

HomePage.getLayout = function getLayout(page: NextPage) {
  return <HomeLayout>{page}</HomeLayout>
}

export default HomePage
