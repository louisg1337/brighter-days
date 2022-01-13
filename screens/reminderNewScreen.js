import React from 'react'
import { StyleSheet, Text, View, SectionList, TextInput, ActivityIndicator, TouchableOpacity, Button, Dimensions, Alert, TouchableWithoutFeedback, Keyboard } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {Picker} from '@react-native-community/picker';
import * as Notifications from 'expo-notifications'
import AsyncStorage from '@react-native-community/async-storage';
import { reminderChoices } from "../data/reminderData"
import { minutes, hours, timeOfDay } from "../data/time"
import { comeBackText } from "../data/comeBack"
import Constants from 'expo-constants'
import { LinearGradient } from 'expo-linear-gradient'
import {RFPercentage} from 'react-native-responsive-fontsize'
import loadFont from '../reusableComponents/font'
import * as Permissions from 'expo-permissions'


export default class reminderNewScreen extends React.Component {
    static navigationOptions = {
      headerShown: false,
    }  

    constructor(props){
        super(props);
        this.state = {
          isLoading: true,
          hasAccess: false,
          notificationID: [],
          message: "",
          startTimeMinutes: 0,
          startTimeHours: 1,
          startTimeDay: '1',
          endTimeMinutes: 0,
          endTimeHours: 1,
          endTimeDay: '1',
          amount: 1
        }
    }

    async componentDidMount() {
      const { navigation } = this.props;
      this.focusListener = navigation.addListener("didFocus", async () => {

        await this.allowsNotificationsAsync()
        await loadFont()
        this.setState({isLoading: false})
      });
      await this.requestPermissionsAsync()
      await this.allowsNotificationsAsync()
      await loadFont()
      this.setState({isLoading: false})
    }

    componentWillUnmount() {
      // Remove the event listener
      this.focusListener.remove();
    }

    //////////////////////// PERMS //////////////////////
    requestPermissionsAsync = async () => {
      return await Permissions.askAsync(Permissions.NOTIFICATIONS)
    }

    allowsNotificationsAsync = async() => {
      const status = await Notifications.getPermissionsAsync()
      if (!status.granted){
          return
      } else {
          console.log("Permissions on")
          this.setState({hasAccess: true})
      }
    }

    allowsNotificationsChecker = async() => {
      const status = await Notifications.getPermissionsAsync()
      return status.granted
    }
    //////////////////////// PERMS //////////////////////


    // TEST
    seeAllQueuedNotifications = async () => {
      console.log("-----------------------------")
      await Notifications.getAllScheduledNotificationsAsync().then(arr => {console.log(arr)}).catch(err => console.log(err))
      const json = await AsyncStorage.getItem('DailyReminders')
      console.log(JSON.parse(json))
    }

    cancelAllNotifications = async () => {
        await Notifications.cancelAllScheduledNotificationsAsync().then(console.log("Clear!")).catch(err => console.log(err))
        await AsyncStorage.removeItem("DailyReminders")
    }
    // TEST

    createNotificationActually = async (amount) => {
      if (this.allowsNotificationsChecker()){
        await this.processTime()
        const endTime = this.state.endTime
        const startTime = this.state.startTime
        if (this.checker(endTime, startTime, amount)){
          return
        }
        this.setState({isLoading: true})
        console.log("GOING THROUGH")
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
        await this.saveNotificationData(amount, startTime, endTime, this.state.notificationID, this.state.endOfReminderNotification, this.state.message)
        this.props.navigation.navigate("Reminder")
      } else {
        return
      }
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
        const notificationID = [...tempNotificationID, ...this.state.notificationID]
        const endOfReminderNotification = this.fixTime(start)
        endOfReminderNotification.setHours(24*7)
        this.setState({notificationID, endOfReminderNotification: endOfReminderNotification.getTime()})
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
        const notificationID = [id, ...this.state.notificationID]       
        this.setState({notificationID})
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
        for (let i = 1; i <= todayPossibleNotifications; i++){
            let id = await Notifications.scheduleNotificationAsync({
                content: {
                    title: 'Daily Reminder',
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

    saveNotificationData = async (amount, startTime, endTime, notificationID, endOfReminderNotification, message) => {
      const shortid = require('shortid');
      const uuid = shortid.generate()
      const data = [{
        id: uuid,
        title: message,
        start: startTime,
        end: endTime,
        amount: amount,
        endOfReminder: endOfReminderNotification,
        notificationID: notificationID
      }]
      const dataJSON = JSON.stringify(data)
      try {
        const prevDataJson = await AsyncStorage.getItem("DailyReminders")
        const prevData = JSON.parse(prevDataJson)
        if (prevData !== null) {
          const combined = [...prevData, data[0]]
          const combinedJSON = JSON.stringify(combined)
          await AsyncStorage.setItem("DailyReminders", combinedJSON)
          console.log("Has previous data, adding it on")
        } else {
          await AsyncStorage.setItem("DailyReminders", dataJSON)
          console.log("No previous data")
        }
      } catch (e) {
          console.log(e)
      }
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

    resetAndCheck = async () => {
      const json = await AsyncStorage.getItem("DailyReminders")
      console.log(JSON.parse(json))
      // await AsyncStorage.removeItem("DailyReminders")
    }

    getNotificationBody = () => {
      const random = Math.floor(Math.random() * reminderChoices.length)
      return reminderChoices[random] + this.state.message
    }

    processTime = () => {
      // start
      //true AM false PM
      let startHourMultiplier = 60
      let startAdd = 0
      if (this.state.startTimeHours === 12 && this.state.startTimeDay){
        startHourMultiplier = 0
      }
      if (!this.state.startTimeDay){
        startAdd = 720
        if (this.state.startTimeHours === 12){
          startHourMultiplier = 0
        }
      }
      let startTime = this.state.startTimeMinutes + (this.state.startTimeHours * startHourMultiplier) + startAdd
      this.setState({startTime})
      // end
      let endHourMultiplier = 60
      let endAdd = 0
      if (this.state.endTimeHours === 12 && this.state.endTimeDay){
        endHourMultiplier = 0
      }
      if (!this.state.endTimeDay){
        endAdd = 720
        if(this.state.endTimeHours === 12){
          endHourMultiplier = 0
        }
      }
      let endTime = this.state.endTimeMinutes + (this.state.endTimeHours * endHourMultiplier) + endAdd
      this.setState({endTime})
    }

    checker = (endTime, startTime, amount) => {
      if (this.state.message === ""){
        Alert.alert("Please put in your desired reminder.")
        return true
      }
      if (endTime < startTime) {
        console.log(startTime)
        console.log(endTime)
        Alert.alert("Please select an end time greater than a start time.")
        return true
      }
      if (endTime === startTime && amount !== 1){
        Alert.alert("If the end and start times are the same, you are only allowed one notification")
        return true
      }
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
          body: comeBackText[randComeBackText],
        },
        trigger,
      })
      const idJSON = JSON.stringify(id)
      await AsyncStorage.setItem("comeBack", idJSON)
    }

    render() {
      if (this.state.isLoading){
        return (
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1D3663'}}>
            <ActivityIndicator size="large" color="#F3F1E0"/>
          </View>
        );
      } else {
        if (this.state.hasAccess){
          return (
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
              <View style={styles.mainContainer}>
                <View style={styles.headerContainer}>
                  <Text style={styles.headerText}>New Reminder</Text>
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
                      style={styles.textInput}
                      onChangeText={message => this.setState({message})}
                      maxLength={25}
                      />
                    </View>
                    <View style={styles.textInputTwo}>
                      <View style={{borderBottomColor: '#F3F1E0', borderBottomWidth: 1, alignSelf: 'baseline', flex: 1, alignItems: 'flex-end'}}>
                        <Text style={styles.characterCounter}>{this.state.message.length} / 25</Text>
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
                  {/* <Button title="Queued" onPress={() => {this.seeAllQueuedNotifications()}}></Button>
                  <Button title="Check and Reset" onPress={() => {this.resetAndCheck()}} />
                  <Button title="Cancel" onPress={() => {this.cancelAllNotifications()}}></Button>
                  <Button title="Test" onPress={async () => {
                    await Notifications.scheduleNotificationAsync({
                      content: {
                          title: 'Daily Reminder',
                          body: "Get u bread", 
                      },
                      trigger: {
                          seconds: 5,
                          repeats: false,
                      }
                  })
                  console.log('done')
                  }}></Button> */}
                </View>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity style={styles.bottomButton} onPress={() => {this.createNotificationActually(this.state.amount)}}>
                      <LinearGradient colors={["#4b6cb7", "#182848"]} style={styles.buttonGradient}>
                          <Text style={styles.buttonText}>Done</Text>
                      </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          );
        } else {
          return(
            <View style={styles.mainContainer}>
              <Text style={{color: '#F3F1E0', fontSize: RFPercentage(3), textAlign: 'center', marginLeft: '5%', marginRight: '5%'}}>Please allow access to notifications to use this feature.</Text>
            </View>
          );
        }
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
    fontSize: RFPercentage(3),
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