import React from 'react';
import { Text, TextInput, View } from 'react-native';

let scheduleArray = [];
const styles = {
  textStyle: {
    fontSize: 16,
    color: 'grey'
  },
  containerStyle: {
      flex: 1,
      height: 60,
      backgroundColor: 'white',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingLeft: 10,
      paddingRight: 10,
  },
};

export default class WorkHourInput extends React.Component {

  state = {
    startTime: 0,
    endTime: 0,
    mondayStartTime: 0,
    mondayEndTime: 0,
  }

  demoMethod = () => {
    this.props.sendData(value);
  }

  handleChange = (startTime, endTime, index) => {
    if(index === 1) {
      this.setState({
        startTime,
        endTime,
        mondayStartTime: startTime,
        mondayEndTime: endTime,
      })
      return;
    }
    if(index === 2) {
      this.setState({
        startTime,
        endTime,
        tuesdayStartTime: startTime,
        tuesdayEndTime: endTime,
      })
      return;
    }
    if(index === 3) {
      this.setState({
        startTime,
        endTime,
        wednesdayStartTime: startTime,
        wednesdayEndTime: endTime,
      })
      return;
    }
    if(index === 4) {
      this.setState({
        startTime,
        endTime,
        thursdayStartTime: startTime,
        thursdayEndTime: endTime,
      })
      return;
    }
    if(index === 5) {
      this.setState({
        startTime,
        endTime,
        fridayStartTime: startTime,
        fridayEndTime: endTime,
      })
      return;
    }
    if(index === 6) {
      this.setState({
        startTime,
        endTime,
        saturdayStartTime: startTime,
        saturdayEndTime: endTime,
      })
      return;
    }
    if(index === 7) {
      this.setState({
        startTime,
        endTime,
        sundayStartTime: startTime,
        sundayEndTime: endTime,
      })
      return;
    }
  }

  render() {
    const { day, index } = this.props;
    const { startTime, endTime, mondayStartTime, mondayEndTime } = this.state;
    console.log(startTime);
    console.log(endTime);
    console.log(mondayStartTime);
    console.log(mondayEndTime);
    return (
      <View style={styles.containerStyle}>
       <Text style={{  fontSize: 24 }}>{day}</Text>
       <Text style={styles.textStyle}>START</Text>
       <TextInput
          placeholder="9:00AM"
          value={startTime}
          onChangeText={(startTime) => {
            this.handleChange(startTime, endTime, index);
          }}
       />
       <View style={{ height: 20, width: 1, backgroundColor: 'red'}} />
       <Text style={styles.textStyle}>END</Text>
       <TextInput
          placeholder="5:00PM"
          value={endTime}
          onChangeText={(endTime) => {
            this.handleChange(startTime, endTime, index);
          }}
       />
      </View>
     );
  }
};