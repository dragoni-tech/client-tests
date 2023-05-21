import React, { useState } from 'react';
import { Header, Icon, Button, Form, Input, Select, Accordion } from 'semantic-ui-react';

function custDetails(props, idv) {
    if (props.customer_details !== undefined) {
        const v = props.customer_details[idv];
        if (v !== undefined && v !== null) {
            return v;
        }
    }
    return '';
}

const DepositForm = (props) => {

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

    const [currency, setCurrency] = useState('EFM');
    const [amount, setAmount] = useState('');
    const [payment_method, setPaymentMethod] = useState('VISA');
    const [pan, setPan] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [holder_name, setHolderName] = useState('');

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


    const handleSubmit = () => {
        props.onDepositAction({

            billing_firstname, billing_lastname,
            billing_address1, billing_address2, billing_address3,
            billing_city, billing_county, billing_postcode,

            currency, amount, payment_method, pan, expiry, cvv, holder_name

        });
    };

    const handleBillingToggle = () => {
        setBillingOpen(!billing_open);
    };

    const disabled = props.disabled;

    return (
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
            <Form.Field width={4}
                disabled={disabled}
                control={Select}
                label="Payment Method"
                options={paymentOptions}
                placeholder="Payment Method"
                value={payment_method}
                onChange={(e, { value }) => setPaymentMethod(value)}
            />
            <Form.Field
                disabled={disabled}
                control={Input}
                label="Card Number"
                placeholder="Card Number"
                value={pan}
                onChange={(e) => setPan(e.target.value)}
            />
            <Form.Group widths="equal">
                <Form.Field
                    disabled={disabled}
                    control={Input}
                    label="Expiry Date"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                />
                <Form.Field
                    disabled={disabled}
                    control={Input}
                    label="CVV"
                    placeholder="CVV"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                />
            </Form.Group>
            <Form.Field
                disabled={disabled}
                control={Input}
                label="Name as appears on card"
                placeholder="Card holders name"
                value={holder_name}
                onChange={(e) => setHolderName(e.target.value)}
            />
            <Button type="submit" disabled={disabled} >Start Deposit</Button>
        </Form>
    );
};

export default DepositForm;
