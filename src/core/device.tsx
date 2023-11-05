import "/node_modules/react-grid-layout/css/styles.css";
import "/node_modules/react-resizable/css/styles.css";
import { useCallback, useState } from 'react';
import GridLayout from 'react-grid-layout';
import Plot from 'react-plotly.js';
import { Box, Button, Stack, ButtonGroup, Typography, Divider, FormControl, RadioGroup,
     FormControlLabel, Radio, TextField, Checkbox, IconButton } from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';



export const Device = () => {

    return (
        <Stack direction='row'>
            <Stack width={1000}>
                <Stack direction='row'>
                    <Box sx={{ p : 2 }}>
                        <ConnectionButton />
                    </Box>
                    <Box sx={{ p : 2 }}>
                        <AcquisitionButtons />
                    </Box>
                    <Box sx={{ p : 2, pt : 3 }}>
                        <CurrentState />
                    </Box>
                </Stack>
                <Divider>
                    LIVE SPECTRUM
                </Divider>
                <SpectrumGraph />
            </Stack>
            <Divider orientation="vertical" sx={{ pl : 2 }} />
            <Stack>
                <Typography variant='button' color={'grey'} fontSize={18} sx={{p : 2}}>
                    settings
                </Typography>    
                <TriggerModeOptions />
                <IntegrationTime />
                <IntegrationTimeBounds />
                <InternalBackgroundSubstraction />
                <CustomBackground />
            </Stack>
        </Stack>
    )
}


const ConnectionButton = () => {

    const [text, setText] = useState<string>('Connect')

    return (
        <Button variant='contained' size='large'>
            {text}
        </Button>
    )
}

const AcquisitionButtons = () => {

    const [text, setText] = useState<string>('Connect')
    const [inAcquisition, setIsInAcquisition ] = useState<boolean>(false) 
    
    return (
        <Stack direction='row'>
            <ButtonGroup>
                <Button disabled >
                    Acquisition :
                </Button>
                <Button 
                    variant='contained' size='large' color='secondary'
                    disabled={inAcquisition}    
                >
                    Start
                </Button>
                <Button 
                    variant='contained' size='large' color='secondary'
                    disabled={!inAcquisition}
                >
                    Stop
                </Button>
            </ButtonGroup>
        </Stack>
    )
}


const CurrentState = () => {

    const [state, setState] = useState('unknown')

    return (
        <Typography variant='button'>
            State : {state}
        </Typography>
    )
}


const SpectrumGraph = () => {

    const [plotWidth, setPlotWidth] = useState(1000)
    const [plotHeight, setPlotHeight] = useState(plotWidth*(9/16))
    
    const handleLayoutChange = useCallback(((layout : GridLayout.Layout[]) => {
        setPlotWidth((layout[0].w)*50)
        setPlotHeight((layout[0].h)*10)
    }), [])

    const [lastMeasureTimestamp, setLastMeasuredTimestamp] = useState<string>('unknown')

    return (
        <Stack>
            <Typography variant='button' color={'grey'} fontSize={14} sx={{ p : 1, pl : 2.5}}>
                Last Measured Timestamp : {lastMeasureTimestamp}
            </Typography>
            <GridLayout
                width={1000}
                cols={20}
                rowHeight={10}
                margin={[0,0]}
                maxRows={57}
                preventCollision={true}
                onLayoutChange={handleLayoutChange}
                >    
                <Box
                    key='main-spectrometer-plot'
                    data-grid={{ 
                        x : 0, y : 0, w : 20, h : 57
                    }}
                    sx={{ border : '1px solid grey'}}
                    >
                    <Plot 
                        data={[{
                            x: [1, 2, 3],
                            y: [2, 6, 3],
                            type: 'scatter',
                            mode: 'lines+markers',
                            marker: {color: 'red'},
                        },
                        {type: 'bar', x: [1, 2, 3], y: [2, 5, 3]},
                    ]}
                    layout={{ width : plotWidth, height : plotHeight, title: 'A Fancy Plot'}}
                    />
                </Box>
            </GridLayout>
        </Stack>
    )
}



const TriggerModeOptions = () => {

    return (
        <FormControl>
            <Stack direction='row'>
                <Typography variant='button' color={'grey'} fontSize={14} sx={{ p : 2.5}}>
                    trigger settings :
                </Typography>
                <RadioGroup
                    row
                    defaultValue="continuous"
                    name="radio-buttons-group"   
                >
                    <FormControlLabel value="continuous" control={<Radio />} label="continuous" />
                    <FormControlLabel value="software" control={<Radio />} label="software" />
                    <FormControlLabel value="hardware" control={<Radio />} label="hardware" />
                </RadioGroup>
            </Stack>
        </FormControl>
    )
}


const IntegrationTime = () => {

    const [helperText, setHelperText] = useState<string>('milliseconds')

    return (
        <Stack direction='row'>
            <Typography variant='button' color={'grey'} fontSize={14} sx={{ p : 2.5}}>
                Integration Time :
            </Typography>
            <TextField variant='filled' size='small' helperText={helperText} />
        </Stack>
    )
}



const IntegrationTimeBounds = () => {

    const [helperText, setHelperText] = useState<string>('milliseconds')

    return (
        <Stack direction='row'>
            <Typography variant='button' color={'grey'} fontSize={14} sx={{ p : 1, pl : 2.5}}>
                Integration Time Bounds :
            </Typography>
            <TextField
                variant='outlined' size='small' helperText="minimum" 
                sx={{ 
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                            borderBottomRightRadius : 0,
                            borderTopRightRadius: 0, 
                    }}
                }}    
            />
            <TextField 
                variant='outlined' size='small' helperText="maximum"    
                sx={{ 
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                            borderBottomLeftRadius : 0,
                            borderTopLeftRadius: 0, 
                    }}
                }}   
            />
        </Stack>
    )
}


const InternalBackgroundSubstraction = () => {

    return (
        <Stack direction='row'>
            <Typography variant='button' color={'grey'} fontSize={14} sx={{ p : 1, pl : 2.5}}>
                Seabreeze Background Substraction :
            </Typography>
            <Checkbox></Checkbox>
        </Stack>
    )
}


const CustomBackground = () => {

    return (
        <Stack direction='row'>
            <Typography variant='button' color={'grey'} fontSize={14} sx={{ p : 1, pl : 2.5}}>
                Custom Background :
            </Typography>
            <Checkbox></Checkbox>
            <IconButton>
                <FileUploadIcon />
            </IconButton>
            <Typography sx= {{ p : 1}}>
                (no file selected yet, default value subtraction or no substraction)
            </Typography>
        </Stack>
    )
}