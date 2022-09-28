import { useState, useEffect, createRef } from 'react'
import Link from 'next/link';

// import styles from '../styles/components/setLeagueSettings.module.scss';

import { Controller, useForm } from 'react-hook-form';
import { supabase } from '../utils/supabaseClient'
import ReCAPTCHA from "react-google-recaptcha";

import FormControl from '@mui/material/FormControl';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';

import Stack from '@mui/material/Stack';
import { registerStyles } from '@emotion/utils';

// TODO: Figure out the fucking caching...
// See 
// Cache
// import redis from '../utils/redis';

// React-Hook-Form with MUI tutorial her ==>
// https://levelup.gitconnected.com/using-react-hook-form-with-material-ui-components-ba42ace9507a

let tableCats;
let leagueSettingFile;

export default function LeagueSettingsForm(props) {
    const [loading, setLoading] = useState(false);
    const { watch, control, reset, handleSubmit } = useForm();
    const recaptchaRef = createRef();

    let scoringTypeRadio = watch("radioScoringType");
    // console.log(watch());

    const onFormChange = (value) => {
        console.log("Captcha value:", value);
    }

    // Get LS Json from public supabase storage file
    let url = 'https://oxkhcrfsekayvbmrpvfj.supabase.co/storage/v1/object/public/site-content/nhl_settings_ID_map.json'
    leagueSettingFile = {};
    if (Object.keys(leagueSettingFile).length == 0) {
        console.log('grabbing new LS Map from ' + url)
        fetch(url)
        .then(res => res.json())
        .then(data =>
            leagueSettingFile = data)
        .then( console.log('got leaguesetting map' + leagueSettingFile))
        .catch(err => {
            console.log(err)
            console.log(err.message)
            // alert('Uh oh, looks there was an issue with submitting your request. Try refreshing the page and submitting again. If the issue persists, please submit the issue to hello@fantasyvorp.com')
    });
    }

    const toggleModal = () => {
        props.setLSModal(false)
    }

    const wait = delay => new Promise(resolve => setTimeout(resolve, delay));
    const fakeLoadingTimeout = async () => {
        setLoading(true)
        await wait(2000);
        setLoading(false)
        toggleModal();
    }

    const onSubmit = (data) => {
        recaptchaRef.current.execute();
        // console.log(leagueSettingFile)
        // fakeLoadingTimeout();
        console.log('submitting league settings...')

        let positionJSON = {}
        let categoryJSON = {}
        let scoringType = '';
        let leagueTeams = 0;
        let catID = '';
        let posID = '';
        tableCats = [];

        if (!data) {
            console.log('form data error')
            alert('Uh oh, looks there was an issue with submitting your League Settings. Try refreshing the page and submitting them again. If the issue persists, please submit the issue to hello@fantasyvorp.com. So sorry for the inconvenience!')
            return
        }

        console.log(data)

        for (let x in data) {
            let y = x.slice(0,3);
            switch(y) {
                case 'ros':     // roster data
                    let pos_0 = x.split("-");
                    let pos = pos_0[1];
                    switch(pos) {
                        case 'bn':
                            pos = 'Bench'
                            break;
                        case 'util':
                            pos = 'Util'
                            break;
                        default:
                            pos = pos.toUpperCase();
                    }
                    if (data[x] == "") {
                        positionJSON[pos] = 0
                    } else {
                        positionJSON[pos] = data[x]
                    }
                    break;
                case 'cat':     // category data
                    let cat_0 = x.split("_");
                    let cat = cat_0[1];
                    
                    switch(cat) {
                        case 'svpct':
                            cat = "SV%"
                            break;
                        default:
                            cat = cat.toUpperCase();
                            break;
                    }
                    categoryJSON[cat] = {}

                    if (data[x] == true) {
                        categoryJSON[cat]["Status"] = 1
                    } else {
                        categoryJSON[cat]["Status"] = 0
                    }
                    break;
                case 'rad':     // cats vs points
                    scoringType = 1
                    if (data[x] == 'categories') {
                        scoringType = 0
                    }
                    break;
                case 'pts':     // cat weight (pts) data
                    let pts_0 = x.split("_");
                    let ptsCat = pts_0[1].toUpperCase();

                    switch(ptsCat) {
                        case 'svpct':
                            ptsCat = "SV%"
                            break;
                        default:
                            ptsCat = cat.toUpperCase();
                            break;
                    }

                    if (scoringType == 'categories') {
                            categoryJSON[ptsCat]["Weight"] = 1
                    } else {
                        if (data[x] == "") {
                            categoryJSON[ptsCat]["Weight"] = 0
                        } else {
                            categoryJSON[ptsCat]["Weight"] = parseFloat(data[x])
                        }
                    }
                    
                    break;
                case 'fan':     // fantasy site
                    break;
                case 'lea':     // # of league teams
                    leagueTeams = parseInt(data[x])
                    break;
                case 'pro':     // projection inputs
                    // TODO: Add this functionality
                    break;
                default:
                    console.log('not sure what this is: ' + data[x])
            }
        }

        console.log('positionJSON :')
        console.log(positionJSON)
        console.log('categoryJSON :')
        console.log(categoryJSON)

        props.getCatSettings(categoryJSON)
        props.getPosSettings(positionJSON)

        console.log(leagueSettingFile)

        
        // Check which Cat ID from leagueSettingFile matches form categoryID
        for (let catSetting in leagueSettingFile["Category_IDs"]) {
            console.log('checking: ' + catSetting)
            let catSettingJSON = leagueSettingFile["Category_IDs"][catSetting]

            // For some reason comparing (categoryJSON == catSettingJSON) ALWAYS returns false...? So this is the long stupid workaround :'(                
            let matchCheck = true

            
            if (scoringType == 0) {
                for (let cat in catSettingJSON) {
                    let settingCatStatus = catSettingJSON[cat]["Status"];
                    let formCatStatus = categoryJSON[cat]["Status"];
                    if (settingCatStatus != formCatStatus) {
                        matchCheck = false
                    }
                }         
            } else {
                for (let cat in catSettingJSON) {
                    let settingCatStatus = catSettingJSON[cat]["Status"];
                    let formCatStatus = categoryJSON[cat]["Status"];
                    let settingCatWeight = catSettingJSON[cat]["Weight"];
                    let formCatWeight = categoryJSON[cat]["Weight"];

                    if ((settingCatStatus != formCatStatus) || (settingCatWeight != formCatWeight))  {
                        matchCheck = false
                    }
                    if (formCatStatus == 1) {
                        tableCats.push(cat)
                    }
                }         
            }


            if (matchCheck) {
                catID = catSetting
                console.log(catSetting + ' is a match!')
                break;
            } else {
                console.log(catSetting + ' is NOT a match')
            }    

        }

        // Also create the Column name / data array for getPlayerData
        let x = 0;
        for (let cat in categoryJSON) {
            let catColInfo;

            catColInfo = {
                name: cat,
                dataRef1: `${cat} VORP`,
                dataRef2: `${cat} perGP VORP`,
                active: false
            }

            if (categoryJSON[cat]["Status"] == 1) {
                catColInfo['active'] = true;
            }
            tableCats[x] = catColInfo
            x += 1
        }


        if (scoringType == 0) {
            tableCats['Scoring Type'] = 'Categories'
        } else {
            tableCats['Scoring Type'] = 'Points'
        }

        for (let posSetting in leagueSettingFile["Position_IDs"]) {
            let posSettingJSON = leagueSettingFile["Position_IDs"][posSetting]

            // console.log(positionJSON)
            // console.log(posSettingJSON)

            // For some reason comparing (positionJSON == posSettingJSON) ALWAYS returns false...? So this is the long stupid workaround :'(                
            let matchCheck = true
            for (let pos in posSettingJSON) {
                let settingPosStatus = posSettingJSON[pos]
                let formPosStatus = positionJSON[pos]
                if (settingPosStatus != formPosStatus) {
                    matchCheck = false;
                }
            }         

            if (matchCheck) {
                posID = posSetting
                console.log(posSetting + ' is a match!')
                break;
            } else {
                console.log(posSetting + ' is NOT a match')
            }    

        }

        // IF LSID is not found in LS ID Map, then serialize the settings and send the prop to be submitted to LSIDSubmissions
        // SET LSID AND TABLE COLUMNS
        let leaguesetid = leagueTeams + '_' + catID + '_' + posID + '_' + scoringType;
        console.log(leaguesetid)
        if ((leaguesetid.length < 11) || (scoringType == null)) {
            console.log(categoryJSON)
            console.log(positionJSON)

            leaguesetid = ""
            leaguesetid += leagueTeams
            leaguesetid += "___"

            for (let pos in positionJSON) {
                // leaguesetid += pos
                leaguesetid += positionJSON[pos]
                leaguesetid += '_'
            }

            leaguesetid += "___"

            if (scoringType == 0) {
                for (let cat in categoryJSON) {
                    // leaguesetid += cat
                    leaguesetid += categoryJSON[cat]["Status"]
                    leaguesetid += '_'
                }
            } else {
                for (let cat in categoryJSON) {
                    // leaguesetid += cat
                    if (categoryJSON[cat]["Status"] == 1) {
                        leaguesetid += categoryJSON[cat]["Weight"]
                        leaguesetid += '_'
                    } else {
                        leaguesetid += '0_'
                    }
                }
            }
            leaguesetid += "___"
            leaguesetid += scoringType
        }
        console.log(leaguesetid)
        props.getLSID(leaguesetid);
        props.getColData(tableCats);
        // console.log(leaguesetid);
        // console.log(tableCats);   
        // toggleModal();     
    }   

    useEffect(() => {
        togglePointsFields();

    }, [scoringTypeRadio])

    // Show or Hide Points fields (based on scoringRadio)
    const togglePointsFields = () => {
        const fields = document.querySelectorAll('.mui_textfield_pts');

        if (scoringTypeRadio == 'points') {
            for (const field of fields) {
                field.classList.remove('hidden');
            }
        } else {
            for (const field of fields) {
                field.classList.add('hidden');
            }
        }
    }
    
    // const highlightActiveSelect = () => {
    // TODO: do this... so it's less confusing UX
    // }

    return (
        <div className="ls-modal">
        <div className="ls-modal-content">
            <span className="closeBtn" onClick={() => toggleModal()}>X</span>
            {/* <GetleagueSettingFile setleagueSettingFile={setleagueSettingFile}/> */}

            <h2>Input Your League&apos;s Settings</h2>
            <p>
                Please input your league settings below. <br />
                {/* <span className="subtext"> */}
                    <em>Form is set to standard <strong>Yahoo! H2H Categories</strong> by default</em>
                {/* </span> */}
            </p>

            <form className="ls-form" onSubmit={handleSubmit(onSubmit)}>

                <div className="form_group_container" id="section_1">
                    {/* <Controller
                    name="fantasySite"
                    control={control}
                    defaultValue="yahoo"
                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                        <FormControl className="mui_select" disabled>
                            <InputLabel id="fanSite-select select-disabled">Fantasy Site</InputLabel>
                            <Select
                            labelId="fanSite-select"
                            label="Fantasy Site"
                            sx={{ width: 250 }}
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            >
                                <MenuItem value={'yahoo'}>Yahoo</MenuItem>
                                <MenuItem value={'fantrax'}>Fantrax</MenuItem>
                                <MenuItem value={'espn'}>ESPN</MenuItem>
                            </Select>
                        </FormControl>
                        // TODO : Removed Autocomplete field here because it wasn't working :(
                    )}
                    // rules={{ required: 'Fantasy Site required' }}
                    />
                    <FormHelperText>Only YAHOO available in Beta</FormHelperText> */}
                    <h3># of Teams</h3>

                    <Controller
                    name="leagueTeams"
                    control={control}
                    defaultValue={16}
                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                        <FormControl className="mui_select leagueTeamSelect">
                            <InputLabel id="leagueTeams-select">Teams</InputLabel>
                            <Select
                            labelId="leagueTeams-select"
                            label="# of Teams"
                            sx={{ width: 250 }}
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            >
                                <MenuItem value={6}>6</MenuItem>
                                <MenuItem value={8}>8</MenuItem>
                                <MenuItem value={10}>10</MenuItem>
                                <MenuItem value={12}>12</MenuItem>
                                <MenuItem value={14}>14</MenuItem>
                                <MenuItem value={16}>16</MenuItem>
                                <MenuItem value={18}>18</MenuItem>
                                <MenuItem value={20}>20</MenuItem>
                                <MenuItem value={22}>22</MenuItem>
                                <MenuItem value={24}>24</MenuItem>
                                <MenuItem value={26}>26</MenuItem>
                                <MenuItem value={28}>28</MenuItem>
                                <MenuItem value={30}>30</MenuItem>
                                <MenuItem value={32}>32</MenuItem>
                            </Select>
                        </FormControl>
                        // TODO : Removed Autocomplete field here because it wasn't working :(
                    )}
                    // rules={{ required: 'Fantasy Site required' }}
                    />


                </div>

                <h3>Roster Settings</h3>
                <p>Your league&apos;s roster slots. (e.g. 2 C, 2 LW, 2 RW, 4 D, 4 Bench (Only input F, W, or Util slots if those specific slots apply to your league))</p>
                <div className="form_group_container select-container" id="section_2">
                    <Controller
                    name="roster-c"
                    control={control}
                    defaultValue={2}
                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                        <FormControl className="mui_select">
                            <InputLabel id="roster-select">C</InputLabel>
                            <Select
                                labelId="roster-select"
                                label="C"
                                value={value}
                                onChange={onChange}
                                // error={!!error}
                                // helperText={error ? error.message : null}
                            >
                                <MenuItem value={0}>0</MenuItem>
                                <MenuItem value={1}>1</MenuItem>
                                <MenuItem value={2}>2</MenuItem>
                                <MenuItem value={3}>3</MenuItem>
                                <MenuItem value={4}>4</MenuItem>
                                <MenuItem value={5}>5</MenuItem>
                                <MenuItem value={6}>6</MenuItem>
                                <MenuItem value={7}>7</MenuItem>
                                <MenuItem value={8}>8</MenuItem>
                            </Select>
                        </FormControl>
                    )}
                    />                
                    
                    <Controller
                    name="roster-lw"
                    control={control}
                    defaultValue={2}
                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                        <FormControl className="mui_select">
                            <InputLabel id="roster-select">LW</InputLabel>
                            <Select
                                labelId="roster-select"
                                label="LW"
                                value={value}
                                onChange={onChange}
                                // error={!!error}
                                // helperText={error ? error.message : null}
                                // defaultValue={2} // Removed for UX / psych
                            >
                                <MenuItem value={0}>0</MenuItem>
                                <MenuItem value={1}>1</MenuItem>
                                <MenuItem value={2}>2</MenuItem>
                                <MenuItem value={3}>3</MenuItem>
                                <MenuItem value={4}>4</MenuItem>
                                <MenuItem value={5}>5</MenuItem>
                                <MenuItem value={6}>6</MenuItem>
                                <MenuItem value={7}>7</MenuItem>
                                <MenuItem value={8}>8</MenuItem>
                            </Select>
                        </FormControl>
                    )}
                    />                
                    
                    <Controller
                    name="roster-rw"
                    control={control}
                    defaultValue={2}
                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                        <FormControl className="mui_select">
                            <InputLabel id="roster-select">RW</InputLabel>
                            <Select
                                labelId="roster-select"
                                label="RW"
                                value={value}
                                onChange={onChange}
                                // error={!!error}
                                // helperText={error ? error.message : null}
                                // defaultValue={2} // Removed for UX / psych
                            >
                                <MenuItem value={0}>0</MenuItem>
                                <MenuItem value={1}>1</MenuItem>
                                <MenuItem value={2}>2</MenuItem>
                                <MenuItem value={3}>3</MenuItem>
                                <MenuItem value={4}>4</MenuItem>
                                <MenuItem value={5}>5</MenuItem>
                                <MenuItem value={6}>6</MenuItem>
                                <MenuItem value={7}>7</MenuItem>
                                <MenuItem value={8}>8</MenuItem>
                            </Select>
                        </FormControl>
                    )}
                    />         

                    <Controller
                    name="roster-d"
                    control={control}
                    defaultValue={4}
                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                        <FormControl className="mui_select">
                            <InputLabel id="roster-select">D</InputLabel>
                            <Select
                                labelId="roster-select"
                                label="D"
                                value={value}
                                onChange={onChange}
                                // error={!!error}
                                // helperText={error ? error.message : null}
                                // defaultValue={2} // Removed for UX / psych
                            >
                                <MenuItem value={0}>0</MenuItem>
                                <MenuItem value={1}>1</MenuItem>
                                <MenuItem value={2}>2</MenuItem>
                                <MenuItem value={3}>3</MenuItem>
                                <MenuItem value={4}>4</MenuItem>
                                <MenuItem value={5}>5</MenuItem>
                                <MenuItem value={6}>6</MenuItem>
                                <MenuItem value={7}>7</MenuItem>
                                <MenuItem value={8}>8</MenuItem>
                            </Select>
                        </FormControl>
                    )}
                    />                
       
                    <Controller
                    name="roster-g"
                    control={control}
                    defaultValue={2}
                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                        <FormControl className="mui_select">
                            <InputLabel id="roster-select">G</InputLabel>
                            <Select
                                labelId="roster-select"
                                label="G"
                                value={value}
                                onChange={onChange}
                                // error={!!error}
                                // helperText={error ? error.message : null}
                                // defaultValue={2} // Removed for UX / psych
                            >
                                <MenuItem value={0}>0</MenuItem>
                                <MenuItem value={1}>1</MenuItem>
                                <MenuItem value={2}>2</MenuItem>
                                <MenuItem value={3}>3</MenuItem>
                                <MenuItem value={4}>4</MenuItem>
                                <MenuItem value={5}>5</MenuItem>
                                <MenuItem value={6}>6</MenuItem>
                                <MenuItem value={7}>7</MenuItem>
                                <MenuItem value={8}>8</MenuItem>
                            </Select>
                        </FormControl>
                    )}
                    />                
                    
                    <Controller
                    name="roster-f"
                    control={control}
                    defaultValue=""
                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                        <FormControl className="mui_select">
                            <InputLabel id="roster-select">F</InputLabel>
                            <Select
                                labelId="roster-select"
                                label="F"
                                value={value}
                                onChange={onChange}
                                // error={!!error}
                                // helperText={error ? error.message : null}
                                // defaultValue={2} // Removed for UX / psych
                            >
                                <MenuItem value={0}>0</MenuItem>
                                <MenuItem value={1}>1</MenuItem>
                                <MenuItem value={2}>2</MenuItem>
                                <MenuItem value={3}>3</MenuItem>
                                <MenuItem value={4}>4</MenuItem>
                                <MenuItem value={5}>5</MenuItem>
                                <MenuItem value={6}>6</MenuItem>
                                <MenuItem value={7}>7</MenuItem>
                                <MenuItem value={8}>8</MenuItem>
                            </Select>
                        </FormControl>
                    )}
                    />                
                    <Controller
                    name="roster-w"
                    control={control}
                    defaultValue=""
                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                        <FormControl className="mui_select">
                            <InputLabel id="roster-select">W</InputLabel>
                            <Select
                                labelId="roster-select"
                                label="W"
                                value={value}
                                onChange={onChange}
                                // error={!!error}
                                // helperText={error ? error.message : null}
                                // defaultValue={2} // Removed for UX / psych
                            >
                                <MenuItem value={0}>0</MenuItem>
                                <MenuItem value={1}>1</MenuItem>
                                <MenuItem value={2}>2</MenuItem>
                                <MenuItem value={3}>3</MenuItem>
                                <MenuItem value={4}>4</MenuItem>
                                <MenuItem value={5}>5</MenuItem>
                                <MenuItem value={6}>6</MenuItem>
                                <MenuItem value={7}>7</MenuItem>
                                <MenuItem value={8}>8</MenuItem>
                            </Select>
                        </FormControl>
                    )}
                    />                

                    <Controller
                    name="roster-util"
                    control={control}
                    defaultValue=""
                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                        <FormControl className="mui_select">
                            <InputLabel id="roster-select">Util</InputLabel>
                            <Select
                                labelId="roster-select"
                                label="Util"
                                value={value}
                                onChange={onChange}
                                // error={!!error}
                                // helperText={error ? error.message : null}
                                // defaultValue={2} // Removed for UX / psych
                            >
                                <MenuItem value={0}>0</MenuItem>
                                <MenuItem value={1}>1</MenuItem>
                                <MenuItem value={2}>2</MenuItem>
                                <MenuItem value={3}>3</MenuItem>
                                <MenuItem value={4}>4</MenuItem>
                                <MenuItem value={5}>5</MenuItem>
                                <MenuItem value={6}>6</MenuItem>
                                <MenuItem value={7}>7</MenuItem>
                                <MenuItem value={8}>8</MenuItem>
                            </Select>
                        </FormControl>
                    )}
                    />                


                    <Controller
                    name="roster-bn"
                    control={control}
                    defaultValue={4}
                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                        <FormControl className="mui_select">
                            <InputLabel id="roster-select">BN</InputLabel>
                            <Select
                                labelId="roster-select"
                                label="BN"
                                value={value}
                                onChange={onChange}
                                // error={!!error}
                                // helperText={error ? error.message : null}
                                // defaultValue={2} // Removed for UX / psych
                            >
                                <MenuItem value={0}>0</MenuItem>
                                <MenuItem value={1}>1</MenuItem>
                                <MenuItem value={2}>2</MenuItem>
                                <MenuItem value={3}>3</MenuItem>
                                <MenuItem value={4}>4</MenuItem>
                                <MenuItem value={5}>5</MenuItem>
                                <MenuItem value={6}>6</MenuItem>
                                <MenuItem value={7}>7</MenuItem>
                                <MenuItem value={8}>8</MenuItem>
                            </Select>
                        </FormControl>
                    )}
                    />                
                </div>

                <h3>Scoring Type</h3>
                <div className="form_group_container" id="section_3">
                    <Controller
                    rules={{ required: 'Scoring Type required' }}
                    name="radioScoringType"
                    control={control}
                    defaultValue="categories"
                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                        <RadioGroup
                        aria-labelledby="demo-radio-buttons-group-label"
                        name="radio-cats-points"
                        className="formControlGroup"
                        defaultValue='categories'
                        value={value}
                        onChange={(e) => {
                            onChange(e);
                        }}
                        // error={!!error}
                        // helperText={error ? error.message : null}
                        >
                            <FormControlLabel 
                            value="categories" 
                            name="categories" 
                            // checked={scoringRadio === "categories"} 
                            label="Categories"
                            control={<Radio />} 
                            />

                            <FormControlLabel 
                            value="points" 
                            name="points" 
                            label="Points" 
                            // checked={scoringRadio === "points"} 
                            control={<Radio />} 
                            />
                        </RadioGroup>
                    )}
                    />                
                </div>
                
                <h3>Skater Categories</h3>
                <p>Check all active categories in your league (and ensure inactive categories are un-checked)</p>
                <div className="form_group_container cats-container" id="section_4">
                    <FormControl className="formControlGroup checkbox-and-textfield cats-field">
                        <Controller
                        name="cat_g"
                        control={control}
                        defaultValue={true}
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <FormControlLabel 
                            className="mui_checkbox" 
                            labelPlacement="start" 
                            label="G"
                            name="G"
                            defaultValue={true}
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            control={
                                <Checkbox 
                                defaultChecked 
                                value="G"
                                name="G"
                                label="G"
                                />} 
                            />
                        )}
                        />
                        <Controller
                        name="pts_g"
                        control={control}
                        defaultValue=""
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <TextField 
                            className="mui_textfield mui_textfield_pts hidden" 
                            size="small" 
                            // fullwidth 
                            // endadornment={<InputAdornment position="end">pts</InputAdornment>} 
                            id="outlined-basic" 
                            label="pts" 
                            variant="outlined" 
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            /> 
                        )}
                        />
                    </FormControl>

                    <FormControl className="formControlGroup checkbox-and-textfield cats-field">
                        <Controller
                        name="cat_a"
                        control={control}
                        defaultValue={true}
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <FormControlLabel 
                            className="mui_checkbox" 
                            labelPlacement="start" 
                            label="A"
                            name="A"
                            // defaultValue={false}
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            control={
                                <Checkbox 
                                defaultChecked 
                                value="A"
                                name="A"
                                label="A"
                                />} 
                            />
                        )}
                        />
                        <Controller
                        name="pts_a"
                        control={control}
                        defaultValue=""
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <TextField 
                            className="mui_textfield mui_textfield_pts hidden" 
                            size="small" 
                            // fullwidth 
                            // endadornment={<InputAdornment position="end">pts</InputAdornment>} 
                            id="outlined-basic" 
                            label="pts" 
                            variant="outlined" 
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            /> 
                        )}
                        />
                    </FormControl>
                    <FormControl className="formControlGroup checkbox-and-textfield cats-field">
                        <Controller
                        name="cat_pts"
                        control={control}
                        defaultValue={false}
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <FormControlLabel 
                            className="mui_checkbox" 
                            labelPlacement="start" 
                            label="Pts"
                            name="Pts"
                            // defaultValue={false}
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            control={
                                <Checkbox 
                                value="Pts"
                                name="Pts"
                                label="Pts"
                                />} 
                            />
                        )}
                        />
                        <Controller
                        name="pts_pts"
                        control={control}
                        defaultValue=""
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <TextField 
                            className="mui_textfield mui_textfield_pts hidden" 
                            size="small" 
                            // fullwidth 
                            // endadornment={<InputAdornment position="end">pts</InputAdornment>} 
                            id="outlined-basic" 
                            label="pts" 
                            variant="outlined" 
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            /> 
                        )}
                        />
                    </FormControl>
                    <FormControl className="formControlGroup checkbox-and-textfield cats-field">
                        <Controller
                        name="cat_+/-"
                        control={control}
                        defaultValue={false}
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <FormControlLabel 
                            className="mui_checkbox" 
                            labelPlacement="start" 
                            label="+/-"
                            name="+/-"
                            // defaultValue={false}
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            control={
                                <Checkbox 
                                value="+/-"
                                name="+/-"
                                label="+/-"
                                />} 
                            />
                        )}
                        />
                        <Controller
                        name="pts_+/-"
                        control={control}
                        defaultValue=""
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <TextField 
                            className="mui_textfield mui_textfield_pts hidden" 
                            size="small" 
                            // fullwidth 
                            // endadornment={<InputAdornment position="end">pts</InputAdornment>} 
                            id="outlined-basic" 
                            label="pts" 
                            variant="outlined" 
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            /> 
                        )}
                        />
                    </FormControl>
                    <FormControl className="formControlGroup checkbox-and-textfield cats-field">
                        <Controller
                        name="cat_pim"
                        control={control}
                        defaultValue={false}
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <FormControlLabel 
                            className="mui_checkbox" 
                            labelPlacement="start" 
                            label="PIM"
                            name="PIM"
                            // defaultValue={false}
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            control={
                                <Checkbox 
                                value="PIM"
                                name="PIM"
                                label="PIM"
                                />} 
                            />
                        )}
                        />
                        <Controller
                        name="pts_pim"
                        control={control}
                        defaultValue=""
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <TextField 
                            className="mui_textfield mui_textfield_pts hidden" 
                            size="small" 
                            // fullwidth 
                            // endadornment={<InputAdornment position="end">pts</InputAdornment>} 
                            id="outlined-basic" 
                            label="pts" 
                            variant="outlined" 
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            /> 
                        )}
                        />
                    </FormControl>
                    <FormControl className="formControlGroup checkbox-and-textfield cats-field">
                        <Controller
                        name="cat_sog"
                        control={control}
                        defaultValue={true}
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <FormControlLabel 
                            className="mui_checkbox" 
                            labelPlacement="start" 
                            label="SOG"
                            name="SOG"
                            // defaultValue={false}
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            control={
                                <Checkbox 
                                defaultChecked 
                                value="SOG"
                                name="SOG"
                                label="SOG"
                                />} 
                            />
                        )}
                        />
                        <Controller
                        name="pts_sog"
                        control={control}
                        defaultValue=""
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <TextField 
                            className="mui_textfield mui_textfield_pts hidden" 
                            size="small" 
                            // fullwidth 
                            // endadornment={<InputAdornment position="end">pts</InputAdornment>} 
                            id="outlined-basic" 
                            label="pts" 
                            variant="outlined" 
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            /> 
                        )}
                        />
                    </FormControl>
                    <FormControl className="formControlGroup checkbox-and-textfield cats-field">
                    <Controller
                        name="cat_ppg"
                        control={control}
                        defaultValue={false}
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <FormControlLabel 
                            className="mui_checkbox" 
                            labelPlacement="start" 
                            label="PPG"
                            name="PPG"
                            // defaultValue={false}
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            control={
                                <Checkbox 
                                value="PPG"
                                name="PPG"
                                label="PPG"
                                />} 
                            />
                        )}
                        />
                        <Controller
                        name="pts_ppg"
                        control={control}
                        defaultValue=""
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <TextField 
                            className="mui_textfield mui_textfield_pts hidden" 
                            size="small" 
                            // fullwidth 
                            // endadornment={<InputAdornment position="end">pts</InputAdornment>} 
                            id="outlined-basic" 
                            label="pts" 
                            variant="outlined" 
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            /> 
                        )}
                        />
                    </FormControl>
                    <FormControl className="formControlGroup checkbox-and-textfield cats-field">
                        <Controller
                        name="cat_ppa"
                        control={control}
                        defaultValue={false}
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <FormControlLabel 
                            className="mui_checkbox" 
                            labelPlacement="start" 
                            label="PPA"
                            name="PPA"
                            // defaultValue={false}
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            control={
                                <Checkbox 
                                value="PPA"
                                name="PPA"
                                label="PPA"
                                />} 
                            />
                        )}
                        />
                        <Controller
                        name="pts_ppa"
                        control={control}
                        defaultValue=""
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <TextField 
                            className="mui_textfield mui_textfield_pts hidden" 
                            size="small" 
                            // fullwidth 
                            // endadornment={<InputAdornment position="end">pts</InputAdornment>} 
                            id="outlined-basic" 
                            label="pts" 
                            variant="outlined" 
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            /> 
                        )}
                        />
                    </FormControl>
                    <FormControl className="formControlGroup checkbox-and-textfield cats-field">
                        <Controller
                        name="cat_ppp"
                        control={control}
                        defaultValue={true}
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <FormControlLabel 
                            className="mui_checkbox" 
                            labelPlacement="start" 
                            label="PPP"
                            name="PPP"
                            // defaultValue={false}
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            control={
                                <Checkbox 
                                defaultChecked 
                                value="PPP"
                                name="PPP"
                                label="PPP"
                                />} 
                            />
                        )}
                        />
                        <Controller
                        name="pts_ppp"
                        control={control}
                        defaultValue=""
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <TextField 
                            className="mui_textfield mui_textfield_pts hidden" 
                            size="small" 
                            // fullwidth 
                            // endadornment={<InputAdornment position="end">pts</InputAdornment>} 
                            id="outlined-basic" 
                            label="pts" 
                            variant="outlined" 
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            /> 
                        )}
                        />
                    </FormControl>

                    <FormControl className="formControlGroup checkbox-and-textfield cats-field">
                        <Controller
                        name="cat_shg"
                        control={control}
                        defaultValue={false}
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <FormControlLabel 
                            className="mui_checkbox" 
                            labelPlacement="start" 
                            label="SHG"
                            name="SHG"
                            // defaultValue={false}
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            control={
                                <Checkbox 
                                value="SHG"
                                name="SHG"
                                label="SHG"
                                />} 
                            />
                        )}
                        />
                        <Controller
                        name="pts_shg"
                        control={control}
                        defaultValue=""
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <TextField 
                            className="mui_textfield mui_textfield_pts hidden" 
                            size="small" 
                            // fullwidth 
                            // endadornment={<InputAdornment position="end">pts</InputAdornment>} 
                            id="outlined-basic" 
                            label="pts" 
                            variant="outlined" 
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            /> 
                        )}
                        />
                    </FormControl>
                    <FormControl className="formControlGroup checkbox-and-textfield cats-field">
                        <Controller
                        name="cat_sha"
                        control={control}
                        defaultValue={false}
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <FormControlLabel 
                            className="mui_checkbox" 
                            labelPlacement="start" 
                            label="SHA"
                            name="SHA"
                            // defaultValue={false}
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            control={
                                <Checkbox 
                                value="SHA"
                                name="SHA"
                                label="SHA"
                                />} 
                            />
                        )}
                        />
                        <Controller
                        name="pts_sha"
                        control={control}
                        defaultValue=""
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <TextField 
                            className="mui_textfield mui_textfield_pts hidden" 
                            size="small" 
                            // fullwidth 
                            // endadornment={<InputAdornment position="end">pts</InputAdornment>} 
                            id="outlined-basic" 
                            label="pts" 
                            variant="outlined" 
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            /> 
                        )}
                        />
                    </FormControl>
                    <FormControl className="formControlGroup checkbox-and-textfield cats-field">
                        <Controller
                        name="cat_shp"
                        control={control}
                        defaultValue={false}
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <FormControlLabel 
                            className="mui_checkbox" 
                            labelPlacement="start" 
                            label="SHP"
                            name="SHP"
                            // defaultValue={false}
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            control={
                                <Checkbox 
                                value="SHP"
                                name="SHP"
                                label="SHP"
                                />} 
                            />
                        )}
                        />
                        <Controller
                        name="pts_shp"
                        control={control}
                        defaultValue=""
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <TextField 
                            className="mui_textfield mui_textfield_pts hidden" 
                            size="small" 
                            // fullwidth 
                            // endadornment={<InputAdornment position="end">pts</InputAdornment>} 
                            id="outlined-basic" 
                            label="pts" 
                            variant="outlined" 
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            /> 
                        )}
                        />
                    </FormControl>
                    <FormControl className="formControlGroup checkbox-and-textfield cats-field">
                        <Controller
                        name="cat_gwg"
                        control={control}
                        defaultValue={false}
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <FormControlLabel 
                            className="mui_checkbox" 
                            labelPlacement="start" 
                            label="GWG"
                            name="GWG"
                            // defaultValue={false}
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            control={
                                <Checkbox 
                                value="GWG"
                                name="GWG"
                                label="GWG"
                                />} 
                            />
                        )}
                        />
                        <Controller
                        name="pts_gwg"
                        control={control}
                        defaultValue=""
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <TextField 
                            className="mui_textfield mui_textfield_pts hidden" 
                            size="small" 
                            // fullwidth 
                            // endadornment={<InputAdornment position="end">pts</InputAdornment>} 
                            id="outlined-basic" 
                            label="pts" 
                            variant="outlined" 
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            /> 
                        )}
                        />
                    </FormControl>

                    <FormControl className="formControlGroup checkbox-and-textfield cats-field">
                        <Controller
                        name="cat_fow"
                        control={control}
                        defaultValue={false}
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <FormControlLabel 
                            className="mui_checkbox" 
                            labelPlacement="start" 
                            label="FOW"
                            name="FOW"
                            // defaultValue={false}
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            control={
                                <Checkbox 
                                value="FOW"
                                name="FOW"
                                label="FOW"
                                />} 
                            />
                        )}
                        />
                        <Controller
                        name="pts_fow"
                        control={control}
                        defaultValue=""
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <TextField 
                            className="mui_textfield mui_textfield_pts hidden" 
                            size="small" 
                            // fullwidth 
                            // endadornment={<InputAdornment position="end">pts</InputAdornment>} 
                            id="outlined-basic" 
                            label="pts" 
                            variant="outlined" 
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            /> 
                        )}
                        />
                    </FormControl>
                    <FormControl className="formControlGroup checkbox-and-textfield cats-field">
                        <Controller
                        name="cat_fol"
                        control={control}
                        defaultValue={false}
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <FormControlLabel 
                            className="mui_checkbox" 
                            labelPlacement="start" 
                            label="FOL"
                            name="FOL"
                            // defaultValue={false}
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            control={
                                <Checkbox 
                                value="FOL"
                                name="FOL"
                                label="FOL"
                                />} 
                            />
                        )}
                        />
                        <Controller
                        name="pts_fol"
                        control={control}
                        defaultValue=""
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <TextField 
                            className="mui_textfield mui_textfield_pts hidden" 
                            size="small" 
                            // fullwidth 
                            // endadornment={<InputAdornment position="end">pts</InputAdornment>} 
                            id="outlined-basic" 
                            label="pts" 
                            variant="outlined" 
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            /> 
                        )}
                        />
                    </FormControl>

                    <FormControl className="formControlGroup checkbox-and-textfield cats-field">
                        <Controller
                        name="cat_hit"
                        control={control}
                        defaultValue={true}
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <FormControlLabel 
                            className="mui_checkbox" 
                            labelPlacement="start" 
                            label="HIT"
                            name="HIT"
                            // defaultValue={false}
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            control={
                                <Checkbox 
                                defaultChecked 
                                value="HIT"
                                name="HIT"
                                label="HIT"
                                />} 
                            />
                        )}
                        />
                        <Controller
                        name="pts_hit"
                        control={control}
                        defaultValue=""
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <TextField 
                            className="mui_textfield mui_textfield_pts hidden" 
                            size="small" 
                            // fullwidth 
                            // endadornment={<InputAdornment position="end">pts</InputAdornment>} 
                            id="outlined-basic" 
                            label="pts" 
                            variant="outlined" 
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            /> 
                        )}
                        />
                    </FormControl>
                    <FormControl className="formControlGroup checkbox-and-textfield cats-field">
                    <Controller
                        name="cat_blk"
                        control={control}
                        defaultValue={true}
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <FormControlLabel 
                            className="mui_checkbox" 
                            labelPlacement="start" 
                            label="BLK"
                            name="BLK"
                            // defaultValue={false}
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            control={
                                <Checkbox 
                                defaultChecked 
                                value="BLK"
                                name="BLK"
                                label="BLK"
                                />} 
                            />
                        )}
                        />
                        <Controller
                        name="pts_blk"
                        control={control}
                        defaultValue=""
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <TextField 
                            className="mui_textfield mui_textfield_pts hidden" 
                            size="small" 
                            // fullwidth 
                            // endadornment={<InputAdornment position="end">pts</InputAdornment>} 
                            id="outlined-basic" 
                            label="pts" 
                            variant="outlined" 
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            /> 
                        )}
                        />
                    </FormControl>
                    
                </div>
                
                <h3>Goalie Categories</h3>
                <p>Check all active categories in your league (and ensure inactive categories are un-checked!)</p>
                <div className="form_group_container cats-container" id="section_5">
                    <FormControl className="formControlGroup checkbox-and-textfield cats-field">
                        <Controller
                        name="cat_gs"
                        control={control}
                        defaultValue={false}
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <FormControlLabel 
                            className="mui_checkbox" 
                            labelPlacement="start" 
                            label="GS"
                            name="GS"
                            // defaultValue={false}
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            control={
                                <Checkbox 
                                value="GS"
                                name="GS"
                                label="GS"
                                />} 
                            />
                        )}
                        />
                        <Controller
                        name="pts_gs"
                        control={control}
                        defaultValue=""
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <TextField 
                            className="mui_textfield mui_textfield_pts hidden" 
                            size="small" 
                            // fullwidth 
                            // endadornment={<InputAdornment position="end">pts</InputAdornment>} 
                            id="outlined-basic" 
                            label="pts" 
                            variant="outlined" 
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            /> 
                        )}
                        />
                    </FormControl>
                    <FormControl className="formControlGroup checkbox-and-textfield cats-field">
                        <Controller
                        name="cat_w"
                        control={control}
                        defaultValue={true}
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <FormControlLabel 
                            className="mui_checkbox" 
                            labelPlacement="start" 
                            label="W"
                            name="W"
                            // defaultValue={false}
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            control={
                                <Checkbox 
                                defaultChecked 
                                value="W"
                                name="W"
                                label="W"
                                />} 
                            />
                        )}
                        />
                        <Controller
                        name="pts_w"
                        control={control}
                        defaultValue=""
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <TextField 
                            className="mui_textfield mui_textfield_pts hidden" 
                            size="small" 
                            // fullwidth 
                            // endadornment={<InputAdornment position="end">pts</InputAdornment>} 
                            id="outlined-basic" 
                            label="pts" 
                            variant="outlined" 
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            /> 
                        )}
                        />
                    </FormControl>
                    <FormControl className="formControlGroup checkbox-and-textfield cats-field">
                        <Controller
                        name="cat_l"
                        control={control}
                        defaultValue={false}
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <FormControlLabel 
                            className="mui_checkbox" 
                            labelPlacement="start" 
                            label="L"
                            name="L"
                            // defaultValue={false}
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            control={
                                <Checkbox 
                                value="L"
                                name="L"
                                label="L"
                                />} 
                            />
                        )}
                        />
                        <Controller
                        name="pts_l"
                        control={control}
                        defaultValue=""
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <TextField 
                            className="mui_textfield mui_textfield_pts hidden" 
                            size="small" 
                            // fullwidth 
                            // endadornment={<InputAdornment position="end">pts</InputAdornment>} 
                            id="outlined-basic" 
                            label="pts" 
                            variant="outlined" 
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            /> 
                        )}
                        />
                    </FormControl>
                    <FormControl className="formControlGroup checkbox-and-textfield cats-field">
                        <Controller
                        name="cat_ga"
                        control={control}
                        defaultValue={false}
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <FormControlLabel 
                            className="mui_checkbox" 
                            labelPlacement="start" 
                            label="GA"
                            name="GA"
                            // defaultValue={false}
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            control={
                                <Checkbox 
                                value="GA"
                                name="GA"
                                label="GA"
                                />} 
                            />
                        )}
                        />
                        <Controller
                        name="pts_ga"
                        control={control}
                        defaultValue=""
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <TextField 
                            className="mui_textfield mui_textfield_pts hidden" 
                            size="small" 
                            // fullwidth 
                            // endadornment={<InputAdornment position="end">pts</InputAdornment>} 
                            id="outlined-basic" 
                            label="pts" 
                            variant="outlined" 
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            /> 
                        )}
                        />
                    </FormControl>
                    <FormControl className="formControlGroup checkbox-and-textfield cats-field">
                        <Controller
                        name="cat_gaa"
                        control={control}
                        defaultValue={true}
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <FormControlLabel 
                            className="mui_checkbox" 
                            labelPlacement="start" 
                            label="GAA"
                            name="GAA"
                            // defaultValue={false}
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            control={
                                <Checkbox 
                                defaultChecked 
                                value="GAA"
                                name="GAA"
                                label="GAA"
                                />} 
                            />
                        )}
                        />
                        <Controller
                        name="pts_gaa"
                        control={control}
                        defaultValue=""
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <TextField 
                            className="mui_textfield mui_textfield_pts hidden" 
                            size="small" 
                            // fullwidth 
                            // endadornment={<InputAdornment position="end">pts</InputAdornment>} 
                            id="outlined-basic" 
                            label="pts" 
                            variant="outlined" 
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            /> 
                        )}
                        />
                    </FormControl>
                    <FormControl className="formControlGroup checkbox-and-textfield cats-field">
                        <Controller
                        name="cat_sa"
                        control={control}
                        defaultValue={false}
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <FormControlLabel 
                            className="mui_checkbox" 
                            labelPlacement="start" 
                            label="SA"
                            name="SA"
                            // defaultValue={false}
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            control={
                                <Checkbox 
                                value="SA"
                                name="SA"
                                label="SA"
                                />} 
                            />
                        )}
                        />
                        <Controller
                        name="pts_sa"
                        control={control}
                        defaultValue=""
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <TextField 
                            className="mui_textfield mui_textfield_pts hidden" 
                            size="small" 
                            // fullwidth 
                            // endadornment={<InputAdornment position="end">pts</InputAdornment>} 
                            id="outlined-basic" 
                            label="pts" 
                            variant="outlined" 
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            /> 
                        )}
                        />
                    </FormControl>
                    <FormControl className="formControlGroup checkbox-and-textfield cats-field">
                        <Controller
                        name="cat_sv"
                        control={control}
                        defaultValue={false}
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <FormControlLabel 
                            className="mui_checkbox" 
                            labelPlacement="start" 
                            label="SV"
                            name="SV"
                            // defaultValue={false}
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            control={
                                <Checkbox 
                                value="SV"
                                name="SV"
                                label="SV"
                                />} 
                            />
                        )}
                        />
                        <Controller
                        name="pts_sv"
                        control={control}
                        defaultValue=""
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <TextField 
                            className="mui_textfield mui_textfield_pts hidden" 
                            size="small" 
                            // fullwidth 
                            // endadornment={<InputAdornment position="end">pts</InputAdornment>} 
                            id="outlined-basic" 
                            label="pts" 
                            variant="outlined" 
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            /> 
                        )}
                        />
                    </FormControl>
                    <FormControl className="formControlGroup checkbox-and-textfield cats-field">
                    <Controller
                        name="cat_svpct"
                        control={control}
                        defaultValue={true}
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <FormControlLabel 
                            className="mui_checkbox" 
                            labelPlacement="start" 
                            label="SV%"
                            name="SV%"
                            // defaultValue={false}
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            control={
                                <Checkbox 
                                defaultChecked 
                                value="SV%"
                                name="SV%"
                                label="SV%"
                                />} 
                            />
                        )}
                        />
                        <Controller
                        name="pts_svpct"
                        control={control}
                        defaultValue=""
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <TextField 
                            className="mui_textfield mui_textfield_pts hidden" 
                            size="small" 
                            // fullwidth 
                            // endadornment={<InputAdornment position="end">pts</InputAdornment>} 
                            id="outlined-basic" 
                            label="pts" 
                            variant="outlined" 
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            /> 
                        )}
                        />
                    </FormControl>
                    <FormControl className="formControlGroup checkbox-and-textfield cats-field">
                        <Controller
                        name="cat_so"
                        control={control}
                        defaultValue={false}
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <FormControlLabel 
                            className="mui_checkbox" 
                            labelPlacement="start" 
                            label="SO"
                            name="SO"
                            // defaultValue={false}
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            control={
                                <Checkbox 
                                value="SO"
                                name="SO"
                                label="SO"
                                />} 
                            />
                        )}
                        />
                        <Controller
                        name="pts_so"
                        control={control}
                        defaultValue=""
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <TextField 
                            className="mui_textfield mui_textfield_pts hidden" 
                            size="small" 
                            // fullwidth 
                            // endadornment={<InputAdornment position="end">pts</InputAdornment>} 
                            id="outlined-basic" 
                            label="pts" 
                            variant="outlined" 
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            /> 
                        )}
                        />
                    </FormControl>
                </div>

                {/* <h3>Projections Sources & Weights</h3>
                <div className="form_group_container single-col">
                    <FormControl className="formControlGroup checkbox-and-textfield">
                        <Controller
                        name="proj_last3seas"
                        control={control}
                        defaultValue=""
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <FormControlLabel 
                            className="mui_checkbox" 
                            labelPlacement="start" 
                            label="Last 3 Seasons (Weighted Avg)" 
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            control = {
                                <Checkbox 
                                defaultChecked 
                                value="proj_last3seas"
                                name="proj_last3seas"
                                label="Last 3 Seasons (Weighted Avg)"
                                />
                            } 
                            />
                        )}
                        />
                        <Controller
                        name="proj_last3seas_weight"
                        control={control}
                        defaultValue={1}
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <TextField 
                            className="mui_textfield" 
                            size="small" 
                            // fullwidth 
                            // endAdornment={<InputAdornment position="end">pts</InputAdornment>} // Not working for some reason...
                            id="outlined-basic" 
                            label="weight" 
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            defaultValue={1} 
                            name="proj_last3seas_weight" 
                            variant="outlined" 
                            />
                        )}
                        />
                    </FormControl>

                    <FormControl className="formControlGroup checkbox-and-textfield">
                        <Controller
                        name="proj_yahoo"
                        control={control}
                        defaultValue=""
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <FormControlLabel 
                            className="mui_checkbox" 
                            labelPlacement="start" 
                            label="Yahoo" 
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            control = {
                                <Checkbox 
                                value="yahoo"
                                name="yahoo"
                                label="Yahoo"
                                />
                            } 
                            />
                        )}
                        />
                        <Controller
                        name="proj_yahoo_weight"
                        control={control}
                        defaultValue={1}
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <TextField 
                            className="mui_textfield" 
                            size="small" 
                            // fullwidth 
                            // endAdornment={<InputAdornment position="end">pts</InputAdornment>} // Not working for some reason...
                            id="outlined-basic" 
                            label="weight" 
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            defaultValue={1} 
                            name="proj_yahoo_weight" 
                            variant="outlined" 
                            />
                        )}
                        />
                    </FormControl>
                    <FormControl className="formControlGroup checkbox-and-textfield">
                        <Controller
                        name="proj_fantrax"
                        control={control}
                        defaultValue=""
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <FormControlLabel 
                            className="mui_checkbox" 
                            labelPlacement="start" 
                            label="Fantrax" 
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            control = {
                                <Checkbox 
                                value="proj_fantrax"
                                name="proj_fantrax"
                                label="Fantrax"
                                />
                            } 
                            />
                        )}
                        />
                        <Controller
                        name="proj_fantrax_weight"
                        control={control}
                        defaultValue={1}
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <TextField 
                            className="mui_textfield" 
                            size="small" 
                            // fullwidth 
                            // endAdornment={<InputAdornment position="end">pts</InputAdornment>} // Not working for some reason...
                            id="outlined-basic" 
                            label="weight" 
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            defaultValue={1} 
                            name="proj_fantrax_weight" 
                            variant="outlined" 
                            />
                        )}
                        />
                    </FormControl>


                    <FormControl className="formControlGroup checkbox-and-textfield">
                        <Controller
                        name="proj_apples"
                        control={control}
                        defaultValue=""
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <FormControlLabel 
                            className="mui_checkbox" 
                            labelPlacement="start" 
                            label="Apples & Ginos" 
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            control = {
                                <Checkbox 
                                value="proj_apples"
                                name="proj_apples"
                                label="Apples & Ginos"
                                />
                            } 
                            />
                        )}
                        />
                        <Controller
                        name="proj_apples_weight"
                        control={control}
                        defaultValue={1}
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <TextField 
                            className="mui_textfield" 
                            size="small" 
                            // fullwidth 
                            // endAdornment={<InputAdornment position="end">pts</InputAdornment>} // Not working for some reason...
                            id="outlined-basic" 
                            label="weight" 
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            defaultValue={1} 
                            name="proj_apples_weight" 
                            variant="outlined" 
                            />
                        )}
                        />
                    </FormControl>

                    <FormControl className="formControlGroup checkbox-and-textfield">
                        <Controller
                        name="proj_scullen"
                        control={control}
                        defaultValue=""
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <FormControlLabel 
                            className="mui_checkbox" 
                            labelPlacement="start" 
                            label="Scott Cullen" 
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            control = {
                                <Checkbox 
                                value="proj_scullen"
                                name="proj_scullen"
                                label="Scott Cullen"
                                />
                            } 
                            />
                        )}
                        />
                        <Controller
                        name="proj_scullen_weight"
                        control={control}
                        defaultValue={1}
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <TextField 
                            className="mui_textfield" 
                            size="small" 
                            // fullwidth 
                            // endAdornment={<InputAdornment position="end">pts</InputAdornment>} // Not working for some reason...
                            id="outlined-basic" 
                            label="weight" 
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            defaultValue={1} 
                            name="proj_scullen_weight" 
                            variant="outlined" 
                            />
                        )}
                        />
                    </FormControl>
                    <FormControl className="formControlGroup checkbox-and-textfield">
                    <Controller
                        name="proj_dfo"
                        control={control}
                        defaultValue=""
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <FormControlLabel 
                            className="mui_checkbox" 
                            labelPlacement="start" 
                            label="Daily Faceoff" 
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            control = {
                                <Checkbox 
                                value="proj_dfo"
                                name="proj_dfo"
                                label="Daily Faceoff"
                                />
                            } 
                            />
                        )}
                        />
                        <Controller
                        name="proj_dfo_weight"
                        control={control}
                        defaultValue={1}
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <TextField 
                            className="mui_textfield" 
                            size="small" 
                            // fullwidth 
                            // endAdornment={<InputAdornment position="end">pts</InputAdornment>} // Not working for some reason...
                            id="outlined-basic" 
                            label="weight" 
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            defaultValue={1} 
                            name="proj_dfo_weight" 
                            variant="outlined" 
                            />
                        )}
                        />
                    </FormControl>
                    <FormControl className="formControlGroup checkbox-and-textfield">
                    <Controller
                        name="proj_custom_1"
                        control={control}
                        defaultValue=""
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <FormControlLabel 
                            className="mui_checkbox" 
                            labelPlacement="start" 
                            label="Custom Proj. 1" 
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            control = {
                                <Checkbox 
                                value="proj_custom_1"
                                name="proj_custom_1"
                                label="Custom Proj. 1"
                                />
                            } 
                            />
                        )}
                        />
                        <Controller
                        name="proj_custom_1_weight"
                        control={control}
                        defaultValue={1}
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <TextField 
                            className="mui_textfield" 
                            size="small" 
                            // fullwidth 
                            // endAdornment={<InputAdornment position="end">pts</InputAdornment>} // Not working for some reason...
                            id="outlined-basic" 
                            label="weight" 
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            defaultValue={1} 
                            name="proj_custom_1_weight" 
                            variant="outlined" 
                            />
                        )}
                        />
                    </FormControl>
                    <FormControl className="formControlGroup checkbox-and-textfield">
                        <Controller
                        name="proj_lastseas"
                        control={control}
                        defaultValue=""
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <FormControlLabel 
                            className="mui_checkbox" 
                            labelPlacement="start" 
                            label="Last Season Stats" 
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            control = {
                                <Checkbox 
                                value="proj_lastseas"
                                name="proj_lastseas"
                                label="Last Season Stats"
                                />
                            } 
                            />
                        )}
                        />
                        <Controller
                        name="proj_lastseas_weight"
                        control={control}
                        defaultValue={1}
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <TextField 
                            className="mui_textfield" 
                            size="small" 
                            // fullwidth 
                            // endAdornment={<InputAdornment position="end">pts</InputAdornment>} // Not working for some reason...
                            id="outlined-basic" 
                            label="weight" 
                            value={value}
                            onChange={onChange}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                            defaultValue={1} 
                            name="proj_lastseas_weight" 
                            variant="outlined" 
                            />
                        )}
                        />
                    </FormControl>
                </div> */}

                <div className="submit-container">
                    <Stack direction="row" spacing={2}>
                        <ReCAPTCHA
                            ref={recaptchaRef}
                            size="invisible"
                            sitekey="6LetDwAiAAAAAL0NGojEuc3Hi9ZT_TT3GTZjkCjk"
                            onChange={onFormChange}
                        />

                        <Button 
                        variant="contained" 
                        type="submit" 
                        value="Submit">
                            {loading ? (
                                "Loading..."
                            ) : (
                                "Submit"
                            )  }
                        </Button>
                        {/* <Button
                        onClick={() => {
                            reset();
                        }}
                        >
                            Reset Form
                        </Button> */}
                    </Stack>
                </div>
                <div className="submit-container">
                </div>

            </form>
        </div>
        </div>

    );
}

// // Get LS Json from public supabase storage file
// export async function getServerSideProps() {
//     let url = 'https://oxkhcrfsekayvbmrpvfj.supabase.co/storage/v1/object/public/site-content/nhl_settings_ID_map.json'
//     // if (!leagueSettingFile) {
//         console.log('getting LS map')
//         const res = await fetch(url)
//         const data = await res.json()
//         return { props: { lsFiledata: data }}
//     // }

// }

// export default LeagueSettingsForm