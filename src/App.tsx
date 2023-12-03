import './App.css';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { Box, Button, Divider, Link, Tabs, Typography, Tab, AppBar, Toolbar, TextField, IconButton} from "@mui/material";
import { useCallback, useState, createContext, useContext } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import { TabPanel } from './helpers/components';
import { DeviceConsole } from './core/device';
import axios from 'axios';



export type Device = { 
    URL : string
    state : string 
    previousState : string
    instanceName : string
}

export type DeviceContextType = [Device, Function]

export const DeviceContext = createContext<null | DeviceContextType>(null)

export const unknownDevice = {
    URL : '',
    state : 'unknown',
    previousState : 'unknown',
    instanceName : 'unknown'
}



function App() {

    const [device, setDevice] = useState<Device>(unknownDevice)
   
    return (
        <DeviceContext.Provider value={[device, setDevice]}>
            <DeviceSearchBar />
            <Toolbar variant="dense" />
            {/* toolbar adds padding & should be similar to defined in DeviceSearchBar */}
            <Functionalities />
        </DeviceContext.Provider>
        
    );
}


export const DeviceSearchBar = () => {

    const [deviceURL, setDeviceURL] = useState<string>('https://localhost:8083/spectrometer/ocean-optics/USB2000-plus')
    const [deviceFound, setDeviceFound] = useState<boolean | null>(null)
    const [device, setDevice] = useContext(DeviceContext) as DeviceContextType

    const loadDevice = async() => {
        let _device : Device = device
        let _deviceFound : boolean = false
        try {
            const response = await axios.get(`${deviceURL}/state`)
            switch(response.status){
                case 200  : _device = {
                                URL : deviceURL, 
                                state : response.data.returnValue,
                                previousState : device.state,
                                instanceName : deviceURL.split('/').slice(3).join('/')
                            }; 
                            _deviceFound = true;
                            break;
    
                case 404  : _deviceFound = false; 
            }
        } catch (error) {
            _deviceFound = false  
            console.log(error)    
        }
        setDevice(_device)
        setDeviceFound(_deviceFound)
        console.debug(_device)
    }
    
    return(
        <AppBar color="inherit" sx={{ pt : 0.5 }}>
            {/* padding top for TextField label to not be covered by browser search bar */}
            <Toolbar variant="dense">
                <Typography fontSize={20}>
                    OceanOptics Spectrometer
                </Typography>
                <Box sx={{pl : 2, display : 'flex', flexGrow : 0.5}}>
                    <TextField 
                        size="small" 
                        label="Device URL"            
                        error={deviceFound !== null && !deviceFound}
                        sx={{ display : 'flex', flexGrow : 1 }}
                        value={deviceURL}
                        onChange={(event) => setDeviceURL(event.target.value)}
                    />
                </Box>
                <IconButton onClick={loadDevice}>
                    <SearchIcon />
                </IconButton>
            </Toolbar>
        </AppBar>
    )
}


const Functionalities = () => {

    const GUIOptions = ['Device', 'Database', 'Information']
    const [currentTab, setCurrentTab] = useState(0)
   
    const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
        setCurrentTab(newValue);
    }, [])

    return (
        <Box sx={{ p : 1, pt : 1 }}>
            <Tabs 
                id="remote-object-fields-tab"
                variant="scrollable"
                sx={{borderBottom: 1, borderColor: 'divider' }}
                value={currentTab}
                onChange={handleTabChange}
            >
                {GUIOptions.map((name : string, index : number) => 
                    <Tab
                        key={"remote-object-fields-tab-" + name} 
                        id={"remote-object-fields-tab-" + name} 
                        label={name} 
                        sx={{ maxWidth : 150 }} 
                    />
                )}
            </Tabs>
            {GUIOptions.map((name : string, index : number) => {
                return (
                    <TabPanel 
                        key={"remote-object-fields-tabpanel-" + name} 
                        tree="remote-object-fields-tab"
                        index={index} 
                        value={currentTab} 
                    >   
                        <TabOptions option={name} />
                    </TabPanel>
                )})
            }
        </Box>
    )
}


const TabOptions = ({ option } : { option : string }) => {

    switch(option) {
        case 'Database' : return <Typography>Database Tab not yet implemented</Typography>
        case 'Information' : return <Typography>Information Tab not yet implemented</Typography>
        default : return <DeviceConsole />
    }
}

export default App;
