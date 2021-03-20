import './App.css';
import React, {useState, Fragment} from "react";
import Router from "./components/router";
import {GlobalNotification} from 'slate-react-system';

export const UserContext = React.createContext(null)


function App() {
    const [identity, setIdentity] = useState(null)
    return (
        <Fragment>
            <GlobalNotification style={{bottom: 0, right: 0}}/>
            <UserContext.Provider value={{identity, setIdentity}}>
                <Router/>
            </UserContext.Provider>
        </Fragment>
    )
}

export default App