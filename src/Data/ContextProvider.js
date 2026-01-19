import React from "react";
import Context from "./Context";
const ContextProvider = ({value,children})=>{
    return(
        <Context.Provider value={value}>
            {children}
        </Context.Provider>
    )
}

export default ContextProvider