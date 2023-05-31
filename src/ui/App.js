
import './App.css';

import React, { useState } from 'react';

import { Routes, Route } from 'react-router-dom';

import Main from './Main';
import CompleteDeposit from './CompleteDeposit';
import CompleteDepositJS from './CompleteDepositJS';




const App = (props) => {

    const MainRoute = () => {
        const context = props.ecl_context;
        return (
            <Main
                ecl_context={ context }
                logged_in_state={ context.getLoggedInState() }
            />
        );
    };

    const CompleteDepositRoute = () => {
        const context = props.ecl_context;
        return (
            <CompleteDeposit
                ecl_context={ context }
            />
        );
    };

    const CompleteDepositJSRoute = () => {
        const context = props.ecl_context;
        return (
            <CompleteDepositJS />
        );
    };


    return (
        <div className="App">
            <Routes>
                <Route path="/">
                    <Route index element={ MainRoute() } />
                    <Route path="complete" element={ CompleteDepositRoute() } />
                    <Route path="completeJS" element={ CompleteDepositJSRoute() } />
                </Route>
            </Routes>
        </div>
    );

};

export default App;
