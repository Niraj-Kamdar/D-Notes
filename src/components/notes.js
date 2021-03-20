import React, {useContext, useEffect, useState} from 'react'
import {Users} from "@textile/hub";
import {UserContext} from "../App";
import {Col, Container, Row} from "react-bootstrap";
import CreateNote from "./createNote";
import Note from "./note";

function Notes() {
    const [notes, setNotes] = useState([])
    const [client, setClient] = useState(null)
    const {identity} = useContext(UserContext)

    useEffect(() => {

        const initializer = async() => {
            // new message handler
            if(!client) return
            const mailboxId = await client.setupMailbox()
            client.watchInbox(mailboxId, handleNewMessage)

            const messages = await client.listInboxMessages()
            const initNotes = await Promise.all(messages.map(messageDecoder))
            console.log(initNotes)
            setNotes(initNotes)
        }

        const handleNewMessage = async (reply, err) => {
            console.log("triggered")
            if (err) {console.log(err); return}
            if (!client) {console.log("no client!"); return}
            if (!reply || !reply.message) {console.log("no reply!", reply); return}
            const message = await messageDecoder(reply.message)
            console.log("updating...")
            setNotes((newNotes) => {
                console.log("insider", newNotes)
                return [...newNotes, message]
            })
            console.log("okay")
        }

        const messageDecoder = async (message) => {
            const bytes = await identity.decrypt(message.body)
            const body = new TextDecoder().decode(bytes)
            const {createdAt} = message
            const {id} = message
            const note = JSON.parse(body)
            return {id, ...note, createdAt}
        }

        initializer()

    }, [client])

    useEffect(() => {
        const initClient = async () => {
            const newClient = await Users.withKeyInfo({key: 'bwkrt36qlemdl2zfvgkp6dthvjy'})
            await newClient.getToken(identity)
            setClient(newClient)
        }
        initClient()
    }, [])

    const deleteNote = async (_id) => {
        if (!client) return
        await client.deleteInboxMessage(_id)
        setNotes((notes) => {
            const updatedNotes = [...notes]
            return updatedNotes.filter((msg) =>  (msg.id !== _id))
        })
    }

    return (
        <Container fluid>
            <Row style={{ marginTop: "0.5em" }}>
                <Col>
                    <CreateNote client={client}/>
                </Col>
            </Row>
            <Row sm={"auto"} style={{ marginTop: "1em"}}>
                {
                    notes.map((note) => (
                        <Col sm={"auto"} key={note.id} style={{width: "25%"}}>
                            <Note
                                {...note}
                                deleteNote={deleteNote}
                            />
                        </Col>
                    ))
                }
            </Row>
        </Container>
    )
}

export default Notes