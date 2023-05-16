
// Context for managing application wide state via a remote server.

// A default session permission object. This is returned when a session is not
// currently authenticated.

function defaultSessionPermissions() {
    return {
        global_permissions: [],
        products_access: [],
        product_permissions: [],
    };
}

function successSessionPermissions() {
    return {
        global_permissions: [],
        products_access: [ 'system' ],
        product_permissions: [],
    };
}

// If browser supports session storage (most do),
const browser_session_storage_support = (window.sessionStorage !== undefined);

function EclContext() {

    let api_uri;
    let platform_subpath;

    let default_permissions_from_init = defaultSessionPermissions();

    let logged_in_state = 'unknown';

    let session_token;

    let platform_route_path;


    // Load the session object,
    async function loadSession(endpoint_uri, subpath) {

        api_uri = endpoint_uri;
        platform_subpath = subpath;
        platform_route_path = '/' + subpath;

        // Refresh session_token from the browser's session storage if session
        // storage API is available,
        if (browser_session_storage_support) {

            // Set session storage,
            window.sessionStorage.setItem('last_endpoint_uri', endpoint_uri);
            window.sessionStorage.setItem('last_subpath', subpath);

            session_token = window.sessionStorage.getItem('ecltoken');

        }
        if (session_token !== null && session_token !== undefined) {
            // Check current session user permissions,
            // This checks with the server to determine if the current session
            // is valid, and if it is returns any admin permissions associated
            // with the account.
            const data = await jsonPost('/v1/account/authcheck', {});
            // Use default session permissions unless we loaded something
            // from the server,
            if (data.status === 'OK') {
                let admin_permissions = data.session_permissions;
                if (admin_permissions === undefined) {
                    admin_permissions = successSessionPermissions();
                }
                default_permissions_from_init = admin_permissions;
                logged_in_state = 'auth';
            }
            else if (data.status === 'AUTH_FAILED') {
                logged_in_state = 'unauth';
            }
            return;
        }
        // Continue without session token. This will ultimately create
        // authenticate dialog,
        else {
            logged_in_state = 'unauth';
            return;
        }
    }

    function updateSessionToken(ecltoken) {
        session_token = ecltoken;
        // Store the session token in the local session storage so that it
        // survives page reloads,
        if (browser_session_storage_support) {
            if (ecltoken === undefined) {
                window.sessionStorage.removeItem('ecltoken');
            }
            else {
                window.sessionStorage.setItem('ecltoken', ecltoken);
            }
        }
    }

    async function jsonPost(api_call, params) {

        const out_headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };
        if (session_token !== undefined) {
            out_headers.ecltoken = session_token;
        }

        // Fetch the request uri,
        const request_uri = api_uri;

        const res = await fetch(request_uri + "/api" + api_call, {
            headers: out_headers,
//            credentials: 'include',
            method: "POST",
            body: JSON.stringify(params)
        });

        if (!res.ok) {

            console.error(res);
            throw Error('Error in response');

        }
        else if (res.status !== 200) {

            // Not a '200' status, therefore generate error,
            throw Error('Expecting 200 HTTP response status');

        }
        else {

            // If there's a token,
            const headers = res.headers;
            if (headers.has('ecltoken')) {
                updateSessionToken( headers.get('ecltoken') );
            }

            try {
                const data = await res.json();
                return data;
            }
            catch (err) {
                console.error(err);
                throw err;
            }

        }

    }

    // Returns the API URI, for example; 'https://demp.dragoneye.gg'
    function getAPIURI() {
        return api_uri;
    }

    // Returns the root path for the back office pages, for example; 'debo'
    function getPlatformSubpath() {
        return platform_subpath;
    }

    // Returns '/debo'
    function getRoutePath() {
        return platform_route_path;
    }


    async function authenticate(product, username, password, code2f) {
        const params = {
            product,
            username,
            password,
            code2f
        };
        const data = await jsonPost('/v1/account/login', params);
        if (data.status === 'OK') {
            // Intercept session permissions here,
            let admin_permissions = data.session_permissions;
            if (admin_permissions === undefined) {
                admin_permissions = successSessionPermissions();
            }
            logged_in_state = 'auth';
        }
        return data;
    }


    async function authenticateByEmail(product, email, password, code2f) {
        const params = {
            product,
            email,
            password,
            code2f
        };
        const data = await jsonPost('/v1/account/login', params);
        if (data.status === 'OK') {
            // Intercept session permissions here,
            let admin_permissions = data.session_permissions;
            if (admin_permissions === undefined) {
                admin_permissions = successSessionPermissions();
            }
            logged_in_state = 'auth';
        }
        return data;
    }



    async function initPayCharge(complete_url) {

        const params = {
            complete_url
        };
        const data = await jsonPost('/v1/payment/initpaycharge', params);
        return data;
        // return {
        //     status: 'OK',
        //     transaction_id: 'testrid_' + new Date().getTime(),
        //     payment_charge_details: {
        //         provider: 'Test',
        //         display: 'REGULAR_CC_FIELDS'
        //     }
        // };
    }


    async function makePayCharge() {

    }


    async function completePayCharge() {

    }



    async function logout() {
        const data = await jsonPost('/v1/account/logout', {});
        if (data.status === 'OK') {
            // Clear session token,
            updateSessionToken(undefined);
            // On successful logout then reset the session permissions,
            logged_in_state = 'unauth';
        }
        return data;
    }


    function getLoggedInState() {
        return logged_in_state;
    }





    async function init() {
        if (browser_session_storage_support) {
            const last_endpoint_uri = window.sessionStorage.getItem('last_endpoint_uri');
            const last_subpath = window.sessionStorage.getItem('last_subpath');

            console.log({
                last_endpoint_uri, last_subpath
            });

            if (last_endpoint_uri !== undefined && last_subpath !== undefined) {
                await loadSession(last_endpoint_uri, last_subpath);
            }
        }
    }

    return {

        init,

        getAPIURI,
        getPlatformSubpath,
        getRoutePath,

        getLoggedInState,

        loadSession,

        authenticate,
        authenticateByEmail,

        initPayCharge,
        makePayCharge,
        completePayCharge,

        logout

    };

}

export default EclContext;
