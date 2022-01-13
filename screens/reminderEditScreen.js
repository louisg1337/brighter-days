import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity, SectionList, TextInput, ActivityIndicator, Button, Dimensions, Alert, TouchableWithoutFeedback, Keyboard } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-community/async-storage';
import * as Notifications from 'expo-notifications'
import { minutes, hours, timeOfDay } from "../data/time"
import { reminderChoices } from "../data/reminderData"
import { comeBackText } from "../data/comeBack"
import { Picker } from '@react-native-community/picker';
import Constants from 'expo-constants'
import { LinearGradient } from 'expo-linear-gradient'
import {RFPercentage} from 'react-native-responsive-fontsize'
import loadFont from '../reusableComponents/font'
import * as Permissions from 'expo-permissions'

export default class reminderEditScreen extends React.Component {
    static navigationOptions = {
      headerShown: false,
    }  

    constructor(props){
      super(props);
      this.state = {
        isLoading: true,
        index: 0,
        reminderData: [],
        notificationID: [],
        title: "",
        amount: 1,
      }
    }

    async componentDidMount() {
      console.log("---------------------------------------------------------")
      this.requestPermissionsAsync()
      this.allowsNotificationsAsync()
      await loadFont()
      const id = this.props.navigation.getParam('id', 'none')
      this.setState({id: id})
      this.getReminderData(id)
    }

    getReminderData = async (id) => {
      const remindersJSON = await AsyncStorage.getItem("DailyReminders")
      const reminders = JSON.parse(remindersJSON)
      let i = 0
      reminders.map(val => {
        if (val.id === id){
          this.setState({index: i})
        }
        i++        
      })
      const startData = this.reversalTime(reminders[this.state.index].start)
      const endData = this.reversalTime(reminders[this.state.index].end)
      this.setState({
        reminderData: reminders[this.state.index], 
        title: reminders[this.state.index].title,
        start: reminders[this.state.index].start,
        end: reminders[this.state.index].end,
        amount: reminders[this.state.index].amount,
        endOfReminder: reminders[this.state.index].endOfReminder,
        notificationID: reminders[this.state.index].notificationID,
        startTimeDay: startData.timeOfDay, 
        startTimeHours: startData.hours, 
        startTimeMinutes: startData.minutes, 
        endTimeDay: endData.timeOfDay, 
        endTimeHours: endData.hours, 
        endTimeMinutes: endData.minutes, 
        isLoading: false
      })
    }

    updateNotification = async () => {
      this.setState({isLoading: true})
      const prevDataJson = await AsyncStorage.getItem("DailyReminders")
      const prevData = JSON.parse(prevDataJson)
      console.log("////////////////////////////////////////////")
      await this.cancelNotifications(this.state.notificationID)
      await this.createNotificationActually()
      const data = [{
        id: this.state.id,
        title: this.state.title,
        start: this.state.startTime,
        end: this.state.endTime,
        amount: this.state.amount,
        endOfReminder: this.state.endOfReminderNotification,
        notificationID: this.state.notificationID,
      }]
      try {
        if (prevData.length !== 1){
          console.log("1")
          console.log(prevData)
          prevData.splice(this.state.index, 1, data[0])
          const fixedJSON = JSON.stringify(prevData)
          await AsyncStorage.setItem("DailyReminders", fixedJSON)
        } else {
          console.log("2")
          await AsyncStorage.removeItem("DailyReminders")
          const dataJSON = JSON.stringify(data)
          await AsyncStorage.setItem("DailyReminders", dataJSON)
        }
        this.setState({isLoading: false})
        this.props.navigation.navigate("Reminder")
      } catch (e) {
          console.log(e)
      }
    }

    cancelNotifications = async (array) => {
      console.log(array.length)

      for (let i = 0; i < array.length; i++){
        this.cancelAsyncMap(array[i])
      }

      this.setState({notificationID: []})
    }

    cancelAsyncMap = async (id) => {
      try {
          await Notifications.cancelScheduledNotificationAsync(id).then().catch(err => console.log(err))
      } catch (e) {
          console.log(e)
      }
    }
    
    //////////////////////// PERMS //////////////////////
    requestPermissionsAsync = async () => {
      return await Permissions.askAsync(Permissions.NOTIFICATIONS)
    }

    allowsNotificationsAsync = async() => {
      const status = await Notifications.getPermissionsAsync()
      if (!status.granted){
          console.log("No access")
      } else {
          console.log("Permissions on")
          this.setState({hasAccess: true})
      }
  }
    //////////////////////// PERMS //////////////////////

    ///////////////////////////////// NOTIFICATION HANDLERS /////////////////////////////////
    createNotificationActually = async () => {
      const timeObj = this.processTime()
      const endTime = timeObj.endTime
      const startTime = timeObj.startTime
      const amount = this.state.amount
      this.setState({startTime, endTime})
      if (this.checker(endTime, startTime, amount)){
        return
      }
      this.setState({isLoading: true})
      let currentDate = new Date(Date.now())
      let start = this.fixTime(startTime)
      let end = this.fixTime(endTime)
      let interval = ((endTime-startTime) / amount)
      await this.scheduleWeekOfNotifications(interval, amount, startTime)
      if (currentDate >= end) {
          console.log("We are passed the interval") 
      } else if (currentDate < end && currentDate >= start) {
          console.log("Within interval")
          await this.handleTodayNotificationsWithinInterval(end, currentDate, interval)
      } else if (currentDate < start) {
          console.log("Its before the interval")
          await this.handleTodayNotificationsBeforeTime(interval, amount, startTime)
      }
      await this.createComeBack()
    }

    scheduleWeekOfNotifications = async (interval, amount, start) => {
        let tempNotificationID = []
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
              shouldShowAlert: true,
              shouldPlaySound: true,
              shouldSetBadge: false,
            }),
        });
        const firstTrigger = this.fixTime(start) /////////////////////// UPDATE
        for (let i = 1; i <= 6; i++){
            let secondTrigger = new Date(firstTrigger.getTime() + (i * 60 * 60 * 24 * 1000)) //////////////////////////// UPDATE
            for (let i = 1; i <= amount; i++){
                let trigger = new Date(secondTrigger.getTime() + (i*interval*60000)) ////////////////// UPDATE
                trigger.setSeconds(0)
                let id = await Notifications.scheduleNotificationAsync({
                    content: {
                        title: 'Daily Reminder',
                        body: this.getNotificationBody(),
                    },
                    trigger,
                })       
                tempNotificationID = [...tempNotificationID, id]
            }
        }
        const endOfReminderNotification = this.fixTime(start)
        endOfReminderNotification.setHours(24*7)
        this.setState({notificationID: tempNotificationID, ...this.state.notificationID, endOfReminderNotification: endOfReminderNotification.getTime()})
    }

    handleTodayNotificationsBeforeTime = async (interval, amount, start) => {
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
              shouldShowAlert: true,
              shouldPlaySound: true,
              shouldSetBadge: false,
            }),
        }); 
        let tempTrigger = this.fixTime(start) /////////////////// UPDATE
        let trigger = new Date(tempTrigger.getTime() + (interval*60000)) ////////////////// UPDATE
        let id = await Notifications.scheduleNotificationAsync({
            content: {
                title: 'Daily Reminder',
                body: this.getNotificationBody(),
            },
            trigger,
        })       
        this.setState({notificationID: [id, ...this.state.notificationID]})
    }

    handleTodayNotificationsWithinInterval = async (end, currentDate, interval) => {
        let tempNotificationID = []
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
              shouldShowAlert: true,
              shouldPlaySound: true,
              shouldSetBadge: false,
            }),
        });
        const diff = (end - currentDate)
        const todayPossibleNotifications = (Math.floor((diff / 60000) / interval))
        for (let i = 1; i < todayPossibleNotifications + 1; i++){
            let id = await Notifications.scheduleNotificationAsync({
                content: {
                    title: 'Daily Reminders',
                    body: this.getNotificationBody(), 
                },
                trigger: {
                    seconds: (interval*i*60),
                    repeats: false,
                }
            })
            tempNotificationID = [...tempNotificationID, id]
        }
        this.setState({notificationID: [tempNotificationID, ...this.state.notificationID]})
    }

    getNotificationBody = () => {
      const random = Math.floor(Math.random() * reminderChoices.length)
      return reminderChoices[random] + this.state.title
    }

    fixTime = (minuteVar) => {
      let date = new Date(Date.now())
      let hours = Math.floor(minuteVar / 60)
      let minutes = minuteVar % 60
      date.setHours(hours)
      date.setMinutes(minutes)
      date.setSeconds(0)
      return date
    }

    processTime = () => {
      // start
      let startHourMultiplier = 60
      let startAdd = 0
      if (this.state.startTimeHours === 12 && this.state.startTimeDay){
        startHourMultiplier = 0
      }
      if (!this.state.startTimeDay && this.startTimeHours !== 12){
        startAdd = 720
      }
      let startTime = this.state.startTimeMinutes + (this.state.startTimeHours * startHourMultiplier) + startAdd
      // end
      let endHourMultiplier = 60
      let endAdd = 0
      if (this.state.endTimeHours === 12 && this.state.endTimeDay){
        endHourMultiplier = 0
      }
      if (!this.state.endTimeDay && this.endTimeHours !== 12){
        endAdd = 720
      }
      let endTime = this.state.endTimeMinutes + (this.state.endTimeHours * endHourMultiplier) + endAdd

      return {startTime, endTime}
    }

    checker = (endTime, startTime, amount) => {
      if (this.state.title === ""){
        Alert.alert("Please put in your desired reminder.")
        return true
      }
      if (endTime < startTime) {
        Alert.alert("Please select an end time greater than a start time.")
        return true
      }
      if (endTime === startTime && amount !== 1){
        Alert.alert("If the end and start times are the same, you are only allowed one notification")
        return true
      }
    }
    
    reversalTime = (time) => {
      let timeOfDay = true
      let hours = 0
      let minutes = 0
      if (time === 720) {
        timeOfDay = false
        hours = 12
        minutes = 0
      } else if (time === 0) {
        timeOfDay = true
        hours = 12
        minutes = 0
      } else if (time > 720) {
        timeOfDay = false
        time = time - 720
        minutes = time % 60
        hours = Math.floor(time / 60)
      } else if (time < 720) {
        timeOfDay = true
        minutes = time % 60
        hours = Math.floor(time / 60)
      }
      return {timeOfDay, hours, minutes}
    }

    createComeBack = async () => {
      // Check if there is one, then cancel
      const prevJSON = await AsyncStorage.getItem("comeBack")
      const prevData = JSON.parse(prevJSON)
      if (prevData !== null){
        await Notifications.cancelScheduledNotificationAsync(prevData).then().catch(err => console.log(err))
        await AsyncStorage.removeItem("comeBack")
      }
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
      let randTimeHours = Math.floor(Math.random() * (17 - 8) + 8)
      let randTimeMinutes = Math.floor(Math.random() * 60)
      let randComeBackText = Math.floor(Math.random() * comeBackText.length)
      let trigger = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000)
      trigger.setHours(randTimeHours)
      trigger.setMinutes(randTimeMinutes)
      trigger.setSeconds(0)
      let id = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'CHANGE THIS',
          body: comeBackText[randComeBackText],
        },
        trigger,
      })
      const idJSON = JSON.stringify(id)
      await AsyncStorage.setItem("comeBack", idJSON)
    }
    ///////////////////////////////// NOTIFICATION HANDLERS /////////////////////////////////

    seeAllQueuedNotifications = async () => {
      console.log("-----------------------------")
      // await AsyncStorage.removeItem("DailyReminders")
      // await Notifications.cancelAllScheduledNotificationAsync()
      await Notifications.getAllScheduledNotificationsAsync().then(arr => console.log(arr)).catch(err => console.log(err))
      const json = await AsyncStorage.getItem("DailyReminders")
      console.log(JSON.parse(json))
    }

    render() {
      if (this.state.isLoading) {
        return (
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1D3663'}}>
            <ActivityIndicator size="large" color="#F3F1E0"/>
          </View>
        );
      } else {
        return (
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
              <View style={styles.mainContainer}>
                <View style={styles.headerContainer}>
                  <Text style={styles.headerText}>Edit Reminder</Text>
                </View>
                <View style={styles.textInputContainer}>
                  <View style={styles.textInputHeaderContainer}>
                    <Text style={styles.textInputHeaderText}>
                       Reminder
                    </Text>
                  </View>
                  <View style={styles.textInputRow}>
                    <View style={styles.textInputOne}>
                      <TextInput 
                      value={this.state.title}
                      style={styles.textInput}
                      onChangeText={title => this.setState({title})}
                      maxLength={25}
                      />
                    </View>
                    <View style={styles.textInputTwo}>
                      <View style={{borderBottomColor: '#F3F1E0', borderBottomWidth: 1, alignSelf: 'baseline', flex: 1, alignItems: 'flex-end'}}>
                        <Text style={styles.characterCounter}>{this.state.title.length} / 25</Text>
                      </View>
                    </View>
                  </View>
                </View>
                <View style={styles.timeMainContainer}>
                  <View style={styles.timeHeaderContainer}>
                    <Text style={styles.timeHeaderText}>Time</Text>
                  </View>
                  <View style={styles.timeContainer}>
                    <View style={styles.pickerContainerOne}>
                      <View style={styles.pickerHoursOne}>
                        <Picker
                          selectedValue={this.state.startTimeHours}
                          itemStyle={styles.pickerStyles}
                          onValueChange={(itemValue, itemIndex) =>
                            this.setState({startTimeHours: itemValue, endTimeHours: itemValue})
                          }>
                          { 
                          hours.map(item => (
                            <Picker.Item label={item.time} value={item.value} key={item.value} />
                          ))
                          }  
                        </Picker>
                      </View>
                      <View style={styles.pickerMinutesOne}>
                        <Picker
                          key={(item) => (item.value)}
                          selectedValue={this.state.startTimeMinutes}
                          itemStyle={styles.pickerStyles}
                          onValueChange={(itemValue, itemIndex) =>
                            this.setState({startTimeMinutes: itemValue, endTimeMinutes: itemValue})
                          }>
                          { 
                          minutes.map(item => (
                            <Picker.Item label={item.time} value={item.value} key={item.value} />
                          ))
                          }  
                        </Picker>
                      </View>
                      <View style={styles.pickerDayOne}>
                        <Picker
                          selectedValue={this.state.startTimeDay}
                          itemStyle={styles.pickerStyles}
                          onValueChange={(itemValue, itemIndex) =>
                            this.setState({startTimeDay: itemValue, endTimeDay: itemValue})
                          }>
                          { 
                          timeOfDay.map(item => (
                            <Picker.Item label={item.label} value={item.value} key={item.value} />
                          ))
                          }  
                        </Picker>
                      </View>
                    </View>
                    <View style={{flex: 0.5}}/>
                  </View>
                </View>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity style={styles.bottomButton} onPress={() => {this.updateNotification()}}>
                      <LinearGradient colors={["#4b6cb7", "#182848"]} style={styles.buttonGradient}>
                          <Text style={styles.buttonText}>Done</Text>
                      </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
        );
      }
    }
}

function buttonLogic() {
  const height = Dimensions.get('window').height
  console.log(height)
  if (height < 700){
      return 15
  } else {
      return 25
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: Dimensions.get("window").width * 0.03,
    paddingRight: Dimensions.get("window").width * 0.03,
    paddingTop: Constants.statusBarHeight,
    backgroundColor: "#1D3663",
  }, 

  // HEADER
  headerContainer: {
    flex: 1,
    width: '100%'
  }, 
  headerText: {
    fontSize: RFPercentage(5),
    color: '#F3F1E0',
    fontFamily: 'Montserrat'
  },


  // TEXT INPUT
  textInputContainer: {
    flex: 2,
  },
  textInputHeaderContainer: {
    borderBottomColor: '#EEB067', 
    borderBottomWidth: 3, 
    alignSelf: 'baseline', 
    paddingBottom: 5,
    marginBottom: 15
  },
  textInputHeaderText: {
    fontSize: RFPercentage(3),
    color: '#F3F1E0',
    fontFamily: 'Raleway'
  },
  textInputRow: {
    width: '100%',
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 20,
  },
  textInputOne: {
    flex: 12,
  },
  textInputTwo: {
    flex: 3,
    alignItems: 'flex-end',
  },
  textInput: {
    borderBottomColor: '#F3F1E0',
    borderBottomWidth: 1,
    width: '90%',
    paddingBottom: 10,
    color: '#F3F1E0',
    fontSize: RFPercentage(2.75),
    fontFamily: 'Raleway'
  },
  characterCounter: {
    color: '#F3F1E0',
    fontSize: RFPercentage(3),
    paddingBottom: 10,
    fontFamily: 'Montserrat'
  },



  // PICKER CONTAINER
  timeMainContainer: {
    flex: 5,
  },
  timeHeaderContainer: { 
    paddingBottom: 5,
  },
  timeHeaderText: {
    fontSize: RFPercentage(3),
    color: '#F3F1E0',
    fontFamily: 'Raleway'
  },
  pickerContainerOne: {
    flex: 1,
    flexDirection: "row",
    borderColor: '#EEB067', 
    borderWidth: 3, 
  }, timeContainer: {
    flexDirection: 'row',
    height: 200,
  }, pickerHoursOne: {
    flex: 1,
  }, pickerMinutesOne: {
    flex: 1,
  }, pickerDayOne: {
    flex: 1,
  }, 
  pickerStyles: {
    color: '#F3F1E0',
    fontSize: RFPercentage(3)
  },

  // BUTTON
  buttonContainer: {
    flex: 1,
    paddingLeft: Dimensions.get('window').width * 0.1,
    paddingRight: Dimensions.get('window').width * 0.1,
    alignItems: 'center',
    justifyContent: 'center'
    // paddingTop: Dimensions.get('window').height * 0.05,
    // paddingBottom: Dimensions.get('window').height * 0.05,
  }, 
  bottomButton: {
    marginTop: 30,
    marginBottom: 30,
    width: '100%',
    height: '60%'
  },
  buttonText: {
    color: '#F3F1E0',
    fontSize: RFPercentage(3),
    fontFamily: 'Montserrat'
  },
  buttonGradient: {
    flex: 1, 
    borderRadius: buttonLogic(), 
    justifyContent: 'center', 
    alignItems: 'center',
    width: '100%'
  },
})