import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import Plot from 'react-plotly.js';
import { TypedArray } from "plotly.js";
import { Box, Button, Stack, ButtonGroup, Typography, Divider, FormControl, RadioGroup,
     FormControlLabel, Radio, TextField, Checkbox, IconButton, Slider } from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import axios from "axios";

import { DeviceContext, DeviceContextType } from "../App";
import { useRemoteFSM } from "../helpers/hooks";
import { FSMProps } from "./props";


export const FSMContext = createContext<{[key : string] : { [key : string] : any}}>(FSMProps["DEFAULT"])


export const DeviceConsole = () => {

    const [device, _] = useContext(DeviceContext) as DeviceContextType
    const currentProps = useRemoteFSM(FSMProps as any, device.state)

    return (
        <Stack direction='row'>
            <Stack>
                <FSMContext.Provider value={currentProps} >
                    <Control />
                    <SpectrumGraph />
                </FSMContext.Provider>
            </Stack>
            <Divider orientation="vertical" sx={{ pl : 2 }} />
            <Settings />
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
                previousState : device.state,
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
    const { endpoint, disabled } = useContext(FSMContext)["acquisition"]
    
    const toggleAcquisition = useCallback(async() => {
        console.log("acquisition endpoint", endpoint)
        await axios({
            url : endpoint, 
            baseURL : device.URL,
            method : 'post',
        }).then((response) => {
            setDevice({
                ...device, 
                previousState : device.state,
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
                    disabled={device.state === 'MEASURING'}    
                    onClick={toggleAcquisition}
                >
                    Start
                </Button>
                <Button 
                    variant='contained' size='large' color='secondary'
                    disabled={device.state !== 'MEASURING'}
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
    
    const resetFault = useCallback(async() => {
        await axios({
            url : '/fault/reset', 
            baseURL : device.URL,
            method : 'post',
        }).then((response) => {
            setDevice({
                ...device, 
                previousState : device.state,
                state : response.data.state[device.instanceName]})
        }).catch((error : any) => {
            console.log(error)
        })
    }, [device])

    return (
        <Button 
            variant='contained' 
            size='large'
            onClick={resetFault}
            disabled={device.state !== 'FAULT'}
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


export const SpectrumGraph = () => {

    const [plotWidth, setPlotWidth] = useState(1000)
    const [plotHeight, setPlotHeight] = useState(plotWidth*(9/16))
    const [lastMeasureTimestamp, setLastMeasuredTimestamp] = useState<string>('unknown')
    // @ts-ignore (default spectrum to tell user no real data has been loaded)
    const [intensity, setIntensity] = useState<TypedArray>(Array.from(Array(1024).keys()))
    // @ts-ignore (default wavelengths to tell user x-axis is invalid and has not been loaded)
    const [wavelengths, setWavelengths] = useState<TypedArray>(Array.from(Array(1024).keys()))
    const [eventSrc, setEventSrc] = useState<EventSource | null>(null)
    const [device, setDevice] = useContext(DeviceContext) as DeviceContextType
    const plotDivRef = useRef<any>(null)
    const [plotDimensions, setPlotDimensions] = useState<Array<number>>([1000, 1000*9/16])

    useEffect(() => {
        setPlotDimensions([plotDivRef.current.clientWidth, plotDivRef.current.clientHeight])
    }, [])

    useEffect(() => {
        let src : EventSource | null = eventSrc
        if(device.URL && eventSrc === null) {
            src = new EventSource(`${device.URL}/intensity/measurement-event`)
            src.onmessage = (event : MessageEvent) => {
                let intensity = JSON.parse(event.data)
                setIntensity(intensity.value)
                setLastMeasuredTimestamp(intensity.timestamp)
                console.log("new intensity", intensity)
            }
            src.onopen = (event) => {
                console.log(`subscribed to event source at ${device.URL}/intensity/measurement-event`)
            } 
            src.onerror = (error) => {
                console.log(error)
            }
        }
        setEventSrc(src)
        return () => {
            /* clean up method */
            if(src) {
                src.close()
                console.log(`closed event source subscribed at ${device.URL}/intensity/measurement-event`)
            }
        }
    }, [device.URL])

    useEffect(() => {
        const fetchWavelengths = async() => {
            let _wavelengths = wavelengths // old or default value
            if(_wavelengths[0] === 0 && device.state !== 'DISCONNECTED') {
                try {
                    const response = await axios.get(`${device.URL}/supported-wavelengths`)
                    switch(response.status) {
                        case 200 : _wavelengths = response.data.returnValue; break;
                        case 404 : break;
                    }
                } catch(error) {
                    console.log(error)
                }
                console.log('fetched new wavelengths', _wavelengths)
            }
            // @ts-ignore
            setWavelengths(_wavelengths)
        }
        fetchWavelengths()
    }, [device.state])


    return (
        <Stack id='spectrum-graph-box' sx={{ display : 'flex', flexGrow :  1}}>
            <Divider>
                LIVE SPECTRUM
            </Divider>
            <Typography variant='button' color={'grey'} fontSize={14} sx={{ p : 1, pl : 2.5}}>
                Last Measured Timestamp : {lastMeasureTimestamp}
            </Typography>
            <Box 
                ref={plotDivRef} 
                sx={{ border : '1px solid grey', display : 'flex', 
                    flexGrow : 1, minHeight : 500}}
            >
                <Plot 
                    data={[{
                        x: wavelengths,
                        y: intensity,
                        type: 'scatter',
                        mode: 'lines',
                        marker: {color: 'red'}
                    }
                    ]}
                    layout={{ 
                        width : plotDimensions[0], 
                        height : plotDimensions[1], 
                        yaxis : { range : [0,2000], title : 'intensity/counts (arbitrary units)' },
                        xaxis : { title : 'wavelength (nm)'}
                    }}
                />
            </Box>
        </Stack>     
    )
}



type SettingOptions = {
    autoApply? : boolean
    triggerMode? : 0 | 1 | 2 | 3
    integrationTime? : number
    // integrationTimeBounds? : Array<number>,
    backgroundSubstraction? : 'AUTO' | 'CUSTOM' | null
    customBackgroundIntensity? : Array<number> | null
}

const defaultSettings : SettingOptions = {
    autoApply : false,
    triggerMode : 0,
    integrationTime : 1000,
    // integrationTimeBounds : [1, 1000],
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
        <Stack sx={{ opacity : device.URL? 1 : 0.15, pointerEvents : device.URL? 'all' : 'none'}}>
            <SettingsContext.Provider value={[settings, updateSettings]}>
                <Typography variant='button' color={'grey'} fontSize={18} sx={{p : 2}}>
                    settings :
                </Typography>    
                <AutoApplySettings />
                <TriggerModeOptions />
                <IntegrationTime />
                {/* <IntegrationTimeBounds /> */}
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


const useDeviceSetting = (name : string, URL : string) : [any, Function] => {
    const [settings, updateSettings] = useContext(SettingsContext)
    const autoApply = settings.autoApply
    const setting = settings[name as keyof SettingOptions]
    const [error, setError] = useState<boolean>(false)
    
    const handleSettingChange = useCallback((value : any) => {
        const apply = async() => {
            let finalSettingValue = value, hasError = false
            if(autoApply) {
                try {
                    const response = await axios.put(
                        URL, { value : value }
                    )
                    switch(response.status) {
                        case 200: finalSettingValue = response.data.returnValue; break;
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
    }, [setting, autoApply, URL, updateSettings])
        
    return [setting, handleSettingChange] 
}
    
    
const TriggerModeOptions = () => {
        
    const [device, setDevice] = useContext(DeviceContext) as DeviceContextType
    const [triggerMode, setTriggerMode] = useDeviceSetting('triggerMode', `${device.URL}/trigger-mode`)
  
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
                    onChange={(event : React.ChangeEvent<HTMLInputElement>) => {setTriggerMode(Number(event.target.value))}}
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


