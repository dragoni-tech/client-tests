import React, { useState, useEffect } from 'react';
import { Grid, Header, Button, Message } from 'semantic-ui-react';

import DepositForm from './DepositForm.js';


// function waitFor(ms) {
//     return new Promise((resolve, reject) => {
//         setInterval(resolve, ms);
//     });
// }


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
    const [payment_customer_details, setPaymentCustomerDetails] = useState({});

    const [operation_error, setOperationError] = useState({});


    /**
     * Redirect to external page with the given redirect details.
     *
     * @param {*} redirect_details
     */

    const redirectToPage = (redirect_details) => {

        const {
            redirect_url,
            params
        } = redirect_details;

        // NOTE: URLSearchParams is not supported for all Browsers.
        const url_params = new URLSearchParams();
        for (const key in params) {
            url_params.set(key, params[key]);
        }

        // Hard browser redirect to the given redirect_url,
        const target = redirect_url + '?' + url_params.toString();
        console.log("Browser redirect to: ", target);

        window.location.replace(target);

    };



    /**
     * Pay initialise. This makes a request on the backend on what method must
     * be used to present the card fields to the user on the front end.
     */

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
                transaction_id,
                payment_charge_details
            } = init_pay_charge_response;

            // Customer details from the payment charge details,
            const customer_details = payment_charge_details.customer_details;

            // If the deposit display is 'REGULAR_CC_FIELDS' then we accept
            // the pan/cvv directly from the user,
            if (payment_charge_details.display === 'REGULAR_CC_FIELDS') {
                setTransactionId(transaction_id);
                setPaymentCustomerDetails(customer_details);
                setStep('init-regular-cc-fields');
            }
            // PENDING: Support for other types of card display settings,
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


    /**
     * The deposit action that happens when 'display' type is
     * 'REGULAR_CC_FIELDS'
     *
     * @param {*} details
     */

    const handleRegularCCFieldsDepositAction = async (details) => {
        const {

            billing_firstname, billing_lastname,
            billing_address1, billing_address2, billing_address3,
            billing_city, billing_county, billing_postcode,

            currency, amount,
            payment_method, pan, expiry, cvv
        } = details;

        await setIsProcessing(true);

        console.log("handleRegularCCFieldsDepositAction");

        // The context for processing this operation,
        const context = props.ecl_context;

        // Card info,
        const cc_info = {
            pan,
            expiration: expiry,
            securitycode: cvv
        };
        const save_in_card_store = false;
        const complete_url = 'http://localhost:3000/complete';

        // Endpoint: /payment/makepaycharge
        const make_pay_charge_response =
                await context.makePayCharge(
                        currency, amount, payment_method, cc_info,
                        save_in_card_store, complete_url );

        // The 'status' value will always be 'REDIRECT' if everything worked
        // as expected. There's currently three possible redirections;
        //   'declined': Card was declined. Redirect to complete_url.
        //   'approved': Card was approved. Redirect to complete_url.
        //   'threed': A 3DS challenge is neceesary. Open an iframe and redirect.
        if (make_pay_charge_response.status === 'REDIRECT') {

            console.log(make_pay_charge_response);

            // The response from platform,
            const {
                step,
                step_details,
                redirect_details,
            } = make_pay_charge_response;

            // Redirect with the given details,
            redirectToPage(redirect_details);

        }
        else {
            setOperationError({
                title: 'Error',
                msg: JSON.stringify(make_pay_charge_response, null, 1)
            });
        }

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
                        onDepositAction = { handleRegularCCFieldsDepositAction }
                        customer_details = { payment_customer_details }
                        disabled = { is_processing }
                    />
                </Grid.Column>
            </Grid>
        );
    }


    // Any errors?
    const error_msg = operation_error.msg;
    const error_title = operation_error.title;

    // Components to render,
    return (
        <div>

            <Message error hidden={error_msg === undefined}
                     header={error_title}
                     content={error_msg} />

            { content }

        </div>
    );

};

export default DepositTest;
