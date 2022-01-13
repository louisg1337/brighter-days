import React from 'react'
import { StyleSheet, Text, View, SectionList, Button, KeyboardAvoidingView, ActivityIndicator, TouchableOpacity, Dimensions, TextInput, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native'
import { Entypo } from '@expo/vector-icons';
import Constants from 'expo-constants'
import AsyncStorage from '@react-native-community/async-storage';
import { LinearGradient } from 'expo-linear-gradient'
import PremiumAd from '../reusableComponents/premiumAd'
import { RFPercentage } from 'react-native-responsive-fontsize'
import loadFont from '../reusableComponents/font'
import { SimpleAnimation } from 'react-native-simple-animations';

export default class selfLoveNewScreen extends React.Component {
    static navigationOptions = {
      headerShown: false
    }  

    constructor(props){
        super(props);
        this.state = {
            isLoading: true,
            text: "",
            paid: false,

        }
    }

    async componentDidMount() {
        await loadFont()
        await this.checkPaid()
        await this.checkData()
        this.setState({isLoading: false})
    }

    checkData = async () => {
        const dataJSON = await AsyncStorage.getItem("SelfLove")
        const data = JSON.parse(dataJSON)
        console.log(data)
        this.setState({data})
    }

    checkPaid = async () => {
        const paidJSON = await AsyncStorage.getItem("Paid")
        const paid = JSON.parse(paidJSON)
        if (paid === null) {
            this.setState({paid: false})
            console.log('1')
            console.log(paid)
        } else {
            this.setState({paid: true})
            console.log('2')
            console.log(paid)
        }
    }

    createData = async (text) => {
        this.setState({isLoading: true})

        if (text.length === 0){
            Alert.alert("Please fill out the form.")
            return
        }

        const prevJson = await AsyncStorage.getItem("SelfLove")
        const prevData = JSON.parse(prevJson)

        const newData = [{
            text
        }]

        if (prevData === null){
            const newJSON = JSON.stringify(newData)
            await AsyncStorage.setItem("SelfLove", newJSON)
        } else {
            const combined = [...prevData, newData[0]]
            const combinedJSON = JSON.stringify(combined)
            await AsyncStorage.setItem("SelfLove", combinedJSON)
        }
    }

    setText = (text) => {
        this.setState({text})
    }

    render() {
        if (this.state.isLoading) {
            return (
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1D3663'}}>
                    <ActivityIndicator size="large" color="#F3F1E0"/>
                </View>
            );
        } else {
            if (this.state.data !== null && !this.state.paid && this.state.data.length === 20){
                return (
                    <View style={styles.premiumAdBackground}>
                        <TouchableOpacity style={styles.chevron} onPress={() => {this.props.navigation.navigate('SelfLoveHome')}}>
                            <Entypo name="chevron-thin-left" size={30} color="#EEB067" />
                        </TouchableOpacity>
                        <SimpleAnimation style={{flex: 1}} movementType='slide' delay={300} duration={1000} direction="up" distance={300}>
                            <PremiumAd />
                        </SimpleAnimation>
                    </View>
                )
            } else {
                return (
                    <TouchableWithoutFeedback onPress={() => {Keyboard.dismiss()}}>
                        <View style={styles.mainContainer} behavior="padding" enabled={true}>
                            <View style={styles.headerContainer}>
                                <Text style={styles.headerText}>New Note</Text>
                            </View>
                            <View style={styles.inputContainer}>
                                <View style={styles.inputTextContainer}>
                                    <Text style={styles.inputText}>Note</Text>
                                </View>
                                <TextInput 
                                style={styles.inputStyle}
                                multiline={true}
                                maxLength={150}
                                onChangeText={(text) => {this.setText(text)}}
                                />
                                <View style={styles.inputCharacterContainer}>
                                    <Text style={styles.characterText}><Text style={this.state.text.length === 150 ? {color: '#EEB067', fontSize: RFPercentage(2.7), fontFamily: 'Montserrat'} : {color: '#F3F1E0', fontSize: RFPercentage(2.7), fontFamily: 'Montserrat'}}>{this.state.text.length}</Text> / 150</Text>
                                </View>
                            </View>
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity style={styles.bottomButton} onPress={() => {this.createData(this.state.text), this.props.navigation.navigate("SelfLoveHome")}}>
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

function buttonLogic() {
    const height = Dimensions.get('window').height
    console.log(height)
    if (height < 700){
        return 20
    } else {
        return 30
    }
  }

const styles = StyleSheet.create({
    chevron: {
        position: 'absolute',
        top: '8%',
        left: '5%',
        width: 100,
        height: 100,
    },
    premiumAdBackground: {
        flex: 1,
        paddingTop: Constants.statusBarHeight,
        backgroundColor: '#1D3663',
        paddingLeft: '10%',
        paddingRight: '10%'
    },

    mainContainer: {
        flex: 1,
        paddingTop: Constants.statusBarHeight,
        backgroundColor: '#1D3663',
        paddingLeft: Dimensions.get("window").width * 0.03,
        paddingRight: Dimensions.get("window").width * 0.03,
    }, 

    // HEADER
    headerContainer: {
        flex: 1,
    },
    headerText:{
        fontSize: RFPercentage(6),
        color: '#F3F1E0',
        fontFamily: 'Montserrat'
    },

    // INPUT
    inputContainer: {
        flex: 6,
    },
    inputTextContainer: {
        borderBottomWidth: 3,
        alignSelf: 'baseline',
        borderColor: '#EEB067'
    },
    inputText: {
        fontSize: RFPercentage(4),
        color: '#F3F1E0',
        fontFamily: 'Raleway'
        
    },
    inputStyle: {
        flexDirection: "row",
        alignSelf: "center",
        width: "100%",
        marginTop: 20,
        paddingBottom: 10,
        borderBottomWidth: 1,
        fontSize: RFPercentage(2.7),
        borderColor: "#F3F1E0",
        color: '#F3F1E0',
        fontFamily: 'Raleway'
    },
    inputCharacterContainer: {
        alignItems: 'flex-end'
    },
    characterText: {
        color: '#EEB067',
        fontSize: RFPercentage(2.7),
        marginTop: 20,
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