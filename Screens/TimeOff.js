import React from 'react';
import {StyleSheet,ScrollView, View,Image, TextInput, Platform, AsyncStorage, Dimensions, KeyboardAvoidingView, Alert} from 'react-native';
import {Picker} from 'native-base'
import {Text, Button, Divider } from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome';
import DateTimePicker from "react-native-modal-datetime-picker";
import Modal from 'react-native-modal';
import { NavigationActions } from 'react-navigation';

import Connection from '../Connection';

var selectedDate, toDay;
var timeArray = ["10:00 AM","10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM",
                "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM", "9:00 PM"];
var toTimeArray = [], tempTimeArray = [], IOSFromTimeTracker= [], IOSToTimeTacker =[];
var screenWidth = Math.round(Dimensions.get('window').width);
var screenHeight = Math.round(Dimensions.get('window').height);


export default class TimeOff extends React.PureComponent
{

    constructor(props)  
    {
        super(props);
        var Obj = new Connection();
        toDay = new Date();
        selectedDate = toDay;
        var monthInText = this._getMonthInText(toDay.getMonth() + 1)
        this.scrollViewRef

        this.state = {
            data:'',
            dateView: toDay.getDate()+'-'+monthInText+'-'+toDay.getFullYear(),
            selectedTimeFrom: 0,
            selectedTimeTo:0,
            selectedTimeFromView:'',
            selectedTimeToView:'',
            IOSTimeFromArray:[],
            IOSTimeToArray:[],
            timeoffReasons:'',
            timeoffReplacement:'',
            modalVisible:false,
            isLoading:false,
            submitBtnDisabled:false,
            DomainName: Obj.getDomainName(),
        };

        this._defTempTimeArray();
        this.initialState = this.state;
    }

    componentDidMount()
    {
        if(Platform.OS === 'ios')
        {
            this.IOSSetupArray();
        }
    }

    showDateTimePicker = () => {
        this.setState({ isFromDateTimePickerVisible: true });
      };
     
    hideDateTimePicker = () => {
        this.setState({ isFromDateTimePickerVisible: false });
      };

    _getMonthInText = (monthView) =>
    {
        switch(monthView)
        {
            case 1: monthView = 'January'; break;
            case 2: monthView = 'February'; break;
            case 3: monthView = 'March'; break;
            case 4: monthView = 'April'; break;
            case 5: monthView = 'May'; break;
            case 6: monthView = 'June'; break;
            case 7: monthView = 'July'; break;
            case 8: monthView = 'August'; break;
            case 9: monthView = 'September'; break;
            case 10: monthView = 'October'; break;
            case 11: monthView = 'November'; break;
            case 12: monthView = 'December'; break;
        }

        return monthView
    }

    

    submitTimeOffRequest = () =>
    {
        this.setState({isLoading: true, submitBtnDisabled:true})
        if(this.state.timeoffReasons == '' || this.state.timeoffReplacement == '')
        {
            Alert.alert(
                "Empty Fields",
                "Do you want to continue?",
                [
                    {
                        text: "Cancel",
                        onPress: () => {},
                        style: "cancel"
                    },  
                    { text: "OK", onPress: () => this.timeOffPostRequest()},
                ],
                { cancelable: true }
              );
        }
        else
        {
            this.timeOffPostRequest();
        }
        
    }

    timeOffPostRequest = async () =>
    {
        const employeeIDValue = await AsyncStorage.getItem('EmployeeID');
        const UserName = await AsyncStorage.getItem('UserName');

        return fetch(this.state.DomainName+'/api/Leave/ApplyTimeOff', {
            method: 'POST',
            headers: 
            {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                LeaveTimeOffID: 0,
                LeaveTimeOffHistoryID: 0,
                RefLeaveTimeOffStatusID: 1,
                ApproverRemarks: "",
                EmployeeID: employeeIDValue,
                Date: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), (selectedDate.getDate() + 1)),
                TimeFrom: Platform.OS === 'android' ? timeArray[this.state.selectedTimeFrom] : this.state.selectedTimeFromView,
                TimeTo: Platform.OS === 'android' ? toTimeArray[this.state.selectedTimeTo] : this.state.selectedTimeToView,
                Reason: this.state.timeoffReasons,
                ReplaceBy: this.state.timeoffReplacement,
                CurrentApproverFlowStage: 1,
                CreatedBy: UserName,
                ModifiedBy: UserName
            }),
            }) .then((response) => 
            {
                return response.json();
            }).then((responseData) => 
            {
                return responseData
            }).then((data) => 
            {
                console.log(data)
                this.setState({
                    modalVisible:true,
                })
            })
            .catch((error) => 
            {
                console.error(error);
            });
    }

    setToTimeArray = () =>
    {
        toTimeArray = [];
        for(var i = this.state.selectedTimeFrom; i <= this.state.selectedTimeFrom + 3; i++)
        {
            toTimeArray.push(timeArray[i + 1]);
        } 
    }

    _defTempTimeArray = () =>
    {
        for(var i = 0; i <= timeArray.length - 5; i++)
        {
            tempTimeArray[i] = timeArray[i];
        }
    }

    IOSSetupArray = () =>
    {
        let tempArray = [...this.state.IOSTimeFromArray]
        let tempTimeToArray = [...this.state.IOSTimeToArray]
        for(let i = 0; i < tempTimeArray.length; i++)
        {
            tempArray.push(tempTimeArray[i]);
        }

        for(let i = 0; i <= 3; i++)
        {
            tempTimeToArray.push(tempTimeArray[i + 1])
        }

        this.setState({
            selectedTimeFromView: tempTimeArray[0],
            selectedTimeToView: tempTimeArray[1],
            IOSTimeFromArray: tempArray,
            IOSTimeToArray: tempTimeToArray
        })
    }

    _setDate = (date) =>
    {
        selectedDate = date;
        var monthText = this._getMonthInText(selectedDate.getMonth() + 1)
        this.setState({dateView: selectedDate.getDate()+'-'+monthText+'-'+selectedDate.getFullYear()})

        this.hideDateTimePicker();
    }

    _setFromTimeValue = (value,index) =>
    {
        this.setState({
            selectedTimeFrom: index
        })
    }

    _setToTimeValue = (value, index) =>
    {
        this.setState({selectedTimeTo: index})
    }

    IOSFromTimePickerController = (value) =>
    {
        var selectedIndex;

        for(let i = 0; i < this.state.IOSTimeFromArray.length; i++)
        {
            if(value === timeArray[i])
            {
                selectedIndex = i;
            }
        }

        let tempIOSTimeToArray = [...this.state.IOSTimeToArray];
        tempIOSTimeToArray = [];
        for(let i = selectedIndex; i <= (selectedIndex + 3); i++)
        {
            tempIOSTimeToArray.push(timeArray[i + 1])
        }

        this.setState({
            selectedTimeFromView: value,
            selectedTimeToView: tempIOSTimeToArray[0],
            IOSTimeToArray: tempIOSTimeToArray
        })
    }

    buttonOnPress= () =>
    {
        this.setState(this.initialState);
        this.IOSSetupArray();
        this.scrollViewRef.scrollTo({x:0,y:0,animated:true});
        

        const navigationAction = NavigationActions.navigate({
            routeName: "Home"
          })
          this.props.navigation.dispatch(navigationAction)
    }
    
    render()
    {
        return(
            <View style={styles.RootView} >
            <KeyboardAvoidingView behavior='position' enabled keyboardVerticalOffset={Platform.select({ios:0,android:64})}>
            <ScrollView ref={ref => this.scrollViewRef = ref}>
                {this.headerLoader()}
                <View style={{flexDirection:'column', justifyContent:'center', marginTop:20}}>
                    <Text h4 h4Style={{alignSelf:'flex-start', fontSize:16, color:'#7B827A', marginLeft:20}}>Date</Text>
                    <View style={{marginTop:10 ,marginLeft:20, marginRight:20, marginBottom:30}}>
                        <Button 
                            title={this.state.dateView}
                            type="outline"
                            onPress={this.showDateTimePicker}
                            buttonStyle={{borderColor:'#7B827A',borderWidth:1, height:40}}
                            titleStyle={{color:'#7B827A'}}
                            icon={<Icon name="calendar" size={20} color="#7B827A"  style={{marginRight:10}}/>}
                        />
                        <DateTimePicker
                        isVisible={this.state.isFromDateTimePickerVisible}
                        minimumDate={toDay}
                        onConfirm={this._setDate}
                        onCancel={this.hideDateTimePicker}
                        />
                    </View>
                    
                    {this.setToTimeArray()}
                    <Text h4 h4Style={{alignSelf:'flex-start', fontSize:16, color:'#7B827A', marginLeft:20}}>Time From</Text>
                    <View style={styles.timeDropdownView}>
                            {this._timeFromDropdown()}
                    </View>

                    <Text h4 h4Style={{alignSelf:'flex-start', fontSize:16, color:'#7B827A', marginLeft:20}}>Time To</Text>
                    <View style={styles.timeDropdownView}>
                            {this._timeToDropdown()}
                    </View>

                    <Divider style={{backgroundColor:'#DFDFDF', marginTop:20,marginBottom:35,marginHorizontal:15, height:1}}/>
                    
                    <View style={{alignSelf:'center', margin:20}}>
                        <Text h4 h4Style={{alignSelf:'flex-start', fontSize:16, color:'#7B827A', marginLeft:20}}>Reasons:</Text>
                        <TextInput
                            style={{width:screenWidth - 40,height:80, borderColor:'gray', borderWidth:1, borderRadius:5, margin:20, padding:7}}
                            multiline={true}
                            textAlignVertical={'top'}
                            value={this.state.timeoffReasons}
                            onChangeText={(value) => this.setState({timeoffReasons: value})}
                        />

                        <Text h4 h4Style={{alignSelf:'flex-start', fontSize:16, color:'#7B827A', marginLeft:20}}>Replacement Date and Time:</Text>
                        <TextInput
                            style={{width:screenWidth - 40,height:100, borderColor:'gray', borderWidth:1, borderRadius:5, margin:20, padding:7}}
                            multiline={true}
                            textAlignVertical={'top'}
                            value={this.state.timeoffReplacement}
                            onChangeText={(value) => this.setState({timeoffReplacement: value})}
                        />
                    </View>

                    <View style={styles.SubmitBtnView}> 
                        <Button loading={this.state.isLoading} 
                        loadingStyle={{width:20,height:20}} 
                        loadingProps={{color:'#fff'}} 
                        title="Submit" 
                        type="solid" 
                        titleStyle={{color:'#fff', fontSize:15}} 
                        disabled={this.state.submitBtnDisabled} 
                        buttonStyle={{backgroundColor:'#4E5078'}} 
                        onPress={this.submitTimeOffRequest} /> 
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
                        <Text h4 h4Style={{fontSize:30,marginBottom:10, fontWeight:'bold', color:'#7B827A',alignSelf:'center'}}>Time Off</Text>
                    </View>
                </View>)
        }
        else if(Platform.OS === 'ios')
        {
            return(
            <View style={[{flexDirection:'row', justifyContent:'flex-start',paddingTop:60,paddingHorizontal:20, borderBottomWidth:1, borderBottomColor:'#DFDFDF'}]}>
                <View style={{flexDirection:'row', justifyContent:'center'}}>
                    <Text h4 h4Style={{fontSize:30,marginBottom:10, fontWeight:'bold', color:'#000',alignSelf:'center'}}>Time Off</Text>
                </View>
            </View>)
        }
    }

    _timeToDropdown = () =>
    {
        if(Platform.OS === 'android')
        {
            return(
                <Picker
                    selectedValue={toTimeArray[this.state.selectedTimeTo]}
                    onValueChange={(value, index) => this._setToTimeValue(value, index) }
                    style={{height: 40, width: screenWidth-60, alignSelf:'center'}}>
    
                    {
                        Object.keys(toTimeArray).map((value,index) =>
                        {
                            return <Picker.Item key={index} value={toTimeArray[value]} label={toTimeArray[value]} />
                        })
                    }
                </Picker>
            )
        }
        else if(Platform.OS === 'ios')
        {
            return(
                <Picker
                    selectedValue={this.state.selectedTimeToView}
                    onValueChange={(value) => this.setState({ selectedTimeToView: value })}
                    style={{height: 40, width: screenWidth-60, alignSelf:'center'}}>
    
                    {
                        Object.keys(this.state.IOSTimeToArray).map((value,index) =>
                        {
                            return <Picker.Item key={index} value={this.state.IOSTimeToArray[value]} label={this.state.IOSTimeToArray[value]} />
                        })
                    }
                </Picker>
            )
        }
    }

    _timeFromDropdown = () =>
    {
        if(Platform.OS === 'android')
        {
            return(
                <Picker
                    selectedValue={timeArray[this.state.selectedTimeFrom]}
                    mode="dropdown"
                    itemStyle={{color:'#7B827A'}}
                    itemStyle={{height:10}}
                    onValueChange={ (value, index) => this._setFromTimeValue(value, index)}
                    style={{height: 40, width:screenWidth-60, alignSelf:'center'}}>

                    {
                        Object.keys(tempTimeArray).map((value,index) =>
                        {
                            return <Picker.Item key={index} value={tempTimeArray[value]} label={tempTimeArray[value]} />
                        })
                    }
                </Picker>
            )
        }
        else if(Platform.OS === 'ios')
        {
            return(
                <Picker
                    selectedValue={this.state.selectedTimeFromView}
                    mode="dropdown"
                    itemStyle={{color:'#000'}}
                    onValueChange={ (value, index) => this.IOSFromTimePickerController(value)}
                    style={{height: 40, width: screenWidth-60, alignSelf:'center'}}>

                    {
                        Object.keys(this.state.IOSTimeFromArray).map((value, index) =>
                        {
                            return <Picker.Item key={index} value={this.state.IOSTimeFromArray[value]} label={this.state.IOSTimeFromArray[value]} />
                        })
                    }
                </Picker>
            )
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
                paddingTop:30
            }
        })
        
    },
    TitleTextView:
    {
        fontSize:20,
        marginBottom:10,
        color:'#fff',
        alignSelf:'center'
    },
    timeDropdownView:
    {
        borderRadius: 3, 
        borderWidth: 1, 
        borderColor: '#7B827A', 
        marginLeft:20, 
        marginRight:20, 
        marginTop:15, 
        marginBottom:15
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