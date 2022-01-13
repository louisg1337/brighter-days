import React from 'react'
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator, Dimensions, ScrollView, Alert, TouchableWithoutFeedback, Platform } from 'react-native'
import Constants from 'expo-constants'
import { choices } from '../data/quoteChoices'
import AsyncStorage from '@react-native-community/async-storage'
import { LinearGradient } from 'expo-linear-gradient'
import PremiumAd from '../reusableComponents/premiumAd'
import { RFPercentage } from 'react-native-responsive-fontsize'
import loadFont from '../reusableComponents/font'
import { Entypo } from '@expo/vector-icons';
import {SimpleAnimation} from 'react-native-simple-animations'
import Thanks from '../reusableComponents/thanks'
import * as InAppPurchases from 'expo-in-app-purchases'

class ChoiceShower extends React.Component {
    render(){
        return(
            <View style={componentStyles.choiceShowerComponentView}>
                <View style={componentStyles.innerContainer}>
                <Text style={componentStyles.text}>{this.props.title}</Text>
                </View>
            </View>
        )
    }
}

export default class quoteChoiceScreen extends React.Component {
    static navigationOptions = {
        headerShown: false,
        tabBarVisible: false
    }  
    
    
    constructor(props){
        super(props);
        this.state = {
            choicesId: [],
            choicesTitles: [],
            data: [],
            isLoading: true,
            paid: false,
            showPaid: false,
            bought: false,
            connected: false,
            bought: false,
        }
    }

    async componentDidMount(){
        const { navigation } = this.props;
        this.focusListener = navigation.addListener("didFocus", async () => {
            this.checkPaid()
        });
        InAppPurchases.setPurchaseListener(async ({ responseCode, results, errorCode }) => {
            console.log('in listener')
            if (responseCode === InAppPurchases.IAPResponseCode.OK) {
                results.forEach(async purchase => {
                    if (!purchase.acknowledged){
                        console.log('Successfully purchased')
                        const paid = true
                        const JSONpaid = JSON.stringify(paid)
                        await AsyncStorage.setItem('Paid', JSONpaid)
                        await InAppPurchases.finishTransactionAsync(purchase, false)
                        this.setState({bought: true, paid: true, isLoading: false})
                    } 
                })
            } 
            
            if (responseCode === InAppPurchases.IAPResponseCode.USER_CANCELED) {
                console.log('User canceled the transaction')
                this.setState({isLoading: false})
            } else if (responseCode === InAppPurchases.IAPResponseCode.DEFERRED){
                Alert.alert('Parental approval needed to buy Brighter Days Boost.')
                this.setState({isLoading: false})
            } 
        })
        await loadFont()
        await this.checkPaid()
        await this.getData()
    }

    componentWillUnmount(){
        this.focusListener.remove()
    }

    handlePressed = async () => {
        this.setState({isLoading: true})
        this.payFunction()
    }

    payFunction = async () => {
        const items = Platform.select({
            ios: ['boost'],
            android: ['boost']
        })
        await InAppPurchases.getProductsAsync(items).then(async () => {
            console.log('In get products')
            try {
                const { responseCode, results } = await InAppPurchases.getProductsAsync(items)
                console.log(results)
                this.setState({items: results})
                if (responseCode === InAppPurchases.IAPResponseCode.OK){
                    await InAppPurchases.purchaseItemAsync('boost')
                    setTimeout(() => {this.checkPaid(),this.setState({isLoading: false})}, 3500)
                } else {
                    console.log('Error!')
                    this.setState({isLoading: false})
                    Alert.alert("I'm sorry, an issue has occured. Please find my contact information in the settings and report this bug.")
                }
            } catch (e) {
                this.setState({isLoading: false})
                console.log(e)
            }
        })
    }

    // On start
    checkPaid = async () => {
        const paidJSON = await AsyncStorage.getItem("Paid")
        const paid = JSON.parse(paidJSON)
        if (paid === null || paid === false) {
            this.setState({paid: false})
        } else {
            this.setState({paid: true})
        }
    }

    getData = async () => {
        try {
          const jsonValue = await AsyncStorage.getItem('QuoteChoicesId')
          const value = JSON.parse(jsonValue)
          if (value !== null) {
            this.setState({
              choicesId: value,
            })
            this.fixData()
          } else {
              this.setState({data: choices,isLoading: false})
          }
        } catch (error) {
          Alert.alert(error)
        }
    }

    fixData = () => {
        this.state.choicesId.map((num) => {
            // Fix the style
            choices[num].style = true
            // Add the title to the data
            this.setState({
                choicesTitles: [...this.state.choicesTitles, choices[num].title]
            })
        })
        this.setState({
            data: choices,
            isLoading: false
        })
    }

    // Handling leaving the page
    goToQuotes = () => {
        this.saveData()
    }

    saveData = async () => {
        try {
            const jsonValue = JSON.stringify(this.state.choicesId)
            await AsyncStorage.setItem('QuoteChoicesId', jsonValue)
            this.props.navigation.navigate("Quotes")
        } catch (error) {
            Alert.alert(error)
        }
    }

    updateState = (id, title) => {
        // check if in state
        const found = this.state.choicesId.includes(id)
        if (!found){
            // If not in the state, then set it, and add true to style
            let tempData = this.state.data
            tempData[id].style = true
            this.setState({
                choicesId: [...this.state.choicesId, id],
                choicesTitles: [...this.state.choicesTitles, title],
                data: tempData,
            })
        } else {
            // If in state then get rid of it
            let tempData = this.state.data
            tempData[id].style = false
            const newChoicesId = this.state.choicesId.filter(arrayId => arrayId !== id)
            const newChoicesTitles = this.state.choicesTitles.filter(arrayTitle => arrayTitle !== title)
            this.setState({
                choicesId: newChoicesId,
                choicesTitles: newChoicesTitles,

            })
        }
    }  


    render(){
        if (this.state.isLoading){
            return (
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1D3663'}}>
                    <ActivityIndicator size="large" color="#F3F1E0"/>
                    {!this.state.paid &&
                        <Text style={{textAlign: 'center', color: '#F3F1E0', fontSize: RFPercentage(3), fontFamily: 'Montserrat', paddingTop: '4%'}}>Do not leave this page</Text>
                    }
                </View>
            );
        } else {
            if (this.state.bought) {
                return(
                    <View style={{paddingTop: Constants.statusBarHeight, flex: 1, backgroundColor: '#1D3663', justifyContent: 'center', alignItems: 'center'}}>
                        <Thanks />
                    </View>
                )
            } else {
                return(
                    <View style={styles.mainContainer}>
                        {!this.state.paid && 
                        <TouchableWithoutFeedback onPress={() => {this.setState({showPaid: false})}}>
                            <View style={styles.paidShield}>
                                {this.state.showPaid ?
                                <View style={styles.premiumAdContainer}>
                                    <View style={styles.chevronContainer}>
                                        <TouchableOpacity style={styles.chevronTwo} onPress={() => {this.props.navigation.navigate('Quotes')}}>
                                            <Entypo name="chevron-thin-left" size={30} color="#EEB067" />
                                        </TouchableOpacity> 
                                    </View>
                                    <SimpleAnimation style={{flex: 1}} movementType='slide' delay={300} duration={1000} direction="up" distance={300}>
                                        <PremiumAd boughtPressed={this.handlePressed}/>
                                    </SimpleAnimation>
                                </View>
                                : 
                                <View style={styles.upgradeNowContainer}>
                                    <View style={styles.chevronContainer}>
                                        <TouchableOpacity style={styles.chevron} onPress={() => {this.props.navigation.navigate('Quotes')}}>
                                            <Entypo name="chevron-thin-left" size={30} color="#EEB067" />
                                        </TouchableOpacity>
                                    </View>
                                    <Text style={styles.paidTextHeader}>Brighter Boost Feature</Text>
                                    <TouchableOpacity onPress={() => {this.setState({showPaid: true})}} style={styles.paidButton}>
                                        <Text style={styles.paidButtonText}>Learn More</Text>
                                    </TouchableOpacity>
                                </View>
                                }
                            </View>
                        </TouchableWithoutFeedback>
                        }
    
                        <View style={styles.headerContainer}>
                            <Text style={styles.headerText}>Choices</Text>
                        </View>
                        <View style={styles.choiceContainer}>
                            <FlatList 
                                numColumns={2}
                                data={this.state.data}
                                keyExtractor={item => item.id}
                                bounces={false}
                                showsVerticalScrollIndicator={false}
                                ItemSeparatorComponent={
                                    () => <View style={{ width: 40}}/>
                                }
                                renderItem={({item}) => 
                                    <View style={styles.innerChoicesContainer}>
                                        <TouchableOpacity onPress={ () => this.updateState(item.id, item.title)} style={{width: '90%', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
                                            {item.style ? 
                                                <View style={styles.individualContainerClicked}>
                                                    <Text style={styles.choiceTextClicked}>{item.title}</Text>
                                                </View>
                                            :   
                                                <LinearGradient colors={item.gradient} style={styles.individualContainerUnClicked}>
                                                    <Text style={styles.choiceTextUnClicked}>{item.title}</Text>
                                                </LinearGradient>
                                            }
                                        </TouchableOpacity>
                                    </View>
                                }
                            />
                        </View>
                        <View style={styles.chosenContainer}>
                            <Text style={{borderBottomWidth: 2, borderColor: 'red', color: 'white', fontSize: RFPercentage(2), fontFamily: 'Montserrat'}}>Chosen:</Text>
                            <FlatList 
                            numColumns={2}
                            style={{width: '100%'}}
                            data = {this.state.choicesTitles}
                            keyExtractor={item => item.length}
                            bounces={false}
                            showsVerticalScrollIndicator={false}
                            renderItem = {({item}) =>
                                <ChoiceShower title={item}/>
                            }
                            />
                        </View>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={() => {this.goToQuotes()}} style={styles.bottomButton}>
                                <LinearGradient colors={["#4b6cb7", "#182848"]} style={styles.bottomButtonGradient}>
                                    <Text style={styles.buttonText}>Done</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
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

const styles = StyleSheet.create({
    mainContainer: {
        paddingTop: Constants.statusBarHeight,
        flex: 1,
        backgroundColor: '#1D3663',
        paddingLeft: "10%",
        paddingRight: "10%",
    },

    chevronContainer: {
        width: '13%',
        height: '25%',
        position: 'absolute',
        top: 10,
        left: 0,
        justifyContent: 'center',
        alignItems: 'center'

    },
    chevron: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    chevronTwo: {
        justifyContent: 'center',
        alignItems: 'center'
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
    },
    upgradeNowContainer: {
        zIndex: 101,
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        marginBottom: '25%',
        width: '100%',
        height: '100%',
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
        marginBottom: '25%',
        width: '100%',
        height: '100%'
    },
    



    headerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    headerText: {
        fontFamily: 'Montserrat',
        fontSize: RFPercentage(5.5),
        color: '#F3F1E0',
    },
    choiceContainer: {
        flex: 6,
        marginTop: Dimensions.get('window').height * 0.025,
        paddingTop: 10,
        borderColor: '#F3F1E0',
        borderWidth: 1,
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20,
    },
    innerChoicesContainer: {
        flex: 1,
        // backgroundColor: 'blue',
        alignItems: 'center',
        height: Dimensions.get('window').height * 0.15,
    },
    individualContainerUnClicked: {
        height: '90%',
        width: '90%',
        justifyContent: "center",
        alignItems: 'center',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#F3F1E0',
    },
    individualContainerClicked: {
        height: '90%',
        width: '90%',
        justifyContent: "center",
        alignItems: 'center',
        borderColor: '#EEB067',
        borderRadius: 20,
        borderWidth: 3,
        backgroundColor: 'rgba(238, 176, 103, 0.75)'
    },
    choiceTextClicked: {
        fontSize: RFPercentage(2.5),
        textAlign: 'center',
        padding: 5,
        color: '#F3F1E0',
        fontFamily: 'Raleway'
    },
    choiceTextUnClicked: {
        fontSize: RFPercentage(2.5),
        textAlign: 'center',
        padding: 5,
        color: '#F3F1E0',
        fontFamily: 'Raleway'
    },
    chosenContainer: {
        flex: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#F3F1E0',
        alignItems: "center",
        paddingTop: 10,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    }, 
    // BUTTON STYLE
    buttonContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    bottomButton: {
        height: '100%',
        width: '100%',
        marginTop: 30,
        marginBottom: 30,
        alignItems: 'center',
        justifyContent: 'center'
    },
    bottomButtonGradient: {
        height: '50%',
        width: '80%',
        borderRadius: 20, 
        justifyContent: 'center', 
        alignItems: 'center'
    },
    buttonText: {
        color: '#F3F1E0',
        fontSize: 20,
        fontFamily: 'Montserrat'
    },
})

const componentStyles = StyleSheet.create({
    choiceShowerComponentView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 10,
    },
    innerContainer: {
        borderColor: '#F3F1E0',
        borderWidth: 1,
        borderRadius: 10,
        padding: 5,
        width: 100,
        justifyContent: 'center',
        alignItems: 'center'
    },
    text: {
        color: '#F3F1E0',
        fontSize: RFPercentage(1.75),
        fontFamily: 'Raleway'
    }
})