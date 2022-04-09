import React,{PureComponent} from 'react';
import {StyleSheet,ScrollView,RefreshControl, View, Image, AsyncStorage, Dimensions, Platform  } from 'react-native';
import { TouchableHighlight } from 'react-native-gesture-handler';
import { Avatar, Text, Divider,Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/SimpleLineIcons'
import { NavigationActions, StackActions } from 'react-navigation';
import {FloatingAction} from 'react-native-floating-action';
import Modal from 'react-native-modal';

import Connection from '../Connection';

var screenWidth = Math.round(Dimensions.get('window').width);
var screenHeight = Math.round(Dimensions.get('window').height);

export default class HomePage extends PureComponent
{ 

  constructor(props) 
  {
      super(props);
      Obj = new Connection();

      this.state = {
        data: '',
        fabHeightControl:200,
        FABVisible:screenHeight <= 700 ? false : true,
        DomainName: Obj.getDomainName(), 
        DomainNameID: Obj.getDomainNameID(), 
        pressLeaveStatus: false,
        pressCalendarView: false,
        refreshing:false,
        showLogoutPrompt:false,
        isLoading:false,
        annualLeaveBalance:'',
        listTodayLeave: [],
        listTimeOff:[],
        listOutOfOffice:[],
        carryFwrdBalance:'',
        compassionateBalance:'',
        maternityBalance:'',
        replacementBalance:'',
        sickBalance:'',
      }; 

      this.initialState = this.state;

  }

  
  componentDidMount() 
  {
    this.getEmployeeDetail();
  }

  getScrollPosition = (e) =>
  {
    var windowHeight = Dimensions.get('window').height,
          height = e.nativeEvent.contentSize.height,
          offset = e.nativeEvent.contentOffset.y;    
    if( windowHeight + offset >= (height - this.state.fabHeightControl))
    {
      this.setState({FABVisible: true})
      // console.log("End Scroll")
    }
    else if(windowHeight - offset <= (height + this.state.fabHeightControl))
    {
      this.setState({FABVisible: false})
      // console.log("Top Scroll")
    } 
  }
  

  getEmployeeDetail = async () =>
  {
    try
    {
      const employeeIDValue = await AsyncStorage.getItem('EmployeeID');
    
      if(employeeIDValue !== null)
      {
        return fetch(this.state.DomainName+'/api/leave/HomePageDetails?DomainName='+this.state.DomainNameID+'&EmployeeID='+ employeeIDValue)
        .then((response) => response.json())
        .then((responseJson) => {return responseJson;})
        .then(data =>
        {
          AsyncStorage.setItem('UserName',JSON.stringify(data.UserName));
          let tempListToday = [...this.state.listTodayLeave];
          let tempListTimeOff = [...this.state.listTimeOff];
          let tempListOOO = [...this.state.listOutOfOffice];
          let tempFabHeight = this.state.fabHeightControl;
          if( data.ListTodayLeave.length > 0 )
          {  
            for(let i = 0; i < data.ListTodayLeave.length; i++)
            {
              tempListToday.push(data.ListTodayLeave[i]);
              tempFabHeight += 100;
            }
          }
          
          if( data.ListTodayTimeOff.length > 0 )
          { 
            for(let i = 0; i < data.ListTodayTimeOff.length; i++)
            {
              tempListTimeOff.push(data.ListTodayTimeOff[i]);
              tempFabHeight += 100;
            }
          }

          if( data.ListTodayOutOfOffice.length > 0 )
          {
            for(let i = 0; i < data.ListTodayOutOfOffice.length; i++)
            {
              tempListOOO.push(data.ListTodayOutOfOffice[i]);
              tempFabHeight += 100;
            }
          }

            this.setState({
              data: data,
              annualLeaveBalance: JSON.stringify(data.ListAnnualLeave[0].LeaveBalance),
              carryFwrdBalance: JSON.stringify(data.ListAnnualLeave[1].LeaveBalance),
              compassionateBalance:JSON.stringify(data.ListAnnualLeave[2].LeaveBalance),
              maternityBalance:JSON.stringify(data.ListAnnualLeave[3].LeaveBalance),
              replacementBalance:JSON.stringify(data.ListAnnualLeave[4].LeaveBalance),
              sickBalance:JSON.stringify(data.ListAnnualLeave[5].LeaveBalance),
              listTodayLeave: tempListToday,
              listTimeOff: tempListTimeOff,
              listOutOfOffice: tempListOOO,
              fabHeightControl: tempFabHeight,
              isLoading:true,
          })
        })
        .catch((error) => {
          console.error(error);
        });
      }
    }catch(error){} 
  }

  leaveStatus = () =>
  {
    const navigationAction = NavigationActions.navigate({
      routeName: "LeaveStatus"
    })
    this.props.navigation.dispatch(navigationAction)
  }

  calendarView = () =>
  {
    const navigationAction = NavigationActions.navigate({
      routeName: "CalendarView"
    })
    this.props.navigation.dispatch(navigationAction)
  }

  refreshPage = () =>
  {
    this.setState(this.initialState);
    this.getEmployeeDetail();
  }

  logout= () =>
  {
    AsyncStorage.setItem('EmployeeID',"");
    AsyncStorage.setItem('DomainName',"");
    AsyncStorage.setItem('Email',"");

    this.props
    .navigation
    .dispatch(StackActions.reset({
        index: 0,
        actions: [
        NavigationActions.navigate({
            routeName: 'SplashScreen'
        }),
        ],
        }))

  }

  render()
  {
    return(
      this.state.isLoading && <View style={styles.RootView}>
        <ScrollView onScroll={screenHeight <= 700 ? this.getScrollPosition : null} refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={() => this.refreshPage()}/>}> 
        <View style={{flexDirection:'row', justifyContent:'space-between'}}>
            <View style={{flexDirection:'row'}}>
            <Avatar
                size="large"
                rounded
                source={require('../assets/tempProfile.png')}
                containerStyle={styles.AvatarView}
            />
            <View style={{flexDirection:'column'}}>
              <Text h4 h4Style={{fontSize:20, marginTop:45, color:'#868686'}}>{this.state.data.Name}</Text>
              <Text style={{fontSize:15, marginTop:10, color:'#868686'}}>{this.state.data.RefPositionValue}</Text>
            </View>
            </View>

            <View style={{marginTop:40,  alignContent:'flex-end'}}>
              <Avatar
                  size='small'
                  rounded
                  activeOpacity={0.7}
                  source={{uri: this.state.DomainName+'/Content/images/logout.png'}}
                  avatarStyle={[{backgroundColor:'#fff'}]}
                  containerStyle={[{ marginRight:10, width:25,height:25}]}
                  onPress={() => {this.setState({showLogoutPrompt:true})}}
              />
              {/* <Image source={{}} style={{}} /> */}
            </View>
        </View>


          <TouchableHighlight 
            activeOpacity={1}
            title="Leave Status"
            style={[this.state.pressLeaveStatus ? styles.leaveStatus_Btn_Press_View: styles.leaveStatus_Btn_Normal_View, styles.elevationShadow5,]}
            underlayColor={'#2C3361'}
            onPress={this.leaveStatus.bind(this)}
            onShowUnderlay={() => this.setState({pressLeaveStatus: true})}
            onHideUnderlay={() => this.setState({pressLeaveStatus: false})}>
              <View style={{flexDirection:'row', justifyContent:'center'}}>
                <Image source={this.state.pressLeaveStatus? require('../assets/buttonHover.png'): require('../assets/buttonNormal.png')} style={styles.leaveStatus_Btn_Image_View}/>
                <Text style={this.state.pressLeaveStatus ? styles.leaveStatus_Btn_Press_Text_View : styles.leaveStatus_Btn_Normal_Text_View}>Leave Status</Text>
              </View>
          </TouchableHighlight>

          <Text style={[styles.TextView, {margin:18, alignSelf:'center'}]}>Leave Availability</Text>
          
        <View style={styles.leaveTileWrapView}>
            <View style={[styles.leaveTileView, styles.elevationShadow10, {backgroundColor:'#91C8E6', borderColor:'#91C8E6'}]}>
              <Text style={[styles.leaveAvailability_Text_View,{fontSize:15}]}>Annual</Text>
              <Text style={[styles.leaveAvailability_Text_View,{fontSize:25}]}>{this.state.annualLeaveBalance}.0</Text>
              <Text style={[styles.leaveAvailability_Text_View,{fontSize:15}]}>days available</Text>
            </View>
            <View style={[styles.leaveTileView, styles.elevationShadow10, {backgroundColor:'#FFA500', borderColor:'#FFA500'}]}>
              <Text style={[styles.leaveAvailability_Text_View,{fontSize:15}]}>Carry Forward</Text>
              <Text style={[styles.leaveAvailability_Text_View,{fontSize:25}]}>{this.state.carryFwrdBalance}.0</Text>
              <Text style={[styles.leaveAvailability_Text_View,{fontSize:15}]}>days available</Text>
            </View>
        </View>
          <View style={styles.leaveTileWrapView}>
            <View style={[styles.leaveTileView, styles.elevationShadow10, {backgroundColor:'#DDA0DD', borderColor:'#DDA0DD'}]}>
              <Text style={[styles.leaveAvailability_Text_View,{fontSize:15}]}>Compassionate</Text>
              <Text style={[styles.leaveAvailability_Text_View,{fontSize:25}]}>{this.state.compassionateBalance}</Text>
              <Text style={[styles.leaveAvailability_Text_View,{fontSize:15}]}>days available</Text>
            </View>
            <View style={[styles.leaveTileView, styles.elevationShadow10, {backgroundColor:'#FFA07A', borderColor:'#FFA07A'}]}>
              <Text style={[styles.leaveAvailability_Text_View,{fontSize:15}]}>Maternity</Text>
              <Text style={[styles.leaveAvailability_Text_View,{fontSize:25}]}>{this.state.maternityBalance}</Text>
              <Text style={[styles.leaveAvailability_Text_View,{fontSize:15}]}>days available</Text>
            </View>
          </View>
          <View style={[styles.leaveTileWrapView,{paddingBottom:20}]}>
            <View style={[styles.leaveTileView, styles.elevationShadow10, {backgroundColor:'#FF5E5E', borderColor:'#FF5E5E'}]}>
              <Text style={[styles.leaveAvailability_Text_View,{fontSize:15}]}>Replacement</Text>
              <Text style={[styles.leaveAvailability_Text_View,{fontSize:25}]}>{this.state.replacementBalance}.0</Text>
              <Text style={[styles.leaveAvailability_Text_View,{fontSize:15}]}>days available</Text>
            </View>
            <View style={[styles.leaveTileView, styles.elevationShadow10, {backgroundColor:'#65C750', borderColor:'#65C750'}]}>
              <Text style={[styles.leaveAvailability_Text_View,{fontSize:15}]}>Sick</Text>
              <Text style={[styles.leaveAvailability_Text_View,{fontSize:25}]}>{this.state.sickBalance}.0</Text>
              <Text style={[styles.leaveAvailability_Text_View,{fontSize:15}]}>days available</Text>
            </View>
          </View>

          <Divider style={{backgroundColor:'#DFDFDF', margin:15, height:1}}/>

          <Text style={[styles.TextView,{marginVertical:5,alignSelf:'center'}]}>Today's Status</Text>

          <View style={{flexDirection:'row',marginHorizontal:10, marginBottom:10}}>
            <View style={{flexDirection:'column',marginTop:5, paddingLeft:20}}>
              <Text style={[{marginVertical:5, color:'#868686', fontSize:18}]}>Leave</Text>
              {this.todayLeave()}
            </View>
          </View>

          <Divider style={{backgroundColor:'#DFDFDF', margin:20, height:1}}/>

          <View style={{flexDirection:'row', justifyContent:'space-between',marginHorizontal:10,marginBottom:10}}>
            <View style={{flexDirection:'column', paddingLeft:20}}>
              <Text style={[{marginVertical:5, color:'#868686', fontSize:18}]}>Time off</Text>
              {this.todayTimeOff()}
             </View>
          </View>

          <Divider style={{backgroundColor:'#DFDFDF', margin:20, height:1}}/>

          <View style={{flexDirection:'row', justifyContent:'space-between',marginHorizontal:10,marginBottom:10}}>
          <View style={{flexDirection:'column', paddingLeft:20}}>
              <Text style={[{marginVertical:5, color:'#868686', fontSize:18 }]}>Out of Office</Text>
              {this.todayOutOfOffice()}
            </View>
          </View>

          <Divider style={{backgroundColor:'#DFDFDF', marginHorizontal:20,marginVertical:10, height:1}}/>
          <Divider style={{backgroundColor:'#DFDFDF', marginHorizontal:20,marginBottom:100, height:1}}/>
  
      </ScrollView>
          <FloatingAction
            showBackground={false}
            visible={this.state.FABVisible}
            color={'#4E5078'}
            floatingIcon={<Icon name="calendar" size={20} color={'#fff'}/>}
            //The vertical is depending on the phone's height! 
            distanceToEdge={{vertical:((screenHeight/4) - 150), horizontal:20}}
            onPressMain={() => this.calendarView()}
          />
            <Modal coverScreen={true} backdropColor={'black'} animationIn={'slideInUp'} isVisible={this.state.showLogoutPrompt}>
              <View style={styles.ModalRootView}>    
                    <Avatar
                      size='medium'
                      rounded
                      source={require('../assets/tempProfile.png')}
                      containerStyle={{alignSelf:'center'}}
                  />
                  <Text h4 h4Style={styles.SuccessTextView}>Leave soon?</Text>
                  <Text style={[styles.SuccessTextView]}>Do you wish to logout?</Text>
                  <View style={styles.ButtonView}>
                      <Button containerStyle={{alignSelf:'stretch'}} titleStyle={{alignSelf:'center'}} type='clear' title={"Confirm"} onPress={() =>this.logout()}/>
                      <Button containerStyle={{alignSelf:'stretch'}} titleStyle={{alignSelf:'center'}} type='clear' title={"Cancel"} onPress={() =>{this.setState({showLogoutPrompt:false})}}/>
                  </View>
              </View>
            </Modal>
    </View>
    )
  }

  todayLeave = () =>
  {
    if(this.state.listTodayLeave.length > 0)
    {
      return this.state.listTodayLeave.map((data,index) =>
      {
        return(
          <Text key={index} style={{fontStyle:'italic', paddingLeft:10, color:'#868686',paddingBottom:10}}>{data.DisplayName} - {data.RefLeavePeriodValue}
          {"\n"}{data.Reason}
          </Text>
          )  
      })
    }
    else
    {
      return(<View style={{fontStyle:'italic', paddingLeft:10, color:'#868686',paddingBottom:30}}/>)
    }
  }

  todayTimeOff = () =>
  {
    if(this.state.listTimeOff.length > 0)
    {
      return this.state.listTimeOff.map((data,index) =>
      {
        return(
          <Text key={index} style={{fontStyle:'italic', paddingLeft:10, color:'#868686',paddingBottom:10}}>{data.DisplayName}  {data.TimeFrom} - {data.TimeTo} 
          {"\n"}{data.Reason}
          </Text>
        )
      })
    }
    else
    {
      return(<View style={{fontStyle:'italic', paddingLeft:10, color:'#868686',paddingBottom:30}}/>)
    }
  }

  todayOutOfOffice = () =>
  {
    if(this.state.listOutOfOffice.length > 0)
    {
      return this.state.listOutOfOffice.map((data,index) => 
      {
        return(
        <Text key={index} style={{fontStyle:'italic', paddingLeft:10, color:'#868686',paddingBottom:10}}>{data.DisplayName}  {data.TimeFrom} - {data.TimeTo}
            {"\n"}{data.Venue}
        </Text>
        )
      })        
    }
    else
    {
      return(<View style={{fontStyle:'italic', paddingLeft:10, color:'#868686',paddingBottom:30}}/>)
    }
  }
}


function elevationShadowStyle(elevation) {
  return {
    elevation,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 0.5 * elevation },
    shadowOpacity: 0.3,
    shadowRadius: 0.8 * elevation
  };
}

const styles = StyleSheet.create({

  RootView:
  {
      backgroundColor: '#fff', 
      width: '100%',
      height: '100%',
      ...Platform.select({
        ios:{
            marginTop:50
        }
    })
  },
  AvatarView:
  {
    marginTop: 35,
    marginLeft: 20,
    marginRight: 20,
  },
  leaveStatus_Btn_Normal_View:
  {
    backgroundColor:'#fff',
    marginTop:30,
    marginBottom:5,
    marginLeft:15,
    marginRight:15,
    borderWidth:0,
    borderRadius:5,
    height:40,
  },
  leaveStatus_Btn_Press_View:
  {
    backgroundColor:'#2C3361',
    marginTop:30,
    marginBottom:5,
    marginLeft:15,
    marginRight:15,
    borderWidth:0,
    borderRadius:5,
    height:40,
  },
  leaveStatus_Btn_Normal_Text_View:
  { 
    color:'#868686',
    alignSelf:'center', 
    marginTop:5,
    marginBottom:5
  },
  leaveStatus_Btn_Press_Text_View:
  { 
    color:'#fff',
    alignSelf:'center',
    marginTop:5,
    marginBottom:5
  },
  leaveStatus_Btn_Image_View:
  {
    height:30,
    width:30,
    marginTop:5,
    marginBottom:5
  },
  calendarView_Btn_Image_View:
  {
    height:30,
    width:30,
    marginTop:15,
  },
  calendarView_Btn_Normal_View:
  {
    backgroundColor:'#fff',
    marginTop:30,
    alignSelf:'stretch',
    borderWidth:0,
    borderRadius:5,
    width:screenWidth/2,
    height:60,
  },
  calendarView_Btn_Press_View:
  {
    backgroundColor:'#2C3361',
    marginTop:30,
    alignSelf:'stretch',
    borderWidth:0,
    borderRadius:5,
    width:screenWidth/2,
    height:60,
  },
  calendarView_Btn_Normal_Text_View:
  { 
    color:'#868686',
    alignSelf:'center', 
    marginTop:15,
  },
  calendarView_Btn_Press_Text_View:
  { 
    color:'#fff',
    alignSelf:'center',
    marginTop:15,
  },
  TextView:
  { 
    color:'#868686',
    fontSize:20 
  },
  leaveAvailability_Text_View:
  { 
    color:'#fff',
    alignSelf:'center',
    margin:3, 
  },
  leaveTileView:
  {
    borderWidth:1, 
    borderRadius:3, 
    height:100,
    width:'48%',
    alignSelf:'stretch',
  },
  leaveTileWrapView:
  {
    flexDirection:'row',
     justifyContent:'space-around',
     width:screenWidth-7,
     margin:3
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
  elevationShadow10: elevationShadowStyle(10),
  elevationShadow5: elevationShadowStyle(5),


});