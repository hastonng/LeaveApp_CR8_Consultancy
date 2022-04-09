import React from 'react';
import {StyleSheet,ScrollView, View, Image, TextInput, Platform, AsyncStorage, Dimensions, KeyboardAvoidingView} from 'react-native';
import {Picker} from 'native-base'
import {Text, Button, Divider } from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome';
import DateTimePicker from "react-native-modal-datetime-picker";
import Connection from '../Connection';
import Modal from 'react-native-modal';
import { NavigationActions } from 'react-navigation';

var selectedDate, toDay;

var timeArray = ["10:00 AM","10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM",
                "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM"];
var screenWidth = Math.round(Dimensions.get('window').width);
var screenHeight = Math.round(Dimensions.get('window').height);

export default class OutOfOffice extends React.Component
{
    constructor(props)  
    {
        super(props);
        var Obj = new Connection();
        toDay = new Date();
        this.scrollViewRef;
  
        this.state = {
            data:'',
            dateView: 'Select Date',
            selectedTimeFrom:0,
            selectedTimeTo:1,
            IOSSelectedTimeFrom:'',
            IOSSelectedTimeTo:'',
            venue:'',
            modalVisible:false,
            isLoading:false,
            submitBtnDisabled:true,
            DomainName: Obj.getDomainName(),
        };

        this.initialState = this.state;
    }

    componentDidMount()
    {
        if(Platform.OS === 'ios')
        {
            this.IOSArraySetup();
        }
    }

    IOSArraySetup = () =>
    {
        this.setState({
            IOSSelectedTimeFrom: timeArray[0],
            IOSSelectedTimeTo: timeArray[1]
        })
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

    submitOOORequest = () =>
    {
        this.setState({isLoading: true, submitBtnDisabled:true})
        if(this.state.dateView != 'Select Date')
        {
            this.OOOPostRequest();
        }
        else
        {
            this.setState({isLoading: false, submitBtnDisabled:false})
            alert("Please Select a Date")
        }
    }

    OOOPostRequest = async () =>
    {
        const employeeIDValue = await AsyncStorage.getItem('EmployeeID');
        const UserName = await AsyncStorage.getItem('UserName');

        return fetch(this.state.DomainName+'/api/Leave/ApplyOutOfOffice', {
            method: 'POST',
            headers: 
            {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                LeaveOutOfOfficeID: "0",
                LeaveOutOfOfficeHistoryID: "0",
                EmployeeID: employeeIDValue,
                Date: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 1),
                TimeFrom: Platform.OS === 'android' ? timeArray[this.state.selectedTimeFrom] : this.state.IOSSelectedTimeFrom,
                TimeTo: Platform.OS === 'android' ? timeArray[this.state.selectedTimeTo] : this.state.IOSSelectedTimeTo,
                Venue : this.state.venue,
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

    _setDate = (date) =>
    {
        selectedDate = date;

        selectedDate = date;
        var monthText = this._getMonthInText(selectedDate.getMonth() + 1)
        this.setState({dateView: selectedDate.getDate()+'-'+monthText+'-'+selectedDate.getFullYear()})

        this.hideDateTimePicker();
    }
    
    _setFromTimeValue = (value, index) =>
    {
        if(Platform.OS === 'ios')
        {
            this.setState({
                IOSSelectedTimeFrom: value
            })
        }
        else if(Platform.OS === 'android')
        {
            this.setState({selectedTimeFrom: index})
        }
    }

    _setToTimeValue = (value , index) =>
    {
        if(Platform.OS === 'ios')
        {
            this.setState({
                IOSSelectedTimeTo: value
            })
        }
        else if(Platform.OS === 'android')
        {
            this.setState({
                selectedTimeTo: index
            })
        }
    }

    buttonOnPress= () =>
    {
        this.setState(this.initialState);
        this.IOSArraySetup();
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
                        <View style={{marginTop:10, marginLeft:20, marginRight:20, marginBottom:30}}>
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
                            <Text h4 h4Style={{alignSelf:'flex-start', fontSize:16, color:'#7B827A', marginLeft:20}}>Venue:</Text>
                            <TextInput
                                style={{width:screenWidth - 40, height:100, borderColor:'gray', borderWidth:1, borderRadius:5, margin:20, padding:7}}
                                multiline={true}
                                textAlignVertical={'top'}
                                value={this.state.venue}
                                onChangeText={(value) => this.setState({venue: value, submitBtnDisabled:false})}
                            />
                        </View>

                        <View style={styles.SubmitBtnView}> 
                            <Button 
                            loading={this.state.isLoading} 
                            loadingStyle={{width:20,height:20}} 
                            loadingProps={{color:'#4E5078'}} 
                            type="solid" 
                            titleStyle={{color:'#fff', fontSize:15}} 
                            title="Submit" 
                            disabled={this.state.submitBtnDisabled} 
                            buttonStyle={{backgroundColor:'#4E5078'}} onPress={this.submitOOORequest} /> 
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
                        <Text h4 h4Style={{fontSize:30,marginBottom:10, fontWeight:'bold', color:'#7B827A',alignSelf:'center'}}>Out of Office</Text>
                    </View>
                </View>)
        }
        else if(Platform.OS === 'ios')
        {
            return(
            <View style={[{flexDirection:'row', justifyContent:'flex-start',paddingTop:60,paddingHorizontal:20, borderBottomWidth:1, borderBottomColor:'#DFDFDF'}]}>
                <View style={{flexDirection:'row', justifyContent:'center'}}>
                    <Text h4 h4Style={{fontSize:30,marginBottom:10, fontWeight:'bold', color:'#000',alignSelf:'center'}}>Out of Office</Text>
                </View>
            </View>)
        }
    }

    _timeFromDropdown = () =>
    {
        if(Platform.OS === 'android')
        {
            return(
                <Picker
                    selectedValue={timeArray[this.state.selectedTimeFrom]}
                    onValueChange={ (value, index) => this._setFromTimeValue(value, index)}
                    style={{height: 40, width: screenWidth-60, alignSelf:'center'}}>
    
                    {
                        Object.keys(timeArray).map((value,index) =>
                        {
                            return <Picker.Item key={index} value={timeArray[value]} label={timeArray[value]} />
                        })
                    }
                    </Picker>
            )
        }
        else if(Platform.OS === 'ios')
        {
            return(
                <Picker
                    selectedValue={this.state.IOSSelectedTimeFrom}
                    onValueChange={ (value, index) => this._setFromTimeValue(value, index)}
                    style={{height: 40, width: screenWidth-60, alignSelf:'center'}}>
    
                    {
                        Object.keys(timeArray).map((value,index) =>
                        {
                            return <Picker.Item key={index} value={timeArray[value]} label={timeArray[value]} />
                        })
                    }
                    </Picker>
            )
        }
    }

    _timeToDropdown = () =>
    {
        if(Platform.OS === 'android')
        {
            return(
                <Picker
                    selectedValue={timeArray[this.state.selectedTimeTo]}
                    onValueChange={ (value, index) => this._setToTimeValue(value, index)}
                    style={{height: 40, width: screenWidth-60, alignSelf:'center'}}>
    
                    {
                        Object.keys(timeArray).map((value,index) =>
                        {
                            return <Picker.Item key={index} value={timeArray[value]} label={timeArray[value]} />
                        })
                    }
                    </Picker>
            )   
        }
        else if(Platform.OS === 'ios')
        {
            return(
                <Picker
                    selectedValue={this.state.IOSSelectedTimeTo}
                    onValueChange={ (value, index) => this._setToTimeValue(value, index)}
                    style={{height: 40, width: screenWidth-60, alignSelf:'center'}}>
    
                    {
                        Object.keys(timeArray).map((value,index) =>
                        {
                            return <Picker.Item key={index} value={timeArray[value]} label={timeArray[value]} />
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