import React, { useState } from 'react';
import { Grid, Header, Message, Button, Form, Segment } from 'semantic-ui-react';

const Login = (props) => {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'username') {
            setUsername(value);
        }
        else if (name === 'password') {
            setPassword(value);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        props.onLoginAction(username, password);
    };

    const { disabled, error_msg } = props;
    const login_error_msg = error_msg;

    return (
        <Grid textAlign="left" style={{ height: '100vh' }} verticalAlign="top">
          <Grid.Column style={{ maxWidth: 450 }}>
            <Header as="h2" textAlign="center">
              Log-in to your account
            </Header>
            <Message error hidden={login_error_msg === ''}
                     header="Authentication error"
                     content={login_error_msg}
            />
            <Form size="large" onSubmit={handleSubmit}>
              <Segment stacked>
                <Form.Input
                  fluid
                  disabled={disabled}
                  icon="user"
                  iconPosition="left"
                  placeholder="Username"
                  name="username"
                  value={username}
                  onChange={handleInputChange}
                />
                <Form.Input
                  fluid
                  disabled={disabled}
                  icon="lock"
                  iconPosition="left"
                  placeholder="Password"
                  type="password"
                  name="password"
                  value={password}
                  onChange={handleInputChange}
                />
                <Button
                    fluid color="green" disabled={disabled}
                    size="large" type="submit">
                  Login
                </Button>
              </Segment>
            </Form>
          </Grid.Column>
        </Grid>
      );
};

export default Login;
