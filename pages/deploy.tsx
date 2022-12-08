import React from 'react'

import type { NextPage } from 'next'
import Head from 'next/head'
import ReactTooltip from 'react-tooltip'

import HomeLayout from 'components/layouts/Home'
import { Button, Container, H1, H2, H3, Icon, Input } from 'components/ui'

import ConnectButton from '../components/ConnectButton'

type SectionWrapperProps = {
  nbr: React.ReactNode
  title: React.ReactNode
  children: React.ReactNode
}

const SectionWrapper: React.FC<SectionWrapperProps> = ({
  nbr,
  title,
  children,
}) => {
  return (
    <div className="flex flex-row px-8 mb-16 xl:border-r border-r-black-500">
      <span className="font-medium text-lg md:text-xl w-8">{nbr}.</span>
      <div className="flex flex-col flex-1">
        <H2>{title}</H2>
        <div className="h-full flex flex-col justify-between mt-4">
          {children}
        </div>
      </div>
    </div>
  )
}

type InfoBoxProps = {
  title: React.ReactNode
  statusIcon: string
  children: React.ReactNode
}

const InfoBox: React.FC<InfoBoxProps> = ({ children, title, statusIcon }) => {
  return (
    <table className="table-auto mb-6 bg-indigo-100 dark:bg-black-500 rounded font-medium w-full">
      <thead>
        <tr className="text-gray-500 uppercase text-xs">
          <td className="pt-3 px-4">{title}</td>
          <td className="pt-3 px-4 text-end flex flex-row justify-end">
            <div data-for="tooltip-copy" data-tip="copy">
              <Icon
                name="links-line"
                className="mr-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white cursor-pointer"
              />
            </div>
            <ReactTooltip id="tooltip-copy" effect="solid" />
            <Icon
              name={statusIcon}
              className="text-green-500 dark:text-green-500"
            />
          </td>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="pb-3 px-4">{children}</td>
        </tr>
      </tbody>
    </table>
  )
}

const AboutPage = () => {
  return (
    <>
      <html lang="en"></html>
      <React.Fragment>
        <Head>
          <title> Kakarot Playground - Deploy from L1 </title>
        </Head>
        <meta
          property="og:description"
          content="Deploy an existing contract from L1 directly to Kakarot"
        />
      </React.Fragment>
      <Container className="pb-10">
        <H1>Deploy from L1</H1>
        <p className="pb-2">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent sit
          amet sapien sem. Nunc pulvinar sagittis magna a lacinia. Ut iaculis
          odio sed nunc dapibus dictum. Ut sed dolor in nulla pretium viverra
          vel in tellus. Sed sodales sapien non purus fermentum, nec consequat
          tellus feugiat. Aliquam consequat.
        </p>
      </Container>
      <section className="py-10 md:py-20 bg-gray-50 dark:bg-black-700">
        <Container>
          <div className="grid xl:grid-cols-3 grid-flow-row gap-4">
            <SectionWrapper nbr={1} title="Import contract from L1">
              <div>
                <H3 className="text-gray-600">Connect wallet</H3>
                <ConnectButton className="mt-4" />
              </div>
              <div className="mt-8">
                <H3 className="text-gray-600">EVM contract Address to fetch</H3>
                <Input
                  searchable
                  //value={searchKeyword}
                  onChange={(e) => {
                    console.log(e)
                    // setSearchKeyword(e.target.value)
                    // handleKeywordChange(e.target.value)
                  }}
                  placeholder={`Enter keyword...`}
                  className="bg-gray-100 dark:bg-black-500 mt-4"
                />
                <Button
                  size="xs"
                  onClick={console.log}
                  className="mt-4 py-1 px-2 font-medium"
                >
                  Fetch
                </Button>
              </div>
            </SectionWrapper>
            <SectionWrapper nbr={2} title="Deploy to Kakarot">
              <div>
                <InfoBox title="Since" statusIcon="checkbox-circle-line">
                  ABI fetched
                </InfoBox>
                <InfoBox title="Since" statusIcon="checkbox-circle-line">
                  Bytecode fetched
                </InfoBox>
              </div>
              <div>
                <Button
                  size="xs"
                  onClick={console.log}
                  className="mt-4 py-1 px-2 font-medium"
                >
                  Deploy
                </Button>
              </div>
            </SectionWrapper>
            <SectionWrapper nbr={3} title="Test your contract on Kakarot">
              <div>
                <H3 className="text-gray-600">Addresses</H3>
                <div className="flex flex-col text-sm mt-4 text-indigo-500">
                  <a
                    href={'http://google.com'}
                    target={'_blank'}
                    rel="noreferrer"
                  >
                    0x1234...5678
                  </a>
                  <a
                    href={'http://google.com'}
                    target={'_blank'}
                    rel="noreferrer"
                  >
                    0x1234...5678
                  </a>
                </div>
              </div>
              <div>
                <Button
                  size="xs"
                  onClick={console.log}
                  className="mt-4 py-1 px-2 font-medium"
                >
                  Go to playground
                </Button>
              </div>
            </SectionWrapper>
          </div>
        </Container>
      </section>
    </>
  )
}

AboutPage.getLayout = function getLayout(page: NextPage) {
  return <HomeLayout>{page}</HomeLayout>
}

export default AboutPage
