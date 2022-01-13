import React from 'react'
import { StyleSheet, Text, View, SectionList, Dimensions, TouchableOpacity, Alert, ActivityIndicator, TouchableWithoutFeedback } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { generalQuotes, quoteChoices } from '../data/getQuotes'
import { Entypo } from '@expo/vector-icons';
import AsyncStorage from "@react-native-community/async-storage"
import { SafeAreaView } from 'react-navigation';
import * as Notifications from 'expo-notifications'
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { gradients } from '../data/getGradients'
import { comeBackText } from '../data/comeBack'
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";
import * as SMS from 'expo-sms';
import * as Font from 'expo-font'
import PremiumAd from '../reusableComponents/premiumAd'
import { SimpleAnimation } from 'react-native-simple-animations/simple-animation';
import { reminderChoices } from '../data/reminderData'


export default class QuoteScreen extends React.Component {
    static navigationOptions = {
      headerShown: false
    }  

    constructor(props){
        super(props);
        this.state = {
          isLoading: true,
          quoteChoicesNumbers: [],
          data: [],
          notificationID: [],
          general: true,
          showPaid: false,
        }
    }

    async componentDidMount(){
      console.log("-----------------------------")
      const { navigation } = this.props;
      this.focusListener = navigation.addListener("didFocus", async () => {
        console.log("1")
        await this.loadFont()
        await this.getData()
        await this.getDataForQuoteNotifications()
        await this.setState({isLoading: false})
      });
      this.unfocus = navigation.addListener('willBlur', () => {
        this.setState({isLoading: true})
        console.log('okay')
      })
      console.log("2")
      await this.loadFont()
      await this.allowsNotificationsAsync().then(async (settings) => {
        await this.checkReminders(settings)
        await this.getDataForQuoteNotifications(settings)
      })
      await this.getData()
      await this.setState({isLoading: false})
    }

    componentWillUnmount() {
      // Remove the event listener
      this.focusListener.remove();
      this.unfocus.remove()
    }

    loadFont = async () => {
      await Font.loadAsync({
        Raleway: require('../assets/fonts/Raleway-Regular.ttf'),
        RalewayItalic: require('../assets/fonts/Raleway-Italic.ttf'),
        Montserrat: require('../assets/fonts/Montserrat-Regular.ttf'),
      })
    }

    getData = async () => {
      try {
        const jsonChoices = await AsyncStorage.getItem('QuoteChoicesId')
        const choicesValue = JSON.parse(jsonChoices)

        if (choicesValue === null || choicesValue.length === 0) {
          // ADD GRADIENTS TO DATA
          const generalQuotesSaved = generalQuotes
          generalQuotesSaved.map(value => {
            value['gradient'] = this.getGradient()
          })
          this.setState({
            data: generalQuotesSaved
          })
        } else {
          this.setState({
            quoteChoicesNumbers: choicesValue,
          })
          this.createQuoteData(choicesValue)
        }

        // if (choicesValue.length !== 0) { // here
        //   this.setState({
        //     quoteChoicesNumbers: choicesValue,
        //   })
        //   this.createQuoteData(choicesValue)
        // } else {
        //   // ADD GRADIENTS TO DATA
        //   const generalQuotesSaved = generalQuotes
        //   generalQuotesSaved.map(value => {
        //     value['gradient'] = this.getGradient()
        //   })
        //   this.setState({
        //     data: generalQuotesSaved
        //   })
        // }

      } catch (error) {
        Alert.alert(error)
      }
    }

    shuffleQuotes = (array) => {
      var m = array.length, t, i;
      while (m) {
        i = Math.floor(Math.random() * m--);
        t = array[m];
        array[m] = array[i];
        array[i] = t;
      }
      return array;
    }

    createQuoteData = (choiceNumbers) => {
      const choices = choiceNumbers
      let tempData = []
      choices.map((value) => {
        tempData = [...tempData, quoteChoices[value]]
      })
      const newData = this.shuffleQuotes(tempData.flat(1))
      newData.map(value => {
        value['gradient'] = this.getGradient()
      })
      this.setState({
        data: newData,
        isLoading: false
      })
    }

    getGradient = () => {
      const rand = Math.floor(Math.random() * gradients.length)
      return gradients[rand]
    }

    sendQuote = async (tempQuote, title) => {
      const isAvailable = await SMS.isAvailableAsync();
      let fixedTitle = ""
      let quote = tempQuote
      if (isAvailable) {
        if (title.length !== 0){
          fixedTitle = " - " + title
          quote = '"' + quote + '"'
        }
        const { result } = await SMS.sendSMSAsync(
          ['            '],
          quote + fixedTitle + "\n\nMake sure you get some positivity in your day today!",
        );
      } else {
        Alert.alert("Unable to share quotes, sorry!")
        return
      } 
    }

    iconFix = () => {
      const height = Dimensions.get('window').height
      if (height < 700){
          return 18
      } else {
          return 24
      }
    }

    ///////////////////////////////////////////
    /////// QUOTE NOTIFICATION CHECKER ////////
    ///////////////////////////////////////////

    getDataForQuoteNotifications = async (access) => {
      if (access){
        const jsonEndOfQuote = await AsyncStorage.getItem('endOfQuoteNotification')
        if (jsonEndOfQuote !== null) {
          const valueMS = JSON.parse(jsonEndOfQuote)
          const temp = new Date()
          const endOfQuoteNotification = temp.setTime(valueMS)
          const currentDate = new Date(Date.now())
          //const currentDate = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000) // CHECKER 
          const diff = (endOfQuoteNotification-currentDate)
          if (diff <= 172800000){
            console.log("within 3 days")
            const amountJSON = await AsyncStorage.getItem('quoteNotificationAmount')
            const startTimeJSON = await AsyncStorage.getItem('quoteNotificationStart')
            const endTimeJSON = await AsyncStorage.getItem('quoteNotificationEnd')
            const amount = JSON.parse(amountJSON)
            const startTime = JSON.parse(startTimeJSON)
            const endTime = JSON.parse(endTimeJSON)
            this.createNotificationActually(startTime, endTime, amount)
          }
        }
      } else {
        return
      }
    }

    createNotificationActually = async (startTime, endTime, amount) => {
      this.setState({isLoading: true})
      await this.cancelNotifications()

      let currentDate = new Date(Date.now())
      let start = this.zeroTime(startTime)
      let end = this.zeroTime(endTime)
      const interval = ((endTime-startTime) * 60 / amount)
      if (interval === 0) {
        interval = 1
      }
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
      // months worth
      await this.createComeBack()
      await this.saveNotificationData(amount, startTime, endTime, this.state.notificationID, this.state.endOfQuoteNotification)
      this.setState({isLoading: false})
    }

    saveNotificationData = async (amount, startTime, endTime, notificationID, endOfQuoteNotification) => {
        try {
            const jsonAmount = JSON.stringify(amount)
            const jsonStart = JSON.stringify(startTime)
            const jsonID = JSON.stringify(notificationID)
            const jsonEnd = JSON.stringify(endTime)
            const jsonNotificationEnd = JSON.stringify(endOfQuoteNotification)
            await AsyncStorage.setItem('quoteNotificationAmount', jsonAmount)
            await AsyncStorage.setItem('quoteNotificationStart', jsonStart)
            await AsyncStorage.setItem('quoteNotificationID', jsonID)
            await AsyncStorage.setItem('quoteNotificationEnd', jsonEnd)
            await AsyncStorage.setItem('endOfQuoteNotification', jsonNotificationEnd)
        } catch (e) {
            console.log(e)
        }
    }

    scheduleWeekOfNotifications = async (interval, amount, start) => {
        let tempNotificationID = []
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
              shouldShowAlert: true,
              shouldPlaySound: false,
              shouldSetBadge: false,
            }),
        });
        for (let i = 1; i <= 6; i++){
            const trigger = new Date(Date.now())
            trigger.setHours((i * 24)) 
            for (let i = 1; i <= amount; i++){
                trigger.setHours(start)
                trigger.setMinutes((i*interval))
                trigger.setSeconds(0)
                let id = await Notifications.scheduleNotificationAsync({
                    content: {
                        body: this.quoteChecker(),
                    },
                    trigger,
                })       
                tempNotificationID = [...tempNotificationID, id]
            }
        }
        const notificationID = [...tempNotificationID, ...this.state.notificationID]
        const endOfQuoteNotification = this.zeroTime((24*7))
        this.setState({notificationID, endOfQuoteNotification: endOfQuoteNotification.getTime()})
    }

    handleTodayNotificationsBeforeTime = async (interval, amount, start) => {
        let tempNotificationID = []
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
              shouldShowAlert: true,
              shouldPlaySound: false,
              shouldSetBadge: false,
            }),
        });
        for (let i = 1; i <= amount; i++){ 
            const trigger = new Date(Date.now() + 60 * 60 * 1000)
            trigger.setHours(start)
            trigger.setMinutes((i*interval))
            trigger.setSeconds(0)
            let general = this.state.general
            let id = await Notifications.scheduleNotificationAsync({
                content: {
                    body: this.quoteChecker(),
                },
                trigger,
            })       
            tempNotificationID = [...tempNotificationID, id]
        } 
        const notificationID = [...tempNotificationID, ...this.state.notificationID]
        this.setState({notificationID})
    }

    handleTodayNotificationsWithinInterval = async (end, currentDate, interval) => {
        let tempNotificationID = []
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
              shouldShowAlert: true,
              shouldPlaySound: false,
              shouldSetBadge: false,
            }),
        });
        const diff = (end - currentDate)
        const todayPossibleNotifications = (Math.floor((diff / 60000) / interval))
        for (let i = 1; i < todayPossibleNotifications + 1; i++){
            let id = await Notifications.scheduleNotificationAsync({
                content: {
                    body: this.quoteChecker(), 
                },
                trigger: {
                    seconds: (interval * i * 60),
                    repeats: false,
                }
            })
            tempNotificationID = [...tempNotificationID, id]
        }
        const notificationID = [...tempNotificationID, ...this.state.notificationID]
        this.setState({notificationID})
    }

    getTime = (interval, i, start) =>{
      const compare = new Date(Date.now() + 24 * 60 * 60 * 1000)
      compare.setHours(start)
      compare.setMinutes(interval*i)
      const currentDate = new Date(Date.now())
      const diff = (compare - currentDate) / 6000
      return diff
    }

    zeroTime = (hour) => {
      let date = new Date(Date.now())
      date.setHours(hour)
      date.setMinutes(0)
      date.setSeconds(0)
      return date
    }

    cancelNotifications =  async () => {
      try {
          const jsonID = await AsyncStorage.getItem('quoteNotificationID')
          const id = JSON.parse(jsonID)
          if (id !== null){
              await id.map((item) => {
                console.log(item)
                  this.cancelAsyncMap(item)
              })
              console.log("REMOVING")
              await AsyncStorage.removeItem('quoteNotificationID')
              await AsyncStorage.removeItem('quoteNotificationAmount')
              await AsyncStorage.removeItem('quoteNotificationStart')
              await AsyncStorage.removeItem('quoteNotificationEnd')
              await AsyncStorage.removeItem('endOfQuoteNotification')
              await AsyncStorage.getAllKeys().then(arr => console.log(arr)).catch(e => console.log(e))
          } else {
          }
      } catch (e) {
          console.log(e)
      }
    }

    cancelAsyncMap = async (id) => {
        await Notifications.cancelScheduledNotificationAsync(id).then().catch(err => console.log(err))
    }

    getGeneralQuotes = () => {
      const rand = Math.floor(Math.random() * generalQuotes.length)
      let title = ''
      let quote = generalQuotes[rand].data[0]
      if (generalQuotes[rand].title.length !== 0){
          title = " -" + generalQuotes[rand].title
          quote = '"' + quote + '"'
      }
      return quote + title
    }

    getSpecificQuotes = () => {
        const arrayID = this.state.QuoteChoicesID
        const firstRand = Math.floor(Math.random() * arrayID.length)
        const chosenCategory = arrayID[firstRand]
        const secondRand = Math.floor(Math.random() * quoteChoices[chosenCategory].length)
        let title = ''
        let quote = quoteChoices[chosenCategory][secondRand].data[0]
        if (quoteChoices[chosenCategory][secondRand].title.length !== 0){
            title = " -" + quoteChoices[chosenCategory][secondRand].title
            quote = '"' + quote + '"'
        }
        return quote + title
    }

    quoteChecker = () => {
        if (this.state.general) {
            return this.getGeneralQuotes()
        } else {
            return this.getSpecificQuotes()
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

    ///////////////////////////////////////////
    ///// END QUOTE NOTIFICATION CHECKER //////
    ///////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////// NOTIFCATION HANDLER //////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////

    checkReminders = async (access) => {
      if (access) {
        console.log("/////////////////////////")
        const check = await AsyncStorage.getItem("DailyReminders")
        const checkData = JSON.parse(check)
        if (check !== null){
          await this.checkReminderConnector(checkData)
        }
      }
    }

    checkReminderConnector = async (checkData) => {
      let count = 0
      await Promise.all(checkData.map( async (item, index) => {
        count++;
        const temp = new Date()
        const endOfReminder = temp.setTime(item.endOfReminder)
        const currentDate = new Date(Date.now())
        //const currentDate = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)
        const diff = (endOfReminder-currentDate)
        await this.checkReminderTwoConnector(item, index, diff, count)
      }))
    }

    checkReminderTwoConnector = async (item, index, diff, count) => {
      // Within 3 days
      if (diff <= 172800000){
        console.log(index)
        await Promise.all(item.notificationID.map(async (id) => {
          await this.cancelAsyncMapReminders(id)
        })).then(async () => {
          await this.createNotificationActuallyReminders(item.start, item.end, item.amount, item.title, item.id, index)
        })
        if (count === 1){
          await this.createComeBackReminders()
        } 
      } else {
        return
      }
    }

    createNotificationActuallyReminders = async (startTime, endTime, amount, title, id, index) => {
        this.setState({isLoading: true})
        let currentDate = new Date(Date.now())
        let start = this.fixTimeReminders(startTime)
        let end = this.fixTimeReminders(endTime)
        let interval = ((endTime-startTime) / amount)
        const weekObj = await this.scheduleWeekOfNotificationsReminders(interval, amount, startTime, title)
        if (currentDate >= end) {
            await this.updateNotificationReminders(amount, startTime, endTime, weekObj.notificationID, weekObj.endOfReminderNotification, title, id, index) 
        } else if (currentDate < end && currentDate >= start) {
            await this.handleTodayNotificationsWithinIntervalReminders(end, currentDate, interval, title)
            // DOSENT MATTER BUT IM NOT GOING TO GET RID
        } else if (currentDate < start) {
            const oneID = await this.handleTodayNotificationsBeforeTimeReminders(interval, amount, startTime, title)
            const notificationIDNew = [...weekObj.notificationID, oneID]
            await this.updateNotificationReminders(amount, startTime, endTime, notificationIDNew, weekObj.endOfReminderNotification, title, id, index)
        }
    }

    scheduleWeekOfNotificationsReminders = async (interval, amount, start, title) => {
        let tempNotificationID = []
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
              shouldShowAlert: true,
              shouldPlaySound: true,
              shouldSetBadge: false,
            }),
        });
        const firstTrigger = this.fixTimeReminders(start) /////////////////////// UPDATE
        for (let i = 1; i <= 6; i++){
            let secondTrigger = new Date(firstTrigger.getTime() + (i * 60 * 60 * 24 * 1000)) //////////////////////////// UPDATE
            for (let i = 1; i <= amount; i++){
                let trigger = new Date(secondTrigger.getTime() + (i*interval*60000)) ////////////////// UPDATE
                trigger.setSeconds(0)
                let id = await Notifications.scheduleNotificationAsync({
                    content: {
                        title: 'Daily Reminder',
                        body: this.getNotificationBodyReminders(title),
                    },
                    trigger,
                })       
                tempNotificationID = [...tempNotificationID, id]
            }
        }
        const notificationID = [...tempNotificationID, ...this.state.notificationID]
        const endOfReminderNotification = this.fixTimeReminders(start)
        endOfReminderNotification.setHours(24*7)
        return {endOfReminderNotification: endOfReminderNotification.getTime(), notificationID}
    }

    handleTodayNotificationsBeforeTimeReminders = async (interval, amount, start, title) => {
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
              shouldShowAlert: true,
              shouldPlaySound: true,
              shouldSetBadge: false,
            }),
        });
        let tempTrigger = this.fixTimeReminders(start) /////////////////// UPDATE
        let trigger = new Date(tempTrigger.getTime() + (interval*60000)) ////////////////// UPDATE
        let id = await Notifications.scheduleNotificationAsync({
            content: {
                title: 'Daily Reminder',
                body: this.getNotificationBodyReminders(title),
            },
            trigger,
        })       
        return id
    }

    handleTodayNotificationsWithinIntervalReminders = async (end, currentDate, interval, title) => {
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
                  body: this.getNotificationBodyReminders(title),
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

    updateNotificationReminders = async (amount, start, end, notificationID, endOfReminder, title, id, index) => {
      const prevDataJson = await AsyncStorage.getItem("DailyReminders")
      const prevData = JSON.parse(prevDataJson)
      const data = [{
        id: id,
        title: title,
        start: start,
        end: end,
        amount: amount,
        endOfReminder: endOfReminder,
        notificationID: notificationID,
      }]
      try {
        if (prevData.length !== 1){
          prevData.splice(index, 1, data[0])
          const fixedJSON = JSON.stringify(prevData)
          await AsyncStorage.setItem("DailyReminders", fixedJSON)
        } else {
          await AsyncStorage.removeItem("DailyReminders")
          const dataJSON = JSON.stringify(data)
          await AsyncStorage.setItem("DailyReminders", dataJSON)
        }
      } catch (e) {
          console.log(e)
      }
    }

    fixTimeReminders = (minuteVar) => {
      let date = new Date(Date.now())
      let hours = Math.floor(minuteVar / 60)
      let minutes = minuteVar % 60
      date.setHours(hours)
      date.setMinutes(minutes)
      date.setSeconds(0)
      return date
    }

    getNotificationBodyReminders = (title) => {
      const random = Math.floor(Math.random() * reminderChoices.length)
      return reminderChoices[random] + title
    }

    cancelAsyncMapReminders = async (id) => {
      try {
          await Notifications.cancelScheduledNotificationAsync(id).then().catch(err => console.log(err))
      } catch (e) {
          console.log(e)
      }
    }

    createComeBackReminders = async () => {
      // Check if there is one, then cancel
      const prevJSON = await AsyncStorage.getItem("comeBack")
      const prevData = JSON.parse(prevJSON)
      if (prevData !== null){
        console.log("Deleting old comeback...")
        await Notifications.cancelScheduledNotificationAsync(prevData).then(() => console.log("Deleted old comeback")).catch(err => console.log(err))
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

    /////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////// END NOTIFCATION HANDLER //////////////////////////
    /////////////////////////////////////////////////////////////////////////////////

    // PERMS // 

    allowsNotificationsAsync = async () => {
      const status = await Notifications.getPermissionsAsync()
      return status.granted
    }

    // PERMS //


    render() {
      if (this.state.isLoading){
        return (
          <View style={styles.mainContainer}>
            <ActivityIndicator size="large" color="#F3F1E0"/>
          </View>
        );
      } else {
        return (
          <View style={styles.mainContainer}>
              <SafeAreaView style={{flex: 0}}>
                {this.state.showPaid &&
                <TouchableWithoutFeedback onPress={() => {this.setState({showPaid: false})}}>
                  <View style={styles.paidShield}>
                      <View style={styles.premiumAdContainer}> 
                          <PremiumAd />
                      </View>
                  </View>
                </TouchableWithoutFeedback>
                }
                <View style={styles.topButtonBarContainer}>
                  <SimpleAnimation direction='right' duration={1500} delay={200} distance={100} movementType='slide' style={styles.topButtonBarGrid}>
                    <TouchableOpacity style={styles.floatButtonMore} onPress={() => {this.setState({isLoading: true, justLoaded: false}); this.props.navigation.navigate('QuoteChoice')}}>
                      <Entypo name="grid" size={this.iconFix()} color="#EEB067" />
                    </TouchableOpacity>
                  </SimpleAnimation>
                  <View style={styles.topButtonBarGridMiddle}>
                  </View>
                  <SimpleAnimation direction='left' duration={1500} delay={200} distance={100} movementType='slide' style={[styles.topButtonBarGrid, {alignItems: 'flex-end'}]}>
                    <TouchableOpacity style={styles.floatButtonReminder} onPress={() => {this.setState({isLoading: true, justLoaded: false}); this.props.navigation.navigate('QuoteReminder')}}>
                      <MaterialCommunityIcons name="bell-ring-outline" size={this.iconFix()} color="#EEB067" />
                    </TouchableOpacity> 
                  </SimpleAnimation>
                </View>
                <SimpleAnimation duration={1500} delay={200} direction="up" distance={400} movementType="slide" style={styles.mainContainer}>
                  <SectionList
                  sections={this.state.data}
                  keyExtractor={(item, index) => item + index}
                  renderItem={({ item, section: { title, gradient }}) =>
                    <LinearGradient colors={gradient} style={styles.sectionContainer}>
                      <View style={styles.quoteContainer}>
                        <Text style={styles.quoteText}>{title.length !== 0 ? '"' + item + '"' : item}</Text>
                      </View>
                      <View style={styles.bottomContainer}>
                        <TouchableOpacity style={styles.shareContainer} onPress={() => this.sendQuote(item, title)}>
                          <Feather name="share" size={30} color="#EEB067" style={styles.share} />
                        </TouchableOpacity>
                        <View style={styles.authorContainer}>
                          <Text style={styles.quoteTextAuthor}>{title.length !== 0 ? "- " + title : title}</Text>
                        </View>
                      </View>
                    </LinearGradient>
                  }
                  horizontal={true}
                  showsHorizontalScrollIndicator={false}
                  />
                </SimpleAnimation>
              </SafeAreaView>
          </View>
        );
      }
    }
}

function buttonLogic() {
  const height = Dimensions.get('window').height
  if (height < 700){
      return 50
  } else {
      return 60
  }
}

function buttonLogicTwo() {
  const height = Dimensions.get('window').height
  if (height < 700){
      return 15
  } else {
      return 25
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    // paddingTop: Constants.statusBarHeight,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 10,
    height: '100%',
    backgroundColor: '#1D3663'
  },
  sectionContainer: {
    width: Dimensions.get('window').width * 0.8,
    flex: 1,
    backgroundColor: '#F3F1E0',
    marginRight: Dimensions.get('window').width * 0.1,
    marginLeft: Dimensions.get('window').width * 0.1,
    marginTop: Dimensions.get('window').height * 0.15,
    marginTop: '15%',
    marginBottom: Dimensions.get('window').height * 0.15,
    // alignItems: "center",
    // justifyContent: "center",
    // shadowColor: '#F3F1E0',
    // shadowOffset: {width: 3, height: 3},
    // shadowOpacity: 0.5,
    elevation: 10,
    shadowRadius: 30,
    borderRadius: 40,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 15,
  },
  love: {
    position: 'absolute',
    bottom: 0,
    left: 50,
    paddingLeft: 45,
    paddingBottom: 20
  },
  // HERE
  quoteContainer: {
    paddingLeft: 20,
    paddingRight: 20,
    flex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quoteText: {
    fontSize: RFPercentage(3.25),
    textAlign: 'center',
    //color: "#776388"
    color: '#F3F1E0',
    fontFamily: 'Raleway'
  },
  quoteTextAuthor: {
    fontSize: RFPercentage(2.5),
    //color: '#776388'
    color: '#F3F1E0',
    fontFamily: 'Montserrat'
  },
  // HERE
  bottomContainer: {
    flex: 1,
    flexDirection: 'row'
  },  
  authorContainer: {
    flex: 5,
    justifyContent: 'center',
    alignItems: 'flex-end'
  },
  shareContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  share: {

  },
  headerText: {
    fontSize: 32,
    backgroundColor: "#fff",
    flexDirection: 'row'
  },
  gradientContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatButtonMore: {
    borderWidth: 2,
    borderColor: '#EEB067',
    alignItems: "center",
    justifyContent: "center",
    width: buttonLogic(),
    height: buttonLogic(),
    borderRadius: 100
  },
  floatButtonReminder: {
    borderWidth: 2,
    borderColor: "#EEB067",
    alignItems: "center",
    justifyContent: "center",
    width: buttonLogic(),
    height: buttonLogic(),
    borderRadius: 100
  },
  topButtonBarContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingLeft: Dimensions.get('window').width * 0.03,
    paddingRight: Dimensions.get('window').width * 0.03,
  },
  topButtonBarGrid: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
  },
  topButtonBarGridMiddle: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  proButton: {
    borderWidth: 2,
    borderColor: '#EEB067',
    borderRadius: buttonLogicTwo(),
    paddingLeft: '15%',
    paddingRight: '15%',
    paddingTop: '5%',
    paddingBottom: '5%',
  },
  proText: {
    color: '#F3F1E0',
    fontFamily: 'Raleway',
    fontSize: RFPercentage(2.2)
  },



  paidShield: {
    zIndex: 100,
    position: 'absolute',
    top: 0,
    left: 0,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    backgroundColor: 'rgba(30, 40, 50, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: '10%',
    paddingRight: '10%'
  },
  upgradeNowContainer: {
      zIndex: 101,
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      marginBottom: '28%',
  },
  paidTextHeader: {
      fontSize: RFPercentage(4),
      fontFamily: 'Montserrat',
      color: '#F3F1E0',
      textAlign: 'center'
  },
  paidButton: {
      borderRadius: 50,
      borderColor: '#F3F1E0',
      borderWidth: 2,
      paddingLeft: '8%',
      paddingRight: '8%',
      paddingTop: '4%',
      paddingBottom: '4%',
      marginTop: '10%'
  },
  paidButtonText:{
      fontFamily: 'Montserrat',
      fontSize: RFPercentage(3),
      color: '#F3F1E0'
  },
  premiumAdContainer: {
      marginBottom: '20%',
      width: '100%',
      height: '85%'
  },


}) 