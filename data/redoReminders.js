import AsyncStorage from '@react-native-community/async-storage';
import * as Notifications from 'expo-notifications'
import { reminderChoices } from '../data/reminderData'
import { comeBackText } from '../data/comeBack'


/////////////////////////////////////////////////////////////////////////////////
////////////////////////////// NOTIFCATION HANDLER //////////////////////////////
/////////////////////////////////////////////////////////////////////////////////

      checkReminders = async () => {
        console.log("/////////////////////////")
        const check = await AsyncStorage.getItem("DailyReminders")
        const checkData = JSON.parse(check)
        if (check !== null){
          await this.checkReminderConnector(checkData)
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
        if (diff <= 259200000){
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