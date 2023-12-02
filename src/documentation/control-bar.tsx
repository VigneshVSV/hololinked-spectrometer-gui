import { useState } from "react";
import { Control } from "../core/device"
import { Device, DeviceContext, unknownDevice } from "../App";
import { DeviceSearchBar } from "./app-bar";
import { Box } from "@mui/material";


export const ControlApp = () => {
    const [device, setDevice] = useState<Device>(unknownDevice)
   
    return (
        <Box sx={{ backgroundColor : 'white' }}>
            <DeviceContext.Provider value={[device, setDevice]}>
                <DeviceSearchBar />
                <Control />
            </DeviceContext.Provider>
        </Box>        
    );
}


