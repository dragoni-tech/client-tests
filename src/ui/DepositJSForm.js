import React, { useState, useEffect, useCallback } from 'react';
import { Header, Icon, Button, Form, Input, Select, List, Segment, Accordion, Divider } from 'semantic-ui-react';

import './DepositJSForm.css';


// Definitions of the PaySafe fields as used by the PaySafe.JS library,
let PAYSAFE_FIELD_OPTIONS = {
    fields: {
        cardNumber: {
            selector: '#cardNumber',
//            placeholder: 'Card number',
            separator: ' ',
            optional: true,
        },
        expiryDate: {
            selector: '#expiryDate',
//            placeholder: 'Expiry date',
            optional: true,
        },
        cvv: {
            selector: '#cvv',
//            placeholder: 'CVV',
            optional: false,
        },
    },
    style: {
       input: {
            "font-family": "robotoregular,Helvetica,Arial,sans-serif",
            "font-weight": "normal",
            "font-size": "14px",
        },
        "#card-number.valid": {
            "color": "black"
        },
        ":focus": {
            "color": "black"
        }
    }
};



// If a value (idv) in props.customer_details is not defined then return empty
// string.
function custDetails(props, idv) {
    if (props.customer_details !== undefined) {
        const v = props.customer_details[idv];
        if (v !== undefined && v !== null) {
            return v;
        }
    }
    return '';
}


// NOTE: Sadly we have to employ a global here because we don't want PaySafe
//   to be initialised twice for this component.
let initialisingPaySafe;
let paysafeInstance;

// PaySafe initialisation. Make sure this is not called multiple times at the
// same time.

async function initialisePaySafe(paysafe_environment) {
    if (initialisingPaySafe !== undefined) {
        await initialisingPaySafe;
        return;
    }
    try {

        // Remove all IFrames on the elements if we need
        // to initialise the component again.
        document.getElementById('cardNumber').replaceChildren();
        document.getElementById('expiryDate').replaceChildren();
        document.getElementById('cvv').replaceChildren();

        // Use the PaySafe library to decorate the payment handling fields,
        const options = { ...PAYSAFE_FIELD_OPTIONS };

        const {
            currencyCode,
            environment,
            web_api_key
        } = paysafe_environment;

        // Set the currency and environment,
        options.currencyCode = currencyCode;
        // select the Paysafe test / sandbox environment
        options.environment = environment;

        const instance = await window.paysafe.fields.setup(web_api_key, options);
        console.log('Setup instance completed. in  new form');
        paysafeInstance = instance;

        const paymentMethods = await instance.show();

        if (paymentMethods.card && !paymentMethods.card.error) {
            console.log('3dS');
        }

    }
    catch (err) {
        // NOTE: We should callback to some sort of error handling here because
        //   this will fail if the PaySafe service is not running or there are
        //   other networking issues blocking access to the servers.
        console.error(err);
    }
    finally {
        initialisingPaySafe = undefined;
    }

}

// The component,

const DepositJSForm = (props) => {

    const [ billing_firstname, setBillingFirstName ] =
                    useState(custDetails(props, "billing_firstname"));
    const [ billing_lastname, setBillingLastName ] =
                    useState(custDetails(props, "billing_lastname"));
    const [ billing_address1, setBillingAddress1 ] =
                    useState(custDetails(props, "billing_address1"));
    const [ billing_address2, setBillingAddress2 ] =
                    useState(custDetails(props, "billing_address2"));
    const [ billing_address3, setBillingAddress3 ] =
                    useState(custDetails(props, "billing_address3"));
    const [ billing_city, setBillingCity ] =
                    useState(custDetails(props, "billing_city"));
    const [ billing_county, setBillingCounty ] =
                    useState(custDetails(props, "billing_county"));
    const [ billing_postcode, setBillingPostcode ] =
                    useState(custDetails(props, "billing_postcode"));

    const [currency, setCurrency] = useState( props.paysafe_environment.currencyCode );
    const [amount, setAmount] = useState('');
    const [payment_method, setPaymentMethod] = useState('VISA');
    const [holder_name, setHolderName] = useState('');

    const [selected_card_id, setSelectedCardId] = useState('');

    const [billing_open, setBillingOpen] = useState(false);

    const paymentOptions = [
        { key: 'v', text: 'VISA', value: 'VISA' },
        { key: 'm', text: 'MASTERCARD', value: 'MASTERCARD' },
    ];

    const currencyOptions = [
        { key: 'efm', text: 'EFM', value: 'EFM' },
        { key: 'gbp', text: 'GBP', value: 'GBP' },
        { key: 'eur', text: 'EUR', value: 'EUR' },
        { key: 'usd', text: 'USD', value: 'USD' },
    ];


    useEffect(() => {

        // NOTE: Global variable here because initialisePaySafe has a lot of
        //   side-effects and we can't easily mount/unmount the PaySafe
        //   components in React.
        if (initialisingPaySafe === undefined) {
            initialisingPaySafe = initialisePaySafe(props.paysafe_environment);
        }

    }, [ props.paysafe_environment ]);


    const handleSubmit = async () => {

        let selected_card_token;
        if (selected_card_id !== '') {
            for (const card of props.customer_stored_cards) {
                if (card.cc_cardstore_id === selected_card_id) {
                    selected_card_token = card.payment_handle_token;
                }
            }
        }

        // Note; This should be parsed depending on the currency. Some
        //   currencies don't have factional parts. PaySafe wants the
        //   amount in minor units.
        const amount_as_number = Math.round( parseFloat( amount ) * 100 );

        const tokenizationOptions = {
            amount: amount_as_number,
            transactionType: 'PAYMENT',
            paymentType: 'CARD',
            merchantRefNum: props.processor_transaction_id,
            customerDetails: {
                holderName: holder_name,
                billingDetails: {
                    country: 'GB',
                    zip: billing_postcode,
                    street: billing_address1,
                    street2: billing_address2,
                    city: billing_city,
                    state: billing_county,
                },
            },
            merchantDescriptor: props.paysafe_environment.merchantDescriptor,
            threeDs: {
                "merchantUrl": "https://www.paysafe.com",
                "deviceChannel": "BROWSER",
                "messageCategory": "PAYMENT",
                "transactionIntent": "GOODS_OR_SERVICE_PURCHASE",
                "authenticationPurpose": "PAYMENT_TRANSACTION"
            },
            openAs: 'IFRAME',
        };

        // If using a stored card,
        if (selected_card_id !== '') {
            tokenizationOptions.singleUseCustomerToken = props.single_use_customer_token;
            tokenizationOptions.paymentTokenFrom = selected_card_token;
        }

        console.log(tokenizationOptions);

        try {

            // Tokenize the payment details,
            const result = await paysafeInstance.tokenize(tokenizationOptions);

            // Looks like we succeeded in tokenization, so do a callback on the
            // deposit action,
            const paysafe_card_tokenization = result.token;

            // Perform the deposit action,
            props.onDepositAction({

                billing_firstname, billing_lastname,
                billing_address1, billing_address2, billing_address3,
                billing_city, billing_county, billing_postcode,

                currency, amount,
                selected_card_id, payment_method, holder_name,

                paysafe_card_tokenization,

            });

        }
        catch (err) {

            // NOTE: There's various errors that can happen with tokenization
            //  such as 3DS failing and cards being declined, etc. This should
            //  handle the errors sensibly.

            console.error(err);
        }

    };

    const handleStoredCardSelection = (card_id) => {
        let to_set = '';
        if (selected_card_id !== card_id) {
            to_set = card_id;
        }
        console.log(to_set);
        setSelectedCardId(to_set);
    };


    const handleBillingToggle = () => {
        setBillingOpen(!billing_open);
    };

    // The current cards stored for the customer,
    const customer_stored_cards = props.customer_stored_cards;

    const disabled = props.disabled;

    // The UI to present for credit card entry (changes depending on if a card
    // is selected or not),
    let card_entry_content;

    const disable_card_number_and_expiry = (selected_card_id !== '');

    card_entry_content = (
        <div>
            <Form.Field disabled={ disable_card_number_and_expiry }>
                <label>Card Number</label>
                <div id="cardNumber" className="paySafeInputField" />
            </Form.Field>
            <Form.Field disabled={ disable_card_number_and_expiry }>
                <label>Expiry</label>
                <div id="expiryDate" className="paySafeInputField" />
            </Form.Field>
            <Form.Field disabled={ false }>
                <label>CVV</label>
                <div id="cvv" className="paySafeInputField" />
            </Form.Field>

            <Form.Field
                disabled={disabled}
                control={Input}
                label="Name as appears on card"
                placeholder="Card holders name"
                value={holder_name}
                onChange={(e) => setHolderName(e.target.value)}
            />
        </div>
    );


    return (
        <div>
            <Form onSubmit={handleSubmit}>

                <Accordion fluid styled>
                    <Accordion.Title
                        index={0}
                        active={ billing_open }
                        onClick={ handleBillingToggle }
                    >
                        <Icon name="dropdown" />
                        Billing Details
                    </Accordion.Title>
                    <Accordion.Content active={billing_open}>

                        <Form.Group widths="equal">
                            <Form.Input
                                label="First name"
                                name="firstname"
                                value={billing_firstname}
                                onChange={(e, { value }) => setBillingFirstName(value) }
                            />
                            <Form.Input
                                label="Last name"
                                name="lastname"
                                value={billing_lastname}
                                onChange={(e, { value }) => setBillingLastName(value) }
                            />
                        </Form.Group>
                        <Form.Input
                            label="Address 1"
                            name="address1"
                            value={billing_address1}
                            onChange={(e, { value }) => setBillingAddress1(value) }
                        />
                        <Form.Input
                            label="Address 2"
                            name="address2"
                            value={billing_address2}
                            onChange={(e, { value }) => setBillingAddress2(value) }
                        />
                        <Form.Input
                            label="Address 3"
                            name="address3"
                            value={billing_address3}
                            onChange={(e, { value }) => setBillingAddress3(value) }
                        />
                        <Form.Group widths="equal">
                            <Form.Input
                                label="City/Town"
                                name="city"
                                value={billing_city}
                                onChange={(e, { value }) => setBillingCity(value) }
                            />
                            <Form.Input
                                label="County"
                                name="county"
                                value={billing_county}
                                onChange={(e, { value }) => setBillingCounty(value) }
                            />
                            <Form.Input
                                label="Postcode"
                                name="postcode"
                                value={billing_postcode}
                                onChange={(e, { value }) => setBillingPostcode(value) }
                            />
                        </Form.Group>

                    </Accordion.Content>
                </Accordion>

                <Header as="h3">
                    Card Details
                </Header>

                <Form.Group widths="equal">
                    <Form.Field width={1}
                        disabled={disabled}
                        control={Select}
                        label="Currency"
                        options={currencyOptions} // Add other currency options as needed
                        placeholder="Currency"
                        value={currency}
                        // onChange={(e, { value }) => setCurrency(value)}
                    />
                    <Form.Field width={9}
                        disabled={disabled}
                        control={Input}
                        label="Amount"
                        placeholder="Amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                </Form.Group>

                <Segment>
                    <Header as="h4">Stored Cards</Header>
                    <List divided selection verticalAlign="middle">
                        { customer_stored_cards.map((card) => (
                            <List.Item active={card.cc_cardstore_id === selected_card_id}
                                    key={card.cc_cardstore_id}
                                    onClick={ () => handleStoredCardSelection( card.cc_cardstore_id ) }>
                                <List.Content>{ card.card_holder_name }</List.Content>
                                <List.Content>{ card.card_type }: { card.card_pan_label } Exp: { card.card_expiration }</List.Content>
                            </List.Item>
                        ))
                        }
                    </List>
                </Segment>

                { card_entry_content }

                <br/>

                <Button type="submit" disabled={disabled} >Start Deposit</Button>

                </Form>

        </div>

    );

};

export default DepositJSForm;
