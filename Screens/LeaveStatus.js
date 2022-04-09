import React from 'react';
import {StyleSheet,ScrollView,Image,KeyboardAvoidingView, TextInput, View, Alert, AsyncStorage, Dimensions, Platform, ActivityIndicator  } from 'react-native';
import {Picker} from 'native-base';
import { TouchableHighlight } from 'react-native-gesture-handler';
import { Avatar, Text, Divider, Icon, Button } from 'react-native-elements';
import SegmentedControlTab from 'react-native-segmented-control-tab';
import {SwipeListView} from 'react-native-swipe-list-view';
import Connection from '../Connection';
import Modal from 'react-native-modal';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { NavigationActions } from 'react-navigation';

var screenWidth = Math.round(Dimensions.get('window').width);
var screenHeight = Math.round(Dimensions.get('window').height);

var toDay = new Date();
var yearArray = new Array(), monthArray = ["All", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var IOSMonthIndexTracker = [];

export default class LeaveStatus extends React.PureComponent
{
    constructor(props) 
    {
        super(props);
        Obj = new Connection();

        this.state = {
            selectedYear: 0, 
            selectedMonth: 0,
            IOSSelectedYear:'',
            IOSSelectedMonth:'',
            swipeListOpenState:false,
            swipeListData:[],
            selectedSegTab:0,
            openRightValue:0,
            openedRowID:0,
            openedRowMap:'',
            openedData:'',
            updateModalReplacement:'',
            updateModalStatus:'',
            showLoader:false,
            showSwipeList:false,
            openedRowStatus:false,
            refreshData: true,
            updateModalVisible:false,
            successModalVisible:false,
            DomainName: Obj.getDomainName(),  
        };

        this.initialState = this.state;
    }

    componentDidMount()
    {
       this.PageSetup();
    }

    PageSetup = () =>
    {
        this.setState({showLoader:true, showSwipeList:false})
        this._setYearArray();
        this._setMonth();
        this.getLeaveStatus();

        if(Platform.OS === 'ios')
        {
            this.setState({
                IOSSelectedYear: yearArray[0],
                IOSSelectedMonth: monthArray[toDay.getMonth() + 1]
            })
        }
    }

    getLeaveStatus = async () =>
    {
        const employeeIDValue = await AsyncStorage.getItem('EmployeeID');
        var userSelectedYear
        
        if(Platform.OS === 'ios')
        {
            userSelectedYear = parseInt(this.state.IOSSelectedYear);
        }
        else if(Platform.OS === 'android')
        {
            userSelectedYear = parseInt(yearArray[this.state.selectedYear]);
        }

        return fetch(this.state.DomainName+'/api/Leave/GetLeaveStatusByYearMonth?month='+this.state.selectedMonth+'&year='+userSelectedYear+'&employeeID='+employeeIDValue)
        .then((response) => response.json())
        .then((responseJson) => {return responseJson;})
        .then(data =>
        {

            this.setState({
                swipeListData: data,
                showLoader: false,
                showSwipeList:true,
            })
        })
        .catch((error) => {
          console.error(error);
        });
    }

    getTimeOffStatus = async () =>
    {
        const employeeIDValue = await AsyncStorage.getItem('EmployeeID');

        var userSelectedYear
        
        if(Platform.OS === 'ios')
        {
            userSelectedYear = parseInt(this.state.IOSSelectedYear);
        }
        else if(Platform.OS === 'android')
        {
            userSelectedYear = parseInt(yearArray[this.state.selectedYear]);
        }

        return fetch(this.state.DomainName+'/api/Leave/GetTimeOffStatusByYearMonth?month='+this.state.selectedMonth+'&year='+userSelectedYear+'&employeeID='+employeeIDValue)
        .then((response) => response.json())
        .then((responseJson) => {return responseJson;})
        .then(data =>
        {

            this.setState({
                swipeListData: data,
                showLoader: false,
                showSwipeList:true
            })
        })
        .catch((error) => {
          console.error(error);
        });
    }

    getOutOfOfficeStatus = async () =>
    {
        const employeeIDValue = await AsyncStorage.getItem('EmployeeID');

        var userSelectedYear
        
        if(Platform.OS === 'ios')
        {
            userSelectedYear = parseInt(this.state.IOSSelectedYear);
        }
        else if(Platform.OS === 'android')
        {
            userSelectedYear = parseInt(yearArray[this.state.selectedYear]);
        }
        
        return fetch(this.state.DomainName+'/api/Leave/GetOutOfOfficeStatusByYearMonth?month='+this.state.selectedMonth+'&year='+userSelectedYear+'&employeeID='+employeeIDValue)
        .then((response) => response.json())
        .then((responseJson) => {return responseJson;})
        .then(data =>
        {
            
            this.setState({
                swipeListData: data,
                showLoader: false,
                showSwipeList:true
            })
        })
        .catch((error) => {
          console.error(error);
        });
    }

    cancelLeave = async (data) =>
    {
        const employeeIDValue = await AsyncStorage.getItem('EmployeeID');
        const UserName = await AsyncStorage.getItem('UserName');

       return fetch(this.state.DomainName+'/api/Leave/CancelLeave', {
            method: 'POST',
            headers: 
            {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                LeaveApplicationhistoryID: data.item.LeaveApplicationHistoryID,
                EmployeeID: employeeIDValue,
                LeaveApplicationID: data.item.LeaveApplicationID,
                ModifiedBy: UserName
            }),
            }).then((response) => 
            {
                this.setState({
                    updateModalVisible:false,
                })

                setTimeout(()=>{
                    this.setState({
                        showLoader:false,
                        successModalVisible:true,
                    })
                },1000)

                // this.requestController(this.state.selectedSegTab)
            })
            .catch((error) => 
            {
                console.error(error);
            });
    }

    cancelTimeOff = async (data) =>
    {
        const employeeIDValue = await AsyncStorage.getItem('EmployeeID');
        const UserName = await AsyncStorage.getItem('UserName');

       return fetch(this.state.DomainName+'/api/Leave/CancelTimeOff', {
            method: 'POST',
            headers: 
            {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                LeaveTimeOffHistoryID: data.item.LeaveTimeOffHistoryID,
                EmployeeID: employeeIDValue,
                LeaveTimeOffID: data.item.LeaveTimeOffID,
                ModifiedBy: UserName
            }),
            }).then((response) => 
            {
                this.setState({
                    updateModalVisible:false,
                })

                setTimeout(()=>{
                    this.setState({
                        showLoader:false,
                        successModalVisible:true,
                    })
                },1000)
            })
            .catch((error) => 
            {
                console.error(error);
            });
    }

    cancelOutOfOffice = async (data) =>
    {
        const employeeIDValue = await AsyncStorage.getItem('EmployeeID');
        const UserName = await AsyncStorage.getItem('UserName');

       return fetch(this.state.DomainName+'/api/Leave/CancelOutOfOffice', {
            method: 'POST',
            headers: 
            {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                LeaveOutOfOfficeHistoryID: data.item.LeaveOutOfOfficeHistoryID,
                EmployeeID: employeeIDValue,
                LeaveOutOfOfficeID: data.item.LeaveOutOfOfficeID,
                ModifiedBy: UserName
            }),
            }).then((response) => 
            {
                this.setState({
                    updateModalVisible:false,
                })

                setTimeout(()=>{
                    this.setState({
                        showLoader:false,
                        successModalVisible:true,
                    })
                },1000)
            })
            .catch((error) => 
            {
                console.error(error);
            });
    }

    updateTimeOffStatus = () =>
    {
        this.setState({showLoader:true})
        // const employeeIDValue = await AsyncStorage.getItem('EmployeeID');
        // const UserName = await AsyncStorage.getItem('UserName');
        
        return fetch(this.state.DomainName+'/api/Leave/UpdateTimeOff', {
            method: 'POST',
            headers: 
            {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                LeaveTimeOffID: this.state.openedData.item.LeaveTimeOffID,
                LeaveTimeOffHistoryID: this.state.openedData.item.LeaveTimeOffHistoryID,
                RefLeaveTimeOffStatusID: this.state.updateModalStatus,
                ApproverRemarks: this.state.openedData.item.ApproverRemarks,
                EmployeeID: this.state.openedData.item.EmployeeID,
                Date: this.state.openedData.item.Date,
                TimeFrom: this.state.openedData.item.TimeFrom,
                TimeTo: this.state.openedData.item.TimeTo,
                Reason: this.state.openedData.item.Reason,
                ReplaceBy: this.state.updateModalReplacement,
                CurrentApproverFlowStage: this.state.openedData.item.CurrentApproverFlowStage,
                CreatedBy: this.state.openedData.item.CreatedBy,
                ModifiedBy: this.state.openedData.item.ModifiedBy
            }),
            }) .then((response) => 
            {
                return response.json();
            }).then((responseData) => 
            {
                return responseData
            }).then((data) => 
            {
                this.setState({
                    updateModalVisible:false,
                })

                setTimeout(()=>{
                    this.setState({
                        showLoader:false,
                        successModalVisible:true,
                    })
                },1000)

            })
            .catch((error) => 
            {
                console.error(error);
            });
    }

    IOSStatusValueContoller = () =>
    {
        if(this.state.updateModalStatus === "Pending Replacement")
        {
            return 1;
        }
        else
        {
            return 2;
        }
    }

    getRefLeavePeriodID = (data) =>
    {
        var refText
        switch(data.item.RefLeavePeriodID)
        {
            case 1: refText = "Full"; break; 
            case 2: refText = "AM"; break;
            case 3: refText = "PM"; break;
            default: break;
        }

        return refText
    }

    requestController = (value) =>
    {
        switch(value)
        {
            case 0: this.getLeaveStatus(); break;
            case 1: this.getTimeOffStatus(); break;
            case 2: this.getOutOfOfficeStatus(); break;
            default: break;
        }
    }

    rightOpenValueController = () =>
    {
        var openValue;
        switch(this.state.selectedSegTab)
        {
            case 0: openValue = -70; break;
            case 1: openValue = -141; break;
            case 2: openValue = -70; break;
            default: break;
        }

        this.state.openRightValue = openValue
    }

    _segmentTabControl = (value) =>
    {
        this.setState({
            showLoader:true,
            showSwipeList:false
        })
        this.requestController(value);
        this.state.selectedSegTab = value;
    }

    _setYearArray = () =>
    {      
        yearArray = [];
        yearArray.push(toDay.getFullYear().toString())
        yearArray.push((toDay.getFullYear() + 1).toString())
    }

    _setMonth = () =>
    {
        this.setState({selectedMonth: toDay.getMonth() + 1})
    }

    onYearValueChange = (value, index) => 
    {
        if(Platform.OS === 'ios')
        {
            this.setState({IOSSelectedYear: value})
            this.requestController(this.state.selectedSegTab);
        }
        else if(Platform.OS === 'android')
        {
            this.setState({selectedYear: index})
            this.requestController(this.state.selectedSegTab);
        }
    }

    onMonthValueChange = (value, index) =>
    {
        var currentIndex;
        if(Platform.OS === 'ios')
        {
            for(let i = 0; i < monthArray.length; i++)
            {
                if(value === monthArray[i])
                {
                    currentIndex = i;
                }
            }
            
            this.setState({
                selectedMonth: currentIndex,
                IOSSelectedMonth: monthArray[currentIndex]
            })
            this.requestController(this.state.selectedSegTab);
        }
        else if(Platform.OS === 'android')
        {
            this.setState({selectedMonth: index})
            this.requestController(this.state.selectedSegTab);
        }
    }

    statusColourController = function(data) 
    {

        if(data.item.RefLeaveStatusID === 1)
        {
            return {
                width:screenWidth, 
                backgroundColor:'#E2E3E5',
                borderBottomWidth:1,
                borderBottomColor:'#7B827A',
            }
        }
        else if(data.item.RefLeaveStatusID === 2)
        {
            return {
                width:screenWidth, 
                backgroundColor:'#D4ECDC',
                borderBottomWidth:1,
                borderBottomColor:'#9EB89D',
            }
        }
        else if(data.item.RefLeaveStatusID === 3)
        {
            return {
                width:screenWidth, 
                backgroundColor:'#F7D7DA',
                borderBottomWidth:1,
                borderBottomColor:'#E29BA2',
            }
        }
        else if(data.item.RefLeaveTimeOffStatusID === 1)
        {
            return {
                width:screenWidth, 
                backgroundColor:'#E2E3E5',
                borderBottomWidth:1,
                borderBottomColor:'#7B827A',
            }
        }
        else if(data.item.RefLeaveTimeOffStatusID === 2)
        {
            return {
                width:screenWidth, 
                backgroundColor:'#D4ECDC',
                borderBottomWidth:1,
                borderBottomColor:'#9EB89D',
            }
        }
    }


    cancelRequest = (data, rowMap) =>
    {
        if(data.item.RefLeaveStatusID === 2 || data.item.RefLeaveTimeOffStatusID === 2 ||
             data.item.RefLeaveStatusID === 3 || data.item.RefLeaveTimeOffStatusID === 3)
        {
            alert("Not Available")
            rowMap[data.item.id].closeRow();
        }
        //Leave
        else if(data.item.RefLeaveStatusID === 1)
        {
            Alert.alert(
                "Confirm cancel",
                "Do you want to continue?",
                [
                    {
                        text: "Cancel",
                        onPress: () => {rowMap[data.item.id].closeRow()},
                        style: "cancel"
                    },  
                    { text: "OK", onPress: () => {this.cancelLeave(data);this.setState({showLoader:true});}},
                ],
                { cancelable: true }
            );
        }
        //Time Off
        else if(data.item.RefLeaveTimeOffStatusID === 1)
        {
            Alert.alert(
                "Confirm cancel",
                "Do you want to continue?",
                [
                    {
                        text: "Cancel",
                        onPress: () => {rowMap[data.item.id].closeRow()},
                        style: "cancel"
                    },  
                    { text: "OK", onPress: () => {this.cancelTimeOff(data); this.setState({showLoader:true});}},
                ],
                { cancelable: true }
            );
        }
        //OutOfOffice
        else if(data.item.RefLeaveStatusID === 0)
        {
            Alert.alert(
                "Confirm cancel",
                "Do you want to continue?",
                [
                    {
                        text: "Cancel",
                        onPress: () => {rowMap[data.item.id].closeRow()},
                        style: "cancel"
                    },  
                    { text: "OK", onPress: () => {this.cancelOutOfOffice(data); this.setState({showLoader:true});}},
                ],
                { cancelable: true }
            );
        }
    }

    updateRequest = (data, rowMap) =>
    {
        if(data.item.RefLeaveTimeOffStatusID === 2 )
        {
            alert("Not Available")
            rowMap[data.item.id].closeRow();
        }
        else
        {
            this.setState({
                openedData: data,
                updateModalReplacement:data.item.ReplaceBy,
                updateModalStatus:1,
                updateModalVisible: true
            })
        }
    }
    successBtnPress = () =>
    {
        this.setState(this.initialState);
        this.PageSetup();

        // const navigationAction = NavigationActions.navigate({
        //     routeName: "TabWithHeader"
        // })
        // this.props.navigation.dispatch(navigationAction)
    }

    render()
    {
        return(
            <View style={styles.RootView}>
                <ScrollView >
                    <View style={{...Platform.select({ios:{marginTop:50, marginBottom:20},android:{marginVertical:20}})}}>
                        <View style={{flexDirection:'row', flex:1, justifyContent:'space-between'}}>
                            <View style={{flexDirection:'column',justifyContent:'flex-start'}}>
                                <MaterialIcon name='arrow-back' color={'#5B5B5B'} size={25} style={{marginHorizontal:10, marginTop:20}} onPress={() => this.props.navigation.pop()}/>
                            </View>
                            <View style={{flexDirection:'column',alignSelf:'flex-end'}}>
                                <Avatar
                                    size='small'
                                    rounded
                                    source={require('../assets/tempProfile.png')}
                                    containerStyle={styles.AvatarView}
                                />
                            </View>
                        </View>
                        

                        <Text h4 h4Style={{alignSelf:'flex-start', fontSize:16, color:'#7B827A',marginTop:10, marginLeft:20}}>Year</Text>
                        <View style={styles.pickerBorderView}>
                            {this.yearDropDownView()}
                        </View>

                        <Text h4 h4Style={{alignSelf:'flex-start', fontSize:16, color:'#7B827A',marginTop:10, marginLeft:20}}>Month</Text>
                        <View style={[styles.pickerBorderView,{marginBottom:15}]}>
                           {this.monthDropDownView()}
                        </View>

                        <Divider style={{backgroundColor:'#DFDFDF', marginTop:20,marginBottom:35,marginHorizontal:15, height:1}}/>

                        <SegmentedControlTab 
                            tabsContainerStyle={{marginHorizontal:35}}
                            borderRadius={20}
                            tabStyle={{borderColor:'#4E5078'}}
                            tabTextStyle={{color:'#4E5078'}}
                            activeTabStyle={{backgroundColor:'#4E5078'}}
                            values={["Leave","Time Off","Out of Office"]}
                            selectedIndex={this.state.selectedSegTab}
                            onTabPress={(value) => this._segmentTabControl(value)}
                        />

                        {this.rightOpenValueController()}
                        {this._swipeListViewContainer()}
                        
                    </View>
                </ScrollView>
                
                <KeyboardAvoidingView style={{position:'absolute'}} behavior='position' enabled keyboardVerticalOffset={Platform.select({ios:0,android:64})}>
                <ScrollView>
                <Modal coverScreen={true} backdropColor={'black'} animationIn={'slideInUp'} isVisible={this.state.updateModalVisible} 
                onBackdropPress={() => 
                    {
                        this.setState({updateModalVisible: false}); 
                        this.state.openedRowMap[this.state.openedRowID].closeRow();
                    }}>
                    <View style={styles.ModalRootView}>
                        <Text h4 h4Style={{alignSelf:'flex-start', fontSize:16, color:'#7B827A', marginLeft:20}}>Replacement Date and Time:</Text>
                        <TextInput
                            style={{width:'90%',height:100, borderColor:'gray', borderWidth:1, borderRadius:5, margin:20, padding:7}}
                            multiline={true}
                            textAlignVertical={'top'}
                            value={this.state.updateModalReplacement}
                            onChangeText={(value) => this.setState({updateModalReplacement: value})}
                        />


                        <Text h4 h4Style={{alignSelf:'flex-start', fontSize:16, color:'#7B827A', marginLeft:20}}>Status</Text>
                        <View style={styles.timeDropdownView}>
                            <Picker
                                selectedValue={this.state.updateModalStatus}
                                onValueChange={(value, index) => {this.setState({updateModalStatus:value})}}
                                style={{height: 40, width: '90%',marginHorizontal:10, alignSelf:'center'}}>

                                <Picker.Item label={"Pending Replacement"} value={1} key={1}/>
                                <Picker.Item label={"Complete"} value={2} key={2}/>
                            </Picker>
                        </View>
            
                        <View style={styles.ButtonView}>
                            <Button containerStyle={{alignSelf:'stretch', margin:10}} titleStyle={{alignSelf:'center'}} type='outline' title={"Submit"} onPress={() => this.updateTimeOffStatus()}/>
                        </View>
                    </View>
                </Modal>
                <Modal coverScreen={true} backdropColor={'black'} animationIn={'slideInUp'} isVisible={this.state.successModalVisible}>
                    <View style={styles.ModalRootView}>
                        <Image source={require('../assets/success.png')} style={styles.SuccessImageView}/>
                        <Text h4 h4Style={styles.SuccessTextView}>Success!</Text>
                        <View style={styles.ButtonView}>
                            <Button containerStyle={{alignSelf:'stretch'}} titleStyle={{alignSelf:'center'}} type='clear' title={Platform.OS === 'ios' ? "Close":"OK" } onPress={() => this.successBtnPress()}/>
                        </View>
                    </View>
                </Modal>
                </ScrollView>
                </KeyboardAvoidingView>
                {
                    this.state.showLoader && <View style={styles.LoadingContainer}>
                        <View style={styles.LoadingInnerContainer}>
                            <ActivityIndicator size="small" color="white" />
                            <Text style={{color:'#fff',alignSelf:'center', padding:5}}>Loading...</Text>
                        </View>
                    </View>
                }
            </View>
        )
    }  
    
    yearDropDownView = () =>
    {
        if(Platform.OS === 'android')
        {
            return(
                <Picker
                    selectedValue={yearArray[this.state.selectedYear]}
                    itemStyle={{color:'#7B827A'}}
                    onValueChange={(value, index) => this.onYearValueChange(value, index)}
                    style={{height: 40, width: screenWidth-60, alignSelf:'center'}}>

                    {
                        Object.keys(yearArray).map((value,index) =>
                        {
                            return <Picker.Item key={index} value={yearArray[value]} label={yearArray[value]} />
                        })
                    }
                    
                </Picker>
            )
        }
        else if(Platform.OS === 'ios')
        {
           return(
            <Picker
            selectedValue={this.state.IOSSelectedYear}
            itemStyle={{color:'#7B827A'}}
            onValueChange={(value, index) => this.onYearValueChange(value, index)}
            style={{height: 40, width: screenWidth-60, alignSelf:'center'}}>

            {
                Object.keys(yearArray).map((value,index) =>
                {
                    return <Picker.Item key={index} value={yearArray[value]} label={yearArray[value]} />
                })
            }
            
            </Picker>
           )
        }
    }

    monthDropDownView = () =>
    {
        if(Platform.OS === 'android')
        {
            return(
                <Picker
                selectedValue={monthArray[this.state.selectedMonth]}
                onValueChange={(value, index) => this.onMonthValueChange(value, index)}
                style={{height: 40, width: screenWidth-60, alignSelf:'center'}}>

                {
                    Object.keys(monthArray).map((value,index) =>
                    {
                        return <Picker.Item key={index} value={monthArray[value]} label={monthArray[value]} />
                    })
                }
            </Picker>
            )
        }
        else if(Platform.OS === 'ios')
        {
            return(
                <Picker
                    selectedValue={this.state.IOSSelectedMonth}
                    onValueChange={(value, index) => this.onMonthValueChange(value, index)}
                    style={{height: 40, width: screenWidth-60, alignSelf:'center'}}>

                    {
                        Object.keys(monthArray).map((value,index) =>
                        {
                            IOSMonthIndexTracker.push(value);
                            return <Picker.Item key={index} value={monthArray[value]} label={monthArray[value]} />
                        })
                    }
                </Picker>
            )
        }
    }

    _swipeListViewContainer = () =>
    {
        return(
            this.state.showSwipeList &&<SwipeListView
                useFlatList={true}
                extraData={this.state.swipeListData}
                style={{marginTop:20,borderTopWidth:1, borderTopColor:'#DFDFDF'}}
                data={this.state.swipeListData}
                // swipeGestureBegan={() => {this.setState({swipeListOpenState: true})}}
                // onRowClose={() => {this.setState({swipeListOpenState: false})}}
                renderItem={ (data, rowMap) => this._swipeViewControl(data, rowMap)}
                renderHiddenItem={ (data, rowMap) => this.swipeViewHiddenController(data, rowMap)}
                keyExtractor={(item,index) => item.id = index.toString() }
                disableRightSwipe={true}
                rightOpenValue={this.state.openRightValue}
                onRowOpen={(dataId,rowMap) => this.setState({openedRowID: dataId, openedRowMap:rowMap, openedRowStatus:!this.state.openedRowStatus})}
                onRowClose={(dataId,rowMap) => this.setState({openedRowID: dataId, openedRowMap:rowMap, openedRowStatus:!this.state.openedRowStatus})}
            />
        )
    }


    _swipeViewControl = (data,rowMap) =>
    {
        if(this.state.selectedSegTab === 0)
        {
            return(

                <TouchableHighlight 
                    disabled={this.state.swipeListOpenState} 
                    // onPress={this.swipeListOpen(data)}
                    underlayColor={'#fff'}>

                    <View style={this.statusColourController(data)}>
                        <View style={{flexDirection:'row',justifyContent:'space-between',marginTop:10}}>
                            <View style={{flexDirection:'column'}}>
                                <Text style={{textAlign:'left',marginHorizontal:20, fontStyle:'italic', color:'#7B827A', fontSize:13}}>{data.item.DateFromDay}/{data.item.DateFromMonth}/{data.item.DateFromYear} - {data.item.DateToDay}/{data.item.DateToMonth}/{data.item.DateToYear}</Text> 
                            </View>
                            <View style={{flexDirection:'column'}}>
                                <Text style={{textAlign:'right',marginHorizontal:20, fontStyle:'italic', color:'#7B827A', fontSize:13}}>{this.getRefLeavePeriodID(data)}</Text>
                            </View>
                        </View>
                        <View style={{flexDirection:'row', justifyContent:'flex-start'}}>
                            <Text numberOfLines={1} style={{marginHorizontal:20, marginVertical:10,  color:'#7B827A', fontSize:13}}>{data.item.Reason}</Text>
                        </View>
                    </View>     
                </TouchableHighlight>
            )
        }
        else if(this.state.selectedSegTab === 1)
        {
            return(
                <TouchableHighlight 
                    disabled={this.state.swipeListOpenState} 
                    // onPress={this.swipeListOpen(data)}
                    underlayColor={'#fff'}>

                    <View style={this.statusColourController(data)}>

                        <View style={{flexDirection:'row',justifyContent:'space-between',marginTop:10}}>
                            <View style={{flexDirection:'column'}}>
                                <Text style={{textAlign:'left',marginHorizontal:20, fontStyle:'italic', color:'#7B827A', fontSize:13}}>{data.item.DateDay}/{data.item.DateMonth}/{data.item.DateYear}</Text> 
                            </View>
                            <View style={{flexDirection:'column'}}>
                                <Text style={{textAlign:'right',marginHorizontal:20, fontStyle:'italic', color:'#7B827A', fontSize:13}}>{data.item.TimeFrom} - {data.item.TimeTo}</Text>
                            </View>
                        </View>
                        <View style={{flexDirection:'row', justifyContent:'flex-start'}}>
                            <Text numberOfLines={1} style={{marginHorizontal:20, marginVertical:10,  color:'#7B827A', fontSize:13}}>{data.item.Reason}</Text>
                        </View>
                    </View>
                </TouchableHighlight>
            )
        }
        else if(this.state.selectedSegTab === 2)
        {
            return(
                <TouchableHighlight 
                    
                    disabled={this.state.swipeListOpenState} 
                    // onPress={this.swipeListOpen(data)}
                    underlayColor={'#fff'}>

                    <View style={{width:screenWidth, backgroundColor:'#fff'}}>

                    <View style={{flexDirection:'row',justifyContent:'space-between',marginTop:10}}>
                        <View style={{flexDirection:'column'}}>
                            <Text style={{textAlign:'left',marginHorizontal:20, fontStyle:'italic', color:'#7B827A', fontSize:13}}>{data.item.DateDay}/{data.item.DateMonth}/{data.item.DateYear}</Text> 
                        </View>
                        <View style={{flexDirection:'column'}}>
                            <Text style={{textAlign:'right',marginHorizontal:20, fontStyle:'italic', color:'#7B827A', fontSize:13}}>{data.item.TimeFrom} - {data.item.TimeTo}</Text>
                        </View>
                        </View>
                        <View style={{flexDirection:'row', justifyContent:'flex-start'}}>
                            <Text numberOfLines={1} style={{marginHorizontal:20, marginVertical:10,  color:'#7B827A', fontSize:13}}>{data.item.Venue}</Text>
                        </View>

                        <Divider style={{backgroundColor:'#DFDFDF', marginHorizontal:15, marginBottom:5, height:1}}/>
                    </View>
                                    
                </TouchableHighlight>
            )
        }
    }

    swipeViewHiddenController = (data, rowMap) =>
    {
        if(this.state.selectedSegTab === 1)
        {
            return(
                <View style={styles.hiddenListWrap}>
                    <TouchableHighlight onPress={()=> this.updateRequest(data, rowMap) }>
                        <View style={[styles.modifySwipeList]}>
                            <Icon name='update' color='#fff' containerStyle={{marginTop:20}}/>
                            <Text style={{color:'#fff',fontSize:10}}>Update</Text>
                        </View>
                    </TouchableHighlight>
                    <TouchableHighlight onPress={()=> this.cancelRequest(data, rowMap)}>
                        <View style={[styles.deleteSwipeList,{paddingRight:20,paddingLeft:20}]}>
                            <Icon name='cancel' color='#fff' containerStyle={{marginTop:20}}/>
                            <Text style={{color:'#fff',fontSize:10}}>Cancel</Text>
                        </View>
                    </TouchableHighlight>
                </View>
            )
        }
        else
        {
            return(
                <View style={styles.hiddenListWrap}>
                    <TouchableHighlight onPress={() => this.cancelRequest(data, rowMap)}>
                        
                            <View style={[styles.deleteSwipeList,{paddingRight:20, paddingLeft:20}]}>
                                <Icon name='cancel' color='#fff' containerStyle={{marginTop:20}}/>
                                <Text style={{color:'#fff',fontSize:10}}>Cancel</Text>
                            </View>
                    </TouchableHighlight>
                </View>
            )
        }
    }
}


const styles = StyleSheet.create({

    RootView:
    {
        backgroundColor: '#F8F8F8', 
        position:'absolute',
        width: '100%',
        height: '100%',
    },
    AvatarView:
    {
        marginTop:20,
        marginRight: 20,
        justifyContent:'flex-end'
    },
    pickerBorderView:
    {
        backgroundColor:'#fff',
        borderRadius: 3, 
        borderWidth: 1, 
        borderColor: '#7B827A', 
        marginLeft:20,
        marginRight:20,
        marginTop:10,
    },
    hiddenListWrap: 
    {
        alignItems: 'center',
        backgroundColor: '#DDD',
        flex: 1,
        flexDirection: 'row',
        justifyContent:'flex-end',
    },  
    deleteSwipeList: 
    {   
        backgroundColor: '#DC3546',
        height:'100%',
        right: 0,
        left:0,
        paddingLeft:10,
        
    },
    modifySwipeList:
    {
        backgroundColor: '#7B827A',
        height:'100%',
        right: 0,
        left:0,
        paddingRight:20,
        paddingLeft: 20
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
        justifyContent:'flex-end'
     },
     LoadingContainer:
     {
        position: 'absolute',
        height:'100%',
        width:'100%',
        justifyContent:'center'
    },
     LoadingInnerContainer:
     {
        width:100,
        backgroundColor:'#000',
        opacity:0.7,
        alignSelf:'center',
        borderRadius:5,
        padding:10
    },

  });