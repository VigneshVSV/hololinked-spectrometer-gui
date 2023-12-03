
export const FSMProps = {
    ON : { 
        connection : {
            text : 'Disconnect', 
            endpoint : '/disconnect', 
            disabled : false
        },
        acquisition : {
            disabled : false
        }
    },
    DISCONNECTED : {
        connection : {
            text : 'Connect', 
            endpoint : '/connect', 
            disabled : false
        }
    },
    MEASURING : {
        connection : {
            text : 'Disconnect', 
            endpoint : '/disconnect', 
            disabled : true
        },
        acquisition : {
            disabled : false, 
            endpoint : '/acquisition/stop'
        }
    },
    DEFAULT : {
        connection : {
            text : 'Connect', 
            endpoint : '/connect', 
            disabled : true
        },
        acquisition : {
            disabled : true,
            endpoint : '/acquisition/start'
        }
    }
}


