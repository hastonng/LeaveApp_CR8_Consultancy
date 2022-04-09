import React, {PureComponent} from 'react';
import {StyleSheet,ScrollView, View, Image, AsyncStorage, Dimensions, Platform  } from 'react-native';
import { TouchableHighlight } from 'react-native-gesture-handler';
import { Avatar, Text } from 'react-native-elements';
import Connection from '../Connection';
import { Agenda} from 'react-native-calendars';

var screenWidth = Math.round(Dimensions.get('window').width);
var screenHeigth= Math.round(Dimensions.get('window').height);

export default class CalendarView extends PureComponent
{ 

  constructor(props) 
  {
      super(props);
      Obj = new Connection();


      this.state = {
        data:[],
        items:{},
        markedItems:{periods:[]},
        DomainName: Obj.getDomainName(), 
        DomainNameID: Obj.getDomainNameID(), 
      };
      
  }

  componentDidMount() 
  {
    this.getLeaveJSON();
  }

  componentWillUnmount()
  {
  }


  getLeaveJSON = () =>
  {
    return fetch(this.state.DomainName+'/leave.json')
    .then((response) => response.json())
    .then((responseJson) => {return responseJson;})
    .then(data => 
    {

      let tempData = [...this.state.data]
      for(var i = 0; i < data.length; i++)
      {
        tempData.push(data[i])
      }

      this.setState({
        data: tempData
      })

      console.log(data[191])
    })
    .catch((error) => {

      console.error(error);
    });
  }

  addDays = (date, days) =>
  {
    const copy = new Date(Number(date))
    copy.setDate(date.getDate() + days)
    return copy
  }

  loadItems(day) {
    setTimeout(() => 
    {
      let today = new Date((new Date()).getFullYear(), 0,1);
      for (let i = 1; i < 545; i++) //until next year June 
      {
        const strTime = this.timeToString(this.addDays(today,i));

        if (!this.state.items[strTime]) 
        {
          this.state.items[strTime] = [];
          this.state.markedItems[strTime] = {dots:[]};

          for(let j = 0; j < this.state.data.length; j++)
          {
            
            if((strTime == this.state.data[j].FromDate && this.state.data[j].type === "L") || (strTime == this.state.data[j].ToDate) && this.state.data[j].type === "L")
            {
              if(this.state.data[j].FromDate !== this.state.data[j].ToDate)
              {
                this.calculateDays(this.state.data[j].FromDate,this.state.data[j].ToDate,j);
              }
              else
              {
                this.state.items[strTime].push({
                  name: this.state.data[j].title,
                  reason: this.state.data[j].reason,
                  type: this.state.data[j].type,
                  color: this.state.data[j].color,
                  bordercolor: this.state.data[j].bordercolor
                });

                this.state.markedItems[strTime].dots.push({
                  selected:true, 
                  color:this.state.data[j].color
                })
                
              }
            }
            else if(strTime == this.state.data[j].date && this.state.data[j].type === "O")
            {
              this.state.items[strTime].push({
                name: this.state.data[j].title,
                venue: this.state.data[j].venue,
                timeFrom: this.state.data[j].TimeFrom,
                timeTo: this.state.data[j].TimeTo,
                type: this.state.data[j].type,
                color: this.state.data[j].color,
                bordercolor: this.state.data[j].bordercolor
              });

              this.state.markedItems[strTime].dots.push({
                selected:true, 
                color:this.state.data[j].color
              })
            }
            else if((strTime === this.state.data[j].date) && (this.state.data[j].type === "T"))
            {
              // console.log(strTime+" = "+this.state.data[j].date+" "+this.state.data[j].type+"= T")
              var replaceText = this.state.data[j].replaceBy.toString();
              replaceText = replaceText.replace(/<br\/>/g,"\n");

              this.state.items[strTime].push({
                name: this.state.data[j].title,
                reason: this.state.data[j].reason,
                replaceBy: replaceText,
                date: this.state.data[j].date,
                timeFrom: this.state.data[j].timeFrom,
                timeTo: this.state.data[j].timeTo,
                type: this.state.data[j].type,
                color: this.state.data[j].color,
                bordercolor: this.state.data[j].bordercolor
              });

              this.state.markedItems[strTime].dots.push({
                selected:true, 
                color:this.state.data[j].color
              })
            }
            else if(strTime == this.state.data[j].date && this.state.data[j].type === "PH")
            {
              this.state.items[strTime].push({
                name: this.state.data[j].title,
                date: this.state.data[j].date,
                type: this.state.data[j].type,
                color: this.state.data[j].color,
                bordercolor: this.state.data[j].bordercolor
              });

              this.state.markedItems[strTime].dots.push({
                selected:true, 
                color:this.state.data[j].color
              })
            }
          }
        }
      }
      const newItems = {};
      Object.keys(this.state.items).forEach(key => {newItems[key] = this.state.items[key];});
      this.setState({
        data: newItems
      });
     }, 3000);
  //   // console.log(`Load Items for ${day.year}-${day.month}`);
   }

   timeToString(time) {
    const date = new Date(time);
    // console.log(date.toISOString().split('T')[0]);
    return date.toISOString().split('T')[0];
  }

  calculateDays = (sDate, eDate, index) =>
  {
    var startDate = new Date(sDate);
    var endDate = new Date(eDate);
    var currentDate = startDate;
    var strTime = currentDate.toISOString().split('T')[0];
    if(! this.state.items[strTime])
    {
      this.state.items[strTime] = [];
      this.state.markedItems[strTime] = {dots:[]};
    } 
    

    while (currentDate <= endDate) 
    {
      this.state.items[strTime].push({
        name: this.state.data[index].title,
        reason: this.state.data[index].reason,
        type: this.state.data[index].type,
        color: this.state.data[index].color,
        bordercolor: this.state.data[index].bordercolor
      }) 
      
      this.state.markedItems[strTime].dots.push({
        selected:true, 
        color:this.state.data[index].color
      })

            
      var d = new Date(currentDate.valueOf());
      d.setDate(d.getDate() + 1);
      currentDate = d;
      strTime = currentDate.toISOString().split('T')[0];
      if(! this.state.items[strTime])
      {
        this.state.items[strTime] = [];
        this.state.markedItems[strTime] = {dots:[]};
      } 
      
    }
  }

  leaveTypeController = (color) =>
  {
    var text;
    if(color === "#f29d55")
    {
      text = "Leave - Full"
    }
    else if(color === "#ef8472")
    {
      text = "Leave - PM"
    }
    else if(color === "#ffcb3e")
    {
      text = "Leave - AM"
    }

    return text;
  }

  rowHasChanged(r1, r2) {
    return r1.name !== r2.name;
  }

  onRefresh = () =>
  {
    this.getLeaveJSON();
  }

  render()
  {
    return(
      <View style={styles.RootView}>
        <Agenda
            // the list of items that have to be displayed in agenda. If you want to render item as empty date
            // the value of date key kas to be an empty array []. If there exists no value for date key it is
            // considered that the date in question is not yet loaded
            items={this.state.items}
            // callback that gets called when items for a certain month should be loaded (month became visible)
            loadItemsForMonth={this.loadItems.bind(this)}
            // specify how each item should be rendered in agenda
            renderItem={this.renderItem.bind(this)}
            // specify how empty date content with no items should be rendered
            renderEmptyDate={() =>{return (<View/>)}}
            // specify how agenda knob should look like
            renderKnob={() => {return (<View style={{width:50,height:5, backgroundColor:'#DFDFDF', borderRadius:10, marginVertical:10}}/>);}}
            // specify your item comparison function for increased performance
            rowHasChanged={this.rowHasChanged.bind(this)}
            // By default, agenda dates are marked if they have at least one item, but you can override this if needed
            markedDates={this.state.markedItems}
            // The type of marking on the Calendar, multi-dot, multi-period, period etc
            markingType={'multi-dot'}
            // If provided, a standard RefreshControl will be added for "Pull to Refresh" functionality. Make sure to also set the refreshing prop correctly.
            onRefresh={() => this.onRefresh()}
            // Set this true while waiting for new data from a refresh
            refreshing={false}
            // Add a custom RefreshControl component, used to provide pull-to-refresh functionality for the ScrollView.
            refreshControl={null}
            // agenda theme
            theme={{
              arrowColor: '#000',
              agendaTodayColor: '#23284C',
              selectedDayBackgroundColor:'#4E5078',
              // agendaDayTextColor: '#868686',
              // agendaDayNumColor: '#868686',
            }}
            // agenda container style
            style={{height:screenHeigth}}
            // callback that fires when the calendar is opened or closed
            // onCalendarToggled={(calendarOpened) => {console.log(calendarOpened)}}
            // callback that gets called on day press
            // onDayPress={(day)=>{console.log('day pressed')}}
            // callback that gets called when day changes while scrolling agenda list
            // onDayChange={(day)=>{console.log('day changed')}}
            // initially selected day
            // selected={'2012-05-16'}
            // Minimum date that can be selected, dates before minDate will be grayed out. Default = undefined
            // minDate={'2012-05-10'}
            // Maximum date that can be selected, dates after maxDate will be grayed out. Default = undefined
            // maxDate={'2012-05-30'}
            // Max amount of months allowed to scroll to the past. Default = 50
            //  pastScrollRange={5}
            // // Max amount of months allowed to scroll to the future. Default = 50
            //  futureScrollRange={5}
            // specify how each date should be rendered. day can be undefined if the item is not first in that day.
            // renderDay={(day, item) => {return (<View><Text>Hello in Render Day</Text></View>);}}
            // specify what should be rendered instead of ActivityIndicator
            // renderEmptyData = {() => {return (<View />);}}
            // Hide knob button. Default = false
            // hideKnob={false}
          />
    </View>
    )
  }

  renderItem(item) {

    if(item.type === "L")
    {
      return (
        <View style={[styles.itemContainterView, styles.elevationShadow3, {backgroundColor: item.color, borderColor: item.color}]}>
          <Text style={styles.itemLeaveTypeTextView}>{this.leaveTypeController(item.color)}</Text>
          <Text style={[styles.itemTextView]}>{item.name}</Text>
          <Text style={[styles.itemTextView,{fontStyle:'italic'}]}>- {item.reason}</Text>
        </View>
      )
    }
    else if(item.type === "O")
    {
      return (
        <View style={[styles.itemContainterView, styles.elevationShadow3, {backgroundColor: item.color}]}>
          <Text style={styles.itemLeaveTypeTextView}>Out Of Office</Text>
          <Text style={[styles.itemTextView]}>{item.name}</Text>
          <Text style={[styles.itemTextView]}>{item.timeFrom} to {item.timeTo}</Text>
          <Text style={[styles.itemTextView,{fontStyle:'italic'}]}>- {item.venue}</Text>
        </View>
      )
    }
    else if(item.type === "T")
    {
      return (
        <View style={[styles.itemContainterView, styles.elevationShadow3, {backgroundColor: item.color, borderColor: item.color}]}>
          <Text style={styles.itemLeaveTypeTextView}>Time Off</Text>
          <Text style={[styles.itemTextView]}>{item.name}</Text>
          <Text style={[styles.itemTextView]}>{item.timeFrom} to {item.timeTo}</Text>
          <Text style={[styles.itemTextView]}>Reason:</Text>
          <Text style={[styles.itemTextView ,{fontStyle:'italic'}]}>{item.reason}</Text>
          <Text style={[styles.itemTextView]}>Replacement:</Text>
          <Text style={[styles.itemTextView ,{fontStyle:'italic'}]}>{item.replaceBy}</Text>
        </View>
      )
    }
    else if(item.type === "PH")
    {
      return (
        <View style={[styles.itemContainterView, styles.elevationShadow3, {backgroundColor: item.color, borderColor: item.color}]}>
          <Text style={styles.itemLeaveTypeTextView}>Public Holiday</Text>
          <Text style={[styles.itemTextView]}>{item.name}</Text>
        </View>
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
      width: '100%',
      height: '100%',
      ...Platform.select({
        ios:{
            paddingTop:60
        },
        android:{
            paddingTop:40,
        }
    })
  },
  itemContainterView: 
  {
    flex: 1,
    borderWidth:0,
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
    marginTop: 17,
  },
  itemTextView:
  {
    color:'#fff', 
    margin:2
  },
  itemLeaveTypeTextView:
  {
    alignSelf:'flex-end', 
    color:'#fff', 
    fontStyle:'italic',
    fontSize:10
  },
  // emptyDate: 
  // {
  //   height: 15,
  //   flex:1,
  //   paddingTop: 30
  // },
  elevationShadow10: elevationShadowStyle(10),
  elevationShadow3: elevationShadowStyle(5),


});