import Head from 'next/head'
import styles from '../styles/Home.module.scss'

import { useState, useEffect } from 'react'
import Link from 'next/link'

import MiniHero from '../components/layout/miniHero'
import RawData from '../components/getRawData'
import PlayerData from '../components/getPlayerData'



export default function RawStats(props) {
  const [colData, setColData] = useState({});
  const [legend, setLegend] = useState(false);

  const toggleLegend = () => setLegend(!legend);

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
            <div className="tableLegend">
              <h4 onClick={toggleLegend}>Notes & Legend:</h4>
              <ul className={`withDots ${legend ? "active" : ""}`}>
                <li>Please take these projections with a <strong>large grain of salt!</strong> They are ONLY supposed to give a general idea of potential value, based entirely on raw stats with zero adjustments. <a href="faqs">Learn about how I made these projections here.</a></li>
              </ul>
            </div>

            <div id="dataTableAnchor"></div>
            {/* <div className="rawDataContainer"> */}
            <PlayerData />
            {/* </div> */}

        </main>
    </div>
  )
}