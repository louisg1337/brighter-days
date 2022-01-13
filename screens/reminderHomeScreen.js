import React from 'react'
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, TouchableOpacity, FlatList, Dimensions, Alert} from 'react-native'
import { Entypo } from '@expo/vector-icons';
import Constants from 'expo-constants'
import AsyncStorage from '@react-native-community/async-storage';
import * as Notifications from 'expo-notifications'
import { withNavigation, SafeAreaView } from 'react-navigation'
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign } from '@expo/vector-icons';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { gradients } from '../data/getGradients'
import { Feather } from '@expo/vector-icons';
import { RFPercentage } from 'react-native-responsive-fontsize';
import loadFont from '../reusableComponents/font'
import { SimpleAnimation } from 'react-native-simple-animations/simple-animation';
import * as Permissions from 'expo-permissions'

export default class reminderHomeScreen extends React.Component {
  static navigationOptions = {
    headerShown: false
  }  

  constructor(props){
        super(props);
        this.state = {
          isLoading: true,
          hasReminder: false,
          reminders: [],
          notificationID: [],
          hasAccess: false
        }
    }

    async componentDidMount() {
      const { navigation } = this.props;
      this.focusListener = navigation.addListener("didFocus", async () => {
        await this.allowsNotificationsAsync()
        await this.getData()
        await loadFont()
        this.setState({isLoading: false})
      });
      await this.requestPermissionsAsync().then( async () => await this.allowsNotificationsAsync() )
      await loadFont()
      await this.start()
    }

    componentWillUnmount() {
      // Remove the event listener
      this.focusListener.remove();
    }
    ///////////////////////////////////////////////////////
    ////////////////////// PERMS //////////////////////////
    ///////////////////////////////////////////////////////
    allowsNotificationsAsync = async() => {
      const status = await Notifications.getPermissionsAsync()
      if (!status.granted){
          return
      } else {
          this.setState({hasAccess: true})
      }
    }
    requestPermissionsAsync = async () => {
      return await Permissions.askAsync(Permissions.NOTIFICATIONS)
    }
    ///////////////////////////////////////////////////////
    ////////////////////// END PERMS //////////////////////
    ///////////////////////////////////////////////////////

    start = async () => {
      console.log("-----------------------------")
      await this.getData()
      //await this.checkReminders()
      this.setState({isLoading: false})
    }

    getData = async () => {
      const json = await AsyncStorage.getItem("DailyReminders")
      const reminders = JSON.parse(json)
      if (reminders !== null) {
          const compare = ( a, b ) => {
            console.log(a.start)
            console.log(b.start)
            if ( a.start < b.start ){
              return -1;
            }
            if ( a.start > b.start ){
              return 1;
            }
            return 0;
          }
          reminders.sort( compare );
          reminders.map(value => {
            value['gradient'] = this.getGradient()
          })
          this.setState({reminders, hasReminder: true})
      } else {
        this.setState({hasReminder: false})
      }
    }

    cancelAsyncMap = async (id) => {
      try {
          await Notifications.cancelScheduledNotificationAsync(id).then().catch(err => console.log(err))
      } catch (e) {
          console.log(e)
      }
    }

    deleteReminder = async (id) => {
      this.setState({isLoading: true})
      const json = await AsyncStorage.getItem("DailyReminders")
      const reminders = JSON.parse(json)
      let index = 0;
      let i = 0
      reminders.map(val => {
        if (val.id === id){
          index = i
        }
        i++        
      })
      const array = reminders[index].notificationID
      if (reminders.length === 1){
        await this.cancelNotifications(array)
        await AsyncStorage.removeItem("DailyReminders")
      } else {
        await this.cancelNotifications(array)
        reminders.splice(index, 1)
        const newJSON = JSON.stringify(reminders)
        await AsyncStorage.setItem("DailyReminders", newJSON)
      }
      this.getData()
      this.setState({isLoading: false})
    }

    cancelNotifications = async (array) => {
      for (let i = 0; i < array.length; i++){
        this.cancelAsyncMap(array[i])
      }
    }

    goToEdit = (id) => {
      this.setState({isLoading: true})
      this.props.navigation.navigate("ReminderEdit", {id})
    }

    getGradient = () => {
      const rand = Math.floor(Math.random() * gradients.length)
      return gradients[rand]
    }

    goToNewScreen = () => {
      if (this.state.reminders.length !== 5){
        this.setState({isLoading: true})
        this.props.navigation.navigate("ReminderNew")
      } else {
        Alert.alert("You have reached the maximum amount of reminders.")
        return
      }
    }

    reversalTime = (time) => {
      let timeOfDay = 'AM'
      let hours = 0
      let minutes = 0
      if (time >= 720 && time <= 779) {
        timeOfDay = 'PM'
        hours = 12
        minutes = time - 720
      } else if (time >= 0 && time <= 59) {
        timeOfDay = 'AM'
        hours = 12
        minutes = time
      } else if (time > 720) {
        timeOfDay = 'PM'
        time = time - 720
        minutes = time % 60
        hours = Math.floor(time / 60)
      } else if (time < 720) {
        timeOfDay = 'AM'
        minutes = time % 60
        hours = Math.floor(time / 60)
      }
      if (minutes < 10){
        minutes = "0" + minutes
      }
      return hours + ":" + minutes + " " + timeOfDay
    }

    RightActions = ({progress, dragX, id}) => {
      const scale = dragX.interpolate({
        inputRange: [0, 100],
        outputRange: [0, 1],
        etrapolate: "clamp"
      })
      return (
        <View style={styles.hiddenItems}>
          <TouchableOpacity style={styles.deleteContainer} onPress={()=>{this.deleteReminder(id)}}>
            <AntDesign name="delete" size={35} color="#F3F1E0" style={styles.deleteIcon}/>
          </TouchableOpacity> 
          <TouchableOpacity style={styles.editContainer} onPress={() => {this.goToEdit(id)}}>
            <Feather name="edit-2" size={35} color="#F3F1E0" style={styles.editIcon} />
            {/* <FontAwesome5 name="edit" size={35} color="#F3F1E0" style={styles.editIcon}/> */}
          </TouchableOpacity>
        </View>
      );
    };

    iconFix = () => {
      const height = Dimensions.get('window').height
      if (height < 700){
          return 20
      } else {
          return 30
      }
    }

    render() {
      if (this.state.isLoading) {
        return (
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1D3663'}}>
            <ActivityIndicator size="large" color="#F3F1E0"/>
          </View>
        );
      } else {
        if (this.state.hasAccess) {
            return (
                <View style={styles.mainContainer}>
                  <View style={styles.headerContainer}>
                    <Text style={styles.headerText}>Daily Reminders</Text>
                  </View>
                  <View style={styles.listContainer}>
                    <View style={styles.fillerContainer}>
                      <SimpleAnimation animateOnUpdate={true} direction='right' duration={1500} delay={200} distance={100} movementType='slide' style={styles.numberOfReminderContainer}>
                        <Text style={this.state.hasReminder && this.state.reminders.length === 5 ? [styles.numberOne, {color: '#EEB067'}] : styles.numberOne}>{this.state.hasReminder === false ? '0' : this.state.reminders.length}</Text>
                        <Text style={styles.numberTwo}>/5</Text>
                      </SimpleAnimation>
                      {this.state.hasReminder ?
                      <SimpleAnimation animateOnUpdate={true} direction='up' duration={1500} delay={200} distance={1000} movementType='slide' style={{flex: 1}}>
                        <FlatList
                        data={this.state.reminders}
                        keyExtractor={item => item.id}
                        ItemSeparatorComponent={() => (<View style={{height: Dimensions.get('window').height * 0.025, flex: 1}}/>)}
                        renderItem={({item}) => (
                          <Swipeable 
                          renderRightActions={(progress, dragX) => <this.RightActions progress={progress} dragX={dragX} id={item.id}/>}
                          rightThreshold={30}
                          >
                            <LinearGradient colors={item.gradient} style={styles.sectionContainer}>
                              <Text style={styles.sectionTimeText}>{this.reversalTime(item.start)}</Text>
                              <Text style={styles.sectionTitleText}>{item.title}</Text>
                            </LinearGradient>
                          </Swipeable>
                        )}
                        />
                      </SimpleAnimation>
                      :
                      <SimpleAnimation animateOnUpdate={true} direction='up' duration={1500} delay={200} distance={500} movementType='slide' style={{flex: 1}}>
                        <ScrollView>
                          <TouchableOpacity onPress={() => {this.goToNewScreen()}}>
                            <LinearGradient colors={this.getGradient()} style={[styles.sectionContainerNothing, {justifyContent: 'center', marginTop: '5%', paddingBottom: '0%'}]}>
                              <Text style={styles.sectionTitleText}>Create a new notification!</Text>
                            </LinearGradient>
                          </TouchableOpacity>
                        </ScrollView>
                      </SimpleAnimation>
                      }
                    </View>
                  </View>
                  <SimpleAnimation animateOnUpdate={true} style={styles.floatButton} direction='left' duration={1500} delay={200} distance={100} movementType='slide'>
                    <TouchableOpacity onPress={() => {this.goToNewScreen()}}>
                      <Entypo name="plus" size={this.iconFix()} color="#fff"/>
                    </TouchableOpacity>
                  </SimpleAnimation>
                </View>
            );
        } else {
          return (
            <View style={styles.mainContainer}>
                  <View style={styles.headerContainer}>
                    <Text style={styles.headerText}>Daily Reminders</Text>
                  </View>
                  <View style={styles.listContainer}>
                      <View style={styles.fillerContainer}>
                        <SimpleAnimation animateOnUpdate={true} direction='up' duration={1500} delay={200} distance={500} movementType='slide' style={{flex: 1}}>
                          <ScrollView>
                              <LinearGradient colors={this.getGradient()} style={[styles.sectionContainerNothing, {justifyContent: 'center', marginTop: '5%'}]}>
                                <Text style={[styles.sectionTitleText, {textAlign: 'center'}]}>Please enable notifications to use this feature!</Text>
                              </LinearGradient>
                          </ScrollView>
                        </SimpleAnimation>
                      </View>
                  </View>
            </View>
          );
        }
      }
    }
}

function buttonLogic() {
  const height = Dimensions.get('window').height
  if (height < 700){
      return 45
  } else {
      return 60
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1D3663',
    paddingTop: Constants.statusBarHeight
  }, 
  headerContainer: {
    height: '15%',
    justifyContent: 'center'
  },
  headerText: {
    color: "#F3F1E0",
    fontSize: RFPercentage(4.75),
    fontFamily: 'Montserrat'  
  },
  listContainer: {
    height: '85%',
    width: '100%',
    backgroundColor: '#2C5484',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    borderBottomColor: '#F3F1E0',
    borderBottomWidth: 1,
    paddingTop: '5%',
    alignItems: 'center',
    paddingLeft: Dimensions.get('window').width * 0.05,
    paddingRight: Dimensions.get('window').width * 0.05,
  },
  sectionContainer: {
    flex: 1, 
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    paddingBottom: '2%'
  },
  fillerContainer: {
    width: '100%',
    height: '100%'
  },
  floatButton: { 
    alignItems: "center",
    justifyContent: "center",
    width: buttonLogic(),
    position: "absolute",
    bottom: '2%',
    right: '2%',
    height: buttonLogic(),
    backgroundColor: "#EEB067",
    borderRadius: 100
  }, 
  sectionTimeText: {
    color: '#F3F1E0',
    fontSize: RFPercentage(3.5),
    paddingTop: '2%',
    fontFamily: 'Montserrat'
  },
  sectionTitleText: {
    color: '#F3F1E0',
    fontSize: RFPercentage(2.75),
    paddingTop: '1%',
    fontFamily: 'Raleway',
  },
  hiddenItems: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 30,
  },
  deleteContainer: {  
    backgroundColor: '#fc7784',
    flex: 1,
    borderBottomLeftRadius: 30,
    borderTopLeftRadius: 30,
    justifyContent: 'center',
    alignItems: 'center'
  },
  deleteIcon: {

  },
  editContainer: {
    backgroundColor: '#3dbf82',
    flex: 1,
    borderBottomRightRadius: 30,
    borderTopRightRadius: 30,
    justifyContent: 'center',
    alignItems: 'center'
  }, 
  editIcon: {

  },

  sectionContainerNothing: { 
    borderRadius: 30,
    width: '100%',
    height: '10%',
    alignItems: 'center',
    height: Dimensions.get("window").height * .09,
  },

  numberOfReminderContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: '3.2%',
    zIndex: 1000
  },
  numberOne: {
    fontSize: RFPercentage(4),
    fontFamily: 'Montserrat',
    color: '#F3F1E0'
  },
  numberTwo: {
    fontSize: RFPercentage(4),
    fontFamily: 'Montserrat',
    color: '#EEB067'
  },
})