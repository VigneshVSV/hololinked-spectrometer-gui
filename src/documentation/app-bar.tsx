import { Box, Typography, AppBar, Toolbar, TextField, IconButton} from "@mui/material";
import {useState, useContext } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import { Device, DeviceContext, DeviceContextType, unknownDevice } from "../App";


export const SpectrometerApp = () => {

    const [device, setDevice] = useState(unknownDevice)
   
    return (
        <DeviceContext.Provider value={[device, setDevice]}>
            <DeviceSearchBar />
            <Toolbar variant="dense" />
            {/* toolbar adds padding & should be similar to defined in DeviceSearchBar */}
        </DeviceContext.Provider>
        
    );
}


export const DeviceSearchBar = () => {

    const [deviceURL, setDeviceURL] = useState<string>('https://localhost:8083/spectrometer/ocean-optics/USB2000-plus')
    const [deviceFound, setDeviceFound] = useState<boolean | null>(null)
    const [_, setDevice] = useContext(DeviceContext) as DeviceContextType

    const loadDevice = async() => {
        let _device : Device = unknownDevice
        let _deviceFound : boolean = false
        try {
            const response = await axios.get(`${deviceURL}/state`)
            switch(response.status){
                case 200  : _device = {
                                URL : deviceURL,
                                state : response.data.returnValue,
                                instanceName : deviceURL.split('/').slice(3).join('/')
                            }; 
                            _deviceFound = true;
                            break;
    
                case 404  : _deviceFound = false; 
            }
        } catch (error) {
            _deviceFound = false      
        }
        setDevice(_device)
        setDeviceFound(_deviceFound)
        console.debug(_device)
    }
    
    return(
        <AppBar position='static' color="inherit" sx={{ pt : 0.5 }}>
            {/* padding top for TextField label to not be covered by browser search bar */}
            <Toolbar variant="dense"> 
                <Typography fontSize={20} color='black'>
                    OceanOptics Spectrometer
                </Typography>
                <Box sx={{pl : 2, display : 'flex', flexGrow : 1}}>
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