import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import Link from 'next/link'
import { supabase } from '../utils/supabaseClient'
import DataTable from 'react-data-table-component';

// import Redis from 'ioredis';

// const redis = new Redis ({
//   'port': 6379,
//   'host': '127.0.0.1'
// })

import Switch from '@mui/material/Switch';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Tooltip from '@mui/material/Tooltip';

import { differenceBy } from 'lodash'
import { Controller, useForm } from 'react-hook-form';

import styles from '../styles/components/playerData.module.scss';
import { customRDTStyles, specificRDTStyles } from '../styles/components/dataTable';

// -------------- Data Table Variables -------------- //
const dataColWidth01 = "66px";
const dataColWidth02 = "100px";
let tableData = {};
let columns;
let dataSource;
let tableTitle = '';
let tableTitle2 = '';
let tableTitle3 = '';
let lsIDcompare = '';


// -------------- END of Data Table Variables -------------- //

const flaggedPlayers = [
  6814,   // cirelli
  5363,   // landeskog
  5152,   // Stone
  4261,   // pacioretty
  7554,   // jason robertson
  7115,   // keller
  7528,   // suzuki
  5369,   // couturier
  6083,   // copp
  4351,   // marchand
  3982,   // backstrom
  6060,   // duclair
  5696,   // wilson
  7122,   // mcavoy
  4762,   // lehner
  3231,   // smith
]

export default function PlayerVORPData(props) {
  const [playerData, setPlayerData] = useState([])
  const [loading, setLoading] = useState()
  const [hidePosRnk, setHidePosRnk] = useState(true);
  const [hideADP, setHideADP] = useState(true);
  const [hideAge, setHideAge] = useState(true);
  const [adps, setADPs] = useState([]);
  const [newLS, setNewLS] = useState(false)
  const [email, setEmail] = useState('')
  const [isValidEmail, setIsValidEmail] = useState()
  const [finalTableData, setFinalTableData] = useState([])    // This has to be a useState hook in order to have "Hide Players" feature on DataTable
  // const [showPerGP, setShowPerGP] = useState(false);
  // const [draftView, setDraftView] = useState(false)

  const [selectedRows, setSelectedRows] = useState([]);
	const [toggleCleared, setToggleCleared] = useState(false);


  const { register, watch, control, reset, handleSubmit, errors, setValue } = useForm();
  let tablePosFilter = watch("tablePosFilter");
  let season = watch("seasonSelect");
  let perGPSelect = watch("perGPSelect");
  let tableView = watch("tableViewSelect");
  let draftView = false;
  let lsID = props.lsID;
  let colData = props.colData;
  let seasonID = season;
  let league = 'NHL';
  let tableColtoSortBy = "Rank";

  // Standard settings to use for data parsing here
  let group2Filters = ['G']
  let group2Cats = ['GS', 'W', 'L', 'GA', 'GAA', 'SA', 'SV', 'SV%', 'SO']
  let leagueCats = ['G', 'A', 'PTS', '+/-', 'PIM', 'PPG', 'PPA', 'PPP', 'SHG', 'SHA', 'SHP', 'GWG', 'SOG', 'FOW', 'FOL', 'HIT', 'BLK', 'GS', 'W', 'L', 'GA', 'GAA', 'SA', 'SV', 'SV%', 'SO']
  let yahooStandardCats = ['G', 'A', '+/-', 'PPP', 'SOG', 'HIT', 'W', 'GAA', 'SV%', 'SO']
  let rateStats = ["GAA", "SV%"]

  let standardYahooBool = false;

  // Checks if lsID value is different than previous value
  const onRefChange = useCallback(
    (node) => {
      // console.log(node);
      return true;
    },
    [lsID]
  );

  const defaultYahooStatPull = async () => {
    setLoading(true)

    lsID = "12_002_001_0"

    if (firstRender.current) {
      // console.log('Setting standard yahoo cats for first load')
      standardYahooBool = true;
      tablePosFilter = "Overall"  
    } else {
      // all of the above do not need to be set again
    }

    let initColData = []
    let colDataObj = {}

    for (let cat in leagueCats) {
      colDataObj = {}
      colDataObj.name = leagueCats[cat]
      colDataObj.dataRef1 = leagueCats[cat] + " VORP"
      colDataObj.dataRef2 = leagueCats[cat] + " perGP VORP"
      colDataObj.omitTotal = true   // these are set in setTableCols()
      colDataObj.omitperGP = true   // this is set in setTableCols()

      if (yahooStandardCats.includes(leagueCats[cat])) {
        colDataObj.active = true
      } else {
        colDataObj.active = false
      }
      
      initColData.push(colDataObj)
    }

    initColData.Name = { dataRef: 'fullName' }
    initColData.Rank = { dataRef: 'vorp_rank' }
    initColData.Rank_pergp = { dataRef: 'vorp_pergp_rank' }
    initColData['Scoring Type'] = 'Categories' 
    initColData.VORP = { dataRef: 'vorp' }
    initColData.VORP_pergp = { dataRef: 'vorp_pergp' }

    // // console.log(initColData)
    colData = initColData;
    if (seasonID == null) {
      seasonID = 'ProjVORPs'
    }

    if (tableData[seasonID] == null) { 
      // console.log('tableData[' + seasonID + '] is null, need new season data for default settings')
      
      // console.log('getting data from api')
      const t0 = new Date().getTime()
  
      fetchPlayerData()
        .then(data => {
          if (data) {
            setNewLS(false);
            const t1 = new Date().getTime()
            data.responseTime = `${t1-t0} ms`
            setTableData(data)
          } else if (!data) {
            submitRequestedLSID(lsID)
              .then(() => {
                // User Message and Input Triggered
                setNewLS(true);
                setLoading(false)
              })
            tableData = {};
            setFinalTableData([])
          }      
        })
        .catch(() => {
          console.error
          setNewLS(true);
        })
  
    } else {
      // console.log('already have ' + seasonID + ' data for default settings')
      setTableData()
    }



    // Reset lsID to avoid "lsID changed" error
    lsID = ""
  }

  const regVORPDataPull = async() => {
    const t0 = new Date().getTime()
    fetchPlayerData()
      .then(data => {
        if (data) {
          newLS = false;
          const t1 = new Date().getTime()
          data.responseTime = `${t1-t0} ms`
          // redis.set(`playerData`, data) 
          setTableData(data)
        } else if (!data) {
          submitRequestedLSID(lsID)
          // User Message and Input Triggered

          setNewLS(true);
          setLoading(false);
          tableData = {};
          setFinalTableData([])
        }
        // setPlayerData(data)  // BUG: If you use this setter, and use playerData for setTableData, the table stops showing the correct dataset...
        // addADP(data)
      })
      .catch(console.error)
  }

  let lsIDChanged_Flag = false;   // need this so I can use this state... without calling the function again...seems like I should probably use REACT STATES lol... TODO
  const lsIDChanged = () => {        
    if (lsID.length == 0) {
      // console.log('lsID is unassigned')
      lsIDChanged_Flag = false;
      return false
    } else if (lsIDcompare == lsID) {
      // console.log('lsID did not change')
      lsIDcompare = lsID
      lsIDChanged_Flag = false;
      return false
    } else {
      // console.log('lsID changed')
      lsIDcompare = lsID
      lsIDChanged_Flag = true;
      tableData = {}          // CLEAR OUT ALL TABLE DATA
      setFinalTableData([]);  // CLEAR OUT ALL TABLE DATA
      return true
    }
  }

  const wait = delay => new Promise(resolve => setTimeout(resolve, delay));

  const checkIfNewDataNecessary = () => {
    // console.log('lsID: "' +lsID+ '"', typeof lsID)

    // 1. Check if lsID has changed
    if (lsIDChanged()) {
      // 2. Check if seasonID is valid
      if ((typeof seasonID == 'undefined')) {
        // console.log('ERROR: seasonID {' + seasonID + '} is not valid')
        return false
        // Removed this for now to make it work...
      // } else if (((lsID == "") || (lsID.length > 12) || (lsID.length <= 10)) && lsIDcompare != "12_002_001_0") {
      //   // 2b. Check if lsID is valid
      //   console.log('ERROR: lsID is not valid')
      //   return false
      } else {
        return true
      }
    } else {

      // If this is still Default lsID (has not been set by user yet)
      if (lsID.length == 0) {
        defaultYahooStatPull()
        return false; // don't pull again, and without "default" data
      } else {
        // Check if this season data already exists
        if (tableData[seasonID] == null) {
          // console.log('tableData[' + seasonID + '] is null, need new season data')
          return true
        } else {
          // console.log('already have ' + seasonID + ' data for lsID: ' + lsID)
          setLoading(true)
          setTableData()
          return false // you already have this data! don't need to pull it
        }
      }
    }
  }

  // const handleEmailValidation = email => {
  //   console.log("ValidateEmail was called with", email);

  //   const isValid = isValidEmail(email);

  //   const validityChanged =
  //     (errors.email && isValid) || (!errors.email && !isValid);
  //   if (validityChanged) {
  //     console.log("Fire tracker with", isValid ? "Valid" : "Invalid");
  //   }

  //   return isValid;
  // };

  const submitRequestedLSID = async (formData) => {
    let userEmail = formData.lsRequestEmail
    let userSubscribe = formData.radioSubscribe
    let leagueSettingID = lsID
    const { data, error } = await supabase
        .from('RequestedLeagueSettings')
        .insert([{ lsID: leagueSettingID, email: userEmail, subscribeType: userSubscribe}])
    if (error) {
      // console.log('error')
      console.log(error.message)
      alert('Uh oh, looks there was an issue with submitting your request. Try refreshing the page and submitting again. If the issue persists, please submit the issue to hello@fantasyvorp.com')
      return // abort
    }
    // console.log('lsID request submitted')
    if (userEmail != null) {
      alert('Your email has been submitted! You will be notified by email as soon as your specific league data is live (usually within a few hours).')
    }
    return data;
  }

  const ensureDraftViewSettings = () => {
    if (tableView == "Draft" && draftView == false) {
      draftView = true;
    } else if (tableView == "Stats" && draftView == true) {
      draftView = false;
    }

    if (draftView == true) {
      seasonID = 'ProjVORPs'
    }
  }

  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      // console.log('first render')
      defaultYahooStatPull()
      return;
    }
    // console.log('next renders')

    if (checkIfNewDataNecessary()) {
      setLoading(true)
      // console.log('Fetching data from API')
      regVORPDataPull()
    } else {
      // console.log('Getting data locally')
    }

    // console.log(newLS)
  }, [props.lsID, season, perGPSelect, tablePosFilter, tableView])  // hidePosRnk, hideAge, 
  

  const setTableCols = (colData) => {
    // console.log('setTableCols')
    // console.log(colData)

    let showPerGP = false;
    if (perGPSelect == "perGP" && showPerGP == false) {
      showPerGP = true;
    } else if (perGPSelect == "Season" && showPerGP == false){
      showPerGP = false;
    }

    if (showPerGP == true) {
      tableColtoSortBy = "RankperGP"
    } else {
      tableColtoSortBy = "Rank"
    }

    tableTitle = '';
    if (draftView) {
      tableTitle += 'Draft Data ';
    } else {
      tableTitle += 'Stats '
    }
    if (seasonID == "ProjVORPs") {
      tableTitle += '(22-23 Projection): ';
    } else {
      tableTitle += '(' + season + '): '
    }
    if (tablePosFilter == "None") {
      tableTitle += "All Positions"
    } else {
      tableTitle += tablePosFilter + " VORP / "
    }
    if (showPerGP) {
      tableTitle += 'Per Game'
    } else {
      tableTitle += 'Full Season'
    }

    tableTitle2 = '';
    tableTitle3 = '';    

    // Also set League Settings DataTable title
    let catSettings = props.catSettings
    let posSettings = props.posSettings

    let teams = lsID.substring(0, 2);   // this is used in ADP Diff col as well
    if (lsID == null || lsID == "") {
      teams = '12';
    }
    tableTitle2 += teams + ' Teams - '
    for (let pos in posSettings) {
      if (posSettings[pos] != 0) {
        tableTitle2 += posSettings[pos] + pos + ', '
      }
    }
    tableTitle2 = tableTitle2.slice(0, -2);

    let scoringType;
    let ignoreCols = [
      'Scoring Type', 'Name', 'Rank', 'Rank_pergp', 'VORP', 'VORP_pergp'
    ]
    colData['Rank'] = {}
    colData['Rank_pergp'] = {}
    colData['Name'] = {}
    colData['VORP'] = {}
    colData['VORP_pergp'] = {}


    // Set Column hide/show Bools

    // COL GROUP A (CONSISTENT)
    // HideCheckbox, Rank, Name, Team, Pos, VORP
    
    // COL GROUP B (DRAFT)
    // ADP, Diff, PS, PosRnk 

    // COL GROUP C (STATS)
    // AllStats

    // COL GROUP D (individual toggles)
    // GP, Age?, VPos?, PosRank

    let group2View = false;

    if (group2Filters.includes(tablePosFilter)) {
      group2View = true;
    }

    let draftColTotalBool;
    let draftColperGPBool;
    let statsCol_1_totals_bool;
    let statsCol_1_perGP_bool;
    let statsCol_2_totals_bool;
    let statsCol_2_perGP_bool;

    if (draftView) {
      statsCol_1_totals_bool = false;
      statsCol_1_perGP_bool = false;
      statsCol_2_totals_bool = false;
      statsCol_2_perGP_bool = false;

      if (showPerGP) {
        draftColTotalBool = false;
        draftColperGPBool = true;
      } else {
        draftColTotalBool = true;
        draftColperGPBool = false;
      }
    } else {
      draftColTotalBool = false;
      draftColperGPBool = false;

      if (group2View) {
        statsCol_1_totals_bool = false;
        statsCol_1_perGP_bool = false;

        if (showPerGP) {
          statsCol_2_totals_bool = false;
          statsCol_2_perGP_bool = true;  
        } else {
          statsCol_2_totals_bool = true;
          statsCol_2_perGP_bool = false;  
        }
      } else {
        if (showPerGP) {
          statsCol_2_totals_bool = false;
          statsCol_2_perGP_bool = true;  
          statsCol_1_totals_bool = false;
          statsCol_1_perGP_bool = true;
        } else {
          statsCol_2_totals_bool = true;
          statsCol_2_perGP_bool = false;  
          statsCol_1_totals_bool = true;
          statsCol_1_perGP_bool = false;
        }
      }
    }


    if (colData["Scoring Type"] == "Categories") {
      tableTitle3 += "Categories - "
      colData['Rank']['dataRef'] = 'vorp_rank'
      colData['Rank_pergp']['dataRef'] = 'vorp_pergp_rank'
      colData['Name']['dataRef'] = 'fullName'
      colData['VORP']['dataRef'] = 'vorp'
      colData['VORP_pergp']['dataRef'] = 'vorp_pergp'

      for (let col in colData) {
        if (!ignoreCols.includes(col)) {
          if (colData[col]['active'] == true) {
            if (rateStats.includes(colData[col]["name"])) {
              colData[col]['omitTotal'] = draftView
            } else {
              if (group2Cats.includes(colData[col]["name"])) {
                colData[col]['omitTotal'] = !statsCol_2_totals_bool
                colData[col]['omitperGP'] = !statsCol_2_perGP_bool
              } else {
                colData[col]['omitTotal'] = !statsCol_1_totals_bool
                colData[col]['omitperGP'] = !statsCol_1_perGP_bool
              }
            }
          } else {
            colData[col]['omitTotal'] = true
            colData[col]['omitperGP'] = true
          }
        }
      }
      for (let cat in catSettings) {
        if (catSettings[cat]["Status"] == 1) {
          tableTitle3 += cat + ', '
        }
      }
      tableTitle3 = tableTitle3.slice(0, -2);

    } else if (colData["Scoring Type"] == "Points") {  // Points League
      tableTitle3 += "Points - "
      colData['Rank']['dataRef'] = 'FanPts Rank'
      colData['Rank_pergp']['dataRef'] = 'FanPts_perGP Rank'
      colData['Name']['dataRef'] = 'Full Name'
      colData['VORP']['dataRef'] = 'VORP'
      colData['VORP_pergp']['dataRef'] = 'VORP_perGP'
      
      for (let col in colData) {
        if (!ignoreCols.includes(col)) {
          if (colData[col]['active'] == true) {
            if (rateStats.includes(col)) {
              colData[col]['omitTotal'] = draftView
            } else {
              if (group2Cats.includes(colData[col]["name"])) {
                colData[col]['omitTotal'] = !statsCol_2_totals_bool
                colData[col]['omitperGP'] = !statsCol_2_perGP_bool
              } else {
                colData[col]['omitTotal'] = !statsCol_1_totals_bool
                colData[col]['omitperGP'] = !statsCol_1_perGP_bool
              }
            }
          } else {
            colData[col]['omitTotal'] = true
            colData[col]['omitperGP'] = true
          }
        }
      }
      for (let cat in catSettings) {
        if (catSettings[cat]["Status"] == 1) {
          tableTitle3 += cat + ': ' + catSettings[cat]["Weight"] + ', '
        }
      }
      tableTitle3 = tableTitle3.slice(0, -2);
    }

    if (tableTitle2.length < 10) {
      tableTitle2 += "- 2C, 2LW, 2RW, 4D, 2G, 4BENCH"
      tableTitle3 += "- G, A, +/-, SOG, PPP, HIT, W, GAA, SV%, SO"
    };

    let pointsCheck = false;
    if (colData['Scoring Type'] == 'Points') {
      pointsCheck = true;
    }

    let posRankTotalBool = false;
    let posRankperGPBool = false;
    if (!hidePosRnk) {
      // console.log('show pos ranks')
      if (showPerGP) {
        posRankTotalBool = false;
        posRankperGPBool = true;
      } else {
        posRankTotalBool = true;
        posRankperGPBool = false;
      }
    }

    let positionScarcityBool = true;
    let positionScarcityperGPBool = false;
    if (showPerGP) {
      positionScarcityBool = false;
      positionScarcityperGPBool = true;
    } else {
      positionScarcityBool = true;
      positionScarcityperGPBool = false;
    }

    const columnPosLvl_4 = 'rgba(69, 128, 241, 0.9)';
    const columnPosLvl_3 = 'rgba(69, 128, 241, 0.65)';
    const columnPosLvl_2 = 'rgba(69, 128, 241, 0.4)';
    const columnPosLvl_1 = 'rgba(69, 128, 241, 0.15)';
    const columnNegLvl_1 = 'rgba(255, 84, 84, 0.15)';
    const columnNegLvl_2 = 'rgba(255, 84, 84, 0.4)';
    const columnNegLvl_3 = 'rgba(255, 84, 84, 0.65)';
    const columnNegLvl_4 = 'rgba(255, 84, 84, 0.9)';

    const colname_Rank_full = (
      <Tooltip title="Rank - Full Season" placement="top" disableFocusListener leaveDelay={200} maxwidth={200}>
        <span>RNK</span>
      </Tooltip>
    );
    const colname_Rank_pergp = (
      <Tooltip title="Rank - perGP" placement="top" disableFocusListener leaveDelay={200} maxwidth={200}>
        <span>RNK</span>
      </Tooltip>
    );
    const colname_Name = (
      <Tooltip title="Name (Red = Injury)" placement="top" disableFocusListener leaveDelay={200} maxwidth={200}>
        <span>Name</span>
      </Tooltip>
    );
    const colname_Pos = (
      <Tooltip title="Positions (Yahoo)" placement="top" disableFocusListener leaveDelay={200} maxwidth={200}>
        <span>Pos</span>
      </Tooltip>
    );
    const colname_VPos = (
      <Tooltip 
      title="VORP Position: Position for which VORP is calculated. If a player has multi-position capability, then they will have a unique VORP value calculated for each position." 
        placement="top" disableFocusListener leaveDelay={200} maxwidth={200}>
        <span>V-Pos</span>
      </Tooltip>
    );
    const colname_VORP_full = (
      <Tooltip title="Value Over Replacement Player/Position (Full Season). If a player has multi-position capability, then they will have a unique VORP calculated for each position. For 'Overall' VORP Position, the players' position with the greatest VORP is used. Read more about VORP calcs on the 'How Does This Work?' page!" placement="top" disableFocusListener leaveDelay={200} maxwidth={200}>
        <span>VORP</span>
      </Tooltip>
    );
    const colname_VORP_perGP = (
      <Tooltip title="Value Over Replacement Player (per GP). If a player has multi-position capability, then they will have a unique VORP calculated for each position. For 'Overall' VORP Position, the players' position with the greatest VORP is used. Read more about VORP calcs on the 'How Does This Work?' page!" placement="top" disableFocusListener leaveDelay={200} maxwidth={200}>
        <span>VORP</span>
      </Tooltip>
    );
    const colname_PS_full = (
      <Tooltip title="Positional Scarcity: The percentage of 'positive remaining value' in the position after that player is taken. This is useful to visualize how much value is remaining at each position for your draft." placement="top" disableFocusListener leaveDelay={200} maxwidth={200}>
        <span>PS</span>
      </Tooltip>
    );
    const colname_PS_perGP = (
      <Tooltip title="Positional Scarcity: The percentage of 'positive remaining value' in the position after that player is taken. This is useful to visualize how much value is remaining at each position for your draft." placement="top" disableFocusListener leaveDelay={200} maxwidth={200}>
        <span>PS</span>
      </Tooltip>
    );    
    const colname_PosRNK_full = (
      <Tooltip title="Positional Ranks - Full Season" placement="top" disableFocusListener leaveDelay={200} maxwidth={200}>
        <span>Pos RNK</span>
      </Tooltip>
    );
    const colname_PosRNK_perGP = (
      <Tooltip title="Positional Ranks - perGP" placement="top" disableFocusListener leaveDelay={200} maxwidth={200}>
        <span>Pos RNK</span>
      </Tooltip>
    );
    const colname_ADP = (
      <Tooltip title="ADP (Yahoo)" placement="top" disableFocusListener leaveDelay={200} maxwidth={200}>
        <span>ADP</span>
      </Tooltip>
    );
    let colname_GP = (
      <span>GP</span>
    );
    if (seasonID == 'ProjVORPs') {
      colname_GP = (
        <Tooltip title="Projected GP: Based on % of GP of Team's Total GP in past 3 seasons, then calculated using the same projection method as other data." placement="top" disableFocusListener leaveDelay={200} maxwidth={200}>
          <span>GP</span>
        </Tooltip>
      );
    }

    
    columns = [
      {
      name: colname_Rank_full,
      id: 'Rank',
      selector: row => row[colData['Rank']['dataRef']],
      sortable: true,
      width: '60px',
      omit: showPerGP,
      reorder: true,
      style: {
      }
      },
      {
        name: colname_Rank_pergp,
        id: 'RankperGP',
        selector: row => row[colData['Rank_pergp']['dataRef']],
        accessor: "age",
        sortable: true,
        width: '60px',
        reorder: true,
        omit: !showPerGP,
        style: {
        }
      },
      {
        name: colname_Name,
        selector: row => row[colData['Name']['dataRef']],
        sortable: false,
        maxwidth: '200px',
        reorder: true,
        style: {
          justifyContent: 'left'
        },
        conditionalCellStyles: [
          {
            when: row => (flaggedPlayers.includes(row.PlayerID)),
            style: {
              backgroundColor: '#D50000',
            }
          },
        ]
      },
      // {
      //   name: 'Age',
      //   selector: row => row.Age,
      //   sortable: false,
      //   width: dataColWidth01,
      //   omit: hideAge,
      // },
      {
        name: 'Team',
        selector: row => row.Team,
        sortable: false,
        width: "80px",
        style: {
          textTransform: 'uppercase',
        }
      },
      {
        name: colname_Pos,
        selector: row => row.PositionAll,
        sortable: false,
        width: '85px',
        style: {
          color: 'black',
          fontSize: '12px',
          fontWeight: '600',
        },
        conditionalCellStyles: [
          {
            when: row => ((row.PositionAll == 'C') || (row.PositionAll == 'F')),
            style: {
              backgroundColor: '#93d274',
            }
          },
          {
            when: row => ((row.PositionAll == 'LW') || (row.PositionAll == 'W')),
            style: {
              backgroundColor: '#f5df72',
            }
          },
          {
            when: row => row.PositionAll == 'RW',
            style: {
              backgroundColor: '#ff6963',
            }
          },
          {
            when: row => row.PositionAll == 'D',
            style: {
              backgroundColor: '#7bb3d6',
            }
          },
          {
            when: row => row.PositionAll == 'G',
            style: {
              backgroundColor: '#b875c8',
            } 
          },
          {
          when: row => (row.PositionAll == 'C, LW' || row.PositionAll == 'LW, RW' || row.PositionAll == 'C, RW' || row.PositionAll == 'C, LW, RW'),
            style: {
              backgroundColor: '#ffab44',
            } 
          },  
        ]
      },
      {
        name: colname_VPos,
        selector: row => row.VORPPosition,
        sortable: false,
        width: dataColWidth01,
        omit: !draftView,
        style: {
          color: 'black',
          fontWeight: '600',
          fontSize: '10px',
        },
        conditionalCellStyles: [
          {
            when: row => ((row.VORPPosition == 'C') || (row.VORPPosition == 'F')),
            style: {
              backgroundColor: '#93d274',
              opacity: '0.8'
            }
          },
          {
            when: row => ((row.VORPPosition == 'LW') || (row.VORPPosition == 'W')),
            style: {
              backgroundColor: '#f5df72',
              opacity: '0.8'
            }
          },
          {
            when: row => (row.VORPPosition == 'RW'),
            style: {
              backgroundColor: '#ff6963',
              opacity: '0.8'
            }
          },
          {
            when: row => row.VORPPosition == 'D',
            style: {
              backgroundColor: '#7bb3d6',
              opacity: '0.8'
            }
          },
          {
            when: row => row.VORPPosition == 'G',
            style: {
              backgroundColor: '#b875c8',
              opacity: '0.8'
            } 
          },
          {
            when: row => (row.VORPPosition == 'Overall' || row.VORPPosition == 'Overall perGP' ),
              style: {
                backgroundColor: 'rgba(255,255,255,0.14)',
                color: "white",
                opacity: '0.8'
              } 
          }
        ]
      },
      {
        name: colname_VORP_full,
        id: 'VORP',
        selector: row => row[colData['VORP']['dataRef']],
        sortable: true,
        width: '80px',
        omit: showPerGP,
        style: {
          fontWeight: '600',
          fontSize: '1rem',
          backgroundColor: 'rgba(255,255,255,0.08)'
        },
        conditionalCellStyles: [
          {
            when: row => (row[colData['VORP']['dataRef']] > -10000),
            style: {
              classNames: ['VORPcol', 'anotherclass'],
            },
          },
        ]
      },
      {
        name: colname_VORP_perGP, 
        id: 'VORP_perGP',
        selector: row => row[colData['VORP_pergp']['dataRef']],
        sortable: true,
        width: '80px',
        omit: !showPerGP,
        style: {
          fontWeight: '600',
          fontSize: '1rem',
          backgroundColor: 'rgba(255,255,255,0.08)'
        }
      },
      {
        name: colname_PS_full,
        selector: row => row.PosScarPct_Totals,
        sortable: true,
        width: '150px',
        omit: !draftColTotalBool,
        style: {
          backgroundColor: 'rgba(255,255,255,0.04)'
        },
        conditionalCellStyles: [
          {
            when: row => (row.PosScarPct_Totals >= '90'),
            classNames: ['psBorder', 'psBorder_90'],
            style: {
            },
          },
          {
            when: row => (row.PosScarPct_Totals >= '80' && row.PosScarPct_Totals < '90'),
            classNames: ['psBorder', 'psBorder_80'],
            style: {
            },
          },
          {
            when: row => (row.PosScarPct_Totals >= '70' && row.PosScarPct_Totals < '80'),
            classNames: ['psBorder', 'psBorder_70'],
            style: {
            },
          },
          {
            when: row => (row.PosScarPct_Totals >= '60' && row.PosScarPct_Totals < '70'),
            classNames: ['psBorder', 'psBorder_60'],
            style: {
            },
          },
          {
            when: row => (row.PosScarPct_Totals >= '50' && row.PosScarPct_Totals < '60'),
            classNames: ['psBorder', 'psBorder_50'],
            style: {
            },
          },
          {
            when: row => (row.PosScarPct_Totals >= '40' && row.PosScarPct_Totals < '50'),
            classNames: ['psBorder', 'psBorder_40'],
            style: {
            },
          },
          {
            when: row => (row.PosScarPct_Totals >= '30' && row.PosScarPct_Totals < '40'),
            classNames: ['psBorder', 'psBorder_30'],
            style: {
            },
          },
          {
            when: row => (row.PosScarPct_Totals >= '20' && row.PosScarPct_Totals < '30'),
            classNames: ['psBorder', 'psBorder_20'],
            style: {
            },
          },
          {
            when: row => (row.PosScarPct_Totals >= '10' && row.PosScarPct_Totals < '20'),
            classNames: ['psBorder', 'psBorder_10'],
            style: {
            },
          },
          {
            when: row => (row.PosScarPct_Totals >= '1' && row.PosScarPct_Totals < '10'),
            classNames: ['psBorder', 'psBorder_05'],
            style: {
            },
          },
        ]
      },
      {
        name: colname_PS_perGP,
        selector: row => row.PosScarPct_perGP,
        sortable: true,
        width: '150px',
        omit: !draftColperGPBool,
        style: {
          backgroundColor: 'rgba(255,255,255,0.04)'
        },
        conditionalCellStyles: [
          {
            when: row => (row.PosScarPct_perGP >= '90'),
            classNames: ['psBorder', 'psBorder_90'],
            style: {
            },
          },
          {
            when: row => (row.PosScarPct_perGP >= '80' && row.PosScarPct_perGP < '90'),
            classNames: ['psBorder', 'psBorder_80'],
            style: {
            },
          },
          {
            when: row => (row.PosScarPct_perGP >= '70' && row.PosScarPct_perGP < '80'),
            classNames: ['psBorder', 'psBorder_70'],
            style: {
            },
          },
          {
            when: row => (row.PosScarPct_perGP >= '60' && row.PosScarPct_perGP < '70'),
            classNames: ['psBorder', 'psBorder_60'],
            style: {
            },
          },
          {
            when: row => (row.PosScarPct_perGP >= '50' && row.PosScarPct_perGP < '60'),
            classNames: ['psBorder', 'psBorder_50'],
            style: {
            },
          },
          {
            when: row => (row.PosScarPct_perGP >= '40' && row.PosScarPct_perGP < '50'),
            classNames: ['psBorder', 'psBorder_40'],
            style: {
            },
          },
          {
            when: row => (row.PosScarPct_perGP >= '30' && row.PosScarPct_perGP < '40'),
            classNames: ['psBorder', 'psBorder_30'],
            style: {
            },
          },
          {
            when: row => (row.PosScarPct_perGP >= '20' && row.PosScarPct_perGP < '30'),
            classNames: ['psBorder', 'psBorder_20'],
            style: {
            },
          },
          {
            when: row => (row.PosScarPct_perGP >= '10' && row.PosScarPct_perGP < '20'),
            classNames: ['psBorder', 'psBorder_10'],
            style: {
            },
          },
          {
            when: row => (row.PosScarPct_perGP >= '1' && row.PosScarPct_perGP < '10'),
            classNames: ['psBorder', 'psBorder_05'],
            style: {
            },
          },
        ]
      },
      {
        name: colname_PosRNK_full,
        selector: row => row.PosRankAll,
        sortable: false,
        width: '140px',
        omit: !draftColTotalBool,  // TODO: Add hidePosRnk =>  Not sure how to have 2 conditions for this... (for "hide/show PosRank" toggle)
        style: {
          fontSize: '0.7rem',
        }
      },
      {
        name: colname_PosRNK_perGP,  // perGP
        selector: row => row.PosRankAll_perGP,
        sortable: false,
        width: '140px',
        omit: !draftColperGPBool, // TODO: Add hidePosRnk =>   Not sure how to have 2 conditions for this... (for "hide/show PosRank" toggle)
        style: {
          fontSize: '0.7rem',
        }
      },
      {
        name: colname_ADP,
        selector: row => row.playerAvgPick,
        sortable: true,
        width: '60px',
        omit: !draftView,
        style: {
          fontSize: '0.7rem',
          fontWeight: '400',
        }
      },
      {
        name: 'Diff',
        selector: row => row.TotalsADPDiff,
        sortable: true,
        width: dataColWidth01,
        omit: !draftColTotalBool,
        style: {
        },
        conditionalCellStyles: [
          {
            when: row => (row.TotalsADPDiff >= (teams*2.5)),
            style: {
              backgroundColor: columnPosLvl_4
            },
          },
          {
            when: row => (row.TotalsADPDiff >= (teams*1.75) && row.TotalsADPDiff < (teams*2.5)),
            style: {
              backgroundColor: columnPosLvl_3
            },
          },
          {
            when: row => (row.TotalsADPDiff >= (teams*1) && row.TotalsADPDiff < (teams*1.75)),
            style: {
              backgroundColor: columnPosLvl_2
            },
          },
          {
            when: row => (row.TotalsADPDiff <= (teams*(-1)) && row.TotalsADPDiff > (teams*(-1.75))),
            style: {
              backgroundColor: columnNegLvl_2
            },
          },
          {
            when: row => (row.TotalsADPDiff <= (teams*(-1.75)) && row.TotalsADPDiff > (teams*(-2.5))),
            style: {
              backgroundColor: columnNegLvl_2
            },
          },
          {
            when: row => (row.TotalsADPDiff <= (teams*(-2.5))),
            style: {
              backgroundColor: columnNegLvl_4
            },
          },
          {
            when: row => (row.TotalsADPDiff == null),
            style: {
              backgroundColor: 'rgba(0,0,0,0)'
            },
          },

        ]
      },
      {
        name: 'Diff',  // PerGP
        selector: row => row.PerGPADPDiff,
        sortable: true,
        width: dataColWidth01,
        omit: !draftColperGPBool,
        style: {
        },
        conditionalCellStyles: [
          {
            when: row => (row.TotalsADPDiff >= (teams*2.5)),
            style: {
              backgroundColor: columnPosLvl_4
            },
          },
          {
            when: row => (row.TotalsADPDiff >= (teams*1.75) && row.TotalsADPDiff < (teams*2.5)),
            style: {
              backgroundColor: columnPosLvl_3
            },
          },
          {
            when: row => (row.TotalsADPDiff >= (teams*1) && row.TotalsADPDiff < (teams*1.75)),
            style: {
              backgroundColor: columnPosLvl_2
            },
          },
          {
            when: row => (row.TotalsADPDiff <= (teams*(-1)) && row.TotalsADPDiff > (teams*(-1.75))),
            style: {
              backgroundColor: columnNegLvl_2
            },
          },
          {
            when: row => (row.TotalsADPDiff <= (teams*(-1.75)) && row.TotalsADPDiff > (teams*(-2.5))),
            style: {
              backgroundColor: columnNegLvl_3
            },
          },
          {
            when: row => (row.TotalsADPDiff <= (teams*(-2.5))),
            style: {
              backgroundColor: columnNegLvl_4
            },
          },
          {
            when: row => (row.TotalsADPDiff == null),
            style: {
              backgroundColor: 'rgba(0,0,0,0)'
            },
          },

        ]
      },
      {
        name: colname_GP,
        selector: row => row.GP,
        sortable: true,
        width: '80px',
        omit: draftView,
        style: {
          // fontSize: '0.9rem',
          justifyContent: 'center'
        }
      },
      {
        name: colData[0]['name'],
        selector: row => row[colData[0]['dataRef1']],
        sortable: true,
        width: dataColWidth01,
        omit: colData[0]['omitTotal'],
        conditionalCellStyles: [
          {
            when: row => ((row[colData[0]['dataRef1']] >= '3') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_4,
            },
          },
          {
            when: row => ((row[colData[0]['dataRef1']] < '3') && (row[colData[0]['dataRef1']] >= '2') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_3,
            },
          },
          {
            when: row => ((row[colData[0]['dataRef1']] < '2') && (row[colData[0]['dataRef1']] >= '1') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_2,
            },
          },
          {
            when: row => ((row[colData[0]['dataRef1']] < '1') && (row[colData[0]['dataRef1']] > '0') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_1,
            },
          },
          {
            when: row => ((row[colData[0]['dataRef1']] < '0') && (row[colData[0]['dataRef1']] >= '-1') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_1,
            },
          },
          {
            when: row => ((row[colData[0]['dataRef1']] < '-1') && (row[colData[0]['dataRef1']] >= '-2') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_2,
            },
          },
          {
            when: row => ((row[colData[0]['dataRef1']] < '-2') && (row[colData[0]['dataRef1']] >= '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_3,
            },
          },
          {
            when: row => ((row[colData[0]['dataRef1']] < '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_4,
            },
          }
        ]
      },
      {
        name: colData[0]['name'],
        selector: row => row[colData[0]['dataRef2']],
        sortable: true,
        width: dataColWidth01,
        omit: colData[0]['omitperGP'],
        conditionalCellStyles: [
          {
            when: row => ((row[colData[0]['dataRef2']] >= '3') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_4,
            },
          },
          {
            when: row => ((row[colData[0]['dataRef2']] < '3') && (row[colData[0]['dataRef2']] >= '2') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_3,
            },
          },
          {
            when: row => ((row[colData[0]['dataRef2']] < '2') && (row[colData[0]['dataRef2']] >= '1') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_2,
            },
          },
          {
            when: row => ((row[colData[0]['dataRef2']] < '1') && (row[colData[0]['dataRef2']] > '0') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_1,
            },
          },
          {
            when: row => ((row[colData[0]['dataRef2']] < '0') && (row[colData[0]['dataRef2']] >= '-1') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_1,
            },
          },
          {
            when: row => ((row[colData[0]['dataRef2']] < '-1') && (row[colData[0]['dataRef2']] >= '-2') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_2,
            },
          },
          {
            when: row => ((row[colData[0]['dataRef2']] < '-2') && (row[colData[0]['dataRef2']] >= '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_3,
            },
          },
          {
            when: row => ((row[colData[0]['dataRef2']] < '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_4,
            },
          }
        ]
      },
      {
        name: colData[1]['name'],
        selector: row => row[colData[1]['dataRef1']],
        sortable: true,
        width: dataColWidth01,
        omit: colData[1]['omitTotal'],
        conditionalCellStyles: [
          {
            when: row => ((row[colData[1]['dataRef1']] >= '3') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_4,
            },
          },
          {
            when: row => ((row[colData[1]['dataRef1']] < '3') && (row[colData[1]['dataRef1']] >= '2') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_3,
            },
          },
          {
            when: row => ((row[colData[1]['dataRef1']] < '2') && (row[colData[1]['dataRef1']] >= '1') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_2,
            },
          },
          {
            when: row => ((row[colData[1]['dataRef1']] < '1') && (row[colData[1]['dataRef1']] > '0') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_1,
            },
          },
          {
            when: row => ((row[colData[1]['dataRef1']] < '0') && (row[colData[1]['dataRef1']] >= '-1') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_1,
            },
          },
          {
            when: row => ((row[colData[1]['dataRef1']] < '-1') && (row[colData[1]['dataRef1']] >= '-2') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_2,
            },
          },
          {
            when: row => ((row[colData[1]['dataRef1']] < '-2') && (row[colData[1]['dataRef1']] >= '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_3,
            },
          },
          {
            when: row => ((row[colData[1]['dataRef1']] < '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_4,
            },
          }
        ]
      },
      {
        name: colData[1]['name'],
        selector: row => row[colData[1]['dataRef2']],
        sortable: true,
        width: dataColWidth01,
        omit: colData[1]['omitperGP'],
        conditionalCellStyles: [
          {
            when: row => ((row[colData[1]['dataRef2']] >= '3') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_4,
            },
          },
          {
            when: row => ((row[colData[1]['dataRef2']] < '3') && (row[colData[1]['dataRef2']] >= '2') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_3,
            },
          },
          {
            when: row => ((row[colData[1]['dataRef2']] < '2') && (row[colData[1]['dataRef2']] >= '1') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_2,
            },
          },
          {
            when: row => ((row[colData[1]['dataRef2']] < '1') && (row[colData[1]['dataRef2']] > '0') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_1,
            },
          },
          {
            when: row => ((row[colData[1]['dataRef2']] < '0') && (row[colData[1]['dataRef2']] >= '-1') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_1,
            },
          },
          {
            when: row => ((row[colData[1]['dataRef2']] < '-1') && (row[colData[1]['dataRef2']] >= '-2') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_2,
            },
          },
          {
            when: row => ((row[colData[1]['dataRef2']] < '-2') && (row[colData[1]['dataRef2']] >= '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_3,
            },
          },
          {
            when: row => ((row[colData[1]['dataRef2']] < '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_4,
            },
          }
        ]
      },
      {
        name: colData[2]['name'],
        selector: row => row[colData[2]['dataRef1']],
        sortable: true,
        width: dataColWidth01,
        omit: colData[2]['omitTotal'],
        conditionalCellStyles: [
          {
            when: row => ((row[colData[2]['dataRef1']] >= '3') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_4,
            },
          },
          {
            when: row => ((row[colData[2]['dataRef1']] < '3') && (row[colData[2]['dataRef1']] >= '2') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_3,
            },
          },
          {
            when: row => ((row[colData[2]['dataRef1']] < '2') && (row[colData[2]['dataRef1']] >= '1') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_2,
            },
          },
          {
            when: row => ((row[colData[2]['dataRef1']] < '1') && (row[colData[2]['dataRef1']] > '0') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_1,
            },
          },
          {
            when: row => ((row[colData[2]['dataRef1']] < '0') && (row[colData[2]['dataRef1']] >= '-1') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_1,
            },
          },
          {
            when: row => ((row[colData[2]['dataRef1']] < '-1') && (row[colData[2]['dataRef1']] >= '-2') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_2,
            },
          },
          {
            when: row => ((row[colData[2]['dataRef1']] < '-2') && (row[colData[2]['dataRef1']] >= '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_3,
            },
          },
          {
            when: row => ((row[colData[2]['dataRef1']] < '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_4,
            },
          }
        ]
      },
      {
        name: colData[2]['name'],
        selector: row => row[colData[2]['dataRef2']],
        sortable: true,
        width: dataColWidth01,
        omit: colData[2]['omitperGP'],
        conditionalCellStyles: [
          {
            when: row => ((row[colData[2]['dataRef2']] >= '3') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_4,
            },
          },
          {
            when: row => ((row[colData[2]['dataRef2']] < '3') && (row[colData[2]['dataRef2']] >= '2') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_3,
            },
          },
          {
            when: row => ((row[colData[2]['dataRef2']] < '2') && (row[colData[2]['dataRef2']] >= '1') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_2,
            },
          },
          {
            when: row => ((row[colData[2]['dataRef2']] < '1') && (row[colData[2]['dataRef2']] > '0') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_1,
            },
          },
          {
            when: row => ((row[colData[2]['dataRef2']] < '0') && (row[colData[2]['dataRef2']] >= '-1') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_1,
            },
          },
          {
            when: row => ((row[colData[2]['dataRef2']] < '-1') && (row[colData[2]['dataRef2']] >= '-2') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_2,
            },
          },
          {
            when: row => ((row[colData[2]['dataRef2']] < '-2') && (row[colData[2]['dataRef2']] >= '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_3,
            },
          },
          {
            when: row => ((row[colData[2]['dataRef2']] < '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_4,
            },
          }
        ]
      },
      {
        name: colData[3]['name'],
        selector: row => row[colData[3]['dataRef1']],
        sortable: true,
        width: dataColWidth01,
        omit: colData[3]['omitTotal'],
        conditionalCellStyles: [
          {
            when: row => ((row[colData[3]['dataRef1']] >= '3') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_4,
            },
          },
          {
            when: row => ((row[colData[3]['dataRef1']] < '3') && (row[colData[3]['dataRef1']] >= '2') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_3,
            },
          },
          {
            when: row => ((row[colData[3]['dataRef1']] < '2') && (row[colData[3]['dataRef1']] >= '1') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_2,
            },
          },
          {
            when: row => ((row[colData[3]['dataRef1']] < '1') && (row[colData[3]['dataRef1']] > '0') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_1,
            },
          },
          {
            when: row => ((row[colData[3]['dataRef1']] < '0') && (row[colData[3]['dataRef1']] >= '-1') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_1,
            },
          },
          {
            when: row => ((row[colData[3]['dataRef1']] < '-1') && (row[colData[3]['dataRef1']] >= '-2') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_2,
            },
          },
          {
            when: row => ((row[colData[3]['dataRef1']] < '-2') && (row[colData[3]['dataRef1']] >= '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_3,
            },
          },
          {
            when: row => ((row[colData[3]['dataRef1']] < '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_4,
            },
          }
        ]
      },
      {
        name: colData[3]['name'],
        selector: row => row[colData[3]['dataRef2']],
        sortable: true,
        width: dataColWidth01,
        omit: colData[3]['omitperGP'],
        conditionalCellStyles: [
          {
            when: row => ((row[colData[3]['dataRef2']] >= '3') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_4,
            },
          },
          {
            when: row => ((row[colData[3]['dataRef2']] < '3') && (row[colData[3]['dataRef2']] >= '2') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_3,
            },
          },
          {
            when: row => ((row[colData[3]['dataRef2']] < '2') && (row[colData[3]['dataRef2']] >= '1') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_2,
            },
          },
          {
            when: row => ((row[colData[3]['dataRef2']] < '1') && (row[colData[3]['dataRef2']] > '0') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_1,
            },
          },
          {
            when: row => ((row[colData[3]['dataRef2']] < '0') && (row[colData[3]['dataRef2']] >= '-1') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_1,
            },
          },
          {
            when: row => ((row[colData[3]['dataRef2']] < '-1') && (row[colData[3]['dataRef2']] >= '-2') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_2,
            },
          },
          {
            when: row => ((row[colData[3]['dataRef2']] < '-2') && (row[colData[3]['dataRef2']] >= '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_3,
            },
          },
          {
            when: row => ((row[colData[3]['dataRef2']] < '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_4,
            },
          }
        ]
      },
      {
        name: colData[4]['name'],
        selector: row => row[colData[4]['dataRef1']],
        sortable: true,
        width: dataColWidth01,
        omit: colData[4]['omitTotal'],
        conditionalCellStyles: [
          {
            when: row => ((row[colData[4]['dataRef1']] >= '3') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_4,
            },
          },
          {
            when: row => ((row[colData[4]['dataRef1']] < '3') && (row[colData[4]['dataRef1']] >= '2') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_3,
            },
          },
          {
            when: row => ((row[colData[4]['dataRef1']] < '2') && (row[colData[4]['dataRef1']] >= '1') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_2,
            },
          },
          {
            when: row => ((row[colData[4]['dataRef1']] < '1') && (row[colData[4]['dataRef1']] > '0') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_1,
            },
          },
          {
            when: row => ((row[colData[4]['dataRef1']] < '0') && (row[colData[4]['dataRef1']] >= '-1') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_1,
            },
          },
          {
            when: row => ((row[colData[4]['dataRef1']] < '-1') && (row[colData[4]['dataRef1']] >= '-2') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_2,
            },
          },
          {
            when: row => ((row[colData[4]['dataRef1']] < '-2') && (row[colData[4]['dataRef1']] >= '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_3,
            },
          },
          {
            when: row => ((row[colData[4]['dataRef1']] < '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_4,
            },
          }
        ]
      },
      {
        name: colData[4]['name'],
        selector: row => row[colData[4]['dataRef2']],
        sortable: true,
        width: dataColWidth01,
        omit: colData[4]['omitperGP'],
        conditionalCellStyles: [
          {
            when: row => ((row[colData[4]['dataRef2']] >= '3') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_4,
            },
          },
          {
            when: row => ((row[colData[4]['dataRef2']] < '3') && (row[colData[4]['dataRef2']] >= '2') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_3,
            },
          },
          {
            when: row => ((row[colData[4]['dataRef2']] < '2') && (row[colData[4]['dataRef2']] >= '1') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_2,
            },
          },
          {
            when: row => ((row[colData[4]['dataRef2']] < '1') && (row[colData[4]['dataRef2']] > '0') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_1,
            },
          },
          {
            when: row => ((row[colData[4]['dataRef2']] < '0') && (row[colData[4]['dataRef2']] >= '-1') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_1,
            },
          },
          {
            when: row => ((row[colData[4]['dataRef2']] < '-1') && (row[colData[4]['dataRef2']] >= '-2') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_2,
            },
          },
          {
            when: row => ((row[colData[4]['dataRef2']] < '-2') && (row[colData[4]['dataRef2']] >= '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_3,
            },
          },
          {
            when: row => ((row[colData[4]['dataRef2']] < '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_4,
            },
          }
        ]
      },
      {
        name: colData[5]['name'],
        selector: row => row[colData[5]['dataRef1']],
        sortable: true,
        width: dataColWidth01,
        omit: colData[5]['omitTotal'],
        conditionalCellStyles: [
          {
            when: row => ((row[colData[5]['dataRef1']] >= '3') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_4,
            },
          },
          {
            when: row => ((row[colData[5]['dataRef1']] < '3') && (row[colData[5]['dataRef1']] >= '2') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_3,
            },
          },
          {
            when: row => ((row[colData[5]['dataRef1']] < '2') && (row[colData[5]['dataRef1']] >= '1') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_2,
            },
          },
          {
            when: row => ((row[colData[5]['dataRef1']] < '1') && (row[colData[5]['dataRef1']] > '0') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_1,
            },
          },
          {
            when: row => ((row[colData[5]['dataRef1']] < '0') && (row[colData[5]['dataRef1']] >= '-1') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_1,
            },
          },
          {
            when: row => ((row[colData[5]['dataRef1']] < '-1') && (row[colData[5]['dataRef1']] >= '-2') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_2,
            },
          },
          {
            when: row => ((row[colData[5]['dataRef1']] < '-2') && (row[colData[5]['dataRef1']] >= '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_3,
            },
          },
          {
            when: row => ((row[colData[5]['dataRef1']] < '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_4,
            },
          }
        ]
      },
      {
        name: colData[5]['name'],
        selector: row => row[colData[5]['dataRef2']],
        sortable: true,
        width: dataColWidth01,
        omit: colData[5]['omitperGP'],
        conditionalCellStyles: [
          {
            when: row => ((row[colData[5]['dataRef2']] >= '3') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_4,
            },
          },
          {
            when: row => ((row[colData[5]['dataRef2']] < '3') && (row[colData[5]['dataRef2']] >= '2') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_3,
            },
          },
          {
            when: row => ((row[colData[5]['dataRef2']] < '2') && (row[colData[5]['dataRef2']] >= '1') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_2,
            },
          },
          {
            when: row => ((row[colData[5]['dataRef2']] < '1') && (row[colData[5]['dataRef2']] > '0') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_1,
            },
          },
          {
            when: row => ((row[colData[5]['dataRef2']] < '0') && (row[colData[5]['dataRef2']] >= '-1') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_1,
            },
          },
          {
            when: row => ((row[colData[5]['dataRef2']] < '-1') && (row[colData[5]['dataRef2']] >= '-2') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_2,
            },
          },
          {
            when: row => ((row[colData[5]['dataRef2']] < '-2') && (row[colData[5]['dataRef2']] >= '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_3,
            },
          },
          {
            when: row => ((row[colData[5]['dataRef2']] < '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_4,
            },
          }
        ]
      },
      {
        name: colData[6]['name'],
        selector: row => row[colData[6]['dataRef1']],
        sortable: true,
        width: dataColWidth01,
        omit: colData[6]['omitTotal'],
        conditionalCellStyles: [
          {
            when: row => ((row[colData[6]['dataRef1']] >= '3') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_4,
            },
          },
          {
            when: row => ((row[colData[6]['dataRef1']] < '3') && (row[colData[6]['dataRef1']] >= '2') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_3,
            },
          },
          {
            when: row => ((row[colData[6]['dataRef1']] < '2') && (row[colData[6]['dataRef1']] >= '1') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_2,
            },
          },
          {
            when: row => ((row[colData[6]['dataRef1']] < '1') && (row[colData[6]['dataRef1']] > '0') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_1,
            },
          },
          {
            when: row => ((row[colData[6]['dataRef1']] < '0') && (row[colData[6]['dataRef1']] >= '-1') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_1,
            },
          },
          {
            when: row => ((row[colData[6]['dataRef1']] < '-1') && (row[colData[6]['dataRef1']] >= '-2') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_2,
            },
          },
          {
            when: row => ((row[colData[6]['dataRef1']] < '-2') && (row[colData[6]['dataRef1']] >= '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_3,
            },
          },
          {
            when: row => ((row[colData[6]['dataRef1']] < '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_4,
            },
          }
        ]
      },
      {
        name: colData[6]['name'],
        selector: row => row[colData[6]['dataRef2']],
        sortable: true,
        width: dataColWidth01,
        omit: colData[6]['omitperGP'],
        conditionalCellStyles: [
          {
            when: row => ((row[colData[6]['dataRef2']] >= '3') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_4,
            },
          },
          {
            when: row => ((row[colData[6]['dataRef2']] < '3') && (row[colData[6]['dataRef2']] >= '2') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_3,
            },
          },
          {
            when: row => ((row[colData[6]['dataRef2']] < '2') && (row[colData[6]['dataRef2']] >= '1') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_2,
            },
          },
          {
            when: row => ((row[colData[6]['dataRef2']] < '1') && (row[colData[6]['dataRef2']] > '0') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_1,
            },
          },
          {
            when: row => ((row[colData[6]['dataRef2']] < '0') && (row[colData[6]['dataRef2']] >= '-1') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_1,
            },
          },
          {
            when: row => ((row[colData[6]['dataRef2']] < '-1') && (row[colData[6]['dataRef2']] >= '-2') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_2,
            },
          },
          {
            when: row => ((row[colData[6]['dataRef2']] < '-2') && (row[colData[6]['dataRef2']] >= '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_3,
            },
          },
          {
            when: row => ((row[colData[6]['dataRef2']] < '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_4,
            },
          }
        ]
      },
      {
        name: colData[7]['name'],
        selector: row => row[colData[7]['dataRef1']],
        sortable: true,
        width: dataColWidth01,
        omit: colData[7]['omitTotal'],
        conditionalCellStyles: [
          {
            when: row => ((row[colData[7]['dataRef1']] >= '3') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_4,
            },
          },
          {
            when: row => ((row[colData[7]['dataRef1']] < '3') && (row[colData[7]['dataRef1']] >= '2') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_3,
            },
          },
          {
            when: row => ((row[colData[7]['dataRef1']] < '2') && (row[colData[7]['dataRef1']] >= '1') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_2,
            },
          },
          {
            when: row => ((row[colData[7]['dataRef1']] < '1') && (row[colData[7]['dataRef1']] > '0') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_1,
            },
          },
          {
            when: row => ((row[colData[7]['dataRef1']] < '0') && (row[colData[7]['dataRef1']] >= '-1') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_1,
            },
          },
          {
            when: row => ((row[colData[7]['dataRef1']] < '-1') && (row[colData[7]['dataRef1']] >= '-2') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_2,
            },
          },
          {
            when: row => ((row[colData[7]['dataRef1']] < '-2') && (row[colData[7]['dataRef1']] >= '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_3,
            },
          },
          {
            when: row => ((row[colData[7]['dataRef1']] < '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_4,
            },
          }
        ]
      },
      {
        name: colData[7]['name'],
        selector: row => row[colData[7]['dataRef2']],
        sortable: true,
        width: dataColWidth01,
        omit: colData[7]['omitperGP'],
        conditionalCellStyles: [
          {
            when: row => ((row[colData[7]['dataRef2']] >= '3') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_4,
            },
          },
          {
            when: row => ((row[colData[7]['dataRef2']] < '3') && (row[colData[7]['dataRef2']] >= '2') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_3,
            },
          },
          {
            when: row => ((row[colData[7]['dataRef2']] < '2') && (row[colData[7]['dataRef2']] >= '1') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_2,
            },
          },
          {
            when: row => ((row[colData[7]['dataRef2']] < '1') && (row[colData[7]['dataRef2']] > '0') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_1,
            },
          },
          {
            when: row => ((row[colData[7]['dataRef2']] < '0') && (row[colData[7]['dataRef2']] >= '-1') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_1,
            },
          },
          {
            when: row => ((row[colData[7]['dataRef2']] < '-1') && (row[colData[7]['dataRef2']] >= '-2') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_2,
            },
          },
          {
            when: row => ((row[colData[7]['dataRef2']] < '-2') && (row[colData[7]['dataRef2']] >= '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_3,
            },
          },
          {
            when: row => ((row[colData[7]['dataRef2']] < '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_4,
            },
          }
        ]
      },
      {
        name: colData[8]['name'],
        selector: row => row[colData[8]['dataRef1']],
        sortable: true,
        width: dataColWidth01,
        omit: colData[8]['omitTotal'],
        conditionalCellStyles: [
          {
            when: row => ((row[colData[8]['dataRef1']] >= '3') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_4,
            },
          },
          {
            when: row => ((row[colData[8]['dataRef1']] < '3') && (row[colData[8]['dataRef1']] >= '2') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_3,
            },
          },
          {
            when: row => ((row[colData[8]['dataRef1']] < '2') && (row[colData[8]['dataRef1']] >= '1') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_2,
            },
          },
          {
            when: row => ((row[colData[8]['dataRef1']] < '1') && (row[colData[8]['dataRef1']] > '0') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_1,
            },
          },
          {
            when: row => ((row[colData[8]['dataRef1']] < '0') && (row[colData[8]['dataRef1']] >= '-1') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_1,
            },
          },
          {
            when: row => ((row[colData[8]['dataRef1']] < '-1') && (row[colData[8]['dataRef1']] >= '-2') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_2,
            },
          },
          {
            when: row => ((row[colData[8]['dataRef1']] < '-2') && (row[colData[8]['dataRef1']] >= '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_3,
            },
          },
          {
            when: row => ((row[colData[8]['dataRef1']] < '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_4,
            },
          }
        ]
      },
      {
        name: colData[8]['name'],
        selector: row => row[colData[8]['dataRef2']],
        sortable: true,
        width: dataColWidth01,
        omit: colData[8]['omitperGP'],
        conditionalCellStyles: [
          {
            when: row => ((row[colData[8]['dataRef2']] >= '3') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_4,
            },
          },
          {
            when: row => ((row[colData[8]['dataRef2']] < '3') && (row[colData[8]['dataRef2']] >= '2') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_3,
            },
          },
          {
            when: row => ((row[colData[8]['dataRef2']] < '2') && (row[colData[8]['dataRef2']] >= '1') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_2,
            },
          },
          {
            when: row => ((row[colData[8]['dataRef2']] < '1') && (row[colData[8]['dataRef2']] > '0') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_1,
            },
          },
          {
            when: row => ((row[colData[8]['dataRef2']] < '0') && (row[colData[8]['dataRef2']] >= '-1') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_1,
            },
          },
          {
            when: row => ((row[colData[8]['dataRef2']] < '-1') && (row[colData[8]['dataRef2']] >= '-2') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_2,
            },
          },
          {
            when: row => ((row[colData[8]['dataRef2']] < '-2') && (row[colData[8]['dataRef2']] >= '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_3,
            },
          },
          {
            when: row => ((row[colData[8]['dataRef2']] < '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_4,
            },
          }
        ]
      },
      {
        name: colData[9]['name'],
        selector: row => row[colData[9]['dataRef1']],
        sortable: true,
        width: dataColWidth01,
        omit: colData[9]['omitTotal'],
        conditionalCellStyles: [
          {
            when: row => ((row[colData[9]['dataRef1']] >= '3') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_4,
            },
          },
          {
            when: row => ((row[colData[9]['dataRef1']] < '3') && (row[colData[9]['dataRef1']] >= '2') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_3,
            },
          },
          {
            when: row => ((row[colData[9]['dataRef1']] < '2') && (row[colData[9]['dataRef1']] >= '1') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_2,
            },
          },
          {
            when: row => ((row[colData[9]['dataRef1']] < '1') && (row[colData[9]['dataRef1']] > '0') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_1,
            },
          },
          {
            when: row => ((row[colData[9]['dataRef1']] < '0') && (row[colData[9]['dataRef1']] >= '-1') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_1,
            },
          },
          {
            when: row => ((row[colData[9]['dataRef1']] < '-1') && (row[colData[9]['dataRef1']] >= '-2') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_2,
            },
          },
          {
            when: row => ((row[colData[9]['dataRef1']] < '-2') && (row[colData[9]['dataRef1']] >= '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_3,
            },
          },
          {
            when: row => ((row[colData[9]['dataRef1']] < '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_4,
            },
          }
        ]
      },
      {
        name: colData[9]['name'],
        selector: row => row[colData[9]['dataRef2']],
        sortable: true,
        width: dataColWidth01,
        omit: colData[9]['omitperGP'],
        conditionalCellStyles: [
          {
            when: row => ((row[colData[9]['dataRef2']] >= '3') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_4,
            },
          },
          {
            when: row => ((row[colData[9]['dataRef2']] < '3') && (row[colData[9]['dataRef2']] >= '2') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_3,
            },
          },
          {
            when: row => ((row[colData[9]['dataRef2']] < '2') && (row[colData[9]['dataRef2']] >= '1') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_2,
            },
          },
          {
            when: row => ((row[colData[9]['dataRef2']] < '1') && (row[colData[9]['dataRef2']] > '0') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_1,
            },
          },
          {
            when: row => ((row[colData[9]['dataRef2']] < '0') && (row[colData[9]['dataRef2']] >= '-1') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_1,
            },
          },
          {
            when: row => ((row[colData[9]['dataRef2']] < '-1') && (row[colData[9]['dataRef2']] >= '-2') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_2,
            },
          },
          {
            when: row => ((row[colData[9]['dataRef2']] < '-2') && (row[colData[9]['dataRef2']] >= '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_3,
            },
          },
          {
            when: row => ((row[colData[9]['dataRef2']] < '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_4,
            },
          }
        ]
      },
      {
        name: colData[10]['name'],
        selector: row => row[colData[10]['dataRef1']],
        sortable: true,
        width: dataColWidth01,
        omit: colData[10]['omitTotal'],
        conditionalCellStyles: [
          {
            when: row => ((row[colData[10]['dataRef1']] >= '3') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_4,
            },
          },
          {
            when: row => ((row[colData[10]['dataRef1']] < '3') && (row[colData[10]['dataRef1']] >= '2') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_3,
            },
          },
          {
            when: row => ((row[colData[10]['dataRef1']] < '2') && (row[colData[10]['dataRef1']] >= '1') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_2,
            },
          },
          {
            when: row => ((row[colData[10]['dataRef1']] < '1') && (row[colData[10]['dataRef1']] > '0') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_1,
            },
          },
          {
            when: row => ((row[colData[10]['dataRef1']] < '0') && (row[colData[10]['dataRef1']] >= '-1') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_1,
            },
          },
          {
            when: row => ((row[colData[10]['dataRef1']] < '-1') && (row[colData[10]['dataRef1']] >= '-2') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_2,
            },
          },
          {
            when: row => ((row[colData[10]['dataRef1']] < '-2') && (row[colData[10]['dataRef1']] >= '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_3,
            },
          },
          {
            when: row => ((row[colData[10]['dataRef1']] < '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_4,
            },
          }
        ]
      },
      {
        name: colData[10]['name'],
        selector: row => row[colData[10]['dataRef2']],
        sortable: true,
        width: dataColWidth01,
        omit: colData[10]['omitperGP'],
        conditionalCellStyles: [
          {
            when: row => ((row[colData[10]['dataRef2']] >= '3') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_4,
            },
          },
          {
            when: row => ((row[colData[10]['dataRef2']] < '3') && (row[colData[10]['dataRef2']] >= '2') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_3,
            },
          },
          {
            when: row => ((row[colData[10]['dataRef2']] < '2') && (row[colData[10]['dataRef2']] >= '1') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_2,
            },
          },
          {
            when: row => ((row[colData[10]['dataRef2']] < '1') && (row[colData[10]['dataRef2']] > '0') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_1,
            },
          },
          {
            when: row => ((row[colData[10]['dataRef2']] < '0') && (row[colData[10]['dataRef2']] >= '-1') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_1,
            },
          },
          {
            when: row => ((row[colData[10]['dataRef2']] < '-1') && (row[colData[10]['dataRef2']] >= '-2') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_2,
            },
          },
          {
            when: row => ((row[colData[10]['dataRef2']] < '-2') && (row[colData[10]['dataRef2']] >= '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_3,
            },
          },
          {
            when: row => ((row[colData[10]['dataRef2']] < '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_4,
            },
          }
        ]
      },
      {
        name: colData[11]['name'],
        selector: row => row[colData[11]['dataRef1']],
        sortable: true,
        width: dataColWidth01,
        omit: colData[11]['omitTotal'],
        conditionalCellStyles: [
          {
            when: row => ((row[colData[11]['dataRef1']] >= '3') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_4,
            },
          },
          {
            when: row => ((row[colData[11]['dataRef1']] < '3') && (row[colData[11]['dataRef1']] >= '2') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_3,
            },
          },
          {
            when: row => ((row[colData[11]['dataRef1']] < '2') && (row[colData[11]['dataRef1']] >= '1') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_2,
            },
          },
          {
            when: row => ((row[colData[11]['dataRef1']] < '1') && (row[colData[11]['dataRef1']] > '0') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_1,
            },
          },
          {
            when: row => ((row[colData[11]['dataRef1']] < '0') && (row[colData[11]['dataRef1']] >= '-1') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_1,
            },
          },
          {
            when: row => ((row[colData[11]['dataRef1']] < '-1') && (row[colData[11]['dataRef1']] >= '-2') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_2,
            },
          },
          {
            when: row => ((row[colData[11]['dataRef1']] < '-2') && (row[colData[11]['dataRef1']] >= '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_3,
            },
          },
          {
            when: row => ((row[colData[11]['dataRef1']] < '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_4,
            },
          }
        ]
      },
      {
        name: colData[11]['name'],
        selector: row => row[colData[11]['dataRef2']],
        sortable: true,
        width: dataColWidth01,
        omit: colData[11]['omitperGP'],
        conditionalCellStyles: [
          {
            when: row => ((row[colData[11]['dataRef2']] >= '3') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_4,
            },
          },
          {
            when: row => ((row[colData[11]['dataRef2']] < '3') && (row[colData[11]['dataRef2']] >= '2') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_3,
            },
          },
          {
            when: row => ((row[colData[11]['dataRef2']] < '2') && (row[colData[11]['dataRef2']] >= '1') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_2,
            },
          },
          {
            when: row => ((row[colData[11]['dataRef2']] < '1') && (row[colData[11]['dataRef2']] > '0') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_1,
            },
          },
          {
            when: row => ((row[colData[11]['dataRef2']] < '0') && (row[colData[11]['dataRef2']] >= '-1') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_1,
            },
          },
          {
            when: row => ((row[colData[11]['dataRef2']] < '-1') && (row[colData[11]['dataRef2']] >= '-2') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_2,
            },
          },
          {
            when: row => ((row[colData[11]['dataRef2']] < '-2') && (row[colData[11]['dataRef2']] >= '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_3,
            },
          },
          {
            when: row => ((row[colData[11]['dataRef2']] < '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_4,
            },
          }
        ]
      },
      {
        name: colData[12]['name'],
        selector: row => row[colData[12]['dataRef1']],
        sortable: true,
        width: dataColWidth01,
        omit: colData[12]['omitTotal'],
        conditionalCellStyles: [
          {
            when: row => ((row[colData[12]['dataRef1']] >= '3') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_4,
            },
          },
          {
            when: row => ((row[colData[12]['dataRef1']] < '3') && (row[colData[12]['dataRef1']] >= '2') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_3,
            },
          },
          {
            when: row => ((row[colData[12]['dataRef1']] < '2') && (row[colData[12]['dataRef1']] >= '1') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_2,
            },
          },
          {
            when: row => ((row[colData[12]['dataRef1']] < '1') && (row[colData[12]['dataRef1']] > '0') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_1,
            },
          },
          {
            when: row => ((row[colData[12]['dataRef1']] < '0') && (row[colData[12]['dataRef1']] >= '-1') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_1,
            },
          },
          {
            when: row => ((row[colData[12]['dataRef1']] < '-1') && (row[colData[12]['dataRef1']] >= '-2') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_2,
            },
          },
          {
            when: row => ((row[colData[12]['dataRef1']] < '-2') && (row[colData[12]['dataRef1']] >= '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_3,
            },
          },
          {
            when: row => ((row[colData[12]['dataRef1']] < '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_4,
            },
          }
        ]
      },
      {
        name: colData[12]['name'],
        selector: row => row[colData[12]['dataRef2']],
        sortable: true,
        width: dataColWidth01,
        omit: colData[12]['omitperGP'],
        conditionalCellStyles: [
          {
            when: row => ((row[colData[12]['dataRef2']] >= '3') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_4,
            },
          },
          {
            when: row => ((row[colData[12]['dataRef2']] < '3') && (row[colData[12]['dataRef2']] >= '2') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_3,
            },
          },
          {
            when: row => ((row[colData[12]['dataRef2']] < '2') && (row[colData[12]['dataRef2']] >= '1') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_2,
            },
          },
          {
            when: row => ((row[colData[12]['dataRef2']] < '1') && (row[colData[12]['dataRef2']] > '0') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_1,
            },
          },
          {
            when: row => ((row[colData[12]['dataRef2']] < '0') && (row[colData[12]['dataRef2']] >= '-1') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_1,
            },
          },
          {
            when: row => ((row[colData[12]['dataRef2']] < '-1') && (row[colData[12]['dataRef2']] >= '-2') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_2,
            },
          },
          {
            when: row => ((row[colData[12]['dataRef2']] < '-2') && (row[colData[12]['dataRef2']] >= '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_3,
            },
          },
          {
            when: row => ((row[colData[12]['dataRef2']] < '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_4,
            },
          }
        ]
      },
      {
        name: colData[13]['name'],
        selector: row => row[colData[13]['dataRef1']],
        sortable: true,
        width: dataColWidth01,
        omit: colData[13]['omitTotal'],
        conditionalCellStyles: [
          {
            when: row => ((row[colData[13]['dataRef1']] >= '3') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_4,
            },
          },
          {
            when: row => ((row[colData[13]['dataRef1']] < '3') && (row[colData[13]['dataRef1']] >= '2') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_3,
            },
          },
          {
            when: row => ((row[colData[13]['dataRef1']] < '2') && (row[colData[13]['dataRef1']] >= '1') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_2,
            },
          },
          {
            when: row => ((row[colData[13]['dataRef1']] < '1') && (row[colData[13]['dataRef1']] > '0') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_1,
            },
          },
          {
            when: row => ((row[colData[13]['dataRef1']] < '0') && (row[colData[13]['dataRef1']] >= '-1') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_1,
            },
          },
          {
            when: row => ((row[colData[13]['dataRef1']] < '-1') && (row[colData[13]['dataRef1']] >= '-2') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_2,
            },
          },
          {
            when: row => ((row[colData[13]['dataRef1']] < '-2') && (row[colData[13]['dataRef1']] >= '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_3,
            },
          },
          {
            when: row => ((row[colData[13]['dataRef1']] < '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_4,
            },
          }
        ]
      },
      {
        name: colData[13]['name'],
        selector: row => row[colData[13]['dataRef2']],
        sortable: true,
        width: dataColWidth01,
        omit: colData[13]['omitperGP'],
        conditionalCellStyles: [
          {
            when: row => ((row[colData[13]['dataRef2']] >= '3') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_4,
            },
          },
          {
            when: row => ((row[colData[13]['dataRef2']] < '3') && (row[colData[13]['dataRef2']] >= '2') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_3,
            },
          },
          {
            when: row => ((row[colData[13]['dataRef2']] < '2') && (row[colData[13]['dataRef2']] >= '1') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_2,
            },
          },
          {
            when: row => ((row[colData[13]['dataRef2']] < '1') && (row[colData[13]['dataRef2']] > '0') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_1,
            },
          },
          {
            when: row => ((row[colData[13]['dataRef2']] < '0') && (row[colData[13]['dataRef2']] >= '-1') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_1,
            },
          },
          {
            when: row => ((row[colData[13]['dataRef2']] < '-1') && (row[colData[13]['dataRef2']] >= '-2') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_2,
            },
          },
          {
            when: row => ((row[colData[13]['dataRef2']] < '-2') && (row[colData[13]['dataRef2']] >= '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_3,
            },
          },
          {
            when: row => ((row[colData[13]['dataRef2']] < '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_4,
            },
          }
        ]
      },
      {
        name: colData[14]['name'],
        selector: row => row[colData[14]['dataRef1']],
        sortable: true,
        width: dataColWidth01,
        omit: colData[14]['omitTotal'],
        conditionalCellStyles: [
          {
            when: row => ((row[colData[14]['dataRef1']] >= '3') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_4,
            },
          },
          {
            when: row => ((row[colData[14]['dataRef1']] < '3') && (row[colData[14]['dataRef1']] >= '2') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_3,
            },
          },
          {
            when: row => ((row[colData[14]['dataRef1']] < '2') && (row[colData[14]['dataRef1']] >= '1') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_2,
            },
          },
          {
            when: row => ((row[colData[14]['dataRef1']] < '1') && (row[colData[14]['dataRef1']] > '0') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_1,
            },
          },
          {
            when: row => ((row[colData[14]['dataRef1']] < '0') && (row[colData[14]['dataRef1']] >= '-1') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_1,
            },
          },
          {
            when: row => ((row[colData[14]['dataRef1']] < '-1') && (row[colData[14]['dataRef1']] >= '-2') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_2,
            },
          },
          {
            when: row => ((row[colData[14]['dataRef1']] < '-2') && (row[colData[14]['dataRef1']] >= '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_3,
            },
          },
          {
            when: row => ((row[colData[14]['dataRef1']] < '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_4,
            },
          }
        ]
      },
      {
        name: colData[14]['name'],
        selector: row => row[colData[14]['dataRef2']],
        sortable: true,
        width: dataColWidth01,
        omit: colData[14]['omitperGP'],
        conditionalCellStyles: [
          {
            when: row => ((row[colData[14]['dataRef2']] >= '3') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_4,
            },
          },
          {
            when: row => ((row[colData[14]['dataRef2']] < '3') && (row[colData[14]['dataRef2']] >= '2') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_3,
            },
          },
          {
            when: row => ((row[colData[14]['dataRef2']] < '2') && (row[colData[14]['dataRef2']] >= '1') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_2,
            },
          },
          {
            when: row => ((row[colData[14]['dataRef2']] < '1') && (row[colData[14]['dataRef2']] > '0') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_1,
            },
          },
          {
            when: row => ((row[colData[14]['dataRef2']] < '0') && (row[colData[14]['dataRef2']] >= '-1') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_1,
            },
          },
          {
            when: row => ((row[colData[14]['dataRef2']] < '-1') && (row[colData[14]['dataRef2']] >= '-2') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_2,
            },
          },
          {
            when: row => ((row[colData[14]['dataRef2']] < '-2') && (row[colData[14]['dataRef2']] >= '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_3,
            },
          },
          {
            when: row => ((row[colData[14]['dataRef2']] < '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_4,
            },
          }
        ]
      },
      {
        name: colData[15]['name'],
        selector: row => row[colData[15]['dataRef1']],
        sortable: true,
        width: dataColWidth01,
        omit: colData[15]['omitTotal'],
        conditionalCellStyles: [
          {
            when: row => ((row[colData[15]['dataRef1']] >= '3') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_4,
            },
          },
          {
            when: row => ((row[colData[15]['dataRef1']] < '3') && (row[colData[15]['dataRef1']] >= '2') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_3,
            },
          },
          {
            when: row => ((row[colData[15]['dataRef1']] < '2') && (row[colData[15]['dataRef1']] >= '1') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_2,
            },
          },
          {
            when: row => ((row[colData[15]['dataRef1']] < '1') && (row[colData[15]['dataRef1']] > '0') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_1,
            },
          },
          {
            when: row => ((row[colData[15]['dataRef1']] < '0') && (row[colData[15]['dataRef1']] >= '-1') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_1,
            },
          },
          {
            when: row => ((row[colData[15]['dataRef1']] < '-1') && (row[colData[15]['dataRef1']] >= '-2') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_2,
            },
          },
          {
            when: row => ((row[colData[15]['dataRef1']] < '-2') && (row[colData[15]['dataRef1']] >= '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_3,
            },
          },
          {
            when: row => ((row[colData[15]['dataRef1']] < '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_4,
            },
          }
        ]
      },
      {
        name: colData[15]['name'],
        selector: row => row[colData[15]['dataRef2']],
        sortable: true,
        width: dataColWidth01,
        omit: colData[15]['omitperGP'],
        conditionalCellStyles: [
          {
            when: row => ((row[colData[15]['dataRef2']] >= '3') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_4,
            },
          },
          {
            when: row => ((row[colData[15]['dataRef2']] < '3') && (row[colData[15]['dataRef2']] >= '2') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_3,
            },
          },
          {
            when: row => ((row[colData[15]['dataRef2']] < '2') && (row[colData[15]['dataRef2']] >= '1') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_2,
            },
          },
          {
            when: row => ((row[colData[15]['dataRef2']] < '1') && (row[colData[15]['dataRef2']] > '0') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_1,
            },
          },
          {
            when: row => ((row[colData[15]['dataRef2']] < '0') && (row[colData[15]['dataRef2']] >= '-1') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_1,
            },
          },
          {
            when: row => ((row[colData[15]['dataRef2']] < '-1') && (row[colData[15]['dataRef2']] >= '-2') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_2,
            },
          },
          {
            when: row => ((row[colData[15]['dataRef2']] < '-2') && (row[colData[15]['dataRef2']] >= '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_3,
            },
          },
          {
            when: row => ((row[colData[15]['dataRef2']] < '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_4,
            },
          }
        ]
      },
      {
        name: colData[16]['name'],
        selector: row => row[colData[16]['dataRef1']],
        sortable: true,
        width: dataColWidth01,
        omit: colData[16]['omitTotal'],
        conditionalCellStyles: [
          {
            when: row => ((row[colData[16]['dataRef1']] >= '3') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_4,
            },
          },
          {
            when: row => ((row[colData[16]['dataRef1']] < '3') && (row[colData[16]['dataRef1']] >= '2') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_3,
            },
          },
          {
            when: row => ((row[colData[16]['dataRef1']] < '2') && (row[colData[16]['dataRef1']] >= '1') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_2,
            },
          },
          {
            when: row => ((row[colData[16]['dataRef1']] < '1') && (row[colData[16]['dataRef1']] > '0') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_1,
            },
          },
          {
            when: row => ((row[colData[16]['dataRef1']] < '0') && (row[colData[16]['dataRef1']] >= '-1') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_1,
            },
          },
          {
            when: row => ((row[colData[16]['dataRef1']] < '-1') && (row[colData[16]['dataRef1']] >= '-2') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_2,
            },
          },
          {
            when: row => ((row[colData[16]['dataRef1']] < '-2') && (row[colData[16]['dataRef1']] >= '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_3,
            },
          },
          {
            when: row => ((row[colData[16]['dataRef1']] < '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_4,
            },
          }
        ]
      },
      {
        name: colData[16]['name'],
        selector: row => row[colData[16]['dataRef2']],
        sortable: true,
        width: dataColWidth01,
        omit: colData[16]['omitperGP'],
        conditionalCellStyles: [
          {
            when: row => ((row[colData[16]['dataRef2']] >= '3') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_4,
            },
          },
          {
            when: row => ((row[colData[16]['dataRef2']] < '3') && (row[colData[16]['dataRef2']] >= '2') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_3,
            },
          },
          {
            when: row => ((row[colData[16]['dataRef2']] < '2') && (row[colData[16]['dataRef2']] >= '1') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_2,
            },
          },
          {
            when: row => ((row[colData[16]['dataRef2']] < '1') && (row[colData[16]['dataRef2']] > '0') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_1,
            },
          },
          {
            when: row => ((row[colData[16]['dataRef2']] < '0') && (row[colData[16]['dataRef2']] >= '-1') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_1,
            },
          },
          {
            when: row => ((row[colData[16]['dataRef2']] < '-1') && (row[colData[16]['dataRef2']] >= '-2') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_2,
            },
          },
          {
            when: row => ((row[colData[16]['dataRef2']] < '-2') && (row[colData[16]['dataRef2']] >= '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_3,
            },
          },
          {
            when: row => ((row[colData[16]['dataRef2']] < '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_4,
            },
          }
        ]
      },
      {
        name: colData[17]['name'],
        selector: row => row[colData[17]['dataRef1']],
        sortable: true,
        width: dataColWidth01,
        omit: colData[17]['omitTotal'],
        conditionalCellStyles: [
          {
            when: row => ((row[colData[17]['dataRef1']] >= '3') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_4,
            },
          },
          {
            when: row => ((row[colData[17]['dataRef1']] < '3') && (row[colData[17]['dataRef1']] >= '2') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_3,
            },
          },
          {
            when: row => ((row[colData[17]['dataRef1']] < '2') && (row[colData[17]['dataRef1']] >= '1') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_2,
            },
          },
          {
            when: row => ((row[colData[17]['dataRef1']] < '1') && (row[colData[17]['dataRef1']] > '0') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_1,
            },
          },
          {
            when: row => ((row[colData[17]['dataRef1']] < '0') && (row[colData[17]['dataRef1']] >= '-1') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_1,
            },
          },
          {
            when: row => ((row[colData[17]['dataRef1']] < '-1') && (row[colData[17]['dataRef1']] >= '-2') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_2,
            },
          },
          {
            when: row => ((row[colData[17]['dataRef1']] < '-2') && (row[colData[17]['dataRef1']] >= '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_3,
            },
          },
          {
            when: row => ((row[colData[17]['dataRef1']] < '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_4,
            },
          }
        ]
      },
      {
        name: colData[17]['name'],
        selector: row => row[colData[17]['dataRef2']],
        sortable: true,
        width: dataColWidth01,
        omit: colData[17]['omitperGP'],
        conditionalCellStyles: [
          {
            when: row => ((row[colData[17]['dataRef2']] >= '3') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_4,
            },
          },
          {
            when: row => ((row[colData[17]['dataRef2']] < '3') && (row[colData[17]['dataRef2']] >= '2') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_3,
            },
          },
          {
            when: row => ((row[colData[17]['dataRef2']] < '2') && (row[colData[17]['dataRef2']] >= '1') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_2,
            },
          },
          {
            when: row => ((row[colData[17]['dataRef2']] < '1') && (row[colData[17]['dataRef2']] > '0') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_1,
            },
          },
          {
            when: row => ((row[colData[17]['dataRef2']] < '0') && (row[colData[17]['dataRef2']] >= '-1') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_1,
            },
          },
          {
            when: row => ((row[colData[17]['dataRef2']] < '-1') && (row[colData[17]['dataRef2']] >= '-2') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_2,
            },
          },
          {
            when: row => ((row[colData[17]['dataRef2']] < '-2') && (row[colData[17]['dataRef2']] >= '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_3,
            },
          },
          {
            when: row => ((row[colData[17]['dataRef2']] < '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_4,
            },
          }
        ]
      },
      {
        name: colData[18]['name'],
        selector: row => row[colData[18]['dataRef1']],
        sortable: true,
        width: dataColWidth01,
        omit: colData[18]['omitTotal'],
        conditionalCellStyles: [
          {
            when: row => ((row[colData[18]['dataRef1']] >= '3') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_4,
            },
          },
          {
            when: row => ((row[colData[18]['dataRef1']] < '3') && (row[colData[18]['dataRef1']] >= '2') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_3,
            },
          },
          {
            when: row => ((row[colData[18]['dataRef1']] < '2') && (row[colData[18]['dataRef1']] >= '1') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_2,
            },
          },
          {
            when: row => ((row[colData[18]['dataRef1']] < '1') && (row[colData[18]['dataRef1']] > '0') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_1,
            },
          },
          {
            when: row => ((row[colData[18]['dataRef1']] < '0') && (row[colData[18]['dataRef1']] >= '-1') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_1,
            },
          },
          {
            when: row => ((row[colData[18]['dataRef1']] < '-1') && (row[colData[18]['dataRef1']] >= '-2') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_2,
            },
          },
          {
            when: row => ((row[colData[18]['dataRef1']] < '-2') && (row[colData[18]['dataRef1']] >= '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_3,
            },
          },
          {
            when: row => ((row[colData[18]['dataRef1']] < '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_4,
            },
          }
        ]
      },
      {
        name: colData[18]['name'],
        selector: row => row[colData[18]['dataRef2']],
        sortable: true,
        width: dataColWidth01,
        omit: colData[18]['omitperGP'],
        conditionalCellStyles: [
          {
            when: row => ((row[colData[18]['dataRef2']] >= '3') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_4,
            },
          },
          {
            when: row => ((row[colData[18]['dataRef2']] < '3') && (row[colData[18]['dataRef2']] >= '2') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_3,
            },
          },
          {
            when: row => ((row[colData[18]['dataRef2']] < '2') && (row[colData[18]['dataRef2']] >= '1') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_2,
            },
          },
          {
            when: row => ((row[colData[18]['dataRef2']] < '1') && (row[colData[18]['dataRef2']] > '0') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_1,
            },
          },
          {
            when: row => ((row[colData[18]['dataRef2']] < '0') && (row[colData[18]['dataRef2']] >= '-1') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_1,
            },
          },
          {
            when: row => ((row[colData[18]['dataRef2']] < '-1') && (row[colData[18]['dataRef2']] >= '-2') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_2,
            },
          },
          {
            when: row => ((row[colData[18]['dataRef2']] < '-2') && (row[colData[18]['dataRef2']] >= '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_3,
            },
          },
          {
            when: row => ((row[colData[18]['dataRef2']] < '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_4,
            },
          }
        ]
      },
      {
        name: colData[19]['name'],
        selector: row => row[colData[19]['dataRef1']],
        sortable: true,
        width: dataColWidth01,
        omit: colData[19]['omitTotal'],
        conditionalCellStyles: [
          {
            when: row => ((row[colData[19]['dataRef1']] >= '3') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_4,
            },
          },
          {
            when: row => ((row[colData[19]['dataRef1']] < '3') && (row[colData[19]['dataRef1']] >= '2') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_3,
            },
          },
          {
            when: row => ((row[colData[19]['dataRef1']] < '2') && (row[colData[19]['dataRef1']] >= '1') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_2,
            },
          },
          {
            when: row => ((row[colData[19]['dataRef1']] < '1') && (row[colData[19]['dataRef1']] > '0') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_1,
            },
          },
          {
            when: row => ((row[colData[19]['dataRef1']] < '0') && (row[colData[19]['dataRef1']] >= '-1') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_1,
            },
          },
          {
            when: row => ((row[colData[19]['dataRef1']] < '-1') && (row[colData[19]['dataRef1']] >= '-2') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_2,
            },
          },
          {
            when: row => ((row[colData[19]['dataRef1']] < '-2') && (row[colData[19]['dataRef1']] >= '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_3,
            },
          },
          {
            when: row => ((row[colData[19]['dataRef1']] < '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_4,
            },
          }
        ]
      },
      {
        name: colData[19]['name'],
        selector: row => row[colData[19]['dataRef2']],
        sortable: true,
        width: dataColWidth01,
        omit: colData[19]['omitperGP'],
        conditionalCellStyles: [
          {
            when: row => ((row[colData[19]['dataRef2']] >= '3') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_4,
            },
          },
          {
            when: row => ((row[colData[19]['dataRef2']] < '3') && (row[colData[19]['dataRef2']] >= '2') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_3,
            },
          },
          {
            when: row => ((row[colData[19]['dataRef2']] < '2') && (row[colData[19]['dataRef2']] >= '1') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_2,
            },
          },
          {
            when: row => ((row[colData[19]['dataRef2']] < '1') && (row[colData[19]['dataRef2']] > '0') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_1,
            },
          },
          {
            when: row => ((row[colData[19]['dataRef2']] < '0') && (row[colData[19]['dataRef2']] >= '-1') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_1,
            },
          },
          {
            when: row => ((row[colData[19]['dataRef2']] < '-1') && (row[colData[19]['dataRef2']] >= '-2') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_2,
            },
          },
          {
            when: row => ((row[colData[19]['dataRef2']] < '-2') && (row[colData[19]['dataRef2']] >= '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_3,
            },
          },
          {
            when: row => ((row[colData[19]['dataRef2']] < '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_4,
            },
          }
        ]
      },
      {
        name: colData[20]['name'],
        selector: row => row[colData[20]['dataRef1']],
        sortable: true,
        width: dataColWidth01,
        omit: colData[20]['omitTotal'],
        conditionalCellStyles: [
          {
            when: row => ((row[colData[20]['dataRef1']] >= '3') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_4,
            },
          },
          {
            when: row => ((row[colData[20]['dataRef1']] < '3') && (row[colData[20]['dataRef1']] >= '2') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_3,
            },
          },
          {
            when: row => ((row[colData[20]['dataRef1']] < '2') && (row[colData[20]['dataRef1']] >= '1') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_2,
            },
          },
          {
            when: row => ((row[colData[20]['dataRef1']] < '1') && (row[colData[20]['dataRef1']] > '0') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_1,
            },
          },
          {
            when: row => ((row[colData[20]['dataRef1']] < '0') && (row[colData[20]['dataRef1']] >= '-1') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_1,
            },
          },
          {
            when: row => ((row[colData[20]['dataRef1']] < '-1') && (row[colData[20]['dataRef1']] >= '-2') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_2,
            },
          },
          {
            when: row => ((row[colData[20]['dataRef1']] < '-2') && (row[colData[20]['dataRef1']] >= '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_3,
            },
          },
          {
            when: row => ((row[colData[20]['dataRef1']] < '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_4,
            },
          }
        ]
      },
      {
        name: colData[20]['name'],
        selector: row => row[colData[20]['dataRef2']],
        sortable: true,
        width: dataColWidth01,
        omit: colData[20]['omitperGP'],
        conditionalCellStyles: [
          {
            when: row => ((row[colData[20]['dataRef2']] >= '3') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_4,
            },
          },
          {
            when: row => ((row[colData[20]['dataRef2']] < '3') && (row[colData[20]['dataRef2']] >= '2') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_3,
            },
          },
          {
            when: row => ((row[colData[20]['dataRef2']] < '2') && (row[colData[20]['dataRef2']] >= '1') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_2,
            },
          },
          {
            when: row => ((row[colData[20]['dataRef2']] < '1') && (row[colData[20]['dataRef2']] > '0') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_1,
            },
          },
          {
            when: row => ((row[colData[20]['dataRef2']] < '0') && (row[colData[20]['dataRef2']] >= '-1') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_1,
            },
          },
          {
            when: row => ((row[colData[20]['dataRef2']] < '-1') && (row[colData[20]['dataRef2']] >= '-2') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_2,
            },
          },
          {
            when: row => ((row[colData[20]['dataRef2']] < '-2') && (row[colData[20]['dataRef2']] >= '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_3,
            },
          },
          {
            when: row => ((row[colData[20]['dataRef2']] < '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_4,
            },
          }
        ]
      },
      { // GAA
        name: colData[21]['name'],
        selector: row => row[colData[21]['dataRef1']],
        sortable: true,
        width: dataColWidth01,
        omit: colData[21]['omitTotal'],
        conditionalCellStyles: [
          {
            when: row => ((row[colData[21]['dataRef1']] >= '3') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_4,
            },
          },
          {
            when: row => ((row[colData[21]['dataRef1']] < '3') && (row[colData[21]['dataRef1']] >= '2') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_3,
            },
          },
          {
            when: row => ((row[colData[21]['dataRef1']] < '2') && (row[colData[21]['dataRef1']] >= '1') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_2,
            },
          },
          {
            when: row => ((row[colData[21]['dataRef1']] < '1') && (row[colData[21]['dataRef1']] > '0') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_1,
            },
          },
          {
            when: row => ((row[colData[21]['dataRef1']] < '0') && (row[colData[21]['dataRef1']] >= '-1') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_1,
            },
          },
          {
            when: row => ((row[colData[21]['dataRef1']] < '-1') && (row[colData[21]['dataRef1']] >= '-2') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_2,
            },
          },
          {
            when: row => ((row[colData[21]['dataRef1']] < '-2') && (row[colData[21]['dataRef1']] >= '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_3,
            },
          },
          {
            when: row => ((row[colData[21]['dataRef1']] < '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_4,
            },
          }
        ]
      },
      {
        name: colData[22]['name'],
        selector: row => row[colData[22]['dataRef2']],
        sortable: true,
        width: dataColWidth01,
        omit: colData[22]['omitTotal'],
        conditionalCellStyles: [
          {
            when: row => ((row[colData[22]['dataRef1']] >= '3') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_4,
            },
          },
          {
            when: row => ((row[colData[22]['dataRef1']] < '3') && (row[colData[22]['dataRef1']] >= '2') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_3,
            },
          },
          {
            when: row => ((row[colData[22]['dataRef1']] < '2') && (row[colData[22]['dataRef1']] >= '1') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_2,
            },
          },
          {
            when: row => ((row[colData[22]['dataRef1']] < '1') && (row[colData[22]['dataRef1']] > '0') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_1,
            },
          },
          {
            when: row => ((row[colData[22]['dataRef1']] < '0') && (row[colData[22]['dataRef1']] >= '-1') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_1,
            },
          },
          {
            when: row => ((row[colData[22]['dataRef1']] < '-1') && (row[colData[22]['dataRef1']] >= '-2') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_2,
            },
          },
          {
            when: row => ((row[colData[22]['dataRef1']] < '-2') && (row[colData[22]['dataRef1']] >= '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_3,
            },
          },
          {
            when: row => ((row[colData[22]['dataRef1']] < '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_4,
            },
          }
        ]
      },
      {
        name: colData[22]['name'],
        selector: row => row[colData[22]['dataRef2']],
        sortable: true,
        width: dataColWidth01,
        omit: colData[22]['omitperGP'],
        conditionalCellStyles: [
          {
            when: row => ((row[colData[22]['dataRef1']] >= '3') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_4,
            },
          },
          {
            when: row => ((row[colData[22]['dataRef1']] < '3') && (row[colData[22]['dataRef1']] >= '2') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_3,
            },
          },
          {
            when: row => ((row[colData[22]['dataRef1']] < '2') && (row[colData[22]['dataRef1']] >= '1') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_2,
            },
          },
          {
            when: row => ((row[colData[22]['dataRef1']] < '1') && (row[colData[22]['dataRef1']] > '0') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_1,
            },
          },
          {
            when: row => ((row[colData[22]['dataRef1']] < '0') && (row[colData[22]['dataRef1']] >= '-1') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_1,
            },
          },
          {
            when: row => ((row[colData[22]['dataRef1']] < '-1') && (row[colData[22]['dataRef1']] >= '-2') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_2,
            },
          },
          {
            when: row => ((row[colData[22]['dataRef2']] < '-2') && (row[colData[22]['dataRef2']] >= '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_3,
            },
          },
          {
            when: row => ((row[colData[22]['dataRef2']] < '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_4,
            },
          }
        ]
      },
      {
        name: colData[23]['name'],
        selector: row => row[colData[23]['dataRef2']],
        sortable: true,
        width: dataColWidth01,
        omit: colData[23]['omitTotal'],
        conditionalCellStyles: [
          {
            when: row => ((row[colData[23]['dataRef2']] >= '3') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_4,
            },
          },
          {
            when: row => ((row[colData[23]['dataRef2']] < '3') && (row[colData[23]['dataRef2']] >= '2') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_3,
            },
          },
          {
            when: row => ((row[colData[23]['dataRef2']] < '2') && (row[colData[23]['dataRef2']] >= '1') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_2,
            },
          },
          {
            when: row => ((row[colData[23]['dataRef2']] < '1') && (row[colData[23]['dataRef2']] > '0') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_1,
            },
          },
          {
            when: row => ((row[colData[23]['dataRef2']] < '0') && (row[colData[23]['dataRef2']] >= '-1') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_1,
            },
          },
          {
            when: row => ((row[colData[23]['dataRef2']] < '-1') && (row[colData[23]['dataRef2']] >= '-2') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_2,
            },
          },
          {
            when: row => ((row[colData[23]['dataRef1']] < '-2') && (row[colData[23]['dataRef1']] >= '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_3,
            },
          },
          {
            when: row => ((row[colData[23]['dataRef1']] < '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_4,
            },
          }
        ]
      },
      {
        name: colData[23]['name'],
        selector: row => row[colData[23]['dataRef2']],
        sortable: true,
        width: dataColWidth01,
        omit: colData[23]['omitperGP'],
        conditionalCellStyles: [
          {
            when: row => ((row[colData[23]['dataRef2']] >= '3') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_4,
            },
          },
          {
            when: row => ((row[colData[23]['dataRef2']] < '3') && (row[colData[23]['dataRef2']] >= '2') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_3,
            },
          },
          {
            when: row => ((row[colData[23]['dataRef2']] < '2') && (row[colData[23]['dataRef2']] >= '1') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_2,
            },
          },
          {
            when: row => ((row[colData[23]['dataRef2']] < '1') && (row[colData[23]['dataRef2']] > '0') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_1,
            },
          },
          {
            when: row => ((row[colData[23]['dataRef2']] < '0') && (row[colData[23]['dataRef2']] >= '-1') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_1,
            },
          },
          {
            when: row => ((row[colData[23]['dataRef2']] < '-1') && (row[colData[23]['dataRef2']] >= '-2') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_2,
            },
          },
          {
            when: row => ((row[colData[23]['dataRef2']] < '-2') && (row[colData[23]['dataRef2']] >= '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_3,
            },
          },
          {
            when: row => ((row[colData[23]['dataRef2']] < '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_4,
            },
          }
        ]
      },
      {  // SV%
        name: colData[24]['name'],
        selector: row => row[colData[24]['dataRef1']],
        sortable: true,
        width: dataColWidth01,
        omit: colData[24]['omitTotal'],
        conditionalCellStyles: [
          {
            when: row => ((row[colData[24]['dataRef1']] >= '3') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_4,
            },
          },
          {
            when: row => ((row[colData[24]['dataRef1']] < '3') && (row[colData[24]['dataRef1']] >= '2') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_3,
            },
          },
          {
            when: row => ((row[colData[24]['dataRef1']] < '2') && (row[colData[24]['dataRef1']] >= '1') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_2,
            },
          },
          {
            when: row => ((row[colData[24]['dataRef1']] < '1') && (row[colData[24]['dataRef1']] > '0') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_1,
            },
          },
          {
            when: row => ((row[colData[24]['dataRef1']] < '0') && (row[colData[24]['dataRef1']] >= '-1') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_1,
            },
          },
          {
            when: row => ((row[colData[24]['dataRef1']] < '-1') && (row[colData[24]['dataRef1']] >= '-2') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_2,
            },
          },
          {
            when: row => ((row[colData[24]['dataRef1']] < '-2') && (row[colData[24]['dataRef1']] >= '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_3,
            },
          },
          {
            when: row => ((row[colData[24]['dataRef1']] < '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_4,
            },
          }
        ]
      },
      {
        name: colData[25]['name'],
        selector: row => row[colData[25]['dataRef1']],
        sortable: true,
        width: dataColWidth01,
        omit: colData[25]['omitTotal'],
        conditionalCellStyles: [
          {
            when: row => ((row[colData[25]['dataRef1']] >= '3') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_4,
            },
          },
          {
            when: row => ((row[colData[25]['dataRef1']] < '3') && (row[colData[25]['dataRef1']] >= '2') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_3,
            },
          },
          {
            when: row => ((row[colData[25]['dataRef1']] < '2') && (row[colData[25]['dataRef1']] >= '1') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_2,
            },
          },
          {
            when: row => ((row[colData[25]['dataRef1']] < '1') && (row[colData[25]['dataRef1']] > '0') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_1,
            },
          },
          {
            when: row => ((row[colData[25]['dataRef1']] < '0') && (row[colData[25]['dataRef1']] >= '-1') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_1,
            },
          },
          {
            when: row => ((row[colData[25]['dataRef1']] < '-1') && (row[colData[25]['dataRef1']] >= '-2') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_2,
            },
          },
          {
            when: row => ((row[colData[25]['dataRef1']] < '-2') && (row[colData[25]['dataRef1']] >= '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_3,
            },
          },
          {
            when: row => ((row[colData[25]['dataRef1']] < '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_4,
            },
          }
        ]
      },
      {
        name: colData[25]['name'],
        selector: row => row[colData[25]['dataRef2']],
        sortable: true,
        width: dataColWidth01,
        omit: colData[25]['omitperGP'],
        conditionalCellStyles: [
          {
            when: row => ((row[colData[25]['dataRef2']] >= '3') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_4,
            },
          },
          {
            when: row => ((row[colData[25]['dataRef2']] < '3') && (row[colData[25]['dataRef2']] >= '2') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_3,
            },
          },
          {
            when: row => ((row[colData[25]['dataRef2']] < '2') && (row[colData[25]['dataRef2']] >= '1') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_2,
            },
          },
          {
            when: row => ((row[colData[25]['dataRef2']] < '1') && (row[colData[25]['dataRef2']] > '0') && (!pointsCheck)),
            style: {
              backgroundColor: columnPosLvl_1,
            },
          },
          {
            when: row => ((row[colData[25]['dataRef2']] < '0') && (row[colData[25]['dataRef2']] >= '-1') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_1,
            },
          },
          {
            when: row => ((row[colData[25]['dataRef2']] < '-1') && (row[colData[25]['dataRef2']] >= '-2') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_2,
            },
          },
          {
            when: row => ((row[colData[25]['dataRef2']] < '-2') && (row[colData[25]['dataRef2']] >= '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_3,
            },
          },
          {
            when: row => ((row[colData[25]['dataRef2']] < '-3') && (!pointsCheck)),
            style: {
              backgroundColor: columnNegLvl_4,
            },
          }
        ]
      }
    ];

    // NOTE:
    // This was previous logic for columns... not sure how to memoize if I am dynamically creating the columns though...
    // columns = useMemo(
    //   () => [  
    //   ],
    //   [hidePosRnk, hideADP, showPerGP],
    // );

  }

  // // async function fetchADPs() {
  // //   console.log('fetching ADPs')
  // //   let adpSupabaseTable = 'Yahoo_NHL_ADP';

  // //   const { data, error } = await supabase
  // //     .from(adpSupabaseTable)
  // //     .select()
  // //   if (error) {
  // //     console.log('error')
  // //     console.log(error.message)
  // //     return // abort
  // //   }    

  // //   return data;
  // // }

  // const addADP = (mainData) => {
  //   console.log('addADPs')
  //   let keyedADPs = {}

  //   fetchADPs()
  //     .then(data => {
  //       for (let row in data) {
  //         keyedADPs[data[row]['playerID']] = {
  //           avgPick: data[row]['playerAvgPick'],
  //           avgRd: data[row]['playerAvgRd'],
  //           pctPicked: data[row]['playerPctPicked']
  //         }
  //       }

  //       for (let player in mainData) {
  //         let id = mainData[player]["PlayerID"];
  //         if (id in keyedADPs) {
  //           mainData[player]["avgPick"] = keyedADPs[id]["avgPick"]
  //         }
  //       }

  //       // console.log('mainData has ADPs')
  //     })
  //     .catch(console.error)

  //   return mainData

  // }


  const setTableData = async (data) => {
    setFinalTableData([]);  // clear specific subset of data to display

    ensureDraftViewSettings();

    // NOTE: Below is for API vs Cache
    // data.Source = dataSource;
    // console.log('Data was pulled from: ' + data.Source + ' and took ' + data.responseTime)
    
    // If season data doesn't exist locally yet, or lsID is unset/just changed => set season data
    if ((tableData[seasonID] == null) || (lsIDChanged_Flag == true)) {
      // console.log('incoming data being set in tableData['+seasonID+']')
      tableData[seasonID] = data
    }
    
    // Filter data on tablePosFilter setting
    if (tablePosFilter == null) {
      tablePosFilter = "Overall"  
    }
    if (tablePosFilter == 'None') {
      // console.log('setting tableData')
      setFinalTableData(
        tableData[seasonID].filter(player => (player.VORPPosition != "Overall") && (player.VORPPosition != "Overall perGP"))
      )
    } else {
      // console.log('setting tableData')
      setFinalTableData(
        tableData[seasonID].filter(player => player.VORPPosition == tablePosFilter)
      )
    }
    
    // Set Table Cols appropriately
    setTableCols(colData)

    // console.log('lsID did not change')
    let delayTime = 333
    await wait(delayTime);

    setLoading(false);
    // console.log(tableData[seasonID])
    // console.log(finalTableData)
  }


  async function fetchPlayerData() {    

      // Check if we have cached data
      // let cacheEntry = await redis.get(`playerData`)
      // let cacheData = {}
      // if (cacheEntry) {
      //   console.log(cacheEntry)
      //   cacheData = cacheEntry;
      //   dataSource = 'redis'
      //   return cacheData;
      // }

      ensureDraftViewSettings()

      if (lsID == "") {
        lsID = "12_002_001_0"
      }

      let dbFile = league + '__' + lsID + '__' + seasonID;
      // console.log("db file = " + dbFile)

      // ------------- TODO: Add REDIS cache here (or some other simple cache) in order to save on server calls

      const { data, error } = await supabase
        .from(dbFile)
        .select()
        .limit(2500)
        // .filter('VORPPosition', 'in', '("Overall")')
        .then( dataSource = 'API' )
        // .then(data => {    // THIS FIRES TOO EARLY - DATA HASN'T BEEN LOADED
        //   setPlayerData(data)
        // })
      if (error) {
        setNewLS(true);
        console.log('Database Error!')
        console.log(error.message)
        // alert('Uh oh, looks there was an issue with submitting your request. Try refreshing the page and submitting again. If the issue persists, please submit the issue to hello@fantasyvorp.com')
        return data; // abort
      }
      
      return data;
  }

  // React-Data-Table-Component
  // Managing Selected Rows
  const handleRowSelected = useCallback(state => {
		setSelectedRows(state.selectedRows);
	}, []);

  const contextActions = useMemo(() => {
		const handleDelete = () => {
			
      setToggleCleared(!toggleCleared);
      setFinalTableData(differenceBy(finalTableData, selectedRows, 'fullName'));
		};

		return (
			<Button key="delete" onClick={handleDelete} variant="contained" >
				Hide Player(s)
			</Button>
		);
	}, [finalTableData, selectedRows, toggleCleared]);

  
    // -------------- Filtering Datatable -------------- // TODO: Add this functionality (Non-MVP)
    // https://react-data-table-component.netlify.app/?path=/docs/examples-filtering--filtering
    // const [filterText, setFilterText] = useState('');
    // const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
    // const filteredItems = tableData.filter(
    // 	item => item.name && item.name.toLowerCase().includes(filterText.toLowerCase()),
    // );

    // const subHeaderComponentMemo = useMemo(() => {
    // 	const handleClear = () => {
    // 		if (filterText) {
    // 			setResetPaginationToggle(!resetPaginationToggle);
    // 			setFilterText('');
    // 		}
    // 	};

    // 	return (
    // 		<FilterComponent onFilter={e => setFilterText(e.target.value)} onClear={handleClear} filterText={filterText} />
    // 	);
    // }, [filterText, resetPaginationToggle]);

  return (

    <section className={styles.playerData}>
        { loading ? (
          <div className={styles.playerLoadOverlay}>
            <h3>VORP Data Loading...</h3>
          </div>
        ) : (
          ""
        )}
        { newLS ? (
        <div className="ls-request-form-container">
          <div className="content">
          <h4 className="warning">Your League&apos;s VORP Data is now being calculated...</h4>
            <p>As this site is still under development, populating the database is unfortunately still a very manual process. The live database has been pre-populated with several common league settings, but your specific settings apparently were not included.</p>
            <p>Your specific FHL settings&apos; VORP data will be run through our scripts and pushed live as soon as possible.</p>
             <p>Feel free to enter your email below to be notified the moment your league&apos;s VORP data is live!
             </p>
             {/* TODO: Add this capability - currently this data isn't available as I am only checking against IDs and not actual pos/cats
             <h5>Your Settings:</h5>
             <h5>{tableTitle2}</h5>
             <h5>{tableTitle3}</h5> */}

            <form className="ls-request-form" onSubmit={handleSubmit(submitRequestedLSID)}>
            <div className="form_group_container">
                <Controller
                name="lsRequestEmail"
                control={control}
                defaultValue=""
                required
                type="email"
                render={({ field: { onChange, value }, fieldState: { errors } }) => (
                    <TextField 
                    id="outlined-basic" 
                    label="Email" 
                    variant="outlined" 
                    value={value}
                    onChange={onChange}
                    className="mui_textfield"
                    type="email"
                    />
                )}
                />
                <Controller
                  // rules={{ required: 'Scoring Type required' }}
                  name="radioSubscribe"
                  control={control}
                  defaultValue="singlenote"
                  render={({ field: { onChange, value }, fieldState: { error } }) => (
                      <RadioGroup
                      aria-labelledby="demo-radio-buttons-group-label"
                      name="radio-subscribe"
                      className="formControlGroup radioGroup"
                      defaultValue='singlenote'
                      value={value}
                      onChange={(e) => {
                          onChange(e);
                      }}
                      // error={!!error}
                      // helperText={error ? error.message : null}
                      >
                          <FormControlLabel 
                          value="singlenote" 
                          name="singlenote" 
                          // checked={scoringRadio === "categories"} 
                          label="Only use this email for THIS notification, and delete all records afterwards."
                          control={<Radio />} 
                          />

                          <FormControlLabel 
                          value="subscribe" 
                          name="subscribe" 
                          label="I would like to subscribe to future updates of FantasyVORP.com" 
                          // checked={scoringRadio === "points"} 
                          control={<Radio />} 
                          />
                      </RadioGroup>
                  )}
                  />                


                    <Button 
                    variant="contained" 
                    type="submit" 
                    value="Submit">
                      Submit
                    </Button>

            </div>
          </form>
        </div>

        </div>
      ) : (
        ""
      )}

      <h5>
        Current Settings:<br />
        {tableTitle2}<br />
        {tableTitle3}
      </h5>
      <div className="playerDataControlMenu">
        <div className="form_group_container">
          <Controller
            name="tableViewSelect"
            control={control}
            defaultValue='Stats'
            render={({ field: { onChange, value }, fieldState: { error } }) => (
                <FormControl className="mui_select">
                    <InputLabel id="tableViewSelect-select">Table View</InputLabel>
                    <Select
                    labelId="tableViewSelect-select"
                    label="Table View"
                    // sx={{ width: 250 }}
                    value={value}
                    onChange={onChange}
                    error={!!error}
                    // helperText={error ? error.message : null}
                    >
                        <MenuItem value={'Stats'}>Stats</MenuItem>
                        <MenuItem value={'Draft'}>Draft</MenuItem>
                    </Select>
                </FormControl>
              )}
            />
            <Controller
            name="tablePosFilter"
            control={control}
            defaultValue="Overall"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
                <FormControl className="mui_select">
                    <InputLabel id="tablePosFilter-select">Position Filter</InputLabel>
                    <Select
                    labelId="tablePosFilter-select"
                    label="Position Filter"
                    // sx={{ width: 250 }}
                    value={value}
                    onChange={onChange}
                    error={!!error}
                    // helperText={error ? error.message : null}
                    >
                        <MenuItem value={'Overall'}>Overall</MenuItem>
                        <MenuItem value={'C'}>C</MenuItem>
                        <MenuItem value={'LW'}>LW</MenuItem>
                        <MenuItem value={'RW'}>RW</MenuItem>
                        <MenuItem value={'D'}>D</MenuItem>
                        <MenuItem value={'G'}>G</MenuItem>
                        {/* <MenuItem value={'None'}>None</MenuItem> */}
                    </Select>
                </FormControl>
            )}
            // rules={{ required: 'Fantasy Site required' }}
            />
            <Controller
            name="seasonSelect"
            control={control}
            defaultValue="ProjVORPs"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
                <FormControl className="mui_select">
                    <InputLabel id="seasonSelect-select">Season Select</InputLabel>
                    <Select
                    labelId="seasonSelect-select"
                    label="Season Select"
                    // sx={{ width: 250 }}
                    value={value}
                    onChange={onChange}
                    error={!!error}
                    // helperText={error ? error.message : null}
                    >
                        <MenuItem value={'ProjVORPs'}>22-23 Projection</MenuItem>
                        <MenuItem value={'21-22'}>21-22</MenuItem>
                        <MenuItem value={'20-21'}>20-21</MenuItem>
                        <MenuItem value={'19-20'}>19-20</MenuItem>
                    </Select>
                </FormControl>
              )}
            />
            <Controller
            name="perGPSelect"
            control={control}
            defaultValue='Season'
            render={({ field: { onChange, value }, fieldState: { error } }) => (
                <FormControl className="mui_select">
                    <InputLabel id="perGP-select">Value Calculated For:</InputLabel>
                    <Select
                    labelId="perGPSelect"
                    label="Value Calculated For:"
                    // sx={{ width: 250 }}
                    value={value}
                    onChange={onChange}
                    error={!!error}
                    // helperText={error ? error.message : null}
                    >
                        <MenuItem value={'Season'}>Full Season</MenuItem>
                        <MenuItem value={'perGP'}>Per Game</MenuItem>
                    </Select>
                </FormControl>
              )}
            />
            </div>
          {/* <div className="form_group_container">
            <FormControl component="fieldset">
              <FormGroup aria-label="position" row>

                  <FormControlLabel
                    label="Show Position Ranks"
                    labelPlacement="top"
                    control={
                      <Checkbox 
                        checked={!hidePosRnk}
                        onChange={() => setHidePosRnk(!hidePosRnk)}
                        inputProps={{ 'aria-label': 'controlled' }}  
                      />
                    }
                  />
                  <FormControlLabel
                    label="Show ADP"
                    labelPlacement="top"
                    control={
                      <Checkbox 
                        checked={!hideADP}
                        onChange={() => setHideADP(!hideADP)}
                        inputProps={{ 'aria-label': 'controlled' }}  
                      />
                    }
                  />
                  <FormControlLabel
                    label="Show Age"
                    labelPlacement="top"
                    control={
                      <Checkbox 
                        checked={!hideAge}
                        onChange={() => setHideAge(!hideAge)}
                        inputProps={{ 'aria-label': 'controlled' }}  
                      />
                    }
                  />

              </FormGroup>
            </FormControl>
        </div> */}
      </div>

      <div className={styles.dataTableContainer}>
        { loading ? (
            ""
          ) : 
          <DataTable
          title={tableTitle}
          columns={columns}
          data={finalTableData}  // filteredItems
          customStyles={customRDTStyles}
          conditionalRowStyles={specificRDTStyles}
          className="dataTable"
          defaultSortFieldId={tableColtoSortBy}
          defaultSortAsc={true}
          responsive
          dense
          direction="auto"
          fixedHeader
          // noHeader
          fixedHeaderScrollHeight="80vh"
          highlightOnHover
          pagination={false}
          // paginationPerPage={400}
          selectableRowsNoSelectAll
          selectableRows
          selectableRowsHighlight
          selectableRowsRadio="checkbox"
          contextActions={contextActions}
          onSelectedRowsChange={handleRowSelected}
          clearSelectedRows={toggleCleared}
          striped   // Not currently working lol
          // FILTERING  vvv
          // subHeader
          // subHeaderWrap
          // subHeaderAlign="right"
          // subHeaderComponent={subHeaderComponentMemo}
          // persistTableHead
          // paginationResetDefaultPage={resetPaginationToggle} 
        />
      }
      { !playerData ? "No player data available." : "" }
      </div>

    </section>   

  )
}