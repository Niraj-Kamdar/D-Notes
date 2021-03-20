import React, {useState} from 'react'
import {Toast} from "react-bootstrap";

function Note(props) {
    const [show, setShow] = useState(true)

    const unixToDate = (unixTimestamp) => {
        const dateObj = new Date(unixTimestamp/1000000);
        const utcString = dateObj.toUTCString()
        return utcString.slice(5, 16)
    }

    const onClose = async () => {
        await props.deleteNote(props.id)
        setShow(false)
    }

    return (
        <Toast onClose={onClose} show={show}>
            <Toast.Header>
                <img
                    src="holder.js/20x20?text=%20"
                    className="rounded mr-2"
                    alt=""
                />
                <strong className="mr-auto">{props.title}</strong>
                <small>{unixToDate(props.createdAt)}</small>
            </Toast.Header>
            <Toast.Body>{props.note}</Toast.Body>
        </Toast>
    )
}

export default Note