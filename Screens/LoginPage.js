import React, {Component} from 'react';
import {StyleSheet, View, KeyboardAvoidingView ,Image, TextInput,Platform, Animated, AsyncStorage } from 'react-native';
import {Button, Text  } from 'react-native-elements';
import { NavigationActions, StackActions  } from 'react-navigation';
import Modal from 'react-native-modal';

import Connection from '../Connection';

class ImageLoader extends React.PureComponent
{
    state=
    {
        opacity: new Animated.Value(0),
    }
    animationMove = () =>
    {
        Animated.timing(
            this.state.opacity,{
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();
    }
   

    render()
    {
        return(
            <Animated.Image onLoad={this.animationMove} 
                {...this.props}
                style={[
                   {
                        opacity: this.state.opacity,
                        transform: [
                            {
                                scale: this.state.opacity.interpolate({
                                    inputRange:[0,1],
                                    outputRange:[0.85, 1],
                                })
                            }
                        ]
                   },
                   this.props.style,
                ]}/>
        )
    }
}


export default class LoginPage extends Component
{
    static navigationOptions = ({ navigation }) => 
    {
        return {
            header: null,
            headerLeft: null
        }
    }

    constructor(props) 
    {
        Obj = new Connection();

        super(props);
        this.state={
            Email: '',
            Password: '',
            isLoading: false,
            loginFailedPrompt:false,
            DomainName: Obj.getDomainName(), 
            DomainNameID: Obj.getDomainNameID(), 
        }

        this.initialState = this.state;
    }

    login = async () =>
    {
        this.setState({isLoading: true});
        return fetch(this.state.DomainName+'/api/Leave/MobileLogin?Email='+this.state.Email+'&Password='+this.state.Password, {
            method: 'POST',
            headers: 
            {
                'Accept': 'application/json',
              'Content-Type': 'application/json',
            }}) .then((response) => 
                {
                    return response.json();
                }).then((responseData) => 
                {
                    this.setState({isLoading: false});
                    return responseData;
                })
                .then(data => 
                {
                    if(data.EmployeeID === 0 && data.DomainName === null)
                    {
                        this.setState({loginFailedPrompt: true})
                    }
                    else
                    {
                        AsyncStorage.setItem('EmployeeID',JSON.stringify(data.EmployeeID));
                        AsyncStorage.setItem('DomainName',JSON.stringify(data.DomainName));
                        AsyncStorage.setItem('Email',JSON.stringify(data.Email));
                        
                        this.props
                        .navigation
                        .dispatch(StackActions.reset({
                            index: 0,
                            actions: [
                            NavigationActions.navigate({
                                routeName: 'TabWithHeader'
                            }),
                            ],
                            }))

                    }
                })
                .catch((error) => 
                {
                    console.error(error);
                });

    }

    render()
    {
        return(
            <View style={styles.RootView}>
                 <KeyboardAvoidingView  behavior='position' enabled keyboardVerticalOffset={Platform.select({ios:0,android:64})}>
                    <View style={{margin:10}}>
                        <ImageLoader source={{uri: 'http://leave.brandnergy.com/Content/images/login_img@3x.png' }} style={styles.imageLogoView} />
                        <Text h4 h4Style={styles.H4View}>Login</Text>
                        <TextInput placeholder="Email" style={styles.TextInput} keyboardType={'email-address'} onChangeText={(text) => this.setState({Email:text})}/>
                        <TextInput placeholder="Password" style={styles.TextInput} secureTextEntry={true} onChangeText={(text) => this.setState({Password:text})}/>
                    </View>
                    <View>
                        <Button title="LOGIN" type="solid" loading={this.state.isLoading} containerStyle={styles.loginButton} buttonStyle={{backgroundColor:'#4E5077'}} titleStyle={{color:'#fff'}} onPress={() => this.login()}/>
                    </View>
                    <View style={styles.forgotBtnView}> 
                        <Button title="Forgot Password?" type="clear" titleStyle={{color:'#4E5077', fontSize:15}} /> 
                    </View>
                </KeyboardAvoidingView>

                <Modal coverScreen={true} backdropColor={'black'} animationIn={'slideInUp'} isVisible={this.state.loginFailedPrompt}>
                    <View style={styles.ModalRootView}>    
                        <Text h4 h4Style={styles.SuccessTextView}>Oops...</Text>
                        <Text style={[styles.SuccessTextView]}>Email and Password entered is incorrect</Text>
                        <View style={styles.ButtonView}>
                            <Button containerStyle={{alignSelf:'stretch'}} titleStyle={{alignSelf:'center'}} type='clear' title={"OK"} onPress={() => this.setState(this.initialState)}/>
                        </View>
                    </View>
                </Modal>
            </View>
        )
    }
}


const styles = StyleSheet.create({

    RootView:
    {
        backgroundColor: '#fff', 
        justifyContent:'center',
        flex: 1,
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    imageLogoView:
    {
        width: 200, 
        height: 100, 
        alignSelf:'center'
    },
    H4View:
    {
        color:'#4E5077', 
        alignSelf:'center',
        margin:10
    },
    loginButton:
    {
        marginTop:5,
        marginEnd:60,
        marginStart:60,
        marginBottom: 20
        
    },
    forgotBtnView:
    {
        flexDirection: 'row',
        justifyContent:'center'
    },
    TextInput:
    {
        color:'#4E5077',
        marginTop: 10,
        marginRight: 30,
        marginLeft: 30,
        marginBottom: 10,
        padding: 8,
        borderWidth: 1,
        borderColor:'#4E5077',
        borderRadius: 5
        
    },
    ModalRootView:
    {
        width: '100%', 
        backgroundColor:'#fff', 
        alignSelf:'center',
        justifyContent:'center',
        paddingTop:10, 
        borderRadius:5, 
     },
     SuccessImageView:
     {
        width:100, 
        height:100, 
        alignSelf:'center'
     },
     SuccessTextView:
     {
        alignSelf:'center',
        margin:10
     },
     timeDropdownView:
     {
        width:'90%',
        borderRadius: 3, 
        borderWidth: 1, 
        borderColor: '#7B827A',
        marginLeft:20, 
        marginTop:15, 
        marginBottom:15
     },
    ButtonView:
    {
      flexDirection:'row',
      justifyContent:'space-around'
    },
});