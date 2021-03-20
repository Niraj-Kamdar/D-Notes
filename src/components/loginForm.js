import React, {useContext, useEffect} from 'react'
import {dispatchCustomEvent} from 'slate-react-system'
import {PrivateKey} from '@textile/hub'
import {BigNumber, providers, utils} from 'ethers'

import {Button, Form, InputGroup} from "react-bootstrap";
import {LockFill} from 'react-bootstrap-icons';
import {Formik} from 'formik';
import * as yup from 'yup'
import {UserContext} from "../App";
import {useHistory, useLocation} from "react-router-dom";

const initialState = {
    password: '',
}

const schema = yup.object().shape({
    password: yup.string().required("Password is required")
});


function LoginForm() {
    const {identity, setIdentity} = useContext(UserContext)
    const history = useHistory()
    const location = useLocation()
    const {from} = location.state || {from: {pathname: "/"}};

    useEffect(() => {
        if (identity) {
            history.replace(from)
        }
    }, [identity])

    const generateMessageForEntropy = (ethereum_address, application_name, secret) => (
        '******************************************************************************** \n' +
        'READ THIS MESSAGE CAREFULLY. \n' +
        'DO NOT SHARE THIS SIGNED MESSAGE WITH ANYONE OR THEY WILL HAVE READ AND WRITE \n' +
        'ACCESS TO THIS APPLICATION. \n' +
        'DO NOT SIGN THIS MESSAGE IF THE FOLLOWING IS NOT TRUE OR YOU DO NOT CONSENT \n' +
        'TO THE CURRENT APPLICATION HAVING ACCESS TO THE FOLLOWING APPLICATION. \n' +
        '******************************************************************************** \n' +
        'The Ethereum address used by this application is: \n' +
        '\n' +
        ethereum_address +
        '\n' +
        '\n' +
        '\n' +
        'By signing this message, you authorize the current application to use the \n' +
        'following app associated with the above address: \n' +
        '\n' +
        application_name +
        '\n' +
        '\n' +
        '\n' +
        'your non-recoverable, private, non-persisted password or secret \n' +
        'phrase is: \n' +
        '\n' +
        secret +
        '\n' +
        '\n' +
        '\n' +
        '******************************************************************************** \n' +
        'ONLY SIGN THIS MESSAGE IF YOU CONSENT TO THE CURRENT PAGE ACCESSING THE KEYS \n' +
        'ASSOCIATED WITH THE ABOVE ADDRESS AND APPLICATION. \n' +
        'AGAIN, DO NOT SHARE THIS SIGNED MESSAGE WITH ANYONE OR THEY WILL HAVE READ AND \n' +
        'WRITE ACCESS TO THIS APPLICATION. \n' +
        '******************************************************************************** \n'
    )

    const getSigner = async () => {
        if (!window.ethereum) {
            throw new Error(
                'Ethereum is not connected. Please download Metamask from https://metamask.io/download.html'
            );
        }

        console.debug('Initializing web3 provider...');
        const provider = new providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        return signer
    }

    const getAddressAndSigner = async () => {
        const signer = await getSigner()
        // @ts-ignore
        const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
        if (accounts.length === 0) {
            throw new Error('No account is provided. Please provide an account to this application.');
        }

        const address = accounts[0];

        return {address, signer}
    }

    const generatePrivateKey = async (password) => {
        const metamask = await getAddressAndSigner()
        // avoid sending the raw secret by hashing it first
        const secret = password
        const message = generateMessageForEntropy(metamask.address, 'Notes', secret)
        const signedText = await metamask.signer.signMessage(message);
        const hash = utils.keccak256(signedText);
        if (hash === null) {
            throw new Error('No account is provided. Please provide an account to this application.');
        }
        // The following line converts the hash in hex to an array of 32 integers.
        // @ts-ignore
        const array = hash
            // @ts-ignore
            .replace('0x', '')
            // @ts-ignore
            .match(/.{2}/g)
            .map((hexNoPrefix) => BigNumber.from('0x' + hexNoPrefix).toNumber())

        if (array.length !== 32) {
            throw new Error('Hash of signature is not the correct size! Something went wrong!');
        }
        const identity = PrivateKey.fromRawEd25519Seed(Uint8Array.from(array))
        console.log(identity.toString())

        createNotification(identity)

        // Your app can now use this identity for generating a user Mailbox, Threads, Buckets, etc
        return identity
    }

    const createNotification = (identity) => {
        dispatchCustomEvent({
            name: "create-notification", detail: {
                id: 1,
                description: `PubKey: ${identity.public.toString()}. Your app can now generate and reuse this users PrivateKey for creating user Mailboxes, Threads, and Buckets.`,
                timeout: 5000,
            }
        })
    }

    const onSubmit = async (values, {setSubmitting}) => {
        const {password} = values
        try {
            const newIdentity = await generatePrivateKey(password)
            // console.log(newIdentity)
            setIdentity(newIdentity)
            setSubmitting(false)
            history.replace(from)
        } catch (err) {
            alert(err)
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
                <Form noValidate onSubmit={handleSubmit}>
                    <Form.Group controlId="bsPassword">
                        <Form.Label>Password</Form.Label>
                        <InputGroup className="mb-3">
                            <InputGroup.Prepend>
                                <InputGroup.Text id="password-icon">
                                    <LockFill/>
                                </InputGroup.Text>
                            </InputGroup.Prepend>
                            <Form.Control
                                type="password"
                                name="password"
                                value={values.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                isInvalid={touched.password && errors.password}
                                placeholder="Enter password"
                                area-label="Password"
                                area-described-by="password-icon"
                            />
                            <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
                        </InputGroup>
                    </Form.Group>
                    <Button variant="primary" type="submit" block>
                        Login
                    </Button>
                </Form>
            )}
        </Formik>
    )
}

export default LoginForm