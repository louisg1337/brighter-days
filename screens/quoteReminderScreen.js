import React from 'react'
import { StyleSheet, Text, View, Alert, Dimensions, Button, ActivityIndicator, AsyncStorage, TouchableOpacity } from 'react-native'
import * as Notifications from 'expo-notifications'
import { SafeAreaView } from 'react-navigation'
import { generalQuotes, quoteChoices } from '../data/getQuotes'
import { AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient'
import { comeBackText } from '../data/comeBack'
import { RFPercentage } from "react-native-responsive-fontsize";
import loadFont from '../reusableComponents/font'
import * as Permissions from 'expo-permissions'

export default class quoteReminderScreen extends React.Component {
    static navigationOptions = {
        headerShown: false
    }

    constructor(props){
        super(props);
        this.state = {
            hasAccess: false,
            isLoading: true,
            notificationID: [],
            QuoteChoicesID: [],
            general: true,
            amount: 1, // DEFAULT
            startTime: 12, // DEFAULT
            endTime: 12, // DEFAULT
            selectorArray: ["12:00 AM", "1:00 AM", "2:00 AM", "3:00 AM", "4:00 AM", "5:00 AM", "6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM", "10:00 PM", "11:00 PM", "12:00 AM"]
        }
         
    }

    async componentDidMount() {
        const { navigation } = this.props;
        this.focusListener = navigation.addListener("didFocus", async () => {
            await this.allowsNotificationsAsync()
            await this.retrieveAsyncData()
            await loadFont()
            await this.setState({isLoading: false})
        });
        await this.requestPermissionsAsync().then( async () => {await this.allowsNotificationsAsync()})
        await this.retrieveAsyncData()
        await loadFont()
        // this.retrieveQuotes()
        this.setState({isLoading: false})
    }

    componentWillUnmount() {
        // Remove the event listener
        this.focusListener.remove();
    }

    getPrevData = async () => {
        const amountJSON = await AsyncStorage.getItem('quoteNotificationAmount')
        const startTimeJSON = await AsyncStorage.getItem('quoteNotificationStart')
        const endTimeJSON = await AsyncStorage.getItem('quoteNotificationEnd')
        const amount = JSON.parse(amountJSON)
        if (amount !== null){
            this.setState({amount})
        }
        const startTime = JSON.parse(startTimeJSON)
        if (startTime !== null){
            this.setState({startTime})
        }
        const endTime = JSON.parse(endTimeJSON)
        if (endTime !== null){
            this.setState({endTime})
        }
    }

    // STARTUP PROCESSES
    requestPermissionsAsync = async () => {
        return await Permissions.askAsync(Permissions.NOTIFICATIONS)
    }

    retrieveAsyncData = async () => {
        try {
            // retrieve all of notification data
            const jsonValue = await AsyncStorage.getItem('QuoteChoicesId')
            const QuoteChoicesID = JSON.parse(jsonValue)
            if (QuoteChoicesID === null){
                this.setState({general: true})
            } else {
                if (QuoteChoicesID.length !== 0) {
                    QuoteChoicesID.sort()
                    this.setState({QuoteChoicesID, general: false})
                } else {
                    this.setState({general: true})
                }
            }
        } catch (error) {
            Alert.alert(error)
        }
    }

    allowsNotificationsAsync = async() => {
        const status = await Notifications.getPermissionsAsync()
        console.log(status)
        if (!status.granted){
            console.log("No access")
        } else {
            console.log("Permissions on")
            this.setState({hasAccess: true})
        }
    }

    allowsNotificationsChecker = async() => {
        const status = await Notifications.getPermissionsAsync()
        return status.granted
    }

    // RANDOM NOT INCLUSIVE OF LAST NUMBER
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


    // TESTING
    sendNotification = async () => {
        await Notifications.scheduleNotificationAsync({
            content: {
                body: this.test()
            },
            trigger: {
                seconds: 20,
                repeats: false
            }
        })
    }

    test = () => {
        const num = Math.floor(Math.random() * 10);
        return (num.toString())
    }

    seeAllQueuedNotifications = async () => {
        console.log("-----------------------------")
        await Notifications.getAllScheduledNotificationsAsync().then(arr => {console.log(arr.length)}).catch(err => console.log(err))
        const json = await AsyncStorage.getItem('quoteNotificationID')
        console.log(JSON.parse(json))
    }

    cancelAllNotifications = async () => {
        await Notifications.cancelAllScheduledNotificationsAsync().then(console.log("Clear!")).catch(err => console.log(err))
    }

    
    

    // ACTUAL CODE
    createNotificationActually = async (startTime, endTime, amount) => {
        if (this.allowsNotificationsChecker()){
            if (this.checker(startTime, endTime, amount)){
                return
            }
            this.setState({isLoading: true})
            await this.cancelNotifications()
            let currentDate = new Date(Date.now())
            let start = this.zeroTime(startTime)
            let end = this.zeroTime(endTime)
            let interval = ((endTime-startTime) * 60 / amount)
            if (interval === 1) {
                interval = 0
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
        } else {
            return
        }
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
        console.log("MONTHLY")
        let tempNotificationID = []
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
              shouldShowAlert: true,
              shouldPlaySound: true,
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
              shouldPlaySound: true,
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
              shouldPlaySound: true,
              shouldSetBadge: false,
            }),
        });
        const diff = (end - currentDate)
        const todayPossibleNotifications = (Math.floor((diff / 60000) / interval))
        let general = this.state.general
        if (todayPossibleNotifications === 0){
            todayPossibleNotifications = 1
        }
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
        this.setState({isLoading: true})
        try {
            const jsonID = await AsyncStorage.getItem('quoteNotificationID')
            const id = JSON.parse(jsonID)
            if (id !== null){
                id.map((item) => {
                    this.cancelAsyncMap(item)
                })
                console.log("REMOVING")
                await AsyncStorage.removeItem('quoteNotificationID')
                await AsyncStorage.removeItem('quoteNotificationAmount')
                await AsyncStorage.removeItem('quoteNotificationStart')
                await AsyncStorage.removeItem('quoteNotificationEnd')
                await AsyncStorage.removeItem('endOfQuoteNotification')
                this.setState({isLoading: false})
            } else {
                this.setState({isLoading: false}) 
            }
        } catch (e) {
            console.log(e)
        }
    }

    cancelAsyncMap = async (id) => {
        await Notifications.cancelScheduledNotificationAsync(id).then().catch(err => console.log(err))
    }

    checker = (start, end, amount) => {
        if (start === end && amount !== 1){
            console.log("1")
            Alert.alert("If the start and end times are the same, you may only have one notification")
            return true
        } else if (start > end) {
            console.log("2")
            Alert.alert("Please choose a start time less than an end time.")
            return true
        }
    }

    amountChange = (val) => {
        if (val === 'minus') {
            if (this.state.amount === 1){
                return
            }
            const amount = this.state.amount - 1
            this.setState({amount})
        } else {
            if (this.state.amount === 4){
                return
            }
            const amount = this.state.amount + 1
            this.setState({amount})
        }
    }

    startDateChange = (val) => {
        if (val === 'minus'){
            if (this.state.startTime === 0){
                return
            }
            const startTime = this.state.startTime - 1
            this.setState({startTime})
        } else {
            if (this.state.startTime === 24) {
                return
            }
            const startTime = this.state.startTime + 1
            this.setState({startTime})
        }
    }

    endDateChange = (val) => {
        if (val === 'minus'){
            if (this.state.endTime === 0){
                return
            }
            const endTime = this.state.endTime - 1
            this.setState({endTime})
        } else {
            if (this.state.endTime === 24) {
                return
            }
            const endTime = this.state.endTime + 1
            this.setState({endTime})
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

    render(){
        if (!this.state.hasAccess){
            return(
                <View style={styles.mainContainer}>
                        <SafeAreaView style={{flex: 0}} >
                            <View style={styles.outerContainer}>
                                <View style={styles.headerContainer}>
                                    <Text style={styles.noNotification}>Please enable notifications in the settings to use this feature!</Text>
                                </View>
                            </View>
                        </SafeAreaView>
                    </View>
            )
        } else {
            if (this.state.isLoading){
                return (
                    <View style={styles.mainContainer}>
                      <ActivityIndicator size="large" color="#F3F1E0"/>
                    </View>
                  );
            } else {
                return(
                    <View style={styles.mainContainer}>
                        <SafeAreaView style={{flex: 0}} >
                            <View style={styles.outerContainer}>
                                <View style={styles.headerContainer}>
                                    <Text style={styles.headerText}>Notifications</Text>
                                </View>
                                <View style={styles.amountContainer}>
                                    <View style={{borderBottomColor: '#EEB067', borderBottomWidth: 3, alignSelf: 'baseline', paddingBottom: 5}}>
                                        <Text style={styles.amountHeader}>Number of notifications:</Text>
                                    </View>
                                    <View style={styles.selectorContainer}>
                                        <TouchableOpacity style={styles.buttonStyling} onPress={() => {this.amountChange('minus')}}>
                                            <AntDesign name="left" size={25} color="#F3F1E0" />
                                        </TouchableOpacity>
                                        <Text style={styles.selectorText}>{this.state.amount}</Text>
                                        <TouchableOpacity style={styles.buttonStyling} onPress={() => {this.amountChange('plus')}}>
                                            <AntDesign name="right" size={25} color="#F3F1E0" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={styles.timeContainer}>
                                    <View style={{borderBottomColor: '#EEB067', borderBottomWidth: 3, alignSelf: 'baseline', paddingBottom: 5}}>
                                        <Text style={styles.timeHeader}>Start</Text>
                                    </View>
                                    <View style={styles.selectorContainer}>
                                        <TouchableOpacity style={styles.buttonStyling} onPress={() => {this.startDateChange('minus')}}>
                                            <AntDesign name="left" size={25} color="#F3F1E0" />
                                        </TouchableOpacity>
                                        <Text style={styles.selectorText}>{this.state.selectorArray[this.state.startTime]}</Text>
                                        <TouchableOpacity style={styles.buttonStyling} onPress={() => {this.startDateChange('plus')}}>
                                            <AntDesign name="right" size={25} color="#F3F1E0" />
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{borderBottomColor: '#EEB067', borderBottomWidth: 3, alignSelf: 'baseline', paddingBottom: 5}}>
                                        <Text style={styles.timeHeader}>End</Text>
                                    </View>
                                    <View style={styles.selectorContainer}>
                                        <TouchableOpacity style={styles.buttonStyling} onPress={() => {this.endDateChange('minus')}}>
                                            <AntDesign name="left" size={25} color="#F3F1E0" />
                                        </TouchableOpacity>
                                        <Text style={styles.selectorText}>{this.state.selectorArray[this.state.endTime]}</Text>
                                        <TouchableOpacity style={styles.buttonStyling} onPress={() => {this.endDateChange('plus')}}>
                                            <AntDesign name="right" size={25} color="#F3F1E0" />
                                        </TouchableOpacity>
                                    </View>

                                    <View style={{borderBottomColor: '#EEB067', borderBottomWidth: 3, alignSelf: 'baseline', paddingBottom: 5}}>
                                        <Text style={styles.timeHeader}>Cancel</Text>
                                    </View>
                                    <View style={styles.selectorContainer}>
                                        <TouchableOpacity style={styles.cancelButton} onPress={() => {this.cancelNotifications()}}>
                                            <Text style={styles.cancelText}>Cancel All Notifications</Text>
                                        </TouchableOpacity>
                                    </View>



                                    {/* <Button title="Cancel All" onPress={() => {this.cancelNotifications()}}/>
                                    <Button onPress={() => {this.seeAllQueuedNotifications()}} title={"Queued"}></Button> */}
                                </View>
                                <View style={styles.buttonContainer}>
                                    <TouchableOpacity style={styles.bottomButton} onPress={() => {this.createNotificationActually(this.state.startTime, this.state.endTime, this.state.amount)}}>
                                        <LinearGradient colors={["#4b6cb7", "#182848"]} style={styles.buttonGradient}>
                                            <Text style={styles.buttonText}>Done</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </SafeAreaView>
                    </View>
                )
            }
        }
    }
}

// PORSCHE #EEB067 GOLD
// RUM #776388 PURPLE
// CREAM #F3F1E0
 
// FROM PINOT NOIR
// COOL DARK BLUE #182848
// LIGHT BLUE #4b6cb7

// FROM BACKGROUND ON QUOTE SCREEN
// DARK BLUE #1D3663
// BLUE #2C5484


function buttonLogic() {
    const height = Dimensions.get('window').height
    console.log(height)
    if (height < 700){
        return 13
    } else {
        return 30
    }
}

const styles = StyleSheet.create({
    mainContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        height: Dimensions.get('window').height,
        backgroundColor: '#1D3663',
        
    },
    outerContainer: {
        flex: 1,
        width: Dimensions.get('window').width * 0.9,
    },
    headerContainer: {
        flex: 1,
        justifyContent: 'center'
    },
    headerText: {
        fontSize: RFPercentage(6),
        color: '#F3F1E0',
        fontFamily: 'Montserrat'
    },
    amountContainer: {
        flex: 1,
        justifyContent: 'center'
    },
    amountHeader: {
        fontSize: RFPercentage(3),
        color: '#F3F1E0',
        fontFamily: 'Raleway'
    },
    timeContainer: {
        flex: 3,
        // borderRightColor: 'green',
        // borderLeftColor: 'green',
        // borderRightWidth: 2,
        // borderLeftWidth: 2,
    },
    timeHeader: {
        fontSize: RFPercentage(3),
        color: '#F3F1E0',
        fontFamily: 'Raleway'
    },
    buttonContainer: {
        flex: 1,
        paddingLeft: Dimensions.get('window').width * 0.1,
        paddingRight: Dimensions.get('window').width * 0.1,
        // paddingTop: Dimensions.get('window').height * 0.05,
        // paddingBottom: Dimensions.get('window').height * 0.05,
    }, 
    bottomButton: {
        flex: 1,
        marginTop: 30,
        marginBottom: 30,
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonText: {
        color: '#F3F1E0',
        fontSize: RFPercentage(3),
        fontFamily: 'Montserrat'
    },
    buttonGradient: {
        flex: 1, 
        width: '100%', 
        borderRadius: buttonLogic(), 
        justifyContent: 'center', 
        alignItems: 'center'
    },
    selectorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 20
    }, selectorText: {
        color: '#F3F1E0',
        fontSize: RFPercentage(3),
        marginLeft: 10,
        marginRight: 10,
    },
    buttonStyling: {
        
        borderRadius: 50,
        padding: '1%'
    },

    noNotification: {
        color: '#F3F1E0',
        fontSize: RFPercentage(3),
        textAlign: 'center',
        fontFamily: 'Raleway',
        paddingBottom: '10%'
    },

    cancelButton: {
        borderWidth: 1,
        borderRadius: 30,
        borderColor: '#F3F1E0',
        padding: '4%'
    },
    cancelText: {
        color: '#F3F1E0',
        fontSize: RFPercentage(2),
        fontFamily: 'Raleway'
    }

})