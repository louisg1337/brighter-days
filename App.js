import React from 'react';
import { Dimensions, View, Platform } from 'react-native'
import { createAppContainer} from 'react-navigation';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import { createStackNavigator } from 'react-navigation-stack'

import QuoteScreen from './screens/QuoteScreen'
import quoteChoiceScreen from './screens/quoteChoiceScreen'
import quoteReminderScreen from "./screens/quoteReminderScreen"

import reminderHomeScreen from './screens/reminderHomeScreen'
import reminderEditScreen from './screens/reminderEditScreen';
import reminderNewScreen from './screens/reminderNewScreen';

import selfLoveHomeScreen from './screens/selfLoveHomeScreen';
import selfLoveNewScreen from './screens/selfLoveNewScreen';
import selfLoveEditScreen from './screens/selfLoveEditScreen';
import selfLoveListScreen from './screens/selfLoveListScreen'

import settingHomeScreen from './screens/settingHomeScreen'
import settingBoostScreen from './screens/settingBoostScreen'
import settingHelpScreen from './screens/settingHelpScreen'
import settingUpdateScreen from './screens/settingUpdateScreen'
import settingSocialsScreen from './screens/settingSocialsScreen'

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SimpleLineIcons } from '@expo/vector-icons';
import { Fontisto } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import * as InAppPurchases from 'expo-in-app-purchases'

InAppPurchases.connectAsync().then(() => {
  InAppPurchases.setPurchaseListener(async ({ responseCode, results, errorCode }) => {
    console.log('in listener')
    if (responseCode === InAppPurchases.IAPResponseCode.OK) {
        results.forEach(async purchase => {
            if (!purchase.acknowledged){
                const JSONpaid = JSON.stringify(paid)
                await AsyncStorage.setItem('Paid', JSONpaid)
                await InAppPurchases.finishTransactionAsync(purchase, false)
            } 
        })
    } 
  })
})

console.log('im in')

function iconSize() {
  const height = Dimensions.get('window').height
  if (height < 700){
      return 30
  } else {
      return 40
  }
}

const settingNavigator = createStackNavigator(
  {
    Settings: settingHomeScreen,
    SettingsBoost: settingBoostScreen,
    SettingsUpdate: settingUpdateScreen,
    SettingsHelp: settingHelpScreen,
    SettingsSocials: settingSocialsScreen
  },
  {
    navigationOptions: {
      tabBarIcon: ({ focused, tintColor }) => {
        if (Platform.isPad){
          return (
          <View style={{width: '190%'}}>
            <SimpleLineIcons
            name={`settings`} 
            size={iconSize()} 
            color={`${focused ? '#EEB067' : '#F3F1E0'}`}
            />
          </View>
          )
        } else {
          return (
          <SimpleLineIcons
          name={`settings`} 
          size={iconSize()} 
          color={`${focused ? '#EEB067' : '#F3F1E0'}`}
          />
          )
        }
      },
    },
  },
)

const quoteNavigator = createStackNavigator(
  {
  Quotes: QuoteScreen,
  QuoteChoice: quoteChoiceScreen,
  QuoteReminder: quoteReminderScreen,
  },
  {
    navigationOptions: {
      tabBarIcon: ({ focused, tintColor }) => {
        if (Platform.isPad){
          return (
          <View style={{width: '190%'}}>
            <MaterialCommunityIcons 
            name={`bookmark-multiple${focused ? '' : '-outline'}`} 
            size={iconSize()} 
            color={`${focused ? '#EEB067' : '#F3F1E0'}`}
            />
          </View>
          )
        } else {
          return (
          <MaterialCommunityIcons 
          name={`bookmark-multiple${focused ? '' : '-outline'}`} 
          size={iconSize()} 
          color={`${focused ? '#EEB067' : '#F3F1E0'}`}
          />
          )
        }
      },
    },
  },
)

const reminderNavigator = createStackNavigator(
  {
    Reminder: reminderHomeScreen,
    ReminderEdit: reminderEditScreen,
    ReminderNew: reminderNewScreen,
  },
  {
    initialRouteName: 'Reminder',
    navigationOptions: { 
      tabBarIcon: ({ focused, tintColor }) => {
        if (Platform.isPad){
          return (
          <View style={{width: '190%'}}>
            <Fontisto
            name={`bell${focused ? '-alt' : ''}`} 
            size={iconSize()} 
            color={`${focused ? '#EEB067' : '#F3F1E0'}`}
            />
          </View>
          )
        } else {
          return (
          <Fontisto
          name={`bell${focused ? '-alt' : ''}`} 
          size={iconSize()} 
          color={`${focused ? '#EEB067' : '#F3F1E0'}`}
          />
          )
        }
      },
    }
  }
);

const selfLoveNavigator = createStackNavigator(
  {
    SelfLoveHome: selfLoveHomeScreen,
    SelfLoveNew: selfLoveNewScreen,
    SelfLoveEdit: selfLoveEditScreen,
    SelfLoveList: selfLoveListScreen,
  },
  {
    initialRouteName: 'SelfLoveHome',
    navigationOptions: {
      tabBarIcon: ({ focused, tintColor }) => {
        if (Platform.isPad){
          return (
          <View style={{width: '190%'}}>
            <FontAwesome
            name={`heart${focused ? '' : '-o'}`} 
            size={iconSize()} 
            color={`${focused ? '#EEB067' : '#F3F1E0'}`}
            />
          </View>
          )
        } else {
          return (
          <FontAwesome
          name={`heart${focused ? '' : '-o'}`} 
          size={iconSize()} 
          color={`${focused ? '#EEB067' : '#F3F1E0'}`}
          />
          )
        }
      },
    },
  }
)

const AppNavigator = createBottomTabNavigator(
  {
    Quotes: quoteNavigator,
    Reminder: reminderNavigator,
    SelfLove: selfLoveNavigator,
    Settings: settingNavigator,
  },
  {
    initialRouteName: 'Quotes',
    navigationOptions: {
      headerTintColor: "#8FB289",
    },
    tabBarOptions: {
      style: {
        height: 70,
        width: '100%',
        paddingTop: '2%',
        backgroundColor: '#2C5484',
        borderTopWidth: 0,
        paddingBottom: '1%',
      },
      tabStyle: {
      },
      
      activeTintColor: '#EEB067',
      inactiveTintColor: '#F3F1E0',
      showLabel: false
    }
  }
);


export default createAppContainer(AppNavigator);



// PORSCHE #EEB067 GOLD
// CREAM #F3F1E0
// RUM #776388 PURPLE
 
// FROM PINOT NOIR
// COOL DARK BLUE #182848
// LIGHT BLUE #4b6cb7

// FROM BACKGROUND ON QUOTE SCREEN
// DARK BLUE #1D3663
// BLUE #2C5484