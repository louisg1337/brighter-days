import React from 'react'
import { StyleSheet, Text, View, SectionList, ActivityIndicator, TouchableOpacity, FlatList, Dimensions, Button, Alert } from 'react-native'
import { Entypo } from '@expo/vector-icons';
import Constants from 'expo-constants'
import AsyncStorage from '@react-native-community/async-storage';
import { LinearGradient } from 'expo-linear-gradient'
import { Feather } from '@expo/vector-icons';
import { gradients } from '../data/getGradients'
import { BlurView } from 'expo-blur'
import { ThemeColors } from 'react-navigation';
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";
import loadFont from '../reusableComponents/font'
import { SimpleAnimation } from 'react-native-simple-animations';

export default class selfLoveHomeScreen extends React.Component {
    static navigationOptions = {
      headerShown: false
    }  

    
    constructor(props){
        super(props);
        this.state = {
          isLoading: true,
          data: [],
          hasData: false,
          prevRand: -1,
          randomNumber: 0,
          firstTime: true,
          paid: false,
        }
    }

    async componentDidMount() {
        const { navigation } = this.props
        this.focusListener = navigation.addListener("didFocus", async () => {
            this.setState({isLoading: true})
            await this.checkPaid()
            await loadFont()
            await this.getDataFocus()
          }); 
        await this.checkPaid()
        await this.getData()
        await this.getGradient()
        await loadFont()
        this.setState({isLoading: false})
    }

    componentWillUnmount() {
        // Remove the event listener
        this.focusListener.remove();
    }


    getDataFocus = async () => {
        const dataJSON = await AsyncStorage.getItem("SelfLove")
        const data = JSON.parse(dataJSON)
        if (data === null || data.length === 0){
            this.setState({hasData: false, data, isLoading: false})
        } else {
            this.setState({hasData: true, data, isLoading: false})
        }
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

    getData = async () => {
        const dataJSON = await AsyncStorage.getItem("SelfLove")
        const data = JSON.parse(dataJSON)
        this.setState({data})
        if (data === null) {
            this.setState({hasData: false, data: []})
        } else if (data.length !== 0) {
            this.setState({hasData: true})
        }
    }

    getRandomNumber = () => {
        console.log('///////////////////////')
        this.getGradient()
        const randomNumber = this.randomFunction()
        if (this.state.data.length === 1){
            this.setState({randomNumber})
        } else {
            this.setState({randomNumber, prevRand: randomNumber})
        }
    }

    randomFunction = () => {
        if (this.state.data === null || this.state.data.length === 0) {
            return
        }
        if (this.state.data.length === 1){
            return 0
        }
        const prevRand = this.state.randomNumber
        const randomNumber = Math.floor(Math.random() * this.state.data.length)
        if (prevRand === randomNumber) {
            return this.randomFunction()
        } else {
            return randomNumber
        }
        /////////////////////////// NEED TWO RETURNS ///////////////////////////
    }
    
    goToNewScreen = () => {
        if (this.state.data !== null){
            if (this.state.data.length === 100){
                Alert.alert("You have reached the maximum amount of notes.")
                return
            }
        }
        this.setState({isLoading: true}) 
        this.props.navigation.navigate("SelfLoveNew")
    }

    goToListScreen = () => {
        this.setState({isLoading: true, firstTime: true}) 
        this.props.navigation.navigate("SelfLoveList")
    }
    
    getGradient = () => {
        const rand = Math.floor(Math.random() * gradients.length)
        this.setState({currentGradient: gradients[rand]})
    }

    render() {
        if (this.state.isLoading) {
            return (
                <View style={[styles.mainContainer, , {backgroundColor: '#1D3663'}]}>
                    <ActivityIndicator size="large" color="#F3F1E0"/>
                </View>
            );
        } else {
            return (
                <View style={styles.bufferContainer}>
                    <View style={styles.mainContainer}>
                        <View style={styles.headerContainer}>
                            <SimpleAnimation direction='right' duration={1000} delay={200} movementType='slide' distance={200} style={styles.headerOne}>
                                <TouchableOpacity style={styles.floatButton} onPress={() => {this.goToNewScreen()}}>
                                    <Entypo name="plus" size={30} color="#F3F1E0"/>
                                </TouchableOpacity>
                            </SimpleAnimation>
                            <View style={styles.headerTwo}>
                                <View style={{width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
                                    {this.state.hasData && !this.state.firstTime ?
                                        <SimpleAnimation direction='down' style={{width: '100%'}} duration={1000} delay={200} movementType='slide' distance={200}> 
                                            <TouchableOpacity style={styles.getButton} onPress={() => {this.getRandomNumber()}}>
                                                <Text style={styles.getButtonText}>Reroll</Text>
                                            </TouchableOpacity>
                                        </SimpleAnimation>
                                        :
                                        <View style={{flex: 1}}/>
                                    }
                                </View>
                            </View>
                            <SimpleAnimation direction='left' duration={1000} delay={200} movementType='slide' distance={200} style={styles.headerThree}>
                                <TouchableOpacity style={styles.floatButtonTwo} onPress={() => {this.goToListScreen()}}>
                                    <Feather name="list" size={30} color="#F3F1E0"/>
                                </TouchableOpacity>
                            </SimpleAnimation>
                        </View>
                        <View style={styles.bodyContainer}>
                            <View style={styles.showContainer}>
                                {this.state.hasData ?
                                    this.state.firstTime ?
                                        <View style={styles.rollButtonContainer}>
                                            <SimpleAnimation style={{width: '100%', alignItems: 'center'}} direction='up' duration={1000} delay={200} movementType='slide' distance={200} >
                                                <TouchableOpacity style={styles.rollButton} onPress={() => {this.setState({firstTime: false})}}>
                                                    <Text style={styles.rollText}>Roll</Text>
                                                </TouchableOpacity>
                                            </SimpleAnimation>
                                        </View>
                                    :
                                        <SimpleAnimation delay={200} duration={1000} distance={400} animateOnUpdate={true} direction={'up'} movementType='slide' style={styles.innerShowContainer}>
                                            <LinearGradient colors={this.state.currentGradient} style={styles.showContent}>
                                                <Text style={styles.showText}>
                                                    {this.state.data[this.state.randomNumber].text}
                                                </Text>
                                            </LinearGradient>
                                        </SimpleAnimation>
                                :
                                <View style={styles.createNewNoteContainer}>
                                    <Text style={styles.createNewNoteText}>Create a new positive note!</Text>
                                </View>
                                
                                }   
                            </View>
                            <View style={styles.jarContainer}>
                                {/* <View style={styles.emptyContainer}/> */}
                                <View style={styles.firstRim}>
                                    <View style={styles.innerFirstRim}/>
                                </View>
                                <View style={styles.secondRim}>
                                    <View style={styles.innerSecondRim}/>
                                </View>
                                <View style={styles.glassBody}>
                                    <BlurView intensity={100} style={styles.blurViewStyle}>
                                        <View style={styles.jarHeaderContainer}>
                                            <Text style={styles.jarHeader}>Positivity Jar</Text>
                                        </View>
                                        {this.state.paid ?
                                            <Text style={styles.jarCounter}><Text style={this.state.data !== null && this.state.data.length === 100 ? styles.jarFinished : styles.jarNotFinished}>{this.state.data !== null ? this.state.data.length : "0"}</Text> / 100</Text>
                                        :
                                            <Text style={styles.jarCounter}><Text style={this.state.data !== null && this.state.data.length === 20 ? styles.jarFinished : styles.jarNotFinished}>{this.state.data !== null ? this.state.data.length : "0"}</Text> / 20</Text>
                                        }
                                    </BlurView>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            );
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
    if (height < 700){
        return 50
    } else {
        return 60
    }
  }

const styles = StyleSheet.create({
    bufferContainer: {
        flex: 1,
        paddingTop: Constants.statusBarHeight,
        backgroundColor: '#1D3663',
    },
    mainContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingLeft: Dimensions.get('window').width * 0.05,
        paddingRight: Dimensions.get('window').width * 0.05,
    }, 

    // HEADER
    headerContainer: {
        flex: 1,
        flexDirection: 'row',
    },
    headerOne: {
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'center'
    },
    headerTwo: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    headerThree: {
        flex: 1,
        alignItems: 'flex-end',
        justifyContent: 'center'
    },
    floatButton: {
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.2)",
        alignItems: "center",
        justifyContent: "center",
        width: buttonLogic(),
        height: buttonLogic(),
        backgroundColor: "#EEB067",
        borderRadius: 100
    }, 
    floatButtonTwo: {
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.2)",
        alignItems: "center",
        justifyContent: "center",
        width: buttonLogic(),
        height: buttonLogic(),
        backgroundColor: "#EEB067",
        borderRadius: 100
    }, 
    getButton: {
        borderWidth: 2,
        borderRadius: 30,
        marginTop: 20,
        paddingTop: 5,
        paddingBottom: 5,
        width: '100%',
        borderColor: '#F3F1E0',
        alignItems: 'center',
        justifyContent: 'center'
    },
    getButtonText: {
        color: '#F3F1E0',
        fontSize: RFPercentage(2.5),
        fontFamily: 'Montserrat'
    },

    // BODY
    bodyContainer: {
        flex: 9,
    },
    
    // SHOW
    showContainer: {
        flex: 3,
    },
    innerShowContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: 'center'
    },
    showContent: {
        width: '80%',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderRadius: 20
    },
    showText: {
        fontSize: RFPercentage(2.5), 
        color: '#F3F1E0',
        fontFamily: 'Raleway'
    },
    rollButton: {
        borderWidth: 2,
        borderColor: '#F3F1E0',
        width: '40%',
        borderRadius: 20,
        padding: 10,
        alignItems: 'center',
    },
    rollButtonContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    rollText: {
        color: '#F3F1E0',
        fontSize: RFPercentage(3),
        fontFamily: 'Montserrat'
    },

    // NO DATA STYLES
    createNewNoteContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    createNewNoteText: {
        fontSize: RFPercentage(3),
        color: '#F3F1E0',
        fontFamily: 'Montserrat'
    },

    // JAR
    jarContainer: {
        flex: 2,
    },
    emptyContainer: { // prob dont need this, but keep
        flex: 4,
    },
    firstRim: {
        flex: 1,
        alignItems: 'center',
    },
    innerFirstRim: {
        width: '60%',
        borderWidth: 3,
        borderBottomWidth: 0,
        borderColor: '#8a8a8a',
        height: '100%',
        backgroundColor: '#adadad',
    },
    secondRim: {
        flex: 1,
        alignItems: 'center'
    },
    innerSecondRim: {
        width: '60%',
        borderWidth: 3,
        borderColor: '#8a8a8a',
        height: '100%',
        backgroundColor: '#adadad',
    },
    glassBody: {
        flex: 8,
        borderWidth: 3,
        borderColor: '#ffffff',
        borderTopLeftRadius: 80,
        borderTopRightRadius: 80,
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomWidth: 0,    
        overflow: 'hidden'    
        
    },
    jarHeader: {
        color: '#F3F1E0',
        fontSize: RFPercentage(3.8),
        fontFamily: 'Montserrat'
    },
    jarHeaderContainer: {
        borderRadius: 15,
        padding: 15,
        backgroundColor: '#EEB067'
    },
    jarCounter:{
        fontSize: RFPercentage(4),
        color: '#EEB067',
        marginTop: 10,
        fontWeight: '400',
        fontFamily: 'Montserrat'
    },
    jarFinished: {
        fontSize: RFPercentage(4),
        color: '#EEB067',
    },
    jarNotFinished: {
        fontSize: RFPercentage(4),
        color: '#F3F1E0',
    },
    blurViewStyle: {
        width: '110%',
        height: '110%',
        alignItems: 'center',
        justifyContent: 'center',
    },

})