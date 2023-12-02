import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import Plot  from 'react-plotly.js';
import { TypedArray } from "plotly.js";
import { Box, Button, Stack, ButtonGroup, Typography, Divider, FormControl, RadioGroup,
     FormControlLabel, Radio, TextField, Checkbox, IconButton, Slider } from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import axios from "axios";

import { Device, DeviceContext, DeviceContextType } from "../App";
import { useRemoteFSM } from "../helpers/hooks";
import { FSMProps } from "./props";


const FSMContext = createContext<{[key : string] : { [key : string] : any}}>(FSMProps["DEFAULT"])


export const DeviceConsole = () => {

    const [device, _] = useContext(DeviceContext) as DeviceContextType
    const currentProps = useRemoteFSM(FSMProps as any, device.state)

    return (
        <Stack direction='row'>
            <FSMContext.Provider value={currentProps} >
                <Stack>
                    <Control />
                    <SpectrumGraph />
                </Stack>
                <Divider orientation="vertical" sx={{ pl : 2 }} />
                <Settings />
            </FSMContext.Provider>
        </Stack>
    )
}


export const Control = () => {
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
            <Box sx={{ p : 2 }}>
                <ResetFaultButton />
            </Box>
        </Stack>
    )
}


const ConnectionButton = () => {

    const [device, setDevice] = useContext(DeviceContext) as DeviceContextType
    const { text, endpoint, disabled } = useContext(FSMContext)["connection"]
    
    const toggleDeviceConnection = useCallback(async() => {
        await axios({
            url : endpoint, 
            baseURL : device.URL,
            method : 'post',
        }).then((response) => {
            setDevice({
                ...device, 
                state : response.data.state[device.instanceName]
            })
        }).catch((error : any) => {
            console.log(error)
        })
    }, [device, endpoint])

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

    const [device, setDevice] = useContext(DeviceContext) as DeviceContextType
    const { endpoint, disabled } = useContext(FSMContext).acquisition
    
    const toggleAcquisition = useCallback(async() => {
        await axios({
            url : endpoint, 
            baseURL : device.URL,
            method : 'post',
        }).then((response) => {
            setDevice({
                ...device, 
                state : response.data.state[device.instanceName]
            })
        }).catch((error : any) => {
            console.log(error)
        })
    }, [device, endpoint])
    
    return (
        <Stack direction='row'>
            <ButtonGroup disabled={disabled}>
                <Button disabled >
                    Acquisition :
                </Button>
                <Button 
                    variant='contained' size='large' color='secondary'
                    disabled={device.state !== 'MEASURING'}    
                    onClick={toggleAcquisition}
                >
                    Start
                </Button>
                <Button 
                    variant='contained' size='large' color='secondary'
                    disabled={device.state === 'MEASURING'}
                    onClick={toggleAcquisition}
                >
                    Stop
                </Button>
            </ButtonGroup>
        </Stack>
    )
}


const ResetFaultButton = () => {

    const [device, setDevice] = useContext(DeviceContext) as DeviceContextType
    const { disabled } = useRemoteFSM({
        FAULT : { disabled : false },
        DEFAULT : { disabled : true}
    }, device.state)
   
    const resetFault = useCallback(async() => {
        await axios({
            url : '/fault/reset', 
            baseURL : device.URL,
            method : 'post',
        }).then((response) => {
            setDevice({...device, state : response.data.state[Object.keys(response.data.state)[0]]})
        }).catch((error : any) => {
            console.log(error)
        })
    }, [device])

    return (
        <Button 
            variant='contained' 
            size='large'
            onClick={resetFault}
            disabled={disabled}
        >
            Reset Fault
        </Button>
    )
}


const CurrentState = () => {

    const [device, _] = useContext(DeviceContext) as DeviceContextType
   
    return (
        <Typography variant='button'>
            State : {device.state}
        </Typography>
    )
}


const SpectrumGraph = () => {

    const [plotWidth, setPlotWidth] = useState(1000)
    const [plotHeight, setPlotHeight] = useState(plotWidth*(9/16))
    const [lastMeasureTimestamp, setLastMeasuredTimestamp] = useState<string>('unknown')
    // @ts-ignore
    const [spectrum, setSpectrum] = useState<TypedArray>(Array.from(Array(1024).keys()))
    // @ts-ignore
    const [pixels, setPixels] = useState<TypedArray>(Array.from(Array(1024).keys()))
    const [eventSrc, setEventSrc] = useState<EventSource | null>(null)
    const [device, setDevice] = useContext(DeviceContext) as DeviceContextType

    useEffect(() => {
        let src = null 
        if(device.URL) {
            src = new EventSource(`${device.URL}/event/data-measured`)
            src.onmessage = (event : MessageEvent) => {
                let spectrum = JSON.parse(event.data)
                setSpectrum(spectrum.value)
                setLastMeasuredTimestamp(spectrum.timestamp)
                console.log("new spectrum", spectrum)
            }
            src.onopen = (event) => {
                console.log(`subscribed to event source at ${device.URL}/event/data-measured`)
            } 
            src.onerror = (error) => {
                console.log(error)
            }
        }
        setEventSrc(src)
    }, [device, setSpectrum, setLastMeasuredTimestamp])


    return (
        <>
            <Divider>
                LIVE SPECTRUM
            </Divider>
            <Stack>
                <Typography variant='button' color={'grey'} fontSize={14} sx={{ p : 1, pl : 2.5}}>
                    Last Measured Timestamp : {lastMeasureTimestamp}
                </Typography>
                <Box
                    key='main-spectrometer-plot'
                    data-grid={{ 
                        x : 0, y : 0, w : 20, h : 57
                    }}
                    sx={{ border : '1px solid grey'}}
                    >
                    <Plot 
                        data={[{
                            x: pixels,
                            y: spectrum,
                            type: 'scatter',
                            mode: 'lines',
                            marker: {color: 'red'}
                        }
                    ]}
                    layout={{ 
                        width : plotWidth, 
                        height : plotHeight, 
                        title: 'Spectrum',
                        yaxis : { range : [0,2000] }
                    
                    }}
                    />
                </Box>
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

    const [device, setDevice] = useContext(DeviceContext) as DeviceContextType
    const [settings, setSettings] = useState(defaultSettings) 
    const [enabled, setEnabled] = useState(false)

    const updateSettings = (newSettings : SettingOptions) => {
        setSettings({
            ...settings,
            ...newSettings
        })
        // console.log("new settings", {
        //     ...settings,
        //     ...newSettings
        // })
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
                    settings :
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
    const [device, setDevice] = useContext(DeviceContext) as DeviceContextType
    const [error, setError] = useState<boolean>(false)
   
    const handleTriggerModeChange = useCallback((event : React.ChangeEvent<HTMLInputElement>) => {
        const apply = async() => {
            let finalSettingValue = Number(event.target.value), hasError = false
            if(autoApply) {
                try {
                    const response = await axios.put(
                        `${device.URL}/trigger-mode`,
                        { value : finalSettingValue }
                    )
                    switch(response.status) {
                        case 200: 
                        case 202: finalSettingValue = response.data.returnValue; break;
                        case 404: hasError = true; break;
                    }
                } catch(error) {
                    console.log(error)
                    hasError = true
                }
            }
            updateSettings(
                { triggerMode : finalSettingValue }   
            )
            setError(hasError)
        }
        // console.log(event.target.value)
        apply()
    }, [triggerMode, autoApply, device, updateSettings])

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
    const [device, setDevice] = useContext(DeviceContext) as DeviceContextType
    const [integrationTimeUnit, setIntegrationTimeUnit] = useState<string>('milli-seconds')

    const handleIntegrationTimeUnitChange = useCallback((event : React.ChangeEvent<HTMLInputElement>) => {
        let newIntegrationTime = integrationTimeUnit === 'milli-seconds'? (integrationTime as number)*1000 : (integrationTime as number)/1000
        setIntegrationTimeUnit(event.target.value)
        updateSettings({ integrationTime : newIntegrationTime })
    }, [integrationTime, integrationTimeUnit])

    const setIntegrationTime = useCallback((event : React.ChangeEvent<HTMLInputElement>) => {
        const apply = async() => {
            let finalSettingValue = Number(event.target.value), hasError = false
            if(autoApply) {
                if(autoApply) {
                    try {
                        const response = await axios.put(
                            `${device.URL}/integration-time/${integrationTimeUnit}`,
                            { value : finalSettingValue }
                        )
                        switch(response.status) {
                            case 200: 
                            case 202: finalSettingValue = response.data.returnValue; break;
                            case 404: hasError = true; break;
                        }
                    } catch(error) {
                        console.log(error)
                        hasError = true
                    }
                }
            }
            updateSettings({ integrationTime : finalSettingValue })
        }
        apply()
    }, [integrationTime, autoApply, device, integrationTimeUnit, updateSettings])

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
    const [device, setDevice] = useContext(DeviceContext) as DeviceContextType
    
    const setBackgroundSubstraction = useCallback((event : React.ChangeEvent<HTMLInputElement>, type : 'AUTO' | 'CUSTOM') => {
        let checked = event.target.checked, finalSettingValue = null, hasError = false
        const apply = async() => {
            if(autoApply) {
                try {
                    const response = await axios.put(
                        `${device.URL}/background-correction`,
                        { value : checked? type : null }
                    )
                    switch(response.status) {
                        case 200: 
                        case 202: finalSettingValue = response.data.returnValue; break;
                        case 404: hasError = true; break;
                    }
                } catch(error) {
                    console.log(error)
                    hasError = true
                }
            }
            updateSettings(
                { backgroundSubstraction : checked? type : null }
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
                    onChange={(event) => setBackgroundSubstraction(event, 'AUTO')}
                />    
            </Stack>
            <Stack direction='row'>
                <Typography variant='button' color={'grey'} fontSize={14} sx={{ p : 1, pl : 2.5}}>
                    Custom Background :
                </Typography>
                <Checkbox
                    checked={backgroundSubstraction==='CUSTOM'} 
                    onChange={(event) => setBackgroundSubstraction(event, 'CUSTOM')}
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


