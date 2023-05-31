export function getApiKey() {
    return 'T1QtMTA3MDc5MDpCLXFhMi0wLTY0NWE3NzU1LTAtMzAyZDAyMTUwMDkxMDdjYWFjOTFlMjUxNmJlMWUyYWQ4OGQyY2FlZDU5MjUxMGYzYWIwMjE0MDQ2MzRmYjk3ZGFkZTIxMWJhOTUxYzVkNjBkOWM4YWU3NTJjNTQ3Yw==';
}

export function getOptions() {
    let options = {
        // You must provide currencyCode to the Paysafe JS SDK to enable the Payment API integration
        currencyCode: 'GBP',
        // select the Paysafe test / sandbox environment
        environment: 'TEST',
        // Provide a cards merchant toaccount if you have more than one configured for that same API key
        // accounts: {
        //   default: 1002667800,
        // },
        // set the CSS selectors to identify the payment field divs above
        // set the placeholder text to display in these fields
        fields: {
          cardNumber: {
            selector: '#cardNumber',
            placeholder: 'Card number',
            separator: ' ',
            optional: true,
          },
          expiryDate: {
            selector: '#expiryDate',
            placeholder: 'Expiry date',
            optional: true,
          },
          cvv: {
            selector: '#cvv',
            placeholder: 'CVV',
            optional: false,
          },
        },
        style: {
          input: {
              "font-family": "robotoregular,Helvetica,Arial,sans-serif",
              "font-weight": "normal",
              "font-size": "14px"
          },
          "#card-number.valid": {
              "color": "black"
          },
          ":focus": {
              "color": "black"
          }
        }
      };
    return options;
}


