import {BrowserRouter, Route, Switch} from "react-router-dom";
import React from 'react'
import ProtectedRoute from "./protectedRoute";
import Login from "./login";
import Notes from "./notes";

function Router(props) {
    return (
        <BrowserRouter>
            <Switch>
                <ProtectedRoute exact path="/">
                    <Notes/>
                </ProtectedRoute>
                <Route exact path="/login">
                    <Login/>
                </Route>
            </Switch>
            {props.children}
        </BrowserRouter>
    )
}

export default Router