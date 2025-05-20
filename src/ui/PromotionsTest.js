import React, { useEffect, useState } from 'react';
import { Button, Header, Input, Segment } from 'semantic-ui-react';


const PromotionsTest = (props) => {

    const [ is_processing, setIsProcessing ] = useState(true);

    const [ codes_details, setCodesDetails ] = useState();

    const [ code_value, setCodeValue ] = useState("");


    useEffect(() => {

        async function fetchAllCodes(context) {

            const data = await context.fetchAllCodes();
            console.log("data = ", data);

            setCodesDetails(JSON.stringify(data, null, 2));
            setIsProcessing(false);

            const claimed_data = await context.fetchAllClaimedCodes();
            console.log("claimed_data = ", claimed_data);

            const code_stats_data = await context.fetchCodeStats();
            console.log("code_stats_data = ", code_stats_data);


        }

        const context = props.ecl_context;
        fetchAllCodes(context);

    }, [ props.ecl_context ]);


    async function handleClaimCodeButton() {

        console.log("Attempt to claim code: ", code_value);

        const context = props.ecl_context;
        const response = await context.claimCode("referrals", code_value);

        console.log(response);

    }



    return (
        <div>
            <pre>
                { codes_details }
            </pre>


            <Segment basic>
                <Input
                    label="Code"
                    name="code"
                    value={ code_value }
                    onChange={(e, { value }) => setCodeValue(value) }
                />
            </Segment>
            <Button disabled = { is_processing }
                onClick={ handleClaimCodeButton } >Claim Code</Button>
        </div>
    );

};

export default PromotionsTest;

