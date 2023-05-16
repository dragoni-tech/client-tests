import React, { useState } from 'react';
import { Button, Form, Input, Select } from 'semantic-ui-react';

const DepositForm = (props) => {

    const [currency, setCurrency] = useState('EFM');
    const [amount, setAmount] = useState('');
    const [payment_method, setPaymentMethod] = useState('VISA');
    const [pan, setPan] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');

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
            currency, amount, payment_method, pan, expiry, cvv
        });
    };

    const disabled = props.disabled;

    return (
        <Form onSubmit={handleSubmit}>
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
            <Button type="submit" disabled={disabled} >Start Deposit</Button>
        </Form>
    );
};

export default DepositForm;
