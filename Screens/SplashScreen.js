import React from 'react';
import { StyleSheet, View, Image, ProgressBarAndroid, AsyncStorage } from 'react-native';
import { Text  } from 'react-native-elements';
import { NavigationActions, StackActions  } from 'react-navigation';

import Connection from '../Connection';

export default class SplashScreen extends React.PureComponent
{

    //Navigation Header
    static navigationOptions = ({ navigation }) => 
    {
        return {
            headerMode: 'none'
        }
    }
    constructor(props) 
    {
        Obj = new Connection();

        super(props);
        this.state={
           activate: false,
           DomainName: Obj.getDomainName(), 
        }
    }

    componentDidMount()
    {
        var that = this;
        setTimeout(function()
        {
            that.showLoading();
        },500);

        setTimeout(function()
        {
            that.login();
        },1000)
    }

    showLoading = () =>  
    {
        this.setState({activate: true});
        
    }

    login = async () => {
        
        try
        {
            const value = await AsyncStorage.getItem('EmployeeID');
            if (value != null) 
            {
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
            else
            {
                this.props
                .navigation
                .dispatch(StackActions.reset({
                    index: 0,
                    actions: [
                    NavigationActions.navigate({
                        routeName: 'LoginPage',
                    }),
                    ],
                    }))
            }
        }catch(error)
        {

        }
    }

    
    render(){
        
        return(
            <View style = { styles.RootView }>
                <Image source={{uri: this.state.DomainName+'/Content/images/login_img@3x.png'}} style={styles.logoView} />
                <Text h4 h4Style={styles.headerView}>CR8 Leave</Text>
                <Text style={styles.headerView}>Powered by CR8 Consultancy</Text>

                {this.state.activate && <ShowLoading/>}       
            
            </View>
            
        );
    }
}

export class ShowLoading extends React.Component
{
    render()
    {
        return(
            <View style = {{flexDirection:'column', marginTop:40}}> 
                <Text style={styles.loginTextView}>Logging in...</Text>
                <ProgressBarAndroid  color="#4E5077" styleAttr='Normal'/>
            </View>
        );
    }
}


const styles = StyleSheet.create({

    RootView:
    {
        backgroundColor: '#fff', 
        justifyContent: 'center',
        flex: 1,
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    logoView:
    {
        width: 200, 
        height: 100, 
        alignSelf:'center'
    },
    headerView:
    {
        color:'#4E5077', 
        alignSelf:'center',
        marginTop:10,
        textAlignVertical: 'bottom',
    },
    loginTextView:
    {
        color:'#4E5077', 
        alignSelf:'center',
        textAlignVertical: 'bottom',
        marginBottom: 20
    },
  });