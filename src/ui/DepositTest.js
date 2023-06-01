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
    const [customer_stored_cards, setCustomerStoredCards] = useState([]);

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

        let delim_char = '?';
        if (redirect_url.indexOf('?') >= 0) {
            delim_char = '&';
        }

        // Hard browser redirect to the given redirect_url,
        const target = redirect_url + delim_char + url_params.toString();
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
        const complete_url = 'https://paymenttests.dragoneye.gg/pp/localhostredirect/complete?port=3000';

        // Endpoint: /payment/initpaycharge
        const init_pay_charge_response =
                                 await context.initPayCharge(complete_url);

        if (init_pay_charge_response.status === 'OK') {

            console.log(init_pay_charge_response);

            // Get the transaction_id and details of how to receive card
            // details from the user,
            const {
                transaction_id,
                payment_charge_details,
                permitted_currencies, // Array of permitted currency codes,
            } = init_pay_charge_response;

            // Set the transaction_id from the response (this is an
            // internal id used for this specific payment interaction)
            setTransactionId(transaction_id);

            // Customer details from the payment charge details,
            const customer_details = payment_charge_details.customer_details;

            // All stored cards for this user,
            const stored_cards = payment_charge_details.stored_cards;

            // If the deposit display is 'REGULAR_CC_FIELDS' then we accept
            // the pan/cvv directly from the user,
            if (payment_charge_details.display === 'REGULAR_CC_FIELDS') {

                // Set up UI with the customer details,
                setPaymentCustomerDetails(customer_details);

                // Set up UI for the stored cards,
                setCustomerStoredCards(stored_cards);

                // Set step to display regular CC fields (server 2 server);
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
            selected_card_id, payment_method, pan, expiry, cvv, holder_name

        } = details;

        await setIsProcessing(true);

        console.log("handleRegularCCFieldsDepositAction");
        console.log(details);

        // The context for processing this operation,
        const context = props.ecl_context;

        // Card info,
        const cc_info = {};

        // If we are using a selected card number,
        if (selected_card_id !== undefined && selected_card_id !== '') {
            cc_info.storedcreditcardid = selected_card_id;
            cc_info.securitycode = cvv;
        }
        else {
            cc_info.pan = pan;
            cc_info.expiration = expiry;
            cc_info.securitycode = cvv;
            cc_info.holdername = holder_name;
        }

        const save_in_card_store = true;

        // PaySafe doesn't allow redirects to 'localhost' so we use a REDIRECT
        // middleware component for testing.
        const complete_url = 'https://paymenttests.dragoneye.gg/pp/localhostredirect/complete?port=3000';

        // NOTE: 'transaction_id' comes out of the 'initpaycharge' endpoint and
        //   it represents an internal payment transaction unique for this
        //   specific charge.

        // Endpoint: /payment/makepaycharge
        const make_pay_charge_response =
                await context.makePayCharge(
                        transaction_id,
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
                        customer_stored_cards = { customer_stored_cards }
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
