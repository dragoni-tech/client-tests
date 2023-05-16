import React, { useState } from 'react';
import { Header, Tab } from 'semantic-ui-react';

import DepositTest from './DepositTest.js';
import WithdrawalTest from './WithdrawalTest.js';


const AuthTests = (props) => {

    const panes = [
        {
            menuItem: 'Card Deposit',
            render: () =>
                <Tab.Pane><DepositTest ecl_context={ props.ecl_context } /></Tab.Pane>

        },
        {
            menuItem: 'Card Withdrawal',
            render: () =>
                <Tab.Pane><WithdrawalTest ecl_context={ props.ecl_context } /></Tab.Pane>
        },
        // add more tabs as needed
    ];

    return (
        <div>
            <Header as="h3">
                Client Tests
            </Header>

            <Tab panes={panes} />
        </div>
    );

};

export default AuthTests;
