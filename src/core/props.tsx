
export const FSMProps = {
    ON : { 
        connection : {
            text : 'Disconnect', 
            endpoint : '/disconnect', 
            disabled : false
        },
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
        }
    },
    DEFAULT : {
        connection : {
            text : 'Connect', 
            endpoint : '/connect', 
            disabled : false
        }
    }
}