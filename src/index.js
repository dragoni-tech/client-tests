import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import 'semantic-ui-css/semantic.min.css';
import App from './ui/App';
import reportWebVitals from './reportWebVitals';

import EclContext from './api/EclContext';

async function start() {

    const context = EclContext();
    await context.init();

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(
      <React.StrictMode>
        <App
            ecl_context={ context }
            logged_in_state={ context.getLoggedInState() }
        />
      </React.StrictMode>
    );

}
start();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
