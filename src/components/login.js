import React, {Fragment} from 'react'
import {Card, Container} from "react-bootstrap";
import logo from "../notes.svg"
import LoginForm from "./loginForm";

function Login(){
    return (
        <Fragment>
            <div style={{display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", marginBottom: "-6rem"}}>
                <Card style={{width: "27rem"}}>
                    <Card.Img variant="top" src={logo} className="col-md-8 mx-auto" style={{width: "13rem"}}/>
                    <Card.Body>
                        <LoginForm/>
                    </Card.Body>
                </Card>
            </div>
            <Container style={{height: "6rem"}}/>
        </Fragment>
    )
}

export default Login