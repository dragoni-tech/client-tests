import React, { useState, useEffect } from 'react';
import { Header } from 'semantic-ui-react';

import { useSearchParams } from 'react-router-dom';


/**
 * Page redirected to when a deposit action is completed.
 *
 * @param {*} props
 * @returns
 */

const CompleteDeposit = (props) => {

    // The transaction id parsed from the parameters,
    const [ transaction_id, setTransactionId ] = useState('');
    const [ deposit_details, setDepositDetails ] = useState('');

    // Parse search parameters,
    const [ searchParams ] = useSearchParams();

    // Decode parameters on the URL and set state,
    useEffect(() => {
        const tid = searchParams.get('transaction_id');
        setTransactionId(tid);
    }, [ searchParams ]);

    useEffect(() => {

        async function handleCompletePayCharge(context) {

            const data = await context.completePayCharge(transaction_id);

            console.log("Transaction updated...");
            console.log("Transaction id: ", transaction_id);
            console.log("data = ", data);

            setDepositDetails(JSON.stringify(data, null, 2));

        }

        if (transaction_id !== '') {
            const context = props.ecl_context;
            handleCompletePayCharge(context);
        }

    }, [ props.ecl_context, transaction_id ]);

    let action_description;

    if (deposit_details !== '') {
        const ddetails_ob = JSON.parse(deposit_details);

        const action = ddetails_ob.step_details.action;
        if (action === 'declined') {
            action_description = 'Card - DECLINED';
        }
        else if (action === 'approved') {
            action_description = 'Card - Payment Approved';
        }
        else {
            action_description = 'Unknown action: ' + action;
        }

    }
    else {
        action_description = '';
    }

    // Rendered components,
    return (
        <div>
            <Header as="h2">
                Deposit Results
            </Header>
            <pre>
                Transaction ID: { transaction_id }
            </pre>
            <Header as="h3">
                { action_description }
            </Header>
            <pre>
                { deposit_details }
            </pre>
            <p><a href="/">Click here to return to client sandbox</a></p>
        </div>
    );

};

export default CompleteDeposit;
