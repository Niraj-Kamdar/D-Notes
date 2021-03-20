import React, {useContext} from 'react'
import {Formik} from "formik";
import {Button, Form, InputGroup} from "react-bootstrap";
import * as yup from "yup";
import {UserContext} from "../App";

const initialState = {
    title: '',
    note: ''
}

const schema = yup.object().shape({
    title: yup.string().required("Title is required")
});

function CreateNote({client}) {
    const {identity} = useContext(UserContext)

    const saveNote = async(newNote) => {
        if (!newNote || newNote === '' || !client) return
        const encoded = new TextEncoder().encode(JSON.stringify(newNote))
        const response = await client.sendMessage(identity, identity.public, encoded)
        return response
    }

    const onSubmit = async (values, {setSubmitting}) => {
        const {title, note} = values
        try {
            await saveNote({title, note})
            setSubmitting(false)
        } catch (err) {
            console.log('error creating note..', err)
        }
    }

    return (
        <Formik initialValues={initialState} onSubmit={onSubmit} validationSchema={schema}>
            {({
                  handleSubmit,
                  handleChange,
                  handleBlur,
                  values,
                  touched,
                  errors,
              }) => (
                <Form noValidate onSubmit={handleSubmit} style={{width: "100%"}}>
                    <Form.Group controlId="bsTitle">
                        {/*<Form.Label>Title</Form.Label>*/}
                        <InputGroup className="mb-3">
                            <Form.Control
                                type="title"
                                name="title"
                                value={values.title}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                isInvalid={touched.title && errors.title}
                                placeholder="Enter Title"
                                area-label="Title"
                            />
                            <Form.Control.Feedback type="invalid">{errors.title}</Form.Control.Feedback>
                        </InputGroup>
                    </Form.Group>
                    <Form.Group controlId="bsNote">
                        {/*<Form.Label>Note</Form.Label>*/}
                        <Form.Control
                            as="textarea"
                            rows={3}
                            name="note"
                            value={values.note}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.note && errors.note}
                            placeholder="Enter Note"
                        />
                        <Form.Control.Feedback type="invalid">{errors.note}</Form.Control.Feedback>
                    </Form.Group>
                    <Button variant="primary" type="submit" block>
                        Save
                    </Button>
                </Form>
            )}
        </Formik>
    )
}

export default CreateNote