import React, { useState, useEffect } from 'react';
import { Grid, Header, Button, Message } from 'semantic-ui-react';

import DepositForm from './DepositForm.js';


function waitFor(ms) {
    return new Promise((resolve, reject) => {
        setInterval(resolve, ms);
    });
}


/**
 * Test of the Deposit payment process in the Gambling platform.
 *
 * @param {*} props
 * @returns
 */

const DepositTest = (props) => {

    const [is_processing, setIsProcessing] = useState(false);

    const [step, setStep] = useState('uninit');
    const [transaction_id, setTransactionId] = useState('');

    const [operation_error, setOperationError] = useState({});


    // useEffect(
    //     () => {
    //         console.log("useEffect run!");
    //     }, []
    // );


    const handlePayInitialise = async () => {

        setOperationError({});
        setIsProcessing(true);

        // The context for processing this operation,
        const context = props.ecl_context;

        // The completion URI we redirect to once payment outcome is known,
        const complete_url = 'http://localhost:3000/complete';

        // Endpoint: /payment/initpaycharge
        const init_pay_charge_response =
                                 await context.initPayCharge(complete_url);
        if (init_pay_charge_response.status === 'OK') {

            console.log(init_pay_charge_response);

            // Get the transaction_id and details of how to receive card
            // details from the user,
            const {
                transaction_id, payment_charge_details
            } = init_pay_charge_response;

            // If the deposit display is 'REGULAR_CC_FIELDS' then we accept
            // the pan/cvv directly from the user,
            if (payment_charge_details.display === 'REGULAR_CC_FIELDS') {
                setTransactionId(transaction_id);
                setStep('init-regular-cc-fields');
            }
            else {
                setOperationError({
                    title: 'Response Error',
                    msg: 'Unknown "display" type.'
                });
            }

        }
        // For none 'OK' response,
        else {
            setOperationError({
                title: 'Error',
                msg: JSON.stringify(init_pay_charge_response, null, 1)
            });
        }

        setIsProcessing(false);

    };


    const handleDepositAction = async (details) => {
        const {
            currency, amount,
            payment_method, pan, expiry, cvv
        } = details;

        await setIsProcessing(true);

        // The context for processing this operation,
        const context = props.ecl_context;

        // // Endpoint: /payment/initpaycharge
        // const init_pay_charge_response =
        //                         await context.initPayCharge(complete_url);
        // if (init_pay_charge_response.status === 'OK') {

        // }





        await setIsProcessing(false);

    };




    let content;

    // If uninitialised, UI is a button to start the deposit process,
    if (step === 'uninit') {
        content = (
            <Button disabled = { is_processing }
                onClick={ handlePayInitialise } >Start Deposit</Button>
        );
    }

    // Once initialised, present UI for entering card details,
    else if (step === 'init-regular-cc-fields') {
        content = (
            <Grid>
                <Grid.Column style={{ maxWidth: 800 }}>
                    <DepositForm
                        onDepositAction = { handleDepositAction }
                        disabled = { is_processing }
                    />
                </Grid.Column>
            </Grid>
        );
    }


    // Any errors?
    const error_msg = operation_error.msg;
    const error_title = operation_error.title;

    console.log(operation_error);
    console.log(error_title);

    // Components to render,
    return (
        <div>
            <Header as="h4">
                Deposit Test
            </Header>
            <Message error hidden={error_msg === undefined}
                     header={error_title}
                     content={error_msg} />

            { content }

        </div>
    );

};

export default DepositTest;
