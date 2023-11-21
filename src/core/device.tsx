import "/node_modules/react-grid-layout/css/styles.css";
import "/node_modules/react-resizable/css/styles.css";
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import GridLayout from 'react-grid-layout';
import Plot from 'react-plotly.js';
import { Box, Button, Stack, ButtonGroup, Typography, Divider, FormControl, RadioGroup,
     FormControlLabel, Radio, TextField, Checkbox, IconButton } from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import axios from "axios";

import { Device, DeviceContext } from "../App";
import { useRemoteFSM } from "../helpers/components";



export const DeviceControl = () => {

    return (
        <Stack direction='row'>
            <Stack width={1000}>
                <Control />
                <SpectrumGraph />
            </Stack>
            <Divider orientation="vertical" sx={{ pl : 2 }} />
            <Settings />
        </Stack>
    )
}



const Control = () => {
    return (
        <Stack direction='row'>
            <Box sx={{ p : 2 }}>
                <ConnectionButton />
            </Box>
            <Box sx={{ p : 2 }}>
                <AcquisitionButtons />
            </Box>
            <Box sx={{ p : 2, pt : 3 }}>
                <CurrentState />
            </Box>
        </Stack>
    )
}

const ConnectionButton = () => {

    const [device, setDevice] = useContext<[Device, Function]>(DeviceContext)
    const { text, connectionEndpoint, disabled } = useRemoteFSM({
        ON : { text : 'Disconnect', connectionEndpoint : '/disconnect', disabled : false},
        DISCONNECTED : {text : 'Connect', connectionEndpoint : '/connect', disabled : false},
        MEASURING : {text : 'Disconnect', connectionEndpoint : '/disconnect', disabled : true},
        DEFAULT : {text : 'Connect', connectionEndpoint : '/connect', disabled : false}
    }, device.state)
   
    const toggleDeviceConnection = useCallback(async() => {
        await axios({
            url : connectionEndpoint, 
            baseURL : device.URL,
            method : 'post',
        }).then((response) => {
            setDevice({...device, state : response.data.state[Object.keys(response.data.state)[0]]})
        }).catch((error : any) => {
            console.log(error)
        })
    }, [device, connectionEndpoint])

    return (
        <Button 
            variant='contained' 
            size='large'
            onClick={toggleDeviceConnection}
            disabled={disabled}
        >
            {text}
        </Button>
    )
}

const AcquisitionButtons = () => {

    const [device, setDevice] = useContext<[Device, Function]>(DeviceContext)
    const { inAcquisition, acquisitionEndpoint, disabled } = useRemoteFSM({
        ON : { inAcquisition : false, acquisitionEndpoint : '/acquisition/start', disabled : false},
        DISCONNECTED : { inAcquisition : false, acquisitionEndpoint : '/acquisition/start', disabled : true},
        MEASURING : { inAcquisition : true, acquisitionEndpoint : '/acquisition/stop', disabled : false},
        DEFAULT : { inAcquisition : false, acquisitionEndpoint : '/acquisition/start', disabled : true}
    }, device.state)
    

    const toggleAcquisition = useCallback(async() => {
        await axios({
            url : acquisitionEndpoint, 
            baseURL : device.URL,
            method : 'post',
        }).then((response) => {
            setDevice({...device, state : response.data.state[Object.keys(response.data.state)[0]]})
        }).catch((error : any) => {
            console.log(error)
        })
    }, [device, acquisitionEndpoint])
    
    return (
        <Stack direction='row'>
            <ButtonGroup disabled={disabled}>
                <Button disabled >
                    Acquisition :
                </Button>
                <Button 
                    variant='contained' size='large' color='secondary'
                    disabled={inAcquisition}    
                    onClick={toggleAcquisition}
                >
                    Start
                </Button>
                <Button 
                    variant='contained' size='large' color='secondary'
                    disabled={!inAcquisition}
                    onClick={toggleAcquisition}
                >
                    Stop
                </Button>
            </ButtonGroup>
        </Stack>
    )
}


const CurrentState = () => {

    const [device, _] = useContext<[Device, Function]>(DeviceContext)
    // const [state, setState] = useState('unknown')

    return (
        <Typography variant='button'>
            State : {device.state}
        </Typography>
    )
}


const SpectrumGraph = () => {

    const [plotWidth, setPlotWidth] = useState(1000)
    const [plotHeight, setPlotHeight] = useState(plotWidth*(9/16))
    
    const handleLayoutChange = useCallback(((layout : GridLayout.Layout[]) => {
        setPlotWidth((layout[0].w)*50)
        setPlotHeight((layout[0].h)*10)
    }), [])

    const [lastMeasureTimestamp, setLastMeasuredTimestamp] = useState<string>('unknown')

    return (
        <>
            <Divider>
                LIVE SPECTRUM
            </Divider>
            <Stack>
                <Typography variant='button' color={'grey'} fontSize={14} sx={{ p : 1, pl : 2.5}}>
                    Last Measured Timestamp : {lastMeasureTimestamp}
                </Typography>
                <GridLayout
                    width={1000}
                    cols={20}
                    rowHeight={10}
                    margin={[0,0]}
                    maxRows={57}
                    preventCollision={true}
                    onLayoutChange={handleLayoutChange}
                    >    
                    <Box
                        key='main-spectrometer-plot'
                        data-grid={{ 
                            x : 0, y : 0, w : 20, h : 57
                        }}
                        sx={{ border : '1px solid grey'}}
                        >
                        <Plot 
                            data={[{
                                x: [1, 2, 3],
                                y: [2, 6, 3],
                                type: 'scatter',
                                mode: 'lines+markers',
                                marker: {color: 'red'},
                            },
                            {type: 'bar', x: [1, 2, 3], y: [2, 5, 3]},
                        ]}
                        layout={{ width : plotWidth, height : plotHeight, title: 'A Fancy Plot'}}
                        />
                    </Box>
                </GridLayout>
            </Stack>
        </>
        
    )
}



type SettingOptions = {
    autoApply? : boolean
    triggerMode? : number 
    integrationTime? : number
    integrationTimeBounds? : Array<number>,
    backgroundSubstraction? : 'AUTO' | 'CUSTOM' | null
    customBackgroundIntensity? : Array<number> | null
}

const defaultSettings : SettingOptions = {
    autoApply : false,
    triggerMode : 0,
    integrationTime : 1000,
    integrationTimeBounds : [1, 1000],
    backgroundSubstraction : null, 
    customBackgroundIntensity : null
}

const SettingsContext = createContext<[SettingOptions, Function]>([defaultSettings, 
    () => console.error("no settings update method provided yet")])


const Settings = () => {

    const [device, setDevice] = useContext<[Device, Function]>(DeviceContext)
    const [settings, setSettings] = useState(defaultSettings) 
    const [enabled, setEnabled] = useState(false)

    const updateSettings = (newSettings : SettingOptions) => {
        setSettings({
            ...settings,
            ...newSettings
        })
    } 

    useEffect(() => {
        const fetchSettings = async() => {
            let newSettings = {}
            let newEnabled = device.URL? true : false
            await axios({
                url :  `/parameters/values?serialNumber=serial_number&\
                    integrationTime=integration_time_millisec&triggerMode=trigger_mode&\
                    backgroundCorrection=background_correction&nonlinearityCorrection=nonlinearity_correction&\
                    customBackgroundIntensity=custom_background_intensity`.replace(/\s+/g,''),
                baseURL : device.URL,
                method : 'get' 
            }).then((response) => {
                switch(response.status) {
                    // @ts-ignore
                    case 200 : ; 
                    case 202 : newSettings = response.data.returnValue; 
                            newEnabled = true; break; 
                    case 404 : newEnabled = false; console.log("error while fetching parameters - 404, is it a spectrometer?"); break;
                    default :  newEnabled = false; console.log('unhandled response status code');
                }
                console.log("new fetched settings", newSettings)
            }).catch((error) => {
                console.log(error)
                newEnabled = false
            })
            updateSettings(newSettings)
            setEnabled(newEnabled)
        }
        fetchSettings()
    }, [device])
    

    return (
        <Stack sx={{ opacity : enabled? 1 : 0.15, pointerEvents : enabled? 'all' : 'none'}}>
            <SettingsContext.Provider value={[settings, updateSettings]}>
                <Typography variant='button' color={'grey'} fontSize={18} sx={{p : 2}}>
                    settings
                </Typography>    
                <AutoApplySettings />
                <TriggerModeOptions />
                <IntegrationTime />
                <IntegrationTimeBounds />
                <BackgroundSubstraction />
            </SettingsContext.Provider>
        </Stack>
    )
}


const AutoApplySettings = () => {

    const [{ autoApply }, updateSettings] = useContext(SettingsContext)

    const toggleAutoApply = () => {
        let newAutoApply = autoApply? false : true // i.e. toggle every time 
        updateSettings({ autoApply : newAutoApply })
    }

    return (    
        <Stack direction='row'>
            <Typography variant='button' color={'grey'} fontSize={14} sx={{ p : 1, pl : 2.5}}>
                auto apply on change :
            </Typography>
            <Checkbox checked={autoApply} onChange={toggleAutoApply}></Checkbox>
        </Stack>
    )
}


const TriggerModeOptions = () => {

    const [{ triggerMode, autoApply }, updateSettings] = useContext(SettingsContext)
    const [device, setDevice] = useContext(DeviceContext)
    const [error, setError] = useState<boolean>(false)
   
    const handleTriggerModeChange = useCallback((event : React.ChangeEvent<HTMLInputElement>) => {
        const apply = async() => {
            if(autoApply) {
                const response = await axios.put(
                    `${device.URL}/trigger-mode`,
                    { value : Number(event.target.value) }
                )
                console.log(response)
            }
            updateSettings(
                {triggerMode : event.target.value}
            )
        }
        // console.log(event.target.value)
        apply()
    }, [triggerMode, autoApply, device])

    return (
        <FormControl>
            <Stack direction='row'>
                <Typography variant='button' color={'grey'} fontSize={14} sx={{ p : 2.5}}>
                    trigger settings :
                </Typography>
                <RadioGroup
                    row
                    value={triggerMode}
                    name="radio-buttons-group"   
                    onChange={handleTriggerModeChange}
                >
                    <FormControlLabel value={0} control={<Radio />} label="continuous" />
                    <FormControlLabel value={1} control={<Radio />} label="software" />
                    <FormControlLabel value={2} control={<Radio />} label="hardware" />
                </RadioGroup>
            </Stack>
        </FormControl>
    )
}


const IntegrationTime = () => {

    const [{ autoApply, integrationTime}, updateSettings] = useContext(SettingsContext)
    const [device, setDevice] = useContext(DeviceContext)
    const [integrationTimeUnit, setIntegrationTimeUnit] = useState<string>('milli-seconds')

    const handleIntegrationTimeUnitChange = useCallback((event : React.ChangeEvent<HTMLInputElement>) => {
        setIntegrationTimeUnit(event.target.value)
    }, [])

    const setIntegrationTime = useCallback((event : React.ChangeEvent<HTMLInputElement>) => {
        const apply = async() => {
            if(autoApply) {
                const response = await axios.put(
                    `${device.URL}/integration-time/${integrationTimeUnit}`,
                    { value : Number(event.target.value) }
                )
                console.log(response)
            }
            updateSettings(
                { integrationTime : event.target.value }
            )
        }
        // console.log(event.target.value)
        apply()
    }, [integrationTime, autoApply, device, integrationTimeUnit])


    return (
        <Stack direction='row'>
            <Typography variant='button' color={'grey'} fontSize={14} sx={{ p : 2.5}}>
                Integration Time :
            </Typography>
            <TextField 
                variant='filled' 
                size='small' 
                helperText={integrationTimeUnit} 
                onChange={setIntegrationTime}
                value={integrationTime}
            />
            <RadioGroup 
                row 
                sx={{ pb : 2, pl : 1 }} 
                defaultValue='milli-seconds'
                onChange={handleIntegrationTimeUnitChange}
            >
                <FormControlLabel value='milli-seconds' control={<Radio />} label='ms' />
                <FormControlLabel value='micro-seconds' control={<Radio />} label='µs' />
            </RadioGroup>
        </Stack>
    )
}



const IntegrationTimeBounds = () => {

    const [helperText, setHelperText] = useState<string>('milliseconds')

    return (
        <Stack direction='row'>
            <Typography variant='button' color={'grey'} fontSize={14} sx={{ p : 1, pl : 2.5}}>
                Integration Time Bounds :
            </Typography>
            <TextField
                variant='outlined' size='small' helperText="minimum" 
                sx={{ 
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                            borderBottomRightRadius : 0,
                            borderTopRightRadius: 0, 
                    }}
                }}    
            />
            <TextField 
                variant='outlined' size='small' helperText="maximum"    
                sx={{ 
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                            borderBottomLeftRadius : 0,
                            borderTopLeftRadius: 0, 
                    }}
                }}   
            />
        </Stack>
    )
}


const BackgroundSubstraction = () => {

    const [{ autoApply, backgroundSubstraction}, updateSettings] = useContext(SettingsContext)
    const [device, setDevice] = useContext(DeviceContext)
    
    const setBackgroundSubstraction = useCallback((type : 'AUTO' | 'CUSTOM' | null) => {
        const apply = async() => {
            if(autoApply) {
                const response = await axios.put(
                    `${device.URL}/background-correction`,
                    { value : type }
                )
                console.log("auto backgrond set", response)
            }
            updateSettings(
                { backgroundSubstraction : type }
            )
        }
        apply()
    }, [autoApply, device, backgroundSubstraction])

    return (
        <>
            <Stack direction='row'>
                <Typography variant='button' color={'grey'} fontSize={14} sx={{ p : 1, pl : 2.5}}>
                    Auto Background Substraction :
                </Typography>
                <Checkbox 
                    checked={backgroundSubstraction==='AUTO'} 
                    onChange={() => setBackgroundSubstraction('AUTO')}
                />    
            </Stack>
            <Stack direction='row'>
                <Typography variant='button' color={'grey'} fontSize={14} sx={{ p : 1, pl : 2.5}}>
                    Custom Background :
                </Typography>
                <Checkbox
                    checked={backgroundSubstraction==='CUSTOM'} 
                    onChange={() => setBackgroundSubstraction('CUSTOM')}
                />
                <IconButton>
                    <FileUploadIcon />
                </IconButton>
                <Typography sx= {{ p : 1}}>
                    (no file selected yet, default value Substraction or no substraction)
                </Typography>
            </Stack>
        </>
    )
}


