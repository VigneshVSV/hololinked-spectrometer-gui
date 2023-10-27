import './App.css';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { Box, Link, Typography } from "@mui/material";


const Code = (props : any) => {
    return (
        <Typography sx={{ fontFamily : 'Consolas' }} component="span">
            {props.children}
        </Typography>
    )
}


function App() {
    return (
        <Box sx={{ display : 'flex', justifyContent : 'center', flexGrow : 1 }}>
            <Typography>
                Use this project as template for <Code>daqpy</Code> based GUI examples at <Link>will be filled</Link>. <br />
                Install dependencies using <Code>npm install .</Code> or <Code>npm install . --force </Code>
            </Typography>
        </Box>
    );
}

export default App;
