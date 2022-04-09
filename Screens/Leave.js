import React from 'react';
import {StyleSheet,ScrollView, View ,Image,Alert ,RefreshControl, AsyncStorage, Dimensions, Platform, TextInput, KeyboardAvoidingView  } from 'react-native';
import {Picker} from 'native-base'
import DateTimePicker from "react-native-modal-datetime-picker";
import RadioForm from 'react-native-simple-radio-button';
import {Text, Button, CheckBox, Divider } from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome';
import Modal from 'react-native-modal'
import { NavigationActions } from 'react-navigation';

import Connection from '../Connection';

var selectedFromDate, selectedToDate, endDate, startDate;
var holidayDatesArray = new Array();
var availableApplyLeaveDp=[]; //To get the ApplyLeaveDropDown
var availableLeaveTypeID=[]; //To get the RefLeaveTypeIDBalance
var IOSDropDownIndexTracker = [];
var radio_props = [
    {label: 'Full   ' , value: 1 },
    {label: 'AM   ' , value: 2 },
    {label: 'PM   ' , value: 3 }
  ];

var screenWidth = Math.round(Dimensions.get('window').width);
var screenHeight = Math.round(Dimensions.get('window').height);

export default class Leave extends React.PureComponent
{

    constructor(props)  
    {
        super(props);
        var Obj = new Connection();
        // this.controller = require("abort-controller/polyfill");
        this._isMounted = false;
        this.scrollViewRef;
        

        this.state = {
            data:'',
            leaveTypes:0,
            RefLeaveTypeIDBalance:[],
            ApplyLeaveDropDown:[],
            radioValue:1,
            _selectedDropDown:'',
            _selectedRefLeaveTypeIDBalance:'',
            _selectedFromDateView:'Select Date',
            _selectedToDateView:'Select Date',
            monthView:'',
            daysTaken:'',
            leaveReasons:'',
            initialDate:new Date((new Date()).getFullYear(),0,1),
            radioFormVisible:true,
            refreshing: false,
            modalVisible:false,
            isLoading:false,
            submitBtnDisabled:true,
            isFromDateTimePickerVisible: false,
            isToDateTimePickerVisible: false,
            halfday1stView: false,
            halfday2ndView: false,
            DomainName: Obj.getDomainName(),
            DomainNameID: Obj.getDomainNameID(), 
        };

        this.initialState = this.state;
    }
   
    componentDidMount()
    {
        this.getEmployeeDetail();
        this.getHolidayDates();
    }

    showFromDateTimePicker = () => 
    {
        this.setState({ isFromDateTimePickerVisible: true });
    };
     
    hideFromDateTimePicker = () => 
    {
        this.setState({ isFromDateTimePickerVisible: false });
    };

    showToDateTimePicker = () => {
        this.setState({ isToDateTimePickerVisible: true });
    };

    hideToDateTimePicker = () => {
        this.setState({ isToDateTimePickerVisible: false });
    };

    
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
            this._isMounted && this.setState({
              data: data,
              leaveTypes: data.ListAnnualLeave.length, 
            })

            this.getLeaveBalance(data);
          })
          .catch((error) => {
            console.error(error);
          });
        }
      }
      catch(error){} 
    }

    getHolidayDates = async () =>
    {
        return fetch(this.state.DomainName+'/disabledate.json?v=1')
        .then((response) => response.json())
        .then((responseJson) => {return responseJson})
        .then(data =>
        {
            var listOfEvents = data['public-holiday'].events;
            for (var i in listOfEvents) {
                holidayDatesArray.push(listOfEvents[i].date);// push the date to our array for checking afterwards
            }

            this._isMounted && this.setState(this.state)
        })
        .catch((error) => {
            console.error(error);
        });
    }

    getLeaveBalance = (data) =>
    {

        for(var i = 0; i < data.ListAnnualLeave.length; i++)
        {
            if(data.ListAnnualLeave[i].LeaveBalance > 0)
            {
                availableApplyLeaveDp.push(data.ListAnnualLeave[i].ApplyLeaveDropDown);
                availableLeaveTypeID.push(data.ListAnnualLeave[i].RefLeaveTypeIDBalance);
            }
        }
        
        availableApplyLeaveDp.push(data.ListAnnualLeave[data.ListAnnualLeave.length - 1].ApplyLeaveDropDown);
        availableLeaveTypeID.push(data.ListAnnualLeave[data.ListAnnualLeave.length - 1].RefLeaveTypeIDBalance);

        this.setState({
            ApplyLeaveDropDown: availableApplyLeaveDp,
            RefLeaveTypeIDBalance: availableLeaveTypeID,
            _selectedDropDown: availableApplyLeaveDp[0],
            _selectedRefLeaveTypeIDBalance: availableLeaveTypeID[0],
        })
    }


    submitLeaveRequest = async () =>
    {
        
        this.setState({isLoading: true, submitBtnDisabled:true, radioFormVisible:Platform.OS === 'android' ? false:true})
        const employeeIDValue = await AsyncStorage.getItem('EmployeeID');

       if(this.state._selectedFromDateView === "Select Date" || this.state._selectedToDateView === "Select Date")
       {
            Alert.alert(
                "Empty Fields",
                "Please select a date",
                [
                    { text: "OK", onPress: () => {
                        this.setState(this.initialState);
                        this.getEmployeeDetail();
                        this.getHolidayDates();
                        this.scrollViewRef.scrollTo({x:0,y:0,animated:true});
                    }}
                ],
                { cancelable: true }
            );
       }
       else
       {
            if(startDate == endDate)
            {
                if(this.state.leaveReasons != "")
                {
                    this.sendLeaveRequest(employeeIDValue, startDate, endDate, 1, this.state.daysTaken)

                }
                else
                {
                    alert("Required Fields are empty!");
                }
            }
            else
            {
                if(this.state.leaveReasons != '')
                {
                    if(this.state.halfday1stView == false && this.state.halfday2ndView == false)
                    {
                        this.sendLeaveRequest(employeeIDValue, startDate, endDate, 1, this.state.daysTaken)
                    }
                    else if(this.state.halfday1stView == true && this.state.halfday2ndView == false)
                    {
                        // console.log("im in 2nd if else")
                        var d = new Date(startDate.valueOf());
                        d.setDate(d.getDate() + 1);
                        var currentDate = d;

                        this.sendLeaveRequest(employeeIDValue, startDate, startDate, 2, 0.5)
                        this.sendLeaveRequest(employeeIDValue, currentDate, endDate, 1, this.state.daysTaken - 1)
                    }
                    else if(this.state.halfday1stView == false && this.state.halfday2ndView == true)
                    {
                        console.log("im in 3rd if else")
                        var d = new Date(endDate.valueOf());
                        d.setDate(d.getDate() - 1);
                        var currentDate = d;

                        this.sendLeaveRequest(employeeIDValue, startDate, currentDate, 1, this.state.daysTaken - 1)
                        this.sendLeaveRequest(employeeIDValue, endDate, endDate, 2, 0.5)
                    }
                    else if(this.state.halfday1stView == true && this.state.halfday2ndView == true)
                    {
                        var d = new Date(startDate.valueOf());
                        d.setDate(d.getDate() + 1);
                        var currentSDate = d;

                        var s = new Date(endDate.valueOf());
                        s.setDate(s.getDate() - 1);
                        var currentEDate = s;

                        this.sendLeaveRequest(employeeIDValue, startDate, startDate, 2, 0.5)
                        this.sendLeaveRequest(employeeIDValue, currentSDate, currentEDate, 1, this.state.daysTaken - 1)
                        this.sendLeaveRequest(employeeIDValue, endDate, endDate, 3, 0.5)

                    }
                }
            }
       }
    }


    sendLeaveRequest = (employeeID, sDate, eDate, refLeavePeriod, totalDays) =>
    {
        return fetch(this.state.DomainName+'/api/Leave/ApplyLeave', 
        {
            method: 'POST',
            headers: 
            {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                RefLeaveTypeIDBalance : this.state._selectedRefLeaveTypeIDBalance,
                DateFrom: new Date(sDate.getFullYear(), sDate.getMonth(), sDate.getDate() + 1),
                DateTo: new Date(eDate.getFullYear(), eDate.getMonth(), eDate.getDate() + 1),
                RefLeavePeriodID : refLeavePeriod,
                Reason : this.state.leaveReasons ,
                TotalDays: totalDays,
                EmployeeID: employeeID,
                RefEmployeeID: employeeID,
                DomainName: this.state.DomainName
            }),
            }) .then((response) => 
            {
                return response.json();
            }).then((responseData) => 
            {
                return responseData
            }).then((data) => 
            {
                console.log(data);
                this.setState({
                    modalVisible:true,
                })
            })
            .catch((error) => 
            {
                console.error(error);
            });
    }


    _setDropDownValue = (value, index) =>
    {   
        // console.log(value+" "+index)
        var IOSIndex;
        if(Platform.OS === 'ios')
        {
            for(let i = 0; i < this.state.ApplyLeaveDropDown.length; i++)
            {
                if(value === this.state.ApplyLeaveDropDown[i])
                {
                    IOSIndex = i;
                }    
            }
            
            this.setState({
                _selectedDropDown: value,
                _selectedRefLeaveTypeIDBalance: this.state.RefLeaveTypeIDBalance[IOSIndex]
            })
        }
        else
        {
            this.setState({
                _selectedDropDown: value,
                _selectedRefLeaveTypeIDBalance: this.state.RefLeaveTypeIDBalance[index]
            })
        }
    }

    _setFromDate = (date) =>
    {
        if(date.getDay() === 0 || date.getDay() === 6)
        {
            Alert.alert(
                "Invalid Date",
                "Please select Weekday",
                [
                    { text: "OK", onPress: () => {
                        this.setState(this.initialState);
                        this.getEmployeeDetail();
                        this.getHolidayDates();
                        this.scrollViewRef.scrollTo({x:0,y:0,animated:true});
                    }}
                ],
                { cancelable: true }
            );
        }
        else
        {
            let currentDate = date.getDate()+'-'+(date.getMonth()+1)+'-'+date.getFullYear();
            for(let i = 0; i < holidayDatesArray.length; i++)
            {
                if(currentDate === holidayDatesArray[i])
                {
                    Alert.alert(
                        "Invalid Date",
                        "Date selected is a Holiday",
                        [
                            { text: "OK", onPress: () => {
                                this.setState(this.initialState);
                                this.getEmployeeDetail();
                                this.getHolidayDates();
                                this.scrollViewRef.scrollTo({x:0,y:0,animated:true});
                            }}
                        ],
                        { cancelable: true }
                    );
                }
                else
                {
                    startDate = date;
                    endDate = date;

                    var dateView = date.getDate();
                    var monthView = date.getMonth() + 1;
                    var yearView = date.getFullYear();

                    //This is for posting
                    selectedFromDate = startDate.getFullYear()+""+(startDate.getMonth()+1)+""+startDate.getDate();
                    selectedToDate = startDate.getFullYear()+""+(startDate.getMonth()+1)+""+startDate.getDate();
                    
                    this._getMonthInText(monthView);

                    this.setState({
                        initialDate: date,
                        _selectedFromDateView: dateView+" "+this.state.monthView+" "+yearView,
                        _selectedToDateView: dateView+" "+this.state.monthView+" "+yearView,
                    })
                }
            }
        }
    
        this.hideFromDateTimePicker();
    }

    _setToDate = (date) =>
    {
        if(date.getDay() === 0 || date.getDay() === 6)
        {
            Alert.alert(
                "Invalid Date",
                "Please select Weekday",
                [
                    { text: "OK", onPress: () => {
                        this.setState(this.initialState);
                        this.getEmployeeDetail();
                        this.getHolidayDates();
                        this.scrollViewRef.scrollTo({x:0,y:0,animated:true});
                    }}
                ],
                { cancelable: true }
            );
        }
        else
        {
            let currentDate = date.getDate()+'-'+(date.getMonth()+1)+'-'+date.getFullYear();
            for(let i = 0; i < holidayDatesArray.length; i++)
            {
                if(currentDate === holidayDatesArray[i])
                {
                    Alert.alert(
                        "Invalid Date",
                        "Date selected is a Holiday",
                        [
                            { text: "OK", onPress: () => {
                                this.setState(this.initialState);
                                this.getEmployeeDetail();
                                this.getHolidayDates();
                                this.scrollViewRef.scrollTo({x:0,y:0,animated:true});
                            }}
                        ],
                        { cancelable: true }
                    );
                }
                else
                {      
                    endDate = date;
                    var dateView = date.getDate();
                    var monthView = date.getMonth() + 1;
                    var yearView = date.getFullYear();

                    //This is for posting
                    selectedToDate = endDate.getFullYear()+""+(endDate.getMonth()+1)+""+endDate.getDate();

                    this._getMonthInText(monthView);
                    
                    this.setState({
                        _selectedToDateView: dateView+" "+this.state.monthView+" "+yearView,
                    })
                }
            }
        }

        this.hideToDateTimePicker();
    }

    daysTaken = () =>
    {

        if(selectedFromDate == selectedToDate)
        {
            switch(this.state.radioValue)
            {
                case 1: this.state.daysTaken = 1; break;
                case 2: this.state.daysTaken = 0.5; break;
                case 3: this.state.daysTaken = 0.5; break;
                default: break;
            }
        }
        else
        {
            //Calculate weekend and Holiday
            var SatSunSum = this.getNumberOfSaturdayAndSunday(startDate, endDate);
            var holidaySum = this.getNumberOfHoliday(startDate, endDate);
            var result = ((endDate - startDate) / (1000 * 60 * 60 * 24) + 1) - SatSunSum - holidaySum;
        
            this.state.daysTaken = Math.ceil(result);

            if((this.state.halfday1stView == true && this.state.halfday2ndView == false) || (this.state.halfday1stView == false && this.state.halfday2ndView == true))
            {
                var days = this.state.daysTaken;
                days = days - 0.5;
                this.state.daysTaken = days;       
            }
            else if(this.state.halfday1stView == true && this.state.halfday2ndView == true)
            {
                var days = this.state.daysTaken;
                days = days - 1;
                this.state.daysTaken = days;   
            }
        }

    }

    _getMonthInText = (monthView) =>
    {
        switch(monthView)
        {
            case 1: monthView = 'Jan'; break;
            case 2: monthView = 'Feb'; break;
            case 3: monthView = 'March'; break;
            case 4: monthView = 'April'; break;
            case 5: monthView = 'May'; break;
            case 6: monthView = 'June'; break;
            case 7: monthView = 'July'; break;
            case 8: monthView = 'Aug'; break;
            case 9: monthView = 'Sept'; break;
            case 10: monthView = 'Oct'; break;
            case 11: monthView = 'Nov'; break;
            case 12: monthView = 'Dec'; break;
            default: break;
        }

        this.state.monthView = monthView;
    }

    getNumberOfSaturdayAndSunday = (dateStart, dateEnd) => 
    {
        var currentDate = dateStart;
        var SatSun = 0;
    
        while (currentDate <= dateEnd) {

            if (currentDate.getDay() == 0 || currentDate.getDay() == 6) {
                SatSun += 1;
            }

            var d = new Date(currentDate.valueOf());
            d.setDate(d.getDate() + 1);
            currentDate = d;

        }
        return SatSun;
    }

    getNumberOfHoliday = (dateStart, dateEnd)  =>
    {
        var currentDate = dateStart;
        var Holiday = 0;
        while (currentDate <= dateEnd) { 
            var myString = currentDate.getDate()+'-'+(currentDate.getMonth()+1)+'-'+currentDate.getFullYear();
            for(var i=0; i <= holidayDatesArray.length; i++)
            {
                if(myString === holidayDatesArray[i])
                {
                    Holiday += 1;
                }
            }
            var d = new Date(currentDate.valueOf());
            d.setDate(d.getDate() + 1);
            currentDate = d;
        }
        return Holiday;
    }

    buttonOnPress= () =>
    {
        this.setState(this.initialState);
        this.getEmployeeDetail();
        this.getHolidayDates();
        this.scrollViewRef.scrollTo({x:0,y:0,animated:true});

        const navigationAction = NavigationActions.navigate({
            routeName: "Home"
          })
          this.props.navigation.dispatch(navigationAction)
    }


    render()
    {
        return(
            <View style={styles.RootView}>
            <KeyboardAvoidingView behavior='position' enabled keyboardVerticalOffset={Platform.select({ios:0,android:64})}>
                <ScrollView ref={ref => this.scrollViewRef = ref}>
                    {this.headerLoader()}
                        <View style={{flexDirection:'column', justifyContent:'center', marginTop:20}}>
                            <Text h4 h4Style={{alignSelf:'flex-start', fontSize:16, color:'#7B827A', marginLeft:20}}>Type of leave applied</Text>
                            <View style={{borderRadius: 3, borderWidth: 1, borderColor: '#7B827A', margin:20}}>
                                {this.dropdownPickerView()}    
                            </View>
                            
                            <Text h4 h4Style={{alignSelf:'flex-start', fontSize:16, color:'#7B827A',marginTop:20, marginLeft:20}}>From Date</Text>
                            <View style={{margin:20}}>

                                <Button 
                                    title={this.state._selectedFromDateView}
                                    type="outline"
                                     onPress={this.showFromDateTimePicker}
                                    buttonStyle={{borderColor:'#7B827A',borderWidth:1, height:40}}
                                    titleStyle={{color:'#7B827A'}}
                                    icon={<Icon name="calendar" size={20} color="#7B827A"  style={{marginRight:10}}/>}
                                    />
                                <DateTimePicker
                                    isVisible={this.state.isFromDateTimePickerVisible}
                                    onConfirm={this._setFromDate}
                                    onCancel={this.hideFromDateTimePicker}
                                />
                            </View>

                            <Text h4 h4Style={{alignSelf:'flex-start', fontSize:16, color:'#7B827A', marginLeft:20}}>To Date</Text>
                            <View style={{margin:20}}>

                                <Button 
                                    title={this.state._selectedToDateView}
                                    type="outline"
                                    onPress={this.showToDateTimePicker}
                                    buttonStyle={{borderColor:'#7B827A',borderWidth:1, height:40}}
                                    titleStyle={{color:'#7B827A'}}
                                    icon={<Icon name="calendar" size={20} color="#7B827A"  style={{marginRight:10}}/>}
                                />
                                <DateTimePicker
                                    isVisible={this.state.isToDateTimePickerVisible}
                                    minimumDate={this.state.initialDate}
                                    onConfirm={this._setToDate}
                                    onCancel={this.hideToDateTimePicker}
                                />
                            </View>

                            {this.leaveDurationView()}
                            {this.daysTaken()}

                            <Divider style={{backgroundColor:'#DFDFDF', marginTop:20,marginBottom:35,marginHorizontal:15, height:1}}/>

                            <Text h4 h4Style={{alignSelf:'flex-start', fontSize:20, color:'#7B827A', marginLeft:20}}>Total Day Taken: {this.state.daysTaken} Day(s)</Text>

                            <View style={{alignSelf:'center', margin:10}}>
                            <Text h4 h4Style={{alignSelf:'flex-start', fontSize:16, color:'#7B827A', marginLeft:20}}>Reasons:</Text>
                                <TextInput
                                    style={{width:screenWidth - 40,height:100, borderColor:'gray', borderWidth:1, borderRadius:5, margin:20, padding:7}}
                                    multiline={true}
                                    textAlignVertical={'top'}
                                    value={this.state.leaveReasons}
                                    onChangeText={(value) => this.setState({leaveReasons: value, submitBtnDisabled:false})}
                                />
                            </View>

                            <View style={styles.SubmitBtnView}> 
                                <Button loading={this.state.isLoading} loadingStyle={{width:20,height:20}} loadingProps={{color:'#4E5078'}} title="Submit" disabled={ this.state.submitBtnDisabled } type="solid" titleStyle={{color:'#fff', fontSize:15}} buttonStyle={{backgroundColor:'#4E5078',alignSelf:'stretch'}} onPress={this.submitLeaveRequest} /> 
                            </View>
                        </View>
                </ScrollView>

                <Modal coverScreen={true} backdropColor={'black'} animationIn={'slideInUp'} isVisible={this.state.modalVisible}>
                        <View style={styles.ModalRootView}>
                            <Image source={require('../assets/success.png')} style={styles.SuccessImageView}/>
                            <Text h4 h4Style={styles.SuccessTextView}>Success!</Text>
                            <View style={styles.ButtonView}>
                                <Button containerStyle={{alignSelf:'stretch'}} titleStyle={{alignSelf:'center'}} type='clear' title={Platform.OS === 'ios' ? "Close":"OK" } onPress={() => this.buttonOnPress()}/>
                            </View>
                        </View>
                </Modal>
            </KeyboardAvoidingView>
            </View>
        )
    }

    headerLoader = () =>
    {
        if(Platform.OS === 'android')
        {
            return(
            <View style={[{flexDirection:'row', justifyContent:'center',backgroundColor:'#F8F8F8', paddingTop:30,paddingHorizontal:20, borderBottomWidth:1, borderBottomColor:'#DFDFDF'}]}>
                <View style={{flexDirection:'row', justifyContent:'center'}}>
                    <Text h4 h4Style={{fontSize:30,marginBottom:10, fontWeight:'bold', color:'#7B827A',alignSelf:'center'}}>Leave</Text>
                </View>
            </View>)
        }
        else if(Platform.OS === 'ios')
        {
            return(
            <View style={[{flexDirection:'row', justifyContent:'flex-start',paddingTop:60,paddingHorizontal:20, borderBottomWidth:1, borderBottomColor:'#DFDFDF'}]}>
                <View style={{flexDirection:'row', justifyContent:'center'}}>
                    <Text h4 h4Style={{fontSize:30,marginBottom:10, fontWeight:'bold', color:'#000',alignSelf:'center'}}>Leave</Text>
                </View>
            </View>)
        }
    }

    leaveDurationView = () =>
    {
        if(this.state.radioFormVisible == true)
        {
            if(selectedFromDate == selectedToDate)
            {
                return(
                    <View style={{alignSelf:'flex-start', margin:20}}>
                        <RadioForm
                        radio_props={radio_props}
                        formHorizontal={true}
                        buttonColor={'#DFDFDF'}
                        selectedButtonColor = {'#4E5078'}
                        labelColor={'#7B827A'}
                        animation={true}
                        buttonSize={10}
                        onPress={(value) => {this.setState({radioValue:value})}}>
                    </RadioForm>
                    </View>
                )
            }
            else
            {
                return(
                    <View style={{alignSelf:'flex-start', margin:20}}>
                        <CheckBox
                            checkedColor='#4E5078'
                            title='Half day off on first day?'
                            checked={this.state.halfday1stView}
                            onPress={()=> this.setState({halfday1stView: !this.state.halfday1stView})}
                        />
                        <CheckBox
                            checkedColor='#4E5078'
                            title='Half day off on last day?'
                            checked={this.state.halfday2ndView}
                            onPress={()=> this.setState({halfday2ndView: !this.state.halfday2ndView})}
                        />
                    </View>
                )
            }
        }
        else
        {
            return null;
        }
        
    }

    dropdownPickerView = () =>
    {
        if(Platform.OS === 'android')
        {
            return(
                <Picker
                    selectedValue={this.state._selectedDropDown}
                    mode="dropdown"
                    itemStyle={{color:'#7B827A'}}
                    onValueChange={(value, index) => this._setDropDownValue(value, index)}
                    style={{height: 40, width: screenWidth-60, alignSelf:'center'}}>
    
                    {
                        Object.keys(this.state.ApplyLeaveDropDown).map((value,index) =>
                        {
                            return <Picker.Item key={index} value={this.state.ApplyLeaveDropDown[value]} label={this.state.ApplyLeaveDropDown[value]} />
                        })
                    }
                </Picker>
            )
        }
        else if(Platform.OS === 'ios')
        {
            return(
                <Picker
                    selectedValue={this.state._selectedDropDown}
                    mode="dropdown"
                    itemStyle={{color:'#7B827A'}}
                    onValueChange={(value, index) => this._setDropDownValue(value, index)}
                    style={{height: 40, width: screenWidth-60, alignSelf:'center'}}>
    
                    {
                        Object.keys(this.state.ApplyLeaveDropDown).map((value,index) =>
                        {
                            IOSDropDownIndexTracker.push(value);
                            return <Picker.Item key={index} value={this.state.ApplyLeaveDropDown[value]} label={this.state.ApplyLeaveDropDown[value]} />
                        })
                    }
                </Picker>
            )
        }
    }

    modalView = () =>
    {
        
    }
}

function elevationShadowStyle(elevation) 
{
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
        flex: 1,
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    TitleBarView:
    {
        flexDirection:'row',
        justifyContent:'space-evenly',
        backgroundColor:'#4E5078',
        ...Platform.select({
            ios:{
                paddingTop:60
            },
            android:{
                paddingTop:40
            }
        })
    },
    TitleTextView:
    {
        fontSize:30,
        marginBottom: Platform.OS ==='ios'? 10 : 20,
        color:'#fff',
        alignSelf:'center'
    },
    SubmitBtnView:
    {
        justifyContent:'center',
        marginBottom:80,
        marginLeft:20,
        marginRight:20,
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
     ButtonView:
     {
         borderTopColor: '#DFDFDF', 
         borderTopWidth: 1,
         justifyContent:'flex-end'
     },
    elevationShadow3: elevationShadowStyle(3),


});