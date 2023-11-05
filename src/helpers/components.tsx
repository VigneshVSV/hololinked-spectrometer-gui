import { Box } from "@mui/material";



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