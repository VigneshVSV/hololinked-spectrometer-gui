import { useContext, useState } from "react";
import { Box, Stack } from "@mui/material";
import { Control, FSMContext, SpectrumGraph } from "../core/device"
import { Device, DeviceContext, DeviceContextType, unknownDevice } from "../App";
import { DeviceSearchBar } from "./app-bar";
import { useRemoteFSM } from "../helpers/components";
import { FSMProps } from "../core/props";


export const ControlAppWithGraph = () => {
    const [device, setDevice] = useState<Device>(unknownDevice)
   
    return (
        <Box id='control-app-with-graph-box' sx={{ backgroundColor : 'white' }}>
            <DeviceContext.Provider value={[device, setDevice]}>
                <DeviceSearchBar />
                <GraphConsole />                
            </DeviceContext.Provider>
        </Box>        
    );
}


export const GraphConsole = () => {

    const [device, _] = useContext(DeviceContext) as DeviceContextType
    const currentProps = useRemoteFSM(FSMProps as any, device.state)

    return (
        <Stack id='graph-console-box' sx={{ display : 'flex', flexGrow : 1 }}>
            <FSMContext.Provider value={currentProps} >
                <Control />
                <SpectrumGraph />
            </FSMContext.Provider>
        </Stack>
    )
}