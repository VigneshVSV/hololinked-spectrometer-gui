import { Alert, Box, Snackbar } from "@mui/material";
import { useEffect, useState } from "react";
import { createContext } from "vm";



type TabPanelProps = {
    tree : string
    index: number;
    value: number;
    children?: React.ReactNode;
}

export const TabPanel = (props: TabPanelProps) => {
    const { tree, index, value, children, ...other } = props;
  
    return (
        <div
            id={`${tree}-tabpanel-${index}`}
            key={`${tree}-tabpanel-${index}`}
            role="tabpanel"
            hidden ={value !== index}
            {...other}
            style={{
                "width" : "100%",
                "height" : "100%"
            }}      
        >
            {value === index && (
                <Box sx={{ flexGrow: 1, display: 'flex', height : '100%' }}>
                    {children}
                </Box>
            )}
        </div>
    );
}


export const ErrorSnackbars = () => {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('')

    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return
        }
        setOpen(false);
    };
  
    return (
        <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
            <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
                {message}
            </Alert>
        </Snackbar>
    )
}


export const useRemoteFSM = (FSMProps : {[key : string] : { [key : string] : any}}, state : string) => {

    const [currentProps, setCurrentProps] = useState(FSMProps[state] || FSMProps["DEFAULT"]) 

    const updateProps = useEffect(() => {
        let newProps = FSMProps[state]
        if(!newProps) 
            newProps = FSMProps["DEFAULT"]
        console.log("new props", newProps)
        setCurrentProps(newProps)
    }, [state])

    return currentProps
}