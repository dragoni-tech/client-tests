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
    const [paysafe_environment, setPaySafeEnvironment] = useState('');
    const [single_use_customer_token, setSingleUseCustomerToken] = useState('');
    const [processor_transaction_id, setProcessorTransactionId] = useState('');
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
        const complete_url = 'https://dragonidev2.dragoneye.gg/pp/localhostredirect/complete?port=3000';

        // Endpoint: /payment/initpaycharge
        const init_pay_charge_response =
                                 await context.initPayCharge(complete_url);

        if (init_pay_charge_response.status === 'OK') {

            // Get the transaction_id and details of how to receive card
            // details from the user,
            const {
                transaction_id,
                payment_charge_details,
            } = init_pay_charge_response;

            // Set the transaction_id from the response (this is an
            // internal id used for this specific payment interaction)
            setTransactionId(transaction_id);

            // Array of permitted currencies,
            const permitted_currencies = payment_charge_details.permitted_currencies;

            // The PaySafe.JS environment (eg. Web API key),
            setPaySafeEnvironment({
                currencyCode: permitted_currencies[0],
                environment: payment_charge_details.environment,
                web_api_key: payment_charge_details.paysafe_api_key,
                merchantDescriptor: payment_charge_details.merchantDescriptor
            });

            // Single use customer token
            setSingleUseCustomerToken(payment_charge_details.single_use_customer_token);

            // Set the processor transaction id (the merchant number) we must
            // use for this payment transaction,
            setProcessorTransactionId(payment_charge_details.processor_transaction_id);

            // Customer details from the payment charge details,
            const customer_details = payment_charge_details.customer_details;

            // All stored cards in paysafe for this user,
            const stored_cards = payment_charge_details.stored_cards;


            // If the deposit display is 'PAYSAFE_JS_LIBRARY' then we accept
            // the pan/cvv through the PaySafe.JS library which is tokenized,
            if (payment_charge_details.display === 'PAYSAFE_JS_LIBRARY') {

                // Set up UI with the customer details,
                setPaymentCustomerDetails(customer_details);

                // Set up UI for the stored cards,
                setCustomerStoredCards(stored_cards);

                // Set step to display PaySafe.JS payment fields;
                setStep('init-paysafe-js-library');

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
     * 'PAYSAFE_JS_LIBRARY'
     *
     * @param {*} details
     */

    const handlePaySafeJSLibraryDepositAction = async (details) => {

        const {

            payment_method, currency, amount,
            selected_card_id, paysafe_card_tokenization

        } = details;

        await setIsProcessing(true);

        // The context for processing this operation,
        const context = props.ecl_context;

        // Card info,
        const cc_info = {};

        // If we are using a selected card number,
        if (selected_card_id !== undefined && selected_card_id !== '') {
            cc_info.storedcreditcardid = selected_card_id;
            cc_info.token = paysafe_card_tokenization;
        }
        else {
            cc_info.token = paysafe_card_tokenization;
        }

        const save_in_card_store = true;

        // NOTE: 'transaction_id' comes out of the 'initpaycharge' endpoint and
        //   it represents an internal payment transaction unique for this
        //   specific charge.

        // NOTE: 'complete_url' is not necessary to be set when using the
        //   PaySafe.JS library,
        const complete_url = '';

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
    else if (step === 'init-paysafe-js-library') {
        content = (
            <Grid>
                <Grid.Column style={{ maxWidth: 800 }}>
                    <DepositJSForm
                        onDepositAction = { handlePaySafeJSLibraryDepositAction }
                        customer_details = { payment_customer_details }
                        customer_stored_cards = { customer_stored_cards }
                        processor_transaction_id = { processor_transaction_id }
                        single_use_customer_token = { single_use_customer_token }
                        paysafe_environment = { paysafe_environment }
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
