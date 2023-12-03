import { useEffect, useState } from "react"



export const useRemoteFSM = (FSMProps : {[key : string] : { [key : string] : any}}, 
                                                            state : string) => {

    const [currentProps, setCurrentProps] = useState(FSMProps[state] || FSMProps["DEFAULT"]) 

    useEffect(() => {
        let newProps = {...FSMProps["DEFAULT"]}
        if(!FSMProps[state]) 
            newProps = FSMProps["DEFAULT"]
        else {
            for(let key of Object.keys(FSMProps[state])) {
                newProps[key] = {
                    ...FSMProps["DEFAULT"][key],
                    ...FSMProps[state][key]
                }        
            }
        }
        console.log("new props", newProps)
        setCurrentProps(newProps)
    }, [state])

    return currentProps
}