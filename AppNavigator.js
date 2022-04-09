import React from 'react';
import {Image} from 'react-native'
import {createAppContainer} from 'react-navigation';
import {createBottomTabNavigator} from 'react-navigation-tabs';
import {createStackNavigator} from 'react-navigation-stack';

import HomePage from './Screens/HomePage';
import LoginPage from './Screens/LoginPage';
import SplashScreen from './Screens/SplashScreen';
import TimeOff from './Screens/TimeOff';
import Leave from './Screens/Leave';
import OutOfOffice from './Screens/OutOfOffice';
import LeaveStatus from './Screens/LeaveStatus';
import CalendarView from './Screens/CalendarView';



const TabStack = createBottomTabNavigator({
    Home: HomePage,
    Leave: Leave,
    TimeOff: TimeOff,
    OutOfOffice: OutOfOffice
},
{
    defaultNavigationOptions: ({ navigation }) =>({
        tabBarIcon:({focused, horizontal, tintColor}) => {
            if(navigation.state.routeName === 'Home')
            {
                return(<Image source={require('./assets/homeHover.png')} style={{width:30,height:30}}/>);
            }
            else if(navigation.state.routeName === 'Leave')
            {
                return(<Image source={require('./assets/leave_normal.png')} style={{width:30,height:30}}/>);
            }
            else if(navigation.state.routeName === 'TimeOff')
            {
                return(<Image source={require('./assets/timeoff_normal.png')} style={{width:30,height:30}}/>);
            }
            else if(navigation.state.routeName === 'OutOfOffice')
            {
                return(<Image source={require('./assets/outofoffice_normal.png')} style={{width:30,height:30}}/>);
            }

            
        },
    }),
    tabBarOptions: {
        activeBackgroundColor:'#DDDDDD',
        inactiveBackgroundColor:'#F5F5F5',
        showLabel: false,
        showIcon:true,
    
    }
})


const HomeStack = createStackNavigator({
    SplashScreen:
    {
        screen: SplashScreen,
    },
    LoginPage:
    {
        screen: LoginPage,
    },
    TabWithHeader: TabStack,
    LeaveStatus:
    {
        screen: LeaveStatus,
    },
    CalendarView:
    {
        screen: CalendarView,
    },

},
{
    headerMode:'none'
})


export default createAppContainer(HomeStack);