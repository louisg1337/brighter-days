import React from 'react'
import { StyleSheet, Text, View, Dimensions, ActivityIndicator, TouchableOpacity, Alert } from 'react-native'
import Constants from 'expo-constants'
import {RFPercentage} from 'react-native-responsive-fontsize'
import loadFont from '../reusableComponents/font'
import { Fontisto } from '@expo/vector-icons';
import { SimpleLineIcons } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import { SimpleAnimation } from 'react-native-simple-animations/simple-animation';
import { AntDesign } from '@expo/vector-icons';
import * as InAppPurchases from 'expo-in-app-purchases'
import AsyncStorage from '@react-native-community/async-storage'

export default class settingHomeScreen extends React.Component {
    static navigationOptions = {
        headerShown: false,
    }  

    constructor(props){
        super(props);
        this.state = {
            isLoading: true,
            store: false,
            text: 'no'
        }
    }

    async componentDidMount() {
        await loadFont()
        this.setState({isLoading: false})
    }

    restorePurchase = async () => {
        this.setState({store: true, isLoading: true})
        let found = false
        const { responseCode, results } = await InAppPurchases.getPurchaseHistoryAsync(true)

        if (responseCode === InAppPurchases.IAPResponseCode.OK){
            if (results.length !== 0){
                found = true
            }
        }

        if (responseCode === InAppPurchases.IAPResponseCode.ERROR){
            this.setState({isLoading: false, store: false})
            Alert.alert("An error has occured. Please contact me with this error. Sorry for the inconvenience.")
        } else if (found) {
            const paid = true
            const JSONpaid = JSON.stringify(paid)
            await AsyncStorage.setItem('Paid', JSONpaid)
            this.setState({isLoading: false, store: false})
            Alert.alert('Purchase was found and your account was updated! Thank you for your support!')  
        } else {
            this.setState({isLoading: false, store: false})
            Alert.alert('No purchase was found, sorry!')  
        }
    }

    iconSize = () => {
        const height = Dimensions.get('window').height
        if (height < 700){
            return 20
        } else {
            return 30
        }
    }

    iconSizeTwo = () => {
        const height = Dimensions.get('window').height
        if (height < 700){
            return 15
        } else {
            return 20
        }
    }
      

    render(){
        if (this.state.isLoading){
            return (
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1D3663'}}>
                  <ActivityIndicator size="large" color="#F3F1E0"/>
                  {this.state.store &&
                    <Text style={{textAlign: 'center', color: '#F3F1E0', fontSize: RFPercentage(3), fontFamily: 'Montserrat', paddingTop: '4%'}}>Do not leave this page</Text> 
                  }
                </View>
            );
        } else {
            return(
                <View style={styles.mainContainer}>
                    <View style={styles.headerContainer}>
                        <Text style={styles.headerText}>Settings</Text>
                    </View>
                    <View style={styles.contentContainer}>
                        <TouchableOpacity style={styles.row} onPress={() => {this.props.navigation.navigate('SettingsBoost')}}>
                            <SimpleAnimation style={{flex: 1, borderBottomWidth: 1, borderColor: 'white',}} duration={1000} delay={200} direction='right' distance={500} movementType="slide">
                                <View style={styles.rowContainer}>
                                    <View style={styles.firstIcon}>
                                        <Fontisto name="day-sunny" size={this.iconSize()} color="#EEB067" />
                                    </View>
                                    <View style={styles.textContainer}>
                                        <Text style={styles.textStyle}>Brighter Boost</Text>
                                    </View>
                                    <View style={styles.secondIcon}>
                                        <Entypo name="chevron-thin-right" size={this.iconSizeTwo()} color="#EEB067" />
                                    </View>
                                </View>
                            </SimpleAnimation>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {this.props.navigation.navigate("SettingsUpdate")}} style={styles.row}>
                            <SimpleAnimation style={{flex: 1, borderBottomWidth: 1, borderColor: 'white',}} duration={1000}  delay={600} direction='right' distance={1000} movementType="slide"> 
                                <View style={styles.rowContainer}>
                                    <View style={styles.firstIcon}>
                                        <SimpleLineIcons name="layers" size={this.iconSize()} color="#EEB067" />
                                    </View>
                                    <View style={styles.textContainer}>
                                        <Text style={styles.textStyle}>Updates</Text>
                                    </View>
                                    <View style={styles.secondIcon}>
                                    <   Entypo name="chevron-thin-right" size={this.iconSizeTwo()} color="#EEB067" />
                                    </View>
                                </View>
                            </SimpleAnimation>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {this.props.navigation.navigate("SettingsHelp")}} style={styles.row}>
                            <SimpleAnimation style={{flex: 1, borderBottomWidth: 1, borderColor: 'white',}} duration={1000} delay={1000} direction='right' distance={1000} movementType="slide"> 
                                <View style={styles.rowContainer}>
                                    <View style={styles.firstIcon}>
                                        <SimpleLineIcons name="question" size={this.iconSize()} color="#EEB067" />
                                    </View>
                                    <View style={styles.textContainer}>
                                        <Text style={styles.textStyle}>Help</Text>
                                    </View>
                                    <View style={styles.secondIcon}>
                                        <Entypo name="chevron-thin-right" size={this.iconSizeTwo()} color="#EEB067" />
                                    </View>
                                </View>
                            </SimpleAnimation>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {this.props.navigation.navigate("SettingsSocials")}} style={styles.row}>
                            <SimpleAnimation style={{flex: 1, borderBottomWidth: 1, borderColor: 'white',}} duration={1000} delay={1400} direction='right' distance={1000} movementType="slide"> 
                                <View style={styles.rowContainer}>
                                    <View style={styles.firstIcon}>
                                        <AntDesign name="instagram" size={this.iconSize()} color="#EEB067" />
                                    </View>
                                    <View style={styles.textContainer}>
                                        <Text style={styles.textStyle}>Instagram</Text>
                                    </View>
                                    <View style={styles.secondIcon}>
                                        <Entypo name="chevron-thin-right" size={this.iconSizeTwo()} color="#EEB067" />
                                    </View>
                                </View>
                            </SimpleAnimation>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {this.restorePurchase()}} style={styles.row}>
                            <SimpleAnimation style={{flex: 1, borderBottomWidth: 1, borderColor: 'white',}} duration={1000} delay={1800} direction='right' distance={1000} movementType="slide"> 
                                <View style={styles.rowContainer}>
                                    <View style={styles.firstIcon}>
                                    <AntDesign name="reload1" size={this.iconSize()} color="#EEB067" />
                                    </View>
                                    <View style={styles.textContainer}>
                                        <Text style={styles.textStyle}>Restore Purchase</Text>
                                    </View>
                                    <View style={styles.secondIcon}>
                                        <Entypo name="chevron-thin-right" size={this.iconSizeTwo()} color="#EEB067" />
                                    </View>
                                </View>
                            </SimpleAnimation>
                        </TouchableOpacity>
                    </View>
                </View>
            )
        }
    }
}

// PORSCHE #EEB067 GOLD
// CREAM #F3F1E0
// RUM #776388 PURPLE
 
// FROM PINOT NOIR
// COOL DARK BLUE #182848
// LIGHT BLUE #4b6cb7

// FROM BACKGROUND ON QUOTE SCREEN
// DARK BLUE #1D3663
// BLUE #2C5484

const styles = StyleSheet.create({
    mainContainer: {
        paddingTop: Constants.statusBarHeight,
        backgroundColor: '#1D3663',
        flex: 1
    },

    headerContainer: {
        backgroundColor: '#1D3663',
        height: '15%',
        zIndex: 99,
        alignItems: 'center',
        justifyContent: 'center'
    },
    headerText: {
        color: '#F3F1E0',
        fontSize: RFPercentage(5),
        fontFamily: 'Montserrat'
    },

    row: {
        width: '80%',
        height: '15%',
    },
    rowContainer: {
        flexDirection: 'row',
        flex: 1,
        
    },
    contentContainer: {
        height: '85%',
        zIndex: 101,
        borderTopRightRadius: 40,
        borderTopLeftRadius: 40,
        backgroundColor: '#2C5484',
        borderBottomColor: '#F3F1E0',
        borderBottomWidth: 1,
        alignItems: 'center',
        paddingTop: '10%',
        
    },
    firstIcon: {
        width: '15%',
        height: '100%',
        alignItems: 'flex-start',
        justifyContent: 'center'
    },
    textContainer:{
        justifyContent: 'center',
        width: '65%'
    },
    textStyle: {
        fontSize: RFPercentage(3),
        fontFamily: 'Raleway',
        color: '#F3F1E0'
    },
    secondIcon: {
        width: '20%',
        height: '100%',
        alignItems: 'flex-end',
        justifyContent: 'center'
    },
})