import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { GoogleSignin, GoogleSigninButton, statusCodes } from '@react-native-community/google-signin';
import { Actions } from 'react-native-router-flux'

class GoogleLogin extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            isSigninInProgress : false,
            userInfo : null,
            error : null
        }
    }

    componentDidMount() {
        GoogleSignin.getCurrentUser().then((res) => {
            if (res && res.user) {
                Actions.replace('home');
            } else {
                this.setState({
                    loading : false
                })
            }
        });

        GoogleSignin.configure({
            webClientId: "1850935566-jirac0dtcirteaa3cub4m6h06utbkrli.apps.googleusercontent.com",
            offlineAccess: true,
        });
    }

    _signIn = async () => {
        try {
            const a = await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            // this.setState({ userInfo, isSigninInProgress : true });
            if (userInfo) {
                Actions.replace('home');
            }
        } catch (error) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                // sign in was cancelled
                console.log('cancelled');
            } else if (error.code === statusCodes.IN_PROGRESS) {
                // operation in progress already
                console.log('in progress');
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                console.log('play services not available or outdated');
            } else {
                console.log('Something went wrong', error.toString());
                this.setState({
                    error,
                });
            }
        }
    }

    render() {
        const {loading} = this.state;
        return (
            <View style={styles.center}>
                {(loading) ? (
                    null
                ) : (
                    <GoogleSigninButton
                        style={{ width: 192, height: 48 }}
                        size={GoogleSigninButton.Size.Wide}
                        color={GoogleSigninButton.Color.Dark}
                        onPress={this._signIn}
                        disabled={this.state.isSigninInProgress} 
                    />
                )}
                 
            </View>
        )
    }
}

export default GoogleLogin;


const styles = StyleSheet.create({
    center : {
        flex : 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff'
    }
})