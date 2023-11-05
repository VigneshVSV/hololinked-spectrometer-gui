import './App.css';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { Box, Button, Divider, Link, Tabs, Typography, Tab} from "@mui/material";
import { useCallback, useState, ReactNode } from 'react';
import { TabPanel } from './helpers/components';
import { Device } from './core/device';


function App() {

    return (
        <Box sx={{ p : 2 }}>
            <Typography fontSize={24}>
                USB2000+ Spectrometer
            </Typography>
            <Divider></Divider>
            <Functionalities />
        </Box>
    );
}


const Functionalities = () => {

    const GUIOptions = ['Device', 'Database', 'Information']
    const [currentTab, setCurrentTab] = useState(0)

    const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
        setCurrentTab(newValue);
    }, [])

    return (
        <>
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
                        sx={{maxWidth : 150 }} 
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
                        {TabOptions[name as string]}
                    </TabPanel>
                )})
            }
        </>
    )
}


const TabOptions : { [key : string] : ReactNode } = {
    'Device' : <Device />,
    'Database' : <Typography>This component (Database) is not implemented yet</Typography>,
    'Information' : <Typography>This component (Information) is not implemented yet</Typography>
}

export default App;
