import Head from 'next/head'
import styles from '../styles/Home.module.scss'

import { useState, useEffect } from 'react'
import Link from 'next/link'

import MiniHero from '../components/layout/miniHero'
import RawData from '../components/getRawData'


export default function RawStats(props) {
  const [colData, setColData] = useState({});

  const wait = delay => new Promise(resolve => setTimeout(resolve, delay));
  const scrollToDataTable = async () => {
    await wait(500)
    document.getElementById("dataTableAnchor").scrollIntoView({behavior: "smooth"});
  }

  const getColData = (colData) => {
    setColData(colData);
  }

  let headlineText = "NHL Raw Stats"

  return (
    <div className={styles.container}>
        <main className={styles.main}>

            <MiniHero headline={headlineText} />

            <h2>NHL - Raw Stats</h2>
            <div id="dataTableAnchor"></div>
            <div className="rawDataContainer">
              <RawData />
            </div>

        </main>
    </div>
  )
}