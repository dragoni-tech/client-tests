import React, { useState } from 'react';
import { Grid, Header, Button, Message } from 'semantic-ui-react';

import DepositJSForm from './DepositJSForm.js';


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

const DepositJSTest2 = (props) => {

    const [is_processing, setIsProcessing] = useState(false);

    const [step, setStep] = useState('uninit');
    const [transaction_id, setTransactionId] = useState('');
    const [single_use_customer_token, setSingleUseCustomerToken] = useState('');
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
        const complete_url = 'https://thetatests.dragoneye.gg/pp/localhostredirect/complete?port=3000';

        // Endpoint: /payment/initpaycharge
        const init_pay_charge_response =
                                 await context.initPayCharge(complete_url);

        if (init_pay_charge_response.status === 'OK') {

            // Get the transaction_id and details of how to receive card
            // details from the user,
            const {
                transaction_id,
                payment_charge_details,
                permitted_currencies, // Array of permitted currency codes,
            } = init_pay_charge_response;

            const single_use_customer_token = payment_charge_details.single_use_customer_token;

            // Set the transaction_id from the response (this is an
            // internal id used for this specific payment interaction)
            setTransactionId(transaction_id);

            // Single use customer token
            setSingleUseCustomerToken(single_use_customer_token);
            

            // Customer details from the payment charge details,
            const customer_details = payment_charge_details.customer_details;

            // All stored cards in paysafe for this user,
            const stored_cards_js = payment_charge_details.stored_cards_js;


            // If the deposit display is 'REGULAR_CC_FIELDS' then we accept
            // the pan/cvv directly from the user,
            if (payment_charge_details.display === 'REGULAR_CC_FIELDS') {

                // Set up UI with the customer details,
                setPaymentCustomerDetails(customer_details);

                // Set up UI for the stored cards,
                setCustomerStoredCards(stored_cards_js);

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

            currency, amount,
            selected_card_id, payment_method, pan, expiry, cvv, holder_name

        } = details;

        await setIsProcessing(true);

        // The context for processing this operation,
        const context = props.ecl_context;

        // Card info,
        const cc_info = {};

        // If we are using a selected card number,
        if (selected_card_id !== undefined && selected_card_id !== '') {
            cc_info.storedcreditcardid = selected_card_id;
            cc_info.securitycode = cvv;
            cc_info.token = details.token;
        }
        else {
            cc_info.pan = pan;
            cc_info.expiration = expiry;
            cc_info.securitycode = cvv;
            cc_info.holdername = holder_name;
            cc_info.token = details.token;
        }

        const save_in_card_store = true;

        // // PaySafe doesn't allow redirects to 'localhost' so we use a REDIRECT
        // // middleware component for testing.
        const complete_url = '';

        // // NOTE: 'transaction_id' comes out of the 'initpaycharge' endpoint and
        // //   it represents an internal payment transaction unique for this
        // //   specific charge.

        // Endpoint: /payment/makepaycharge
        const make_pay_charge_response =
                await context.makePayCharge(
                        transaction_id,
                        currency, amount, payment_method, cc_info,
                        save_in_card_store, complete_url );

        console.log('make_pay_charge_response', make_pay_charge_response);

        const redirect_details = {
            params: {
                transaction_id: transaction_id,
                json_result: JSON.stringify(make_pay_charge_response),
            },
            redirect_url: 'http://localhost:3000/completeJS',
        };
        
        // Redirect with the given details,
        redirectToPage(redirect_details);

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
                    <DepositJSForm
                        onDepositAction = { handleRegularCCFieldsDepositAction }
                        customer_details = { payment_customer_details }
                        customer_stored_cards = { customer_stored_cards }
                        single_use_customer_token = { single_use_customer_token }
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

export default DepositJSTest2;
