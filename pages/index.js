import styles from '../styles/Home.module.scss'

import { useState, useEffect, StrictMode } from 'react'
import Link from 'next/link'
import Image from 'next/image'

import Hero from '../components/layout/hero'
import PlayerData from '../components/getPlayerData'
import SetLeagueSettings from '../components/setLeagueSettings'
// import DashGraph from '../components/dashGraph' // To implement later - NON MVP

import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';

import img_bmc from '../public/bmc_icon_black.png'


export default function Home(props) {
  const [lsID, setLSID] = useState('');
  const [colData, setColData] = useState({});
  const [posSettings, setPosSettings] = useState({});
  const [catSettings, setCatSettings] = useState({});
  const [activeAnswer, setActiveAnswer] = useState();

  const [lsModal, setLSModal] = useState(false);

  const handleOpen = () => setLSModal(true);
  const handleClose = () => setLSModal(false);

  const pickAnswer = (answerID) => {
    // setActiveAnswer(answerID);
    console.log('pickanswer: ' + answerID)

    let answersParent = document.getElementById(`content_2`)
    for (const child of answersParent.children) {
      if (child.id == `answer_${answerID}`) {
      child.classList.remove("answerHidden")
      } else {
        child.classList.add("answerHidden")
      }
    }
    // let answerEl = document.getElementById(`answer_${answerID}`)
    // console.log(answerEl)
    // answerEl.classList.remove("hidden")

  }

  const wait = delay => new Promise(resolve => setTimeout(resolve, delay));
  const scrollToDataTable = async () => {
    // await wait(500)
    document.getElementById("dataTableAnchor").scrollIntoView({behavior: "smooth"});
  }

  const getLSID = (lsID) => {
    setLSID(lsID);
    handleClose();
    scrollToDataTable();
  }

  const getColData = (colData) => {
    setColData(colData);
  }

  const getPosSettings = (posData) => {
    setPosSettings(posData)
  }

  const getCatSettings = (catData) => {
    setCatSettings(catData)
  }


  return (
    <div className={styles.container}>
      <main className={styles.main}>

        <section className={styles.hero}>
          <div className={styles.contentContainer}>
              <div className={styles.content_1}>
                <h1>
                    Welcome to the <span className={styles.logoFont}>FantasyVORP.com</span> beta!
                </h1>
              </div>
              <div>
                <h3>Quick ?&apos;s</h3>
                <div className="quickLinkContainer flexCenterRow">
                  <Button
                    variant="outlined"
                    onClick={() => pickAnswer(1)}
                    >
                      What is VORP?
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => pickAnswer(2)}
                    >
                      Why is VORP better?
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => pickAnswer(3)}
                    >
                      How do I use this site?
                  </Button>
                </div>
              </div>
              <div className="content_2" id="content_2">
                <div className="answer answerHidden" id="answer_1">
                  <p className="logoFont">Q: What is VORP?</p>
                  <p><strong>VORP</strong>: Value Over Replacement Player</p>
                  <p>VORP is a measure of <strong><em>a player&apos;s value to your fantasy team, specific to your league settings</em></strong>.</p>
                  <p>This means that the same player will have different VORP values in different leagues. For example: if a league uses HITs and BLKs, a &apos;rough&apos; defenceman will, of course, have a higher value (and a higher <strong>VORP</strong>) than he would in a league that does not use HITs and BLKs.</p>
                  <p></p>
                  <p></p>
                  <p>A specific player contributes to your fantasy team in comparison to a replacement-level player. Finding the &apos;replacement-level&apos; depends on how &apos;big&apos; your league is. These factors include: # of teams, # of players in each position, and chosen categories [with category weights if applicable].</p>
                </div>
                <div className="answer answerHidden"  id="answer_2">
                  <p className="logoFont">Q: Why is VORP better?</p>
                  <p>Using VORP is better than your fantasy platform&apos;s <strong>pre-season AND in-season rankings</strong>.</p>
                  <p>Most fantasy platform pre-season rankings are garbage - we all know this. However, it&apos;s my opinion that their in-season rankings are actually not that useful, either. This is for a few reasons, including:
                    <ul>
                      <li>It takes time and effort to create accurate pre-season rankings. For the big fantasy platforms, it&apos;s easier and cheaper to create rankings that are acceptable, but... have some glaring flaws.</li>
                      <li>Most fantasy GMs know the above point, and this issues has created an entire industry of custom spreadsheet products across every sport. These spreadsheets are much better than the alternative, but require a lot of time and effort to find the right one for your league.</li>
                      <li>Most platform&apos;s In-Season Rankings are created from extremely basic calculations that don&apos;t accurately convey a players&apos; value.</li>
                      <li>It&apos;s especially difficult to use standard platforms when it comes to making decisions between: players in two different positions, or players with different values in differnt categories, or even generally which players are <em>hurting</em> your team more than <em>helping</em>!</li>
                    </ul>
                  </p>
                  <p><strong>Using VORP instantly simplifies all of these issues.</strong></p>
                  <p>Of course, it&apos;s not a silver bullet by any means - but it brings every category and every player onto a level playing field to be compared. For pre-season rankings, you can look at <strong><em>past seasons more accurately</em></strong>, while you can gain an edge by having a <strong><em>more accurate analysis on current stats</em></strong> throughout the year.</p>
                  {/* <p>With VORP, you're compare apples to apples, instead of parsing raw data on your platform and trying to compare the value of a <a>C</a>'s <a>PPP</a> to a <a>D</a>'s <a>BLK</a>s!</p> */}
                  {/* <p>For pre-season rankings, you can look at <strong><em>past seasons more accurately</em></strong>, while you can gain an edge by having a <strong><em>more accurate analysis on current stats</em></strong> throughout the year.</p> */}
                  <Button
                    variant="outlined"
                    >
                      <Link href="how-does-this-work">
                        Learn more about VORP here 👉
                      </Link>
                  </Button>
                </div>
                <div className="answer answerHidden"  id="answer_3">
                  <p className="logoFont">Q: How do I use this site?</p>
                  <p>
                    <ol>
                      <li>Scroll down 👇 to the <em>Input Your League Settings</em> button - input all of the specific settings for your FHL</li>
                      <li>The VORP data for your specific league will be calculated for:
                        <ul>
                          <li>The past 3 seasons</li>
                          <li>A bare-bones VORP projection for the upcoming 22-23 season!</li>
                        </ul>
                      </li>
                    </ol>
                  </p>
                  <p>
                    Feel free to play around with the filters above the datatable as well! The Table View is for a Stats vs. Draft data view, filter the table by Position, select your Season [or projection], and switch between Full Season values vs. Per Game values.
                  </p>
                </div>
              </div>


          </div>
        </section>



        <h2>NHL Fantasy VORP Data</h2>
        <Button 
          onClick={handleOpen} 
          variant="contained" 
          type="submit" 
          value="Submit"
          className="setLSbtn"
          >
            Input your League Settings
        </Button>
        <div id="dataTableAnchor"></div>
        {/* <StrictMode> */}
          <PlayerData lsID={lsID} colData={colData} posSettings={posSettings} catSettings={catSettings}/>
        {/* </StrictMode> */}

      </main>

      <Modal
        open={lsModal}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box>
          <SetLeagueSettings setLSModal={setLSModal} getLSID={getLSID} getColData={getColData} getPosSettings={getPosSettings} getCatSettings={getCatSettings}/>
        </Box>
      </Modal>

    </div>
  )
}