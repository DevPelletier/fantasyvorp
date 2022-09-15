import Head from 'next/head'

import { useState, useEffect, useMemo } from 'react'
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


import { Controller, useForm } from 'react-hook-form';

import styles from '../styles/components/playerData.module.scss';
import { customRDTStyles, specificRDTStyles } from '../styles/components/dataTable';

// -------------- Data Table Variables -------------- //
const dataColWidth01 = "75px";
const dataColWidth02 = "100px";
let tableData;
let columns;
let dataSource;

// -------------- END of Data Table Variables -------------- //


// DEV TODO:
// USE THIS DATA TABLE 
// SEEMS WAY MORE SIMPLE & LIGHTWEIGHT THAN MUI
// https://react-data-table-component.netlify.app/?path=/docs/getting-started-examples--page

export default function PlayerData(props) {
  const [playerData, setPlayerData] = useState([])
  const [loading, setLoading] = useState(true)
  const [hidePosRnk, setHidePosRnk] = useState(false);
  const [hideADP, setHideADP] = useState(true);
  const [showPerGP, setShowPerGP] = useState(false);
  const [adps, setADPs] = useState([]);
  const [newLS, setNewLS] = useState(false)

  let lsID = props.lsID;
  let colData = props.colData;

  // const [statColumns, setStatColumns] = useState([])

  const { watch, control, reset, handleSubmit } = useForm();
  let tablePosFilter = watch("tablePosFilter");
  let season = watch("seasonSelect");
  // console.log(watch());

  useEffect(() => {
    if (lsID != "") {
      const t0 = new Date().getTime()
      fetchPlayerData()
        .then(data => {
          if (data) {
            const t1 = new Date().getTime()
            data.responseTime = `${t1-t0} ms`
            // redis.set(`playerData`, data) 
            setTableData(data)
          } else if (!data) {

            // User Message and Input Triggered
            setNewLS(true);
          }
          // setPlayerData(data)  // BUG: If you use this setter, and use playerData for setTableData, the table stops showing the correct dataset...
          // addADP(data)
        })
        .catch(console.error)
    }
  }, [lsID, season, showPerGP, tablePosFilter ])

  // Auto-filter to 'Overall_perGP' if switching to both Overall and PerGP (different dataset)
  if ((tablePosFilter == 'Overall' && showPerGP) || (tablePosFilter == 'Overall perGP' && !showPerGP)) {
    setShowPerGP(!showPerGP)
  }
  
  let seasonID = season;
  let league = 'NHL';

  const setTableCols = (colData) => {
    console.log('setTableCols')
    let scoringType;
    let ignoreCols = [
      'Scoring Type', 'Name', 'Rank', 'Rank_pergp', 'VORP', 'VORP_pergp'
    ]
    colData['Rank'] = {}
    colData['Rank_pergp'] = {}
    colData['Name'] = {}
    colData['VORP'] = {}
    colData['VORP_pergp'] = {}
    let rateStats = ["21", "24"]  // These are mapped to GAA and SV% lol

    if (colData["Scoring Type"] == "Categories") {
      colData['Rank']['dataRef'] = 'vorp_rank'
      colData['Rank_pergp']['dataRef'] = 'vorp_pergp_rank'
      colData['Name']['dataRef'] = 'fullName'
      colData['VORP']['dataRef'] = 'vorp'
      colData['VORP_pergp']['dataRef'] = 'vorp_pergp'

      for (let col in colData) {
        if (!ignoreCols.includes(col)) {
          if (colData[col]['active'] == true) {
            if (rateStats.includes(col)) {
              colData[col]['omitTotal'] = ""
            } else {
              colData[col]['omitTotal'] = showPerGP
              colData[col]['omitperGP'] = !showPerGP
              }
          } else {
            colData[col]['omitTotal'] = true
            colData[col]['omitperGP'] = true
          }
        }
      }  
    } else {  // Points League
      colData['Rank']['dataRef'] = 'FanPts Rank'
      colData['Rank_pergp']['dataRef'] = 'FanPts_perGP Rank'
      colData['Name']['dataRef'] = 'Full Name'
      colData['VORP']['dataRef'] = 'VORP'
      colData['VORP_pergp']['dataRef'] = 'VORP_perGP'
      
      for (let col in colData) {
        if (!ignoreCols.includes(col)) {
          if (colData[col]['active'] == true) {
            if (rateStats.includes(col)) {
              colData[col]['omitTotal'] = ""
              colData[col]['dataRef1'] = colData[col]['name'];
            } else {
              colData[col]['omitTotal'] = showPerGP
              colData[col]['omitperGP'] = !showPerGP
              colData[col]['dataRef1'] = colData[col]['name'];
              colData[col]['dataRef2'] = colData[col]['name'] + ' perGP';
            }  
          } else {
            colData[col]['omitTotal'] = true
            colData[col]['omitperGP'] = true
          }
        }
      }
    }

    console.log(colData)
    
    columns = [
      {
      name: 'Rank',
      selector: row => row[colData['Rank']['dataRef']],
      sortable: true,
      width: '60px',
      omit: showPerGP,
      style: {
      }
      },
      {
        name: 'Rank',  // perGP
        selector: row => row[colData['Rank_pergp']['dataRef']],
        accessor: "age",
        sortable: true,
        width: '60px',
        omit: !showPerGP,
        style: {
        }
      },
      // TODO:
      // These columns are driving me insane lol
      // THey show up AFTER a few refreshes... the data is being added but doesn't appear immediately?!
      // {
      //   name: 'ADP',
      //   selector: row => row.avgPick,
      //   sortable: true,
      //   width: '85px',
      //   // omit: hideADP,
      //   style: {
      //   }
      // },
      // {
      //   name: 'Diff',
      //   selector: row => row.ADP, // TODO
      //   sortable: true,
      //   width: '85px',
      //   omit: hideADP,
      //   style: {
      //   }
      // },
      {
        name: 'Name',
        selector: row => row[colData['Name']['dataRef']],
        sortable: false,
        width: '170px',
        style: {
          justifyContent: 'left'
        }
      },
      {
        name: 'Age',
        selector: row => row.Age,
        sortable: false,
        width: dataColWidth01,
      },
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
        name: 'Pos',
        selector: row => row.PositionAll,
        sortable: false,
        width: '85px',
        style: {
          color: 'black',
          fontSize: '14px',
          fontWeight: '600',
        },
        conditionalCellStyles: [
          {
            when: row => row.PositionAll == 'C',
            style: {
              backgroundColor: '#93d274',
            }
          },
          {
            when: row => row.PositionAll == 'LW',
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
        name: 'V Pos',
        selector: row => row.VORPPosition,
        sortable: false,
        width: '80px',
        style: {
          color: 'black',
          fontWeight: '600',
          fontSize: '12px',
        },
        conditionalCellStyles: [
          {
            when: row => row.VORPPosition == 'C',
            style: {
              backgroundColor: '#93d274',
            }
          },
          {
            when: row => row.VORPPosition == 'LW',
            style: {
              backgroundColor: '#f5df72',
            }
          },
          {
            when: row => row.VORPPosition == 'RW',
            style: {
              backgroundColor: '#ff6963',
            }
          },
          {
            when: row => row.VORPPosition == 'D',
            style: {
              backgroundColor: '#7bb3d6',
            }
          },
          {
            when: row => row.VORPPosition == 'G',
            style: {
              backgroundColor: '#b875c8',
            } 
          },
          {
            when: row => (row.VORPPosition == 'Overall' || row.VORPPosition == 'Overall perGP' ),
              style: {
                backgroundColor: 'rgba(255,255,255,0.14)',
                color: "white"
              } 
          }
        ]
      },
      {
        name: 'VORP',
        id: 'VORP',
        selector: row => row[colData['VORP']['dataRef']],
        sortable: true,
        width: '80px',
        omit: showPerGP,
        style: {
          fontWeight: '600',
          fontSize: '14px',
        }
      },
      {
        name: 'VORP',  // perGP
        id: 'VORP_perGP',
        selector: row => row[colData['VORP_pergp']['dataRef']],
        sortable: true,
        width: '80px',
        omit: !showPerGP,
        style: {
          fontWeight: '600',
          fontSize: '14px',
        }
      },
      {
        name: "Pos RNK",
        selector: row => row.PosRankAll,
        sortable: false,
        width: '140px',
        omit: showPerGP,  // TODO: Add hidePosRnk =>  Not sure how to have 2 conditions for this... (for "hide/show PosRank" toggle)
        style: {
          fontSize: '0.7rem',
        }
      },
      {
        name: "Pos RNK",  // perGP
        selector: row => row.PosRankAll_perGP,
        sortable: false,
        width: '140px',
        omit: !showPerGP, // TODO: Add hidePosRnk =>   Not sure how to have 2 conditions for this... (for "hide/show PosRank" toggle)
        style: {
          fontSize: '0.7rem',
        }
      },
      {
        name: "GP",
        selector: row => row.GP,
        sortable: true,
        width: '80px',
        style: {
          fontSize: '0.9rem',
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
            when: row => (row[colData[0]['dataRef1']] >= '3'),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.85)',
            },
          },
          {
            when: row => ((row[colData[0]['dataRef1']] < '3') && (row[colData[0]['dataRef1']] >= '2')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.65)',
            },
          },
          {
            when: row => ((row[colData[0]['dataRef1']] < '2') && (row[colData[0]['dataRef1']] >= '1')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.4)',
            },
          },
          {
            when: row => ((row[colData[0]['dataRef1']] < '1') && (row[colData[0]['dataRef1']] > '0')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.1)',
            },
          },
          {
            when: row => ((row[colData[0]['dataRef1']] < '0') && (row[colData[0]['dataRef1']] >= '-1')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.1)',
            },
          },
          {
            when: row => ((row[colData[0]['dataRef1']] < '-1') && (row[colData[0]['dataRef1']] >= '-2')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.4)',
            },
          },
          {
            when: row => (row[colData[0]['dataRef1']] < '-2'),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.8)',
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
            when: row => row[colData[0]['dataRef2']] >= '3',
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.85)',
            },
          },
          {
            when: row => ((row[colData[0]['dataRef2']] < '3') && (row[colData[0]['dataRef2']] >= '2')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.65)',
            },
          },
          {
            when: row => ((row[colData[0]['dataRef2']] < '2') && (row[colData[0]['dataRef2']] >= '1')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.4)',
            },
          },
          {
            when: row => ((row[colData[0]['dataRef2']] < '1') && (row[colData[0]['dataRef2']] > '0')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.1)',
            },
          },
          {
            when: row => ((row[colData[0]['dataRef2']] < '0') && (row[colData[0]['dataRef2']] >= '-1')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.1)',
            },
          },
          {
            when: row => ((row[colData[0]['dataRef2']] < '-1') && (row[colData[0]['dataRef2']] >= '-2')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.4)',
            },
          },
          {
            when: row => (row[colData[0]['dataRef2']] < '-2'),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.8)',
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
            when: row => row[colData[1]['dataRef1']] >= '3',
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.85)',
            },
          },
          {
            when: row => ((row[colData[1]['dataRef1']] < '3') && (row[colData[1]['dataRef1']] >= '2')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.65)',
            },
          },
          {
            when: row => ((row[colData[1]['dataRef1']] < '2') && (row[colData[1]['dataRef1']] >= '1')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.4)',
            },
          },
          {
            when: row => ((row[colData[1]['dataRef1']] < '1') && (row[colData[1]['dataRef1']] > '0')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.1)',
            },
          },
          {
            when: row => ((row[colData[1]['dataRef1']] < '0') && (row[colData[1]['dataRef1']] >= '-1')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.1)',
            },
          },
          {
            when: row => ((row[colData[1]['dataRef1']] < '-1') && (row[colData[1]['dataRef1']] >= '-2')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.4)',
            },
          },
          {
            when: row => (row[colData[1]['dataRef1']] < '-2'),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.8)',
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
            when: row => row[colData[1]['dataRef2']] >= '3',
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.85)',
            },
          },
          {
            when: row => ((row[colData[1]['dataRef2']] < '3') && (row[colData[1]['dataRef2']] >= '2')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.65)',
            },
          },
          {
            when: row => ((row[colData[1]['dataRef2']] < '2') && (row[colData[1]['dataRef2']] >= '1')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.4)',
            },
          },
          {
            when: row => ((row[colData[1]['dataRef2']] < '1') && (row[colData[1]['dataRef2']] > '0')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.1)',
            },
          },
          {
            when: row => ((row[colData[1]['dataRef2']] < '0') && (row[colData[1]['dataRef2']] >= '-1')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.1)',
            },
          },
          {
            when: row => ((row[colData[1]['dataRef2']] < '-1') && (row[colData[1]['dataRef2']] >= '-2')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.4)',
            },
          },
          {
            when: row => (row[colData[1]['dataRef2']] < '-2'),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.8)',
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
            when: row => row[colData[2]['dataRef1']] >= '3',
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.85)',
            },
          },
          {
            when: row => ((row[colData[2]['dataRef1']] < '3') && (row[colData[2]['dataRef1']] >= '2')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.65)',
            },
          },
          {
            when: row => ((row[colData[2]['dataRef1']] < '2') && (row[colData[2]['dataRef1']] >= '1')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.4)',
            },
          },
          {
            when: row => ((row[colData[2]['dataRef1']] < '1') && (row[colData[2]['dataRef1']] > '0')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.1)',
            },
          },
          {
            when: row => ((row[colData[2]['dataRef1']] < '0') && (row[colData[2]['dataRef1']] >= '-1')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.1)',
            },
          },
          {
            when: row => ((row[colData[2]['dataRef1']] < '-1') && (row[colData[2]['dataRef1']] >= '-2')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.4)',
            },
          },
          {
            when: row => (row[colData[2]['dataRef1']] < '-2'),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.8)',
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
            when: row => row[colData[2]['dataRef2']] >= '3',
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.85)',
            },
          },
          {
            when: row => ((row[colData[2]['dataRef2']] < '3') && (row[colData[2]['dataRef2']] >= '2')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.65)',
            },
          },
          {
            when: row => ((row[colData[2]['dataRef2']] < '2') && (row[colData[2]['dataRef2']] >= '1')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.4)',
            },
          },
          {
            when: row => ((row[colData[2]['dataRef2']] < '1') && (row[colData[2]['dataRef2']] > '0')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.1)',
            },
          },
          {
            when: row => ((row[colData[2]['dataRef2']] < '0') && (row[colData[2]['dataRef2']] >= '-1')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.1)',
            },
          },
          {
            when: row => ((row[colData[2]['dataRef2']] < '-1') && (row[colData[2]['dataRef2']] >= '-2')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.4)',
            },
          },
          {
            when: row => (row[colData[2]['dataRef2']] < '-2'),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.8)',
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
            when: row => row[colData[3]['dataRef1']] >= '3',
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.85)',
            },
          },
          {
            when: row => ((row[colData[3]['dataRef1']] < '3') && (row[colData[3]['dataRef1']] >= '2')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.65)',
            },
          },
          {
            when: row => ((row[colData[3]['dataRef1']] < '2') && (row[colData[3]['dataRef1']] >= '1')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.4)',
            },
          },
          {
            when: row => ((row[colData[3]['dataRef1']] < '1') && (row[colData[3]['dataRef1']] > '0')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.1)',
            },
          },
          {
            when: row => ((row[colData[3]['dataRef1']] < '0') && (row[colData[3]['dataRef1']] >= '-1')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.1)',
            },
          },
          {
            when: row => ((row[colData[3]['dataRef1']] < '-1') && (row[colData[3]['dataRef1']] >= '-2')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.4)',
            },
          },
          {
            when: row => (row[colData[3]['dataRef1']] < '-2'),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.8)',
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
            when: row => row[colData[3]['dataRef2']] >= '3',
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.85)',
            },
          },
          {
            when: row => ((row[colData[3]['dataRef2']] < '3') && (row[colData[3]['dataRef2']] >= '2')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.65)',
            },
          },
          {
            when: row => ((row[colData[3]['dataRef2']] < '2') && (row[colData[3]['dataRef2']] >= '1')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.4)',
            },
          },
          {
            when: row => ((row[colData[3]['dataRef2']] < '1') && (row[colData[3]['dataRef2']] > '0')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.1)',
            },
          },
          {
            when: row => ((row[colData[3]['dataRef2']] < '0') && (row[colData[3]['dataRef2']] >= '-1')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.1)',
            },
          },
          {
            when: row => ((row[colData[3]['dataRef2']] < '-1') && (row[colData[3]['dataRef2']] >= '-2')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.4)',
            },
          },
          {
            when: row => (row[colData[3]['dataRef2']] < '-2'),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.8)',
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
            when: row => row[colData[4]['dataRef1']] >= '3',
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.85)',
            },
          },
          {
            when: row => ((row[colData[4]['dataRef1']] < '3') && (row[colData[4]['dataRef1']] >= '2')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.65)',
            },
          },
          {
            when: row => ((row[colData[4]['dataRef1']] < '2') && (row[colData[4]['dataRef1']] >= '1')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.4)',
            },
          },
          {
            when: row => ((row[colData[4]['dataRef1']] < '1') && (row[colData[4]['dataRef1']] > '0')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.1)',
            },
          },
          {
            when: row => ((row[colData[4]['dataRef1']] < '0') && (row[colData[4]['dataRef1']] >= '-1')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.1)',
            },
          },
          {
            when: row => ((row[colData[4]['dataRef1']] < '-1') && (row[colData[4]['dataRef1']] >= '-2')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.4)',
            },
          },
          {
            when: row => (row[colData[4]['dataRef1']] < '-2'),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.8)',
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
            when: row => row[colData[4]['dataRef2']] >= '3',
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.85)',
            },
          },
          {
            when: row => ((row[colData[4]['dataRef2']] < '3') && (row[colData[4]['dataRef2']] >= '2')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.65)',
            },
          },
          {
            when: row => ((row[colData[4]['dataRef2']] < '2') && (row[colData[4]['dataRef2']] >= '1')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.4)',
            },
          },
          {
            when: row => ((row[colData[4]['dataRef2']] < '1') && (row[colData[4]['dataRef2']] > '0')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.1)',
            },
          },
          {
            when: row => ((row[colData[4]['dataRef2']] < '0') && (row[colData[4]['dataRef2']] >= '-1')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.1)',
            },
          },
          {
            when: row => ((row[colData[4]['dataRef2']] < '-1') && (row[colData[4]['dataRef2']] >= '-2')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.4)',
            },
          },
          {
            when: row => (row[colData[4]['dataRef2']] < '-2'),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.8)',
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
            when: row => row[colData[5]['dataRef1']] >= '3',
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.85)',
            },
          },
          {
            when: row => ((row[colData[5]['dataRef1']] < '3') && (row[colData[5]['dataRef1']] >= '2')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.65)',
            },
          },
          {
            when: row => ((row[colData[5]['dataRef1']] < '2') && (row[colData[5]['dataRef1']] >= '1')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.4)',
            },
          },
          {
            when: row => ((row[colData[5]['dataRef1']] < '1') && (row[colData[5]['dataRef1']] > '0')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.1)',
            },
          },
          {
            when: row => ((row[colData[5]['dataRef1']] < '0') && (row[colData[5]['dataRef1']] >= '-1')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.1)',
            },
          },
          {
            when: row => ((row[colData[5]['dataRef1']] < '-1') && (row[colData[5]['dataRef1']] >= '-2')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.4)',
            },
          },
          {
            when: row => (row[colData[5]['dataRef1']] < '-2'),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.8)',
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
            when: row => row[colData[5]['dataRef2']] >= '3',
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.85)',
            },
          },
          {
            when: row => ((row[colData[5]['dataRef2']] < '3') && (row[colData[5]['dataRef2']] >= '2')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.65)',
            },
          },
          {
            when: row => ((row[colData[5]['dataRef2']] < '2') && (row[colData[5]['dataRef2']] >= '1')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.4)',
            },
          },
          {
            when: row => ((row[colData[5]['dataRef2']] < '1') && (row[colData[5]['dataRef2']] > '0')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.1)',
            },
          },
          {
            when: row => ((row[colData[5]['dataRef2']] < '0') && (row[colData[5]['dataRef2']] >= '-1')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.1)',
            },
          },
          {
            when: row => ((row[colData[5]['dataRef2']] < '-1') && (row[colData[5]['dataRef2']] >= '-2')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.4)',
            },
          },
          {
            when: row => (row[colData[5]['dataRef2']] < '-2'),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.8)',
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
            when: row => row[colData[6]['dataRef1']] >= '3',
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.85)',
            },
          },
          {
            when: row => ((row[colData[6]['dataRef1']] < '3') && (row[colData[6]['dataRef1']] >= '2')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.65)',
            },
          },
          {
            when: row => ((row[colData[6]['dataRef1']] < '2') && (row[colData[6]['dataRef1']] >= '1')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.4)',
            },
          },
          {
            when: row => ((row[colData[6]['dataRef1']] < '1') && (row[colData[6]['dataRef1']] > '0')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.1)',
            },
          },
          {
            when: row => ((row[colData[6]['dataRef1']] < '0') && (row[colData[6]['dataRef1']] >= '-1')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.1)',
            },
          },
          {
            when: row => ((row[colData[6]['dataRef1']] < '-1') && (row[colData[6]['dataRef1']] >= '-2')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.4)',
            },
          },
          {
            when: row => (row[colData[6]['dataRef1']] < '-2'),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.8)',
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
            when: row => row[colData[6]['dataRef2']] >= '3',
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.85)',
            },
          },
          {
            when: row => ((row[colData[6]['dataRef2']] < '3') && (row[colData[6]['dataRef2']] >= '2')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.65)',
            },
          },
          {
            when: row => ((row[colData[6]['dataRef2']] < '2') && (row[colData[6]['dataRef2']] >= '1')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.4)',
            },
          },
          {
            when: row => ((row[colData[6]['dataRef2']] < '1') && (row[colData[6]['dataRef2']] > '0')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.1)',
            },
          },
          {
            when: row => ((row[colData[6]['dataRef2']] < '0') && (row[colData[6]['dataRef2']] >= '-1')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.1)',
            },
          },
          {
            when: row => ((row[colData[6]['dataRef2']] < '-1') && (row[colData[6]['dataRef2']] >= '-2')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.4)',
            },
          },
          {
            when: row => (row[colData[6]['dataRef2']] < '-2'),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.8)',
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
            when: row => row[colData[7]['dataRef1']] >= '3',
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.85)',
            },
          },
          {
            when: row => ((row[colData[7]['dataRef1']] < '3') && (row[colData[7]['dataRef1']] >= '2')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.65)',
            },
          },
          {
            when: row => ((row[colData[7]['dataRef1']] < '2') && (row[colData[7]['dataRef1']] >= '1')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.4)',
            },
          },
          {
            when: row => ((row[colData[7]['dataRef1']] < '1') && (row[colData[7]['dataRef1']] > '0')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.1)',
            },
          },
          {
            when: row => ((row[colData[7]['dataRef1']] < '0') && (row[colData[7]['dataRef1']] >= '-1')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.1)',
            },
          },
          {
            when: row => ((row[colData[7]['dataRef1']] < '-1') && (row[colData[7]['dataRef1']] >= '-2')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.4)',
            },
          },
          {
            when: row => (row[colData[7]['dataRef1']] < '-2'),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.8)',
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
            when: row => row[colData[7]['dataRef2']] >= '3',
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.85)',
            },
          },
          {
            when: row => ((row[colData[7]['dataRef2']] < '3') && (row[colData[7]['dataRef2']] >= '2')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.65)',
            },
          },
          {
            when: row => ((row[colData[7]['dataRef2']] < '2') && (row[colData[7]['dataRef2']] >= '1')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.4)',
            },
          },
          {
            when: row => ((row[colData[7]['dataRef2']] < '1') && (row[colData[7]['dataRef2']] > '0')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.1)',
            },
          },
          {
            when: row => ((row[colData[7]['dataRef2']] < '0') && (row[colData[7]['dataRef2']] >= '-1')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.1)',
            },
          },
          {
            when: row => ((row[colData[7]['dataRef2']] < '-1') && (row[colData[7]['dataRef2']] >= '-2')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.4)',
            },
          },
          {
            when: row => (row[colData[7]['dataRef2']] < '-2'),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.8)',
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
            when: row => row[colData[8]['dataRef1']] >= '3',
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.85)',
            },
          },
          {
            when: row => ((row[colData[8]['dataRef1']] < '3') && (row[colData[8]['dataRef1']] >= '2')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.65)',
            },
          },
          {
            when: row => ((row[colData[8]['dataRef1']] < '2') && (row[colData[8]['dataRef1']] >= '1')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.4)',
            },
          },
          {
            when: row => ((row[colData[8]['dataRef1']] < '1') && (row[colData[8]['dataRef1']] > '0')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.1)',
            },
          },
          {
            when: row => ((row[colData[8]['dataRef1']] < '0') && (row[colData[8]['dataRef1']] >= '-1')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.1)',
            },
          },
          {
            when: row => ((row[colData[8]['dataRef1']] < '-1') && (row[colData[8]['dataRef1']] >= '-2')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.4)',
            },
          },
          {
            when: row => (row[colData[8]['dataRef1']] < '-2'),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.8)',
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
            when: row => row[colData[8]['dataRef2']] >= '3',
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.85)',
            },
          },
          {
            when: row => ((row[colData[8]['dataRef2']] < '3') && (row[colData[8]['dataRef2']] >= '2')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.65)',
            },
          },
          {
            when: row => ((row[colData[8]['dataRef2']] < '2') && (row[colData[8]['dataRef2']] >= '1')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.4)',
            },
          },
          {
            when: row => ((row[colData[8]['dataRef2']] < '1') && (row[colData[8]['dataRef2']] > '0')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.1)',
            },
          },
          {
            when: row => ((row[colData[8]['dataRef2']] < '0') && (row[colData[8]['dataRef2']] >= '-1')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.1)',
            },
          },
          {
            when: row => ((row[colData[8]['dataRef2']] < '-1') && (row[colData[8]['dataRef2']] >= '-2')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.4)',
            },
          },
          {
            when: row => (row[colData[8]['dataRef2']] < '-2'),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.8)',
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
            when: row => row[colData[9]['dataRef1']] >= '3',
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.85)',
            },
          },
          {
            when: row => ((row[colData[9]['dataRef1']] < '3') && (row[colData[9]['dataRef1']] >= '2')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.65)',
            },
          },
          {
            when: row => ((row[colData[9]['dataRef1']] < '2') && (row[colData[9]['dataRef1']] >= '1')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.4)',
            },
          },
          {
            when: row => ((row[colData[9]['dataRef1']] < '1') && (row[colData[9]['dataRef1']] > '0')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.1)',
            },
          },
          {
            when: row => ((row[colData[9]['dataRef1']] < '0') && (row[colData[9]['dataRef1']] >= '-1')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.1)',
            },
          },
          {
            when: row => ((row[colData[9]['dataRef1']] < '-1') && (row[colData[9]['dataRef1']] >= '-2')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.4)',
            },
          },
          {
            when: row => (row[colData[9]['dataRef1']] < '-2'),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.8)',
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
            when: row => row[colData[9]['dataRef2']] >= '3',
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.85)',
            },
          },
          {
            when: row => ((row[colData[9]['dataRef2']] < '3') && (row[colData[9]['dataRef2']] >= '2')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.65)',
            },
          },
          {
            when: row => ((row[colData[9]['dataRef2']] < '2') && (row[colData[9]['dataRef2']] >= '1')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.4)',
            },
          },
          {
            when: row => ((row[colData[9]['dataRef2']] < '1') && (row[colData[9]['dataRef2']] > '0')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.1)',
            },
          },
          {
            when: row => ((row[colData[9]['dataRef2']] < '0') && (row[colData[9]['dataRef2']] >= '-1')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.1)',
            },
          },
          {
            when: row => ((row[colData[9]['dataRef2']] < '-1') && (row[colData[9]['dataRef2']] >= '-2')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.4)',
            },
          },
          {
            when: row => (row[colData[9]['dataRef2']] < '-2'),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.8)',
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
            when: row => row[colData[10]['dataRef1']] >= '3',
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.85)',
            },
          },
          {
            when: row => ((row[colData[10]['dataRef1']] < '3') && (row[colData[10]['dataRef1']] >= '2')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.65)',
            },
          },
          {
            when: row => ((row[colData[10]['dataRef1']] < '2') && (row[colData[10]['dataRef1']] >= '1')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.4)',
            },
          },
          {
            when: row => ((row[colData[10]['dataRef1']] < '1') && (row[colData[10]['dataRef1']] > '0')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.1)',
            },
          },
          {
            when: row => ((row[colData[10]['dataRef1']] < '0') && (row[colData[10]['dataRef1']] >= '-1')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.1)',
            },
          },
          {
            when: row => ((row[colData[10]['dataRef1']] < '-1') && (row[colData[10]['dataRef1']] >= '-2')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.4)',
            },
          },
          {
            when: row => (row[colData[10]['dataRef1']] < '-2'),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.8)',
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
            when: row => row[colData[10]['dataRef2']] >= '3',
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.85)',
            },
          },
          {
            when: row => ((row[colData[10]['dataRef2']] < '3') && (row[colData[10]['dataRef2']] >= '2')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.65)',
            },
          },
          {
            when: row => ((row[colData[10]['dataRef2']] < '2') && (row[colData[10]['dataRef2']] >= '1')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.4)',
            },
          },
          {
            when: row => ((row[colData[10]['dataRef2']] < '1') && (row[colData[10]['dataRef2']] > '0')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.1)',
            },
          },
          {
            when: row => ((row[colData[10]['dataRef2']] < '0') && (row[colData[10]['dataRef2']] >= '-1')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.1)',
            },
          },
          {
            when: row => ((row[colData[10]['dataRef2']] < '-1') && (row[colData[10]['dataRef2']] >= '-2')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.4)',
            },
          },
          {
            when: row => (row[colData[10]['dataRef2']] < '-2'),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.8)',
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
            when: row => row[colData[11]['dataRef1']] >= '3',
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.85)',
            },
          },
          {
            when: row => ((row[colData[11]['dataRef1']] < '3') && (row[colData[11]['dataRef1']] >= '2')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.65)',
            },
          },
          {
            when: row => ((row[colData[11]['dataRef1']] < '2') && (row[colData[11]['dataRef1']] >= '1')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.4)',
            },
          },
          {
            when: row => ((row[colData[11]['dataRef1']] < '1') && (row[colData[11]['dataRef1']] > '0')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.1)',
            },
          },
          {
            when: row => ((row[colData[11]['dataRef1']] < '0') && (row[colData[11]['dataRef1']] >= '-1')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.1)',
            },
          },
          {
            when: row => ((row[colData[11]['dataRef1']] < '-1') && (row[colData[11]['dataRef1']] >= '-2')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.4)',
            },
          },
          {
            when: row => (row[colData[11]['dataRef1']] < '-2'),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.8)',
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
            when: row => row[colData[11]['dataRef2']] >= '3',
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.85)',
            },
          },
          {
            when: row => ((row[colData[11]['dataRef2']] < '3') && (row[colData[11]['dataRef2']] >= '2')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.65)',
            },
          },
          {
            when: row => ((row[colData[11]['dataRef2']] < '2') && (row[colData[11]['dataRef2']] >= '1')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.4)',
            },
          },
          {
            when: row => ((row[colData[11]['dataRef2']] < '1') && (row[colData[11]['dataRef2']] > '0')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.1)',
            },
          },
          {
            when: row => ((row[colData[11]['dataRef2']] < '0') && (row[colData[11]['dataRef2']] >= '-1')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.1)',
            },
          },
          {
            when: row => ((row[colData[11]['dataRef2']] < '-1') && (row[colData[11]['dataRef2']] >= '-2')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.4)',
            },
          },
          {
            when: row => (row[colData[11]['dataRef2']] < '-2'),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.8)',
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
            when: row => row[colData[12]['dataRef1']] >= '3',
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.85)',
            },
          },
          {
            when: row => ((row[colData[12]['dataRef1']] < '3') && (row[colData[12]['dataRef1']] >= '2')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.65)',
            },
          },
          {
            when: row => ((row[colData[12]['dataRef1']] < '2') && (row[colData[12]['dataRef1']] >= '1')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.4)',
            },
          },
          {
            when: row => ((row[colData[12]['dataRef1']] < '1') && (row[colData[12]['dataRef1']] > '0')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.1)',
            },
          },
          {
            when: row => ((row[colData[12]['dataRef1']] < '0') && (row[colData[12]['dataRef1']] >= '-1')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.1)',
            },
          },
          {
            when: row => ((row[colData[12]['dataRef1']] < '-1') && (row[colData[12]['dataRef1']] >= '-2')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.4)',
            },
          },
          {
            when: row => (row[colData[12]['dataRef1']] < '-2'),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.8)',
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
            when: row => row[colData[12]['dataRef2']] >= '3',
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.85)',
            },
          },
          {
            when: row => ((row[colData[12]['dataRef2']] < '3') && (row[colData[12]['dataRef2']] >= '2')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.65)',
            },
          },
          {
            when: row => ((row[colData[12]['dataRef2']] < '2') && (row[colData[12]['dataRef2']] >= '1')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.4)',
            },
          },
          {
            when: row => ((row[colData[12]['dataRef2']] < '1') && (row[colData[12]['dataRef2']] > '0')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.1)',
            },
          },
          {
            when: row => ((row[colData[12]['dataRef2']] < '0') && (row[colData[12]['dataRef2']] >= '-1')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.1)',
            },
          },
          {
            when: row => ((row[colData[12]['dataRef2']] < '-1') && (row[colData[12]['dataRef2']] >= '-2')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.4)',
            },
          },
          {
            when: row => (row[colData[12]['dataRef2']] < '-2'),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.8)',
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
            when: row => row[colData[13]['dataRef1']] >= '3',
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.85)',
            },
          },
          {
            when: row => ((row[colData[13]['dataRef1']] < '3') && (row[colData[13]['dataRef1']] >= '2')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.65)',
            },
          },
          {
            when: row => ((row[colData[13]['dataRef1']] < '2') && (row[colData[13]['dataRef1']] >= '1')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.4)',
            },
          },
          {
            when: row => ((row[colData[13]['dataRef1']] < '1') && (row[colData[13]['dataRef1']] > '0')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.1)',
            },
          },
          {
            when: row => ((row[colData[13]['dataRef1']] < '0') && (row[colData[13]['dataRef1']] >= '-1')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.1)',
            },
          },
          {
            when: row => ((row[colData[13]['dataRef1']] < '-1') && (row[colData[13]['dataRef1']] >= '-2')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.4)',
            },
          },
          {
            when: row => (row[colData[13]['dataRef1']] < '-2'),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.8)',
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
            when: row => row[colData[13]['dataRef2']] >= '3',
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.85)',
            },
          },
          {
            when: row => ((row[colData[13]['dataRef2']] < '3') && (row[colData[13]['dataRef2']] >= '2')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.65)',
            },
          },
          {
            when: row => ((row[colData[13]['dataRef2']] < '2') && (row[colData[13]['dataRef2']] >= '1')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.4)',
            },
          },
          {
            when: row => ((row[colData[13]['dataRef2']] < '1') && (row[colData[13]['dataRef2']] > '0')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.1)',
            },
          },
          {
            when: row => ((row[colData[13]['dataRef2']] < '0') && (row[colData[13]['dataRef2']] >= '-1')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.1)',
            },
          },
          {
            when: row => ((row[colData[13]['dataRef2']] < '-1') && (row[colData[13]['dataRef2']] >= '-2')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.4)',
            },
          },
          {
            when: row => (row[colData[13]['dataRef2']] < '-2'),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.8)',
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
            when: row => row[colData[14]['dataRef1']] >= '3',
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.85)',
            },
          },
          {
            when: row => ((row[colData[14]['dataRef1']] < '3') && (row[colData[14]['dataRef1']] >= '2')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.65)',
            },
          },
          {
            when: row => ((row[colData[14]['dataRef1']] < '2') && (row[colData[14]['dataRef1']] >= '1')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.4)',
            },
          },
          {
            when: row => ((row[colData[14]['dataRef1']] < '1') && (row[colData[14]['dataRef1']] > '0')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.1)',
            },
          },
          {
            when: row => ((row[colData[14]['dataRef1']] < '0') && (row[colData[14]['dataRef1']] >= '-1')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.1)',
            },
          },
          {
            when: row => ((row[colData[14]['dataRef1']] < '-1') && (row[colData[14]['dataRef1']] >= '-2')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.4)',
            },
          },
          {
            when: row => (row[colData[14]['dataRef1']] < '-2'),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.8)',
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
            when: row => row[colData[14]['dataRef2']] >= '3',
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.85)',
            },
          },
          {
            when: row => ((row[colData[14]['dataRef2']] < '3') && (row[colData[14]['dataRef2']] >= '2')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.65)',
            },
          },
          {
            when: row => ((row[colData[14]['dataRef2']] < '2') && (row[colData[14]['dataRef2']] >= '1')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.4)',
            },
          },
          {
            when: row => ((row[colData[14]['dataRef2']] < '1') && (row[colData[14]['dataRef2']] > '0')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.1)',
            },
          },
          {
            when: row => ((row[colData[14]['dataRef2']] < '0') && (row[colData[14]['dataRef2']] >= '-1')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.1)',
            },
          },
          {
            when: row => ((row[colData[14]['dataRef2']] < '-1') && (row[colData[14]['dataRef2']] >= '-2')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.4)',
            },
          },
          {
            when: row => (row[colData[14]['dataRef2']] < '-2'),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.8)',
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
            when: row => row[colData[15]['dataRef1']] >= '3',
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.85)',
            },
          },
          {
            when: row => ((row[colData[15]['dataRef1']] < '3') && (row[colData[15]['dataRef1']] >= '2')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.65)',
            },
          },
          {
            when: row => ((row[colData[15]['dataRef1']] < '2') && (row[colData[15]['dataRef1']] >= '1')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.4)',
            },
          },
          {
            when: row => ((row[colData[15]['dataRef1']] < '1') && (row[colData[15]['dataRef1']] > '0')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.1)',
            },
          },
          {
            when: row => ((row[colData[15]['dataRef1']] < '0') && (row[colData[15]['dataRef1']] >= '-1')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.1)',
            },
          },
          {
            when: row => ((row[colData[15]['dataRef1']] < '-1') && (row[colData[15]['dataRef1']] >= '-2')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.4)',
            },
          },
          {
            when: row => (row[colData[15]['dataRef1']] < '-2'),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.8)',
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
            when: row => row[colData[15]['dataRef2']] >= '3',
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.85)',
            },
          },
          {
            when: row => ((row[colData[15]['dataRef2']] < '3') && (row[colData[15]['dataRef2']] >= '2')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.65)',
            },
          },
          {
            when: row => ((row[colData[15]['dataRef2']] < '2') && (row[colData[15]['dataRef2']] >= '1')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.4)',
            },
          },
          {
            when: row => ((row[colData[15]['dataRef2']] < '1') && (row[colData[15]['dataRef2']] > '0')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.1)',
            },
          },
          {
            when: row => ((row[colData[15]['dataRef2']] < '0') && (row[colData[15]['dataRef2']] >= '-1')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.1)',
            },
          },
          {
            when: row => ((row[colData[15]['dataRef2']] < '-1') && (row[colData[15]['dataRef2']] >= '-2')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.4)',
            },
          },
          {
            when: row => (row[colData[15]['dataRef2']] < '-2'),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.8)',
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
            when: row => row[colData[16]['dataRef1']] >= '3',
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.85)',
            },
          },
          {
            when: row => ((row[colData[16]['dataRef1']] < '3') && (row[colData[16]['dataRef1']] >= '2')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.65)',
            },
          },
          {
            when: row => ((row[colData[16]['dataRef1']] < '2') && (row[colData[16]['dataRef1']] >= '1')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.4)',
            },
          },
          {
            when: row => ((row[colData[16]['dataRef1']] < '1') && (row[colData[16]['dataRef1']] > '0')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.1)',
            },
          },
          {
            when: row => ((row[colData[16]['dataRef1']] < '0') && (row[colData[16]['dataRef1']] >= '-1')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.1)',
            },
          },
          {
            when: row => ((row[colData[16]['dataRef1']] < '-1') && (row[colData[16]['dataRef1']] >= '-2')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.4)',
            },
          },
          {
            when: row => (row[colData[16]['dataRef1']] < '-2'),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.8)',
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
            when: row => row[colData[16]['dataRef2']] >= '3',
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.85)',
            },
          },
          {
            when: row => ((row[colData[16]['dataRef2']] < '3') && (row[colData[16]['dataRef2']] >= '2')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.65)',
            },
          },
          {
            when: row => ((row[colData[16]['dataRef2']] < '2') && (row[colData[16]['dataRef2']] >= '1')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.4)',
            },
          },
          {
            when: row => ((row[colData[16]['dataRef2']] < '1') && (row[colData[16]['dataRef2']] > '0')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.1)',
            },
          },
          {
            when: row => ((row[colData[16]['dataRef2']] < '0') && (row[colData[16]['dataRef2']] >= '-1')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.1)',
            },
          },
          {
            when: row => ((row[colData[16]['dataRef2']] < '-1') && (row[colData[16]['dataRef2']] >= '-2')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.4)',
            },
          },
          {
            when: row => (row[colData[16]['dataRef2']] < '-2'),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.8)',
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
            when: row => row[colData[17]['dataRef1']] >= '3',
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.85)',
            },
          },
          {
            when: row => ((row[colData[17]['dataRef1']] < '3') && (row[colData[17]['dataRef1']] >= '2')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.65)',
            },
          },
          {
            when: row => ((row[colData[17]['dataRef1']] < '2') && (row[colData[17]['dataRef1']] >= '1')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.4)',
            },
          },
          {
            when: row => ((row[colData[17]['dataRef1']] < '1') && (row[colData[17]['dataRef1']] > '0')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.1)',
            },
          },
          {
            when: row => ((row[colData[17]['dataRef1']] < '0') && (row[colData[17]['dataRef1']] >= '-1')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.1)',
            },
          },
          {
            when: row => ((row[colData[17]['dataRef1']] < '-1') && (row[colData[17]['dataRef1']] >= '-2')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.4)',
            },
          },
          {
            when: row => (row[colData[17]['dataRef1']] < '-2'),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.8)',
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
            when: row => row[colData[17]['dataRef2']] >= '3',
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.85)',
            },
          },
          {
            when: row => ((row[colData[17]['dataRef2']] < '3') && (row[colData[17]['dataRef2']] >= '2')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.65)',
            },
          },
          {
            when: row => ((row[colData[17]['dataRef2']] < '2') && (row[colData[17]['dataRef2']] >= '1')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.4)',
            },
          },
          {
            when: row => ((row[colData[17]['dataRef2']] < '1') && (row[colData[17]['dataRef2']] > '0')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.1)',
            },
          },
          {
            when: row => ((row[colData[17]['dataRef2']] < '0') && (row[colData[17]['dataRef2']] >= '-1')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.1)',
            },
          },
          {
            when: row => ((row[colData[17]['dataRef2']] < '-1') && (row[colData[17]['dataRef2']] >= '-2')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.4)',
            },
          },
          {
            when: row => (row[colData[17]['dataRef2']] < '-2'),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.8)',
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
            when: row => row[colData[18]['dataRef1']] >= '3',
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.85)',
            },
          },
          {
            when: row => ((row[colData[18]['dataRef1']] < '3') && (row[colData[18]['dataRef1']] >= '2')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.65)',
            },
          },
          {
            when: row => ((row[colData[18]['dataRef1']] < '2') && (row[colData[18]['dataRef1']] >= '1')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.4)',
            },
          },
          {
            when: row => ((row[colData[18]['dataRef1']] < '1') && (row[colData[18]['dataRef1']] > '0')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.1)',
            },
          },
          {
            when: row => ((row[colData[18]['dataRef1']] < '0') && (row[colData[18]['dataRef1']] >= '-1')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.1)',
            },
          },
          {
            when: row => ((row[colData[18]['dataRef1']] < '-1') && (row[colData[18]['dataRef1']] >= '-2')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.4)',
            },
          },
          {
            when: row => (row[colData[18]['dataRef1']] < '-2'),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.8)',
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
            when: row => row[colData[18]['dataRef2']] >= '3',
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.85)',
            },
          },
          {
            when: row => ((row[colData[18]['dataRef2']] < '3') && (row[colData[18]['dataRef2']] >= '2')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.65)',
            },
          },
          {
            when: row => ((row[colData[18]['dataRef2']] < '2') && (row[colData[18]['dataRef2']] >= '1')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.4)',
            },
          },
          {
            when: row => ((row[colData[18]['dataRef2']] < '1') && (row[colData[18]['dataRef2']] > '0')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.1)',
            },
          },
          {
            when: row => ((row[colData[18]['dataRef2']] < '0') && (row[colData[18]['dataRef2']] >= '-1')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.1)',
            },
          },
          {
            when: row => ((row[colData[18]['dataRef2']] < '-1') && (row[colData[18]['dataRef2']] >= '-2')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.4)',
            },
          },
          {
            when: row => (row[colData[18]['dataRef2']] < '-2'),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.8)',
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
            when: row => row[colData[19]['dataRef1']] >= '3',
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.85)',
            },
          },
          {
            when: row => ((row[colData[19]['dataRef1']] < '3') && (row[colData[19]['dataRef1']] >= '2')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.65)',
            },
          },
          {
            when: row => ((row[colData[19]['dataRef1']] < '2') && (row[colData[19]['dataRef1']] >= '1')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.4)',
            },
          },
          {
            when: row => ((row[colData[19]['dataRef1']] < '1') && (row[colData[19]['dataRef1']] > '0')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.1)',
            },
          },
          {
            when: row => ((row[colData[19]['dataRef1']] < '0') && (row[colData[19]['dataRef1']] >= '-1')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.1)',
            },
          },
          {
            when: row => ((row[colData[19]['dataRef1']] < '-1') && (row[colData[19]['dataRef1']] >= '-2')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.4)',
            },
          },
          {
            when: row => (row[colData[19]['dataRef1']] < '-2'),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.8)',
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
            when: row => row[colData[19]['dataRef2']] >= '3',
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.85)',
            },
          },
          {
            when: row => ((row[colData[19]['dataRef2']] < '3') && (row[colData[19]['dataRef2']] >= '2')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.65)',
            },
          },
          {
            when: row => ((row[colData[19]['dataRef2']] < '2') && (row[colData[19]['dataRef2']] >= '1')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.4)',
            },
          },
          {
            when: row => ((row[colData[19]['dataRef2']] < '1') && (row[colData[19]['dataRef2']] > '0')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.1)',
            },
          },
          {
            when: row => ((row[colData[19]['dataRef2']] < '0') && (row[colData[19]['dataRef2']] >= '-1')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.1)',
            },
          },
          {
            when: row => ((row[colData[19]['dataRef2']] < '-1') && (row[colData[19]['dataRef2']] >= '-2')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.4)',
            },
          },
          {
            when: row => (row[colData[19]['dataRef2']] < '-2'),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.8)',
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
            when: row => row[colData[20]['dataRef1']] >= '3',
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.85)',
            },
          },
          {
            when: row => ((row[colData[20]['dataRef1']] < '3') && (row[colData[20]['dataRef1']] >= '2')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.65)',
            },
          },
          {
            when: row => ((row[colData[20]['dataRef1']] < '2') && (row[colData[20]['dataRef1']] >= '1')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.4)',
            },
          },
          {
            when: row => ((row[colData[20]['dataRef1']] < '1') && (row[colData[20]['dataRef1']] > '0')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.1)',
            },
          },
          {
            when: row => ((row[colData[20]['dataRef1']] < '0') && (row[colData[20]['dataRef1']] >= '-1')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.1)',
            },
          },
          {
            when: row => ((row[colData[20]['dataRef1']] < '-1') && (row[colData[20]['dataRef1']] >= '-2')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.4)',
            },
          },
          {
            when: row => (row[colData[20]['dataRef1']] < '-2'),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.8)',
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
            when: row => row[colData[20]['dataRef2']] >= '3',
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.85)',
            },
          },
          {
            when: row => ((row[colData[20]['dataRef2']] < '3') && (row[colData[20]['dataRef2']] >= '2')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.65)',
            },
          },
          {
            when: row => ((row[colData[20]['dataRef2']] < '2') && (row[colData[20]['dataRef2']] >= '1')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.4)',
            },
          },
          {
            when: row => ((row[colData[20]['dataRef2']] < '1') && (row[colData[20]['dataRef2']] > '0')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.1)',
            },
          },
          {
            when: row => ((row[colData[20]['dataRef2']] < '0') && (row[colData[20]['dataRef2']] >= '-1')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.1)',
            },
          },
          {
            when: row => ((row[colData[20]['dataRef2']] < '-1') && (row[colData[20]['dataRef2']] >= '-2')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.4)',
            },
          },
          {
            when: row => (row[colData[20]['dataRef2']] < '-2'),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.8)',
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
            when: row => row[colData[21]['dataRef1']] >= '3',
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.85)',
            },
          },
          {
            when: row => ((row[colData[21]['dataRef1']] < '3') && (row[colData[21]['dataRef1']] >= '2')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.65)',
            },
          },
          {
            when: row => ((row[colData[21]['dataRef1']] < '2') && (row[colData[21]['dataRef1']] >= '1')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.4)',
            },
          },
          {
            when: row => ((row[colData[21]['dataRef1']] < '1') && (row[colData[21]['dataRef1']] > '0')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.1)',
            },
          },
          {
            when: row => ((row[colData[21]['dataRef1']] < '0') && (row[colData[21]['dataRef1']] >= '-1')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.1)',
            },
          },
          {
            when: row => ((row[colData[21]['dataRef1']] < '-1') && (row[colData[21]['dataRef1']] >= '-2')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.4)',
            },
          },
          {
            when: row => (row[colData[21]['dataRef1']] < '-2'),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.8)',
            },
          }
        ]
      },
      {
        name: colData[22]['name'],
        selector: row => row[colData[22]['dataRef1']],
        sortable: true,
        width: dataColWidth01,
        omit: colData[22]['omitTotal'],
        conditionalCellStyles: [
          {
            when: row => row[colData[22]['dataRef1']] >= '3',
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.85)',
            },
          },
          {
            when: row => ((row[colData[22]['dataRef1']] < '3') && (row[colData[22]['dataRef1']] >= '2')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.65)',
            },
          },
          {
            when: row => ((row[colData[22]['dataRef1']] < '2') && (row[colData[22]['dataRef1']] >= '1')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.4)',
            },
          },
          {
            when: row => ((row[colData[22]['dataRef1']] < '1') && (row[colData[22]['dataRef1']] > '0')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.1)',
            },
          },
          {
            when: row => ((row[colData[22]['dataRef1']] < '0') && (row[colData[22]['dataRef1']] >= '-1')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.1)',
            },
          },
          {
            when: row => ((row[colData[22]['dataRef1']] < '-1') && (row[colData[22]['dataRef1']] >= '-2')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.4)',
            },
          },
          {
            when: row => (row[colData[22]['dataRef1']] < '-2'),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.8)',
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
            when: row => row[colData[22]['dataRef2']] >= '3',
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.85)',
            },
          },
          {
            when: row => ((row[colData[22]['dataRef2']] < '3') && (row[colData[22]['dataRef2']] >= '2')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.65)',
            },
          },
          {
            when: row => ((row[colData[22]['dataRef2']] < '2') && (row[colData[22]['dataRef2']] >= '1')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.4)',
            },
          },
          {
            when: row => ((row[colData[22]['dataRef2']] < '1') && (row[colData[22]['dataRef2']] > '0')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.1)',
            },
          },
          {
            when: row => ((row[colData[22]['dataRef2']] < '0') && (row[colData[22]['dataRef2']] >= '-1')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.1)',
            },
          },
          {
            when: row => ((row[colData[22]['dataRef2']] < '-1') && (row[colData[22]['dataRef2']] >= '-2')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.4)',
            },
          },
          {
            when: row => (row[colData[22]['dataRef2']] < '-2'),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.8)',
            },
          }
        ]     
      },
      {
        name: colData[23]['name'],
        selector: row => row[colData[23]['dataRef1']],
        sortable: true,
        width: dataColWidth01,
        omit: colData[23]['omitTotal'],
        conditionalCellStyles: [
          {
            when: row => row[colData[23]['dataRef1']] >= '3',
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.85)',
            },
          },
          {
            when: row => ((row[colData[23]['dataRef1']] < '3') && (row[colData[23]['dataRef1']] >= '2')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.65)',
            },
          },
          {
            when: row => ((row[colData[23]['dataRef1']] < '2') && (row[colData[23]['dataRef1']] >= '1')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.4)',
            },
          },
          {
            when: row => ((row[colData[23]['dataRef1']] < '1') && (row[colData[23]['dataRef1']] > '0')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.1)',
            },
          },
          {
            when: row => ((row[colData[23]['dataRef1']] < '0') && (row[colData[23]['dataRef1']] >= '-1')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.1)',
            },
          },
          {
            when: row => ((row[colData[23]['dataRef1']] < '-1') && (row[colData[23]['dataRef1']] >= '-2')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.4)',
            },
          },
          {
            when: row => (row[colData[23]['dataRef1']] < '-2'),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.8)',
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
            when: row => row[colData[23]['dataRef2']] >= '3',
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.85)',
            },
          },
          {
            when: row => ((row[colData[23]['dataRef2']] < '3') && (row[colData[23]['dataRef2']] >= '2')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.65)',
            },
          },
          {
            when: row => ((row[colData[23]['dataRef2']] < '2') && (row[colData[23]['dataRef2']] >= '1')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.4)',
            },
          },
          {
            when: row => ((row[colData[23]['dataRef2']] < '1') && (row[colData[23]['dataRef2']] > '0')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.1)',
            },
          },
          {
            when: row => ((row[colData[23]['dataRef2']] < '0') && (row[colData[23]['dataRef2']] >= '-1')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.1)',
            },
          },
          {
            when: row => ((row[colData[23]['dataRef2']] < '-1') && (row[colData[23]['dataRef2']] >= '-2')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.4)',
            },
          },
          {
            when: row => (row[colData[23]['dataRef2']] < '-2'),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.8)',
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
            when: row => row[colData[24]['dataRef1']] >= '3',
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.85)',
            },
          },
          {
            when: row => ((row[colData[24]['dataRef1']] < '3') && (row[colData[24]['dataRef1']] >= '2')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.65)',
            },
          },
          {
            when: row => ((row[colData[24]['dataRef1']] < '2') && (row[colData[24]['dataRef1']] >= '1')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.4)',
            },
          },
          {
            when: row => ((row[colData[24]['dataRef1']] < '1') && (row[colData[24]['dataRef1']] > '0')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.1)',
            },
          },
          {
            when: row => ((row[colData[24]['dataRef1']] < '0') && (row[colData[24]['dataRef1']] >= '-1')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.1)',
            },
          },
          {
            when: row => ((row[colData[24]['dataRef1']] < '-1') && (row[colData[24]['dataRef1']] >= '-2')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.4)',
            },
          },
          {
            when: row => (row[colData[24]['dataRef1']] < '-2'),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.8)',
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
            when: row => row[colData[25]['dataRef1']] >= '3',
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.85)',
            },
          },
          {
            when: row => ((row[colData[25]['dataRef1']] < '3') && (row[colData[25]['dataRef1']] >= '2')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.65)',
            },
          },
          {
            when: row => ((row[colData[25]['dataRef1']] < '2') && (row[colData[25]['dataRef1']] >= '1')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.4)',
            },
          },
          {
            when: row => ((row[colData[25]['dataRef1']] < '1') && (row[colData[25]['dataRef1']] > '0')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.1)',
            },
          },
          {
            when: row => ((row[colData[25]['dataRef1']] < '0') && (row[colData[25]['dataRef1']] >= '-1')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.1)',
            },
          },
          {
            when: row => ((row[colData[25]['dataRef1']] < '-1') && (row[colData[25]['dataRef1']] >= '-2')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.4)',
            },
          },
          {
            when: row => (row[colData[25]['dataRef1']] < '-2'),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.8)',
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
            when: row => row[colData[25]['dataRef2']] >= '3',
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.85)',
            },
          },
          {
            when: row => ((row[colData[25]['dataRef2']] < '3') && (row[colData[25]['dataRef2']] >= '2')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.65)',
            },
          },
          {
            when: row => ((row[colData[25]['dataRef2']] < '2') && (row[colData[25]['dataRef2']] >= '1')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.4)',
            },
          },
          {
            when: row => ((row[colData[25]['dataRef2']] < '1') && (row[colData[25]['dataRef2']] > '0')),
            style: {
              backgroundColor: 'rgba(69, 128, 241, 0.1)',
            },
          },
          {
            when: row => ((row[colData[25]['dataRef2']] < '0') && (row[colData[25]['dataRef2']] >= '-1')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.1)',
            },
          },
          {
            when: row => ((row[colData[25]['dataRef2']] < '-1') && (row[colData[25]['dataRef2']] >= '-2')),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.4)',
            },
          },
          {
            when: row => (row[colData[25]['dataRef2']] < '-2'),
            style: {
              backgroundColor: 'rgba(255, 84, 84, 0.8)',
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

  // async function fetchADPs() {
  //   console.log('fetching ADPs')
  //   let adpSupabaseTable = 'Yahoo_NHL_ADP';

  //   const { data, error } = await supabase
  //     .from(adpSupabaseTable)
  //     .select()
  //   if (error) {
  //     console.log('error')
  //     console.log(error.message)
  //     return // abort
  //   }    

  //   return data;
  // }

  const addADP = (mainData) => {
    console.log('addADPs')
    let keyedADPs = {}

    fetchADPs()
      .then(data => {
        for (let row in data) {
          keyedADPs[data[row]['playerID']] = {
            avgPick: data[row]['playerAvgPick'],
            avgRd: data[row]['playerAvgRd'],
            pctPicked: data[row]['playerPctPicked']
          }
        }

        for (let player in mainData) {
          let id = mainData[player]["PlayerID"];
          if (id in keyedADPs) {
            mainData[player]["avgPick"] = keyedADPs[id]["avgPick"]
          }
        }

        // console.log('mainData has ADPs')
      })
      .catch(console.error)

    return mainData

  }


  const setTableData = (data) => {
    console.log('setTableData');
    tableData = []; // clear specific subset of data to display
    data.Source = dataSource;
    console.log('Data was pulled from: ' + data.Source + ' and took ' + data.responseTime)

    if (tablePosFilter == 'None') {
      tableData = data.filter(player => (player.VORPPosition != "Overall") && (player.VORPPosition != "Overall perGP"))
    } else {
      tableData = data.filter(player => player.VORPPosition == tablePosFilter);
    }

    setTableCols(colData)
    setLoading(false);

    console.log(tableData)
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

      console.log('fetching data from server')
      setLoading(true)
      let dbFile = league + '__' + lsID + '__' + seasonID;
      console.log("db file = " + dbFile)

      // ------------- TODO: Add REDIS cache here (or some other simple cache) in order to save on server calls

      const { data, error } = await supabase
        .from(dbFile)
        .select()
        .range(0, 200)
        .then( dataSource = 'API' )
        // .then(data => {    // THIS FIRES TOO EARLY - DATA HASN'T BEEN LOADED
        //   setPlayerData(data)
        // })
      if (error) {
        console.log('error')
        console.log(error.message)
        return // abort
      }
      
      return data;
  }

  
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

      <h2>NHL Fantasy VORP Data</h2>
      <div className="playerDataControlMenu">
        <div className="form_group_container">
          <Stack direction="row" spacing={2}>
          <Controller
            name="seasonSelect"
            control={control}
            defaultValue="ProjVORPs"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
                <FormControl className="mui_select">
                    <InputLabel id="seasonSelect-select">Select Season</InputLabel>
                    <Select
                    labelId="seasonSelect-select"
                    label="Select Season"
                    sx={{ width: 250 }}
                    value={value}
                    onChange={onChange}
                    error={!!error}
                    // helperText={error ? error.message : null}
                    >
                        <MenuItem value={'ProjVORPs'}>22-23 Projection</MenuItem>
                        <MenuItem value={'1920'}>19-20</MenuItem>
                        <MenuItem value={'2021'}>20-21</MenuItem>
                        <MenuItem value={'2122'}>21-22</MenuItem>
                    </Select>
                </FormControl>
              )}
            />
            <Controller
            name="tablePosFilter"
            control={control}
            defaultValue="None"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
                <FormControl className="mui_select">
                    <InputLabel id="tablePosFilter-select">VORP Position Filter</InputLabel>
                    <Select
                    labelId="tablePosFilter-select"
                    label="Position Filter"
                    sx={{ width: 250 }}
                    value={value}
                    onChange={onChange}
                    error={!!error}
                    // helperText={error ? error.message : null}
                    >
                        <MenuItem value={'None'}>None</MenuItem>
                        <MenuItem value={'Overall'}>Overall</MenuItem>
                        <MenuItem value={'C'}>C</MenuItem>
                        <MenuItem value={'LW'}>LW</MenuItem>
                        <MenuItem value={'RW'}>RW</MenuItem>
                        <MenuItem value={'D'}>D</MenuItem>
                        <MenuItem value={'G'}>G</MenuItem>
                        <MenuItem hidden value={'Overall perGP'}>Overall perGP</MenuItem>
                    </Select>
                </FormControl>
            )}
            // rules={{ required: 'Fantasy Site required' }}
            />
            <FormControl component="fieldset">
              <FormGroup aria-label="position" row>
                {/* <FormLabel component="legend">Table Controls</FormLabel> */}
                <FormControlLabel
                    control={
                      <Switch 
                      checked={showPerGP} 
                      onChange={() => setShowPerGP(!showPerGP)}
                      name="totals" />
                    }
                    label="Totals / perGP"
                    labelPlacement="top"
                  />
                  {/* 
                    TODO: Add this functionality
                    Issue rendering using both hidePosRnk AND showPerGP toggles
                  */}
                  {/* <FormControlLabel
                    label="Show Position Ranks"
                    labelPlacement="top"
                    control={
                      <Checkbox 
                        defaultChecked
                        checked={!hidePosRnk}
                        onChange={() => setHidePosRnk(!hidePosRnk)}
                        inputProps={{ 'aria-label': 'controlled' }}  
                      />
                    }
                  /> */}
                  {/* <FormControlLabel
                    label="Show ADP"
                    labelPlacement="top"
                    control={
                      <Checkbox 
                        checked={!hideADP}
                        onChange={() => setHideADP(!hideADP)}
                        inputProps={{ 'aria-label': 'controlled' }}  
                      />
                    }
                  /> */}
                  {/* <Button variant="contained" onClick={() => setHidePosRnk(!hidePosRnk)}>Toggle Pos-Rank Column</Button>
                  <Button variant="contained" onClick={() => setHideADP(!hideADP)}>Toggle ADP Columns</Button> */}
              </FormGroup>
            </FormControl>

          </Stack>
        </div>
      </div>
      <h3>
        {showPerGP ? 'Per Game' : 'Totals'}
        { tablePosFilter == "None" ? " - All Position VORPs" : " - " + tablePosFilter + " VORP"}
      </h3>

      { newLS ? (
        <p>
          New League Setting! Please enter your email or whatever
        </p>
      ) : (
        ""
      )}

      <div className={styles.dataTableContainer}>
        { lsID ? 
          "" : 
          (
            <p className="warning">Please enter your league settings above to see relevant Fantasy VORP data ☝️</p>
          )
        }
        { loading ? (
            <p className="subtext">DataTable Loading...</p>
          ) : 
          <DataTable
          title={"Table Title TODO"}
          columns={columns}
          data={tableData}  // filteredItems
          customStyles={customRDTStyles}
          conditionalRowStyles={specificRDTStyles}
          className="dataTable"
          defaultSortFieldId="VORP"
          defaultSortAsc={false}
          responsive
          dense
          direction="auto"
          fixedHeader
          noHeader
          // fixedHeaderScrollHeight="300px"
          highlightOnHover
          pagination
          paginationPerPage={100}
          // selectAllRowsItem true
          // selectableRows
          selectableRowsHighlight
          selectableRowsRadio="checkbox"
          striped // Not currently working lol
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