import { useState } from "react";
import { Control } from "../core/device"
import { Device, DeviceContext, DeviceSearchBar, unknownDevice } from "../App";
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


