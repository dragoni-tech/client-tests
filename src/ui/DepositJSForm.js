import React, { useState, useEffect } from 'react';
import { Header, Icon, Button, Form, Input, Select, List, Segment, Accordion, Divider } from 'semantic-ui-react';
import { getApiKey, getOptions } from '../utils/PaysafeSettings.js';

function custDetails(props, idv) {
    if (props.customer_details !== undefined) {
        const v = props.customer_details[idv];
        if (v !== undefined && v !== null) {
            return v;
        }
    }
    return '';
}

let paysafeInstance = null;
let API_KEY = getApiKey();
let OPTIONS = getOptions();

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

    const [currency, setCurrency] = useState('GBP');
    const [amount, setAmount] = useState('');
    const [payment_method, setPaymentMethod] = useState('VISA');
    const [pan, setPan] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [holder_name, setHolderName] = useState('');

    const [selected_card_id, setSelectedCardId] = useState('');
    const [selected_card_token, setSelectedCardToken] = useState('');

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

    const [initialized, setInitialized] = useState(false);
    const [token, setToken] = useState('');
    const [storedCard, setStoredCard] = useState(true);

    let initializedJsForm = false;

    useEffect(() => {

        if (!initializedJsForm) {

            window.paysafe.fields.setup(API_KEY, OPTIONS).then((instance) => {

                console.log('Setup instance completed. in  new form');
                paysafeInstance = instance;
                return instance.show();

            }).then((paymentMethods) => {
                
                if (paymentMethods.card && !paymentMethods.card.error) {

                    console.log('3dS');

                }
            }).catch((error) => {
                // display any setup errors
                console.log(JSON.stringify(error));
            });
        }
        initializedJsForm = true;
    }, []);
    

    const handleSubmit = () => {

        let tokenizationOptions = {};

        if (selected_card_token !== '') {
            tokenizationOptions = {
                amount: parseInt(amount, 10) * 100, // Is necesary parse the amount value with a valid finance code
                threeDs: {
                    "merchantUrl": "https://www.paysafe.com",
                    "deviceChannel": "BROWSER",
                    "messageCategory": "PAYMENT",
                    "transactionIntent": "GOODS_OR_SERVICE_PURCHASE",
                    "authenticationPurpose": "PAYMENT_TRANSACTION"
                },
                transactionType: 'PAYMENT',
                paymentType: 'CARD',
                merchantRefNum: 'merchant-ref-num-' + new Date().getTime(),
                customerDetails: {
                    billingDetails: {
                        country: 'GB',
                        zip: billing_postcode,
                        street: billing_address1,
                        city: billing_city,
                        state: billing_county,
                    },
                },
                singleUseCustomerToken: props.single_use_customer_token,
                paymentTokenFrom: selected_card_token,
            };
        }
        else {
            tokenizationOptions = {
                amount: parseInt(amount, 10) * 100, // Is necesary parse the amount value with a valid finance code
                currencyCode: currency,
                threeDs: {
                    "merchantUrl": "https://www.paysafe.com",
                    "deviceChannel": "BROWSER",
                    "messageCategory": "PAYMENT",
                    "transactionIntent": "GOODS_OR_SERVICE_PURCHASE",
                    "authenticationPurpose": "PAYMENT_TRANSACTION"
                },
                transactionType: 'PAYMENT',
                paymentType: 'CARD',
                merchantRefNum: 'merchant-ref-num-' + new Date().getTime(),
                customerDetails: {
                    holderName: holder_name,
                    billingDetails: {
                        country: 'GB',
                        zip: billing_postcode,
                        street: billing_address1,
                        city: billing_city,
                        state: billing_county,
                    },
                },
            };
        }

        console.log(tokenizationOptions);

        paysafeInstance.tokenize(tokenizationOptions).then((result) => {
            // write the Payment token value to the browser console
            setToken(result.token);
            handlePay(result.token);
        }).catch((error) => {
        // display the tokenization error in dialog window
            console.log(JSON.stringify(error));
        });
        
    };

    const handlePay = async (token) => {
        
        console.log(token);
        console.log("handlePay");
        
        const details = {

            billing_firstname: '',
            billing_lastname: '',
            billing_address1: '',
            billing_address2: '',
            billing_address3: '',
            billing_city: '',
            billing_county: '',
            billing_postcode: '',
            currency: 'GBP',
            amount: amount,
            selected_card_id: '',
            payment_method: 'VISA',
            pan: '',
            expiry: '',
            cvv: '',
            holder_name: '',
            token: token,
        };

        await props.onDepositAction(details);

        setInitialized(true);

    };

    const handleStoredCardSelection = (card_token) => {
        let to_set = '';
        if (selected_card_token !== card_token) {
            to_set = card_token;
        }
        console.log(to_set);
        setSelectedCardToken(to_set);

        document.getElementById('cardNumber').style.visibility = 'hidden';
        document.getElementById('expiryDate').style.visibility = 'hidden';

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
    if (selected_card_id === '') {
        card_entry_content = (
            <div>
                <div id="cardNumber"></div>
                <div id="expiryDate"></div>
                <div id="cvv"></div>
                <Form.Field
                    disabled={disabled}
                    control={Input}
                    label="Name as appears on card"
                    placeholder="Card holders name"
                    value={holder_name}
                    onChange={(e) => setHolderName(e.target.value)}
                />
                {/* <button id="payNow" type="button" class="ui button">Pay now</button> */}
            </div>
        );
    }

    // Otherwise user has selected a card so only requires CVV to be passed,
    else {
        card_entry_content = (
            <div>
                <Form.Group widths="equal">
                    <Form.Field
                        disabled={disabled}
                        control={Input}
                        label="Confirm CVV"
                        placeholder="CVV"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                    />
                </Form.Group>
            </div>
        );
    }
    

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
                        onChange={(e, { value }) => setCurrency(value)}
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
                                    onClick={ () => handleStoredCardSelection( card.payment_handle_token ) }>
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
