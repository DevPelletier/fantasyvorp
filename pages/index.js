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
  const [legend, setLegend] = useState(false);


  const [lsModal, setLSModal] = useState(false);

  const handleOpen = () => setLSModal(true);
  const handleClose = () => setLSModal(false);

  const toggleLegend = () => setLegend(!legend);

  const pickAnswer = (answerID) => {
    // setActiveAnswer(answerID);
    // console.log('pickanswer: ' + answerID)

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
                  <p><strong>VORP: Value Over Replacement Player</strong><br />
                  <em>Def: <strong>A single-number measure of a player&apos;s value, specific to that players&apos; position, and your league settings</strong></em>.</p>
                  <p>The stat was first used in the MLB [of course] as a way to measure the effective value of pitcher [<em>e.g.:&quot;How many runs would a replacement level pitcher have allowed here?&quot;</em>].</p>
                  <p>In Fantasy Sports, though, there are far less variables to consider, and far more structure. This makes VORP is a <em>much</em> more effective and simple way of measuring player values in Fantasy. However, for some reason VORP hasn&apos;t been adopted by any of the major fantasy platforms - currently, VORP is only really used within some custom spreadsheets found online which may be difficult to find and/or use...</p>
                  <p>So that&apos;s why I created this site 🤠</p>
                  <Button
                    variant="outlined"
                    >
                      <Link href="faqs-and-tutorial">
                        Learn more about VORP 👉
                      </Link>
                  </Button>

                </div>
                <div className="answer answerHidden"  id="answer_2">
                  <p className="logoFont">Q: Why is VORP better?</p>
                  <p><strong>Using VORP is better than your fantasy platform&apos;s existing pre-season / in-season rankings</strong>.</p>
                  <p>The standard fantasy platform rankings are not great - and most fantasy GMs know this. That&apos;s why there is an entire cottage industry of <em>custom spreadsheets</em> and <em>insider projections</em>, and so on. Don&apos;t get me wrong - these analysts and spreadsheets are undoubtedly very valuable... for users that want to spend the time and effort to find the right analyst/tool and customize their spreadsheet to perfection.</p>
                  <p>
                    <strong>But what if we could just use the existing raw stats to create a better ranking system? </strong>
                  </p>
                  <p>The facts of the case:</p>
                  <ul className="withDots">
                    <li>
                      Standard fantasy platform pre-season rankings are not great. Even the platforms themselves know this - their business is competently facilitating a fantasy league, not performing complex calculations to provide you custom data insights.
                    </li>
                    <li>
                      This lack of effort into data extends to the Regular Season, too, of course. In-season rankings are usually calculated with the most simple possible calculation [averages of each category]. This process works to provide rough estimates of overall value, but <strong>doesn&apos;t take into account several important factors in fantasy</strong>, such as: the value of a category within that players&apos; position, the value of that position relative to other positions, the scarcity of that position&apos;s value, and so much more.
                    </li>
                  </ul>
                  <p><strong>Using VORP solves all of these issues - without increasing complexity. It&apos;s 1 number, and a better ranking.</strong></p>
                  <p>You can go as deep as you&apos;d like into the complexity, of course, as well. You can calculate VORP within each category, and even VORP within each category within each position 🤯. But we&apos;re trying to SAVE time and effort here, though, right? So let&apos;s keep it simple - <strong>in fantasy sports, your primary goal is to better understand player values, and VORP makes that easier.</strong> <em>VORP is better</em>.</p>
                  <Button
                    variant="outlined"
                    >
                      <Link href="faqs-and-tutorial">
                        Learn how VORP is actually calculated 👉
                      </Link>
                  </Button>
                </div>
                <div className="answer answerHidden"  id="answer_3">
                  <p className="logoFont">Q: How do I use this site?</p>
                  <ol>
                    <li>Scroll down 👇 to the <em>Input Your League Settings</em> button - input all of the specific settings for your FHL</li>
                    <li>The VORP data for your specific league will be calculated for:
                      <ul>
                        <li>The past 3 seasons</li>
                        <li>A bare-bones VORP projection for the upcoming 22-23 season!</li>
                        <li><em>and coming soon... Live VORP calculations for In-Season and In-Game stats </em>😮</li>
                      </ul>
                    </li>
                  </ol>
                  <p>
                    Feel free to play around with the filters above the datatable as well! The Table View is for a Stats vs. Draft data view, filter the table by Position, select your Season [or projection], and switch between Full Season values vs. Per Game values.
                  </p>
                  <p>
                    PS - If you&apos;re interested in that last feature - Live VORP for In-Season and In-Game stats...<br /><Link href="coming-soon">sign up for feature updates here</Link>.
                  </p>
                </div>
              </div>


          </div>
        </section>


        <div className="homeCtaContainer">
          <Button 
            onClick={handleOpen} 
            variant="contained" 
            type="submit" 
            value="Submit"
            className="setLSbtn"
            >
              Input your League Settings
          </Button>
        </div>

        <h2>NHL Fantasy VORP Data</h2>
        <div className="tableLegend">
          <h4 onClick={toggleLegend}>Notes & Legend:</h4>
          <ul className={`withDots ${legend ? "active" : ""}`}>
            <li>
              All VORPs are adjusted to your League&apos;s replacement levels [A VORP of 0 means they are exactly at the replacement level].
            </li>
            <li>
              Category VORPs may not sum to overall VORP or positional VORP. This is because each VORP is a silo - only compared to relevant comparators, and finally adjusted to replacement levels. [e.g. PlayerX having &quot;2.3&quot; value for &apos;G&apos; means that&apos;s how valuable they are in that category <em>relative to other players at their position</em>, <strong>not</strong> relative to the entire league.]
            </li>
            <li>Please take these projections with a <strong>large grain of salt!</strong> They are ONLY supposed to give a general idea of potential value, based entirely on raw stats with zero adjustments. <a href="faqs">Learn about how I made these projections here.</a></li>
          </ul>
        </div>
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