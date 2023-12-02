import { useEffect, useState } from "react"



export const useRemoteFSM = (FSMProps : {[key : string] : { [key : string] : any}}, 
                                                            state : string) => {

    const [currentProps, setCurrentProps] = useState(FSMProps[state] || FSMProps["DEFAULT"]) 

    useEffect(() => {
        let newProps = FSMProps[state]
        if(!newProps) 
            newProps = FSMProps["DEFAULT"]
        console.log("new props", newProps)
        setCurrentProps(newProps)
    }, [state])

    return currentProps
}