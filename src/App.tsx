import './App.css';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { Box, Button, Divider, Link, Tabs, Typography, Tab, AppBar, Toolbar, TextField, IconButton} from "@mui/material";
import { useCallback, useState, createContext } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import { TabPanel } from './helpers/components';
import { Device } from './core/device';
import axios from 'axios';


export const DeviceContext = createContext<any | { URL : string, info : any}>(null)


function App() {

    const [device, setDevice] = useState({
        URL : '', 
        info : {}
    })
   
    return (
        <DeviceContext.Provider value={device}>
            <DeviceSearchBar setDevice={setDevice} />
            <Toolbar variant="dense" />
            <Functionalities 
                borderPadding={1} 
                tabPadding={1} 
            />
        </DeviceContext.Provider>
        
    );
}


const DeviceSearchBar = ({ setDevice } : any) => {

    const [deviceSearchText, setDeviceSearchText] = useState<string>('')

    const loadDevice = async() => {
        const response = await axios.get(`${deviceSearchText}/resources/gui`)
        if(response.status === 200) 
            setDevice({
                URL : deviceSearchText,
                info : response.data.returnValue,
                state : response.data.state
            })
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
                        sx={{ display : 'flex', flexGrow : 1 }}
                        onChange={(event) => setDeviceSearchText(event.target.value)}
                    />
                </Box>
                <IconButton onClick={loadDevice}>
                    <SearchIcon />
                </IconButton>
            </Toolbar>
        </AppBar>
    )
}


const Functionalities = ({ borderPadding, tabPadding } : { 
    borderPadding : number, 
    tabPadding : number 
}) => {

    const GUIOptions = ['Device', 'Database', 'Information']
    const [currentTab, setCurrentTab] = useState(0)
   
    const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
        setCurrentTab(newValue);
    }, [])

    return (
        <Box sx={{ p : borderPadding, pt : tabPadding }}>
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
        default : return <Device />
    }
}

export default App;
