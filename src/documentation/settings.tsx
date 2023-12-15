import { useState } from "react";
import { Box } from "@mui/material";
import { Control, Settings } from "../core/device"
import { Device, DeviceContext, unknownDevice } from "../App";
import { DeviceSearchBar } from "./app-bar";


export const ControlAppWithSettings = () => {
    const [device, setDevice] = useState<Device>(unknownDevice)
   
    return (
        <Box sx={{ backgroundColor : 'white' }}>
            <DeviceContext.Provider value={[device, setDevice]}>
                <DeviceSearchBar />
                <Settings />
            </DeviceContext.Provider>
        </Box>        
    );
}


