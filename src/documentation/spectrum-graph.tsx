import { createContext, useContext, useState } from "react";
import { Box, Stack } from "@mui/material";
import { Control, SpectrumGraph } from "../core/device"
import { Device, DeviceContext, DeviceContextType, unknownDevice } from "../App";
import { DeviceSearchBar } from "./app-bar";
import { useRemoteFSM } from "../helpers/components";
import { FSMProps } from "../core/props";


export const ControlApp = () => {
    const [device, setDevice] = useState<Device>(unknownDevice)
   
    return (
        <Box sx={{ backgroundColor : 'white' }}>
            <DeviceContext.Provider value={[device, setDevice]}>
                <DeviceSearchBar />
                <GraphConsole />                
            </DeviceContext.Provider>
        </Box>        
    );
}

const FSMContext = createContext<{[key : string] : { [key : string] : any}}>(FSMProps["DEFAULT"])

export const GraphConsole = () => {

    const [device, _] = useContext(DeviceContext) as DeviceContextType
    const currentProps = useRemoteFSM(FSMProps as any, device.state)

    return (
        <Stack direction='row'>
            <FSMContext.Provider value={currentProps} >
                <Stack>
                    <Control />
                    <SpectrumGraph />
                </Stack>
            </FSMContext.Provider>
        </Stack>
    )
}