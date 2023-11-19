import './App.css';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { Box, Button, Divider, Link, Tabs, Typography, Tab, AppBar, Toolbar, TextField, IconButton} from "@mui/material";
import { useCallback, useState, createContext, useContext } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import { TabPanel } from './helpers/components';
import { DeviceControl } from './core/device';
import axios from 'axios';



export type Device = { 
    URL : string
    // info : any
    state : string 
}

export const DeviceContext = createContext<any | [Device, Function]>(null)

const unknownDevice = {
    URL : '',
    // info : {},
    state : 'unknown'
}



function App() {

    const [device, setDevice] = useState(unknownDevice)
   
    return (
        <DeviceContext.Provider value={[device, setDevice]}>
            <DeviceSearchBar />
            <Toolbar variant="dense" />
            <Functionalities />
        </DeviceContext.Provider>
        
    );
}


const DeviceSearchBar = () => {

    const [deviceURL, setDeviceURL] = useState<string>('https://localhost:8083/spectrometer/ocean-optics/USB2000-plus')
    const [deviceFound, setDeviceFound] = useState<boolean | null>(false)
    const [_, setDevice] = useContext(DeviceContext)

    const loadDevice = async() => {
        let device : Device = unknownDevice
        const response = await axios.get(`${deviceURL}/resources/gui`)
        switch(response.status){
            case 202  : device = {
                            URL : deviceURL,
                            // info : response.data.returnValue,
                            state : response.data.state[Object.keys(response.data.state)[0]]
                        }; break;

            case 404  : break

        }
        setDevice(device)
        console.debug(device)
    }
    
    return(
        <AppBar color="inherit" sx={{ pt : 0.5 }}>
            <Toolbar variant="dense">
                <Typography fontSize={20}>
                    Spectrometer
                </Typography>
                <Box sx={{pl : 2, display : 'flex', flexGrow : 0.5}}>
                    <TextField 
                        size="small" 
                        label="Device URL"            
                        error={deviceFound !== null && deviceFound}
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
        default : return <DeviceControl />
    }
}

export default App;
