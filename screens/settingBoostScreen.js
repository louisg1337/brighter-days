import React from 'react'
import { StyleSheet, Text, View, Alert, Dimensions, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native'
import Constants from 'expo-constants'
import {RFPercentage, RFValue} from 'react-native-responsive-fontsize'
import AsyncStorage from '@react-native-community/async-storage'
import loadFont from '../reusableComponents/font'
import { AntDesign } from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient'
import Thanks from '../reusableComponents/thanks'
import * as InAppPurchases from 'expo-in-app-purchases'

export default class settingBoostScreen extends React.Component {
    static navigationOptions = {
        headerShown: false,
    }  

    constructor(props){
        super(props);
        this.state = {
            isLoading: true,
            bought: false,
        }
    }

    async componentDidMount() {
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
        this.setState({isLoading: false})
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
            try {
                const { responseCode, results } = await InAppPurchases.getProductsAsync(items)
                this.setState({items: results})
                if (responseCode === InAppPurchases.IAPResponseCode.OK){
                    await InAppPurchases.purchaseItemAsync('boost')
                    setTimeout(() => {this.checkPaid()}, 3500)
                } else {
                    console.log('Error!')
                    this.setState({isLoading: false})
                    Alert.alert("I'm sorry, an issue has occured. Please find my contact information in the settings and email me the issue.")
                }
            } catch (e) {
                this.setState({isLoading: false})
                console.log(e)
            }
        })
    }

    checkPaid = async () => {
        const paidJSON = await AsyncStorage.getItem("Paid")
        const paid = JSON.parse(paidJSON)
        if (paid === null || paid === false) {
            this.setState({paid: false, isLoading: false})
        } else {
            this.setState({paid: true, isLoading: false})
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
                    {!this.state.paid &&
                        <Text style={{textAlign: 'center', color: '#F3F1E0', fontSize: RFPercentage(3), fontFamily: 'Montserrat', paddingTop: '4%'}}>Do not leave this page</Text>
                    }
                </View>
            );
        } else {
            if (this.state.bought){
                return (
                    <View style={[styles.mainContainer, {justifyContent: 'center', alignItems: 'center'}]}>
                       <Thanks />
                    </View>
                )
            } else {
                return(
                    <View style={styles.mainContainer}>
                        <View style={styles.headerContainer}>
                            <Text style={styles.headerText}>Brighter Boost</Text>
                        </View>
                        <View style={styles.contentContainer}>
                            <View style={{width: '100%', height: '82%'}}>
                                {/* <View style={styles.chevron}>
                                    <Entypo name="chevron-thin-down" size={50} color="#EEB067" />
                                </View> */}
                                <ScrollView 
                                style={styles.scrollViewStyle}>
                                    <View style={styles.row}>
                                        <View style={styles.innerRow}>
                                            <View style={styles.headerListContainer}>
                                                <View style={styles.iconHeader}>
                                                    <AntDesign style={styles.check} name="checkcircleo" size={30} color="#3dbf82" />
                                                </View>
                                                <View style={styles.listHeaderTextContainer}>
                                                    <Text style={styles.listHeaderText}>Price: $2.00</Text>
                                                </View>
                                            </View>
                                            <View style={styles.textContainer}>
                                                <Text style={styles.contentTextStyle}>Its a 1/4 of the price of a deli sandwhich, something that will last you 10 minutes. This lasts a life time.</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <View style={styles.row}>
                                        <View style={styles.innerRow}>
                                            <View style={styles.headerListContainer}>
                                                <View style={styles.iconHeader}>
                                                    <AntDesign style={styles.check} name="checkcircleo" size={30} color="#3dbf82" />
                                                </View>
                                                <View style={styles.listHeaderTextContainer}>
                                                    <Text style={styles.listHeaderText}>Keep Brighter Days Alive</Text>
                                                </View>
                                            </View>
                                            <View style={styles.textContainer}>
                                                <Text style={styles.contentTextStyle}>This money goes directly back into the app to pay for its expenses.</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <View style={styles.row}>
                                        <View style={styles.innerRow}>
                                            <View style={styles.headerListContainer}>
                                                <View style={styles.iconHeader}>
                                                    <AntDesign style={styles.check} name="checkcircleo" size={30} color="#3dbf82" />
                                                </View>
                                                <View style={styles.listHeaderTextContainer}>
                                                    <Text style={styles.listHeaderText}>Future Updates</Text>
                                                </View>
                                            </View>
                                            <View style={styles.textContainer}>
                                                <Text style={styles.contentTextStyle}>Exclusive access to upcoming features, such as a favorite tab for quotes.</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <View style={styles.row}>
                                        <View style={styles.innerRow}>
                                            <View style={styles.headerListContainer}>
                                                <View style={styles.iconHeader}>
                                                    <AntDesign style={styles.check} name="checkcircleo" size={30} color="#3dbf82" />
                                                </View>
                                                <View style={styles.listHeaderTextContainer}>
                                                    <Text style={styles.listHeaderText}>100 Notes</Text>
                                                </View>
                                            </View>
                                            <View style={styles.textContainer}>
                                                <Text style={styles.contentTextStyle}>Instead of 20 jar notes, you get 100.</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <View style={styles.row}>
                                        <View style={styles.innerRow}>
                                            <View style={styles.headerListContainer}>
                                                <View style={styles.iconHeader}>
                                                    <AntDesign style={styles.check} name="checkcircleo" size={30} color="#3dbf82" />
                                                </View>
                                                <View style={styles.listHeaderTextContainer}>
                                                    <Text style={styles.listHeaderText}>3000+ New Quotes</Text>
                                                </View>
                                            </View>
                                            <View style={styles.textContainer}>
                                                <Text style={styles.contentTextStyle}>Access to 3000 new quotes, compared to the standard 300.</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <View style={styles.row}>
                                    <View style={styles.innerRow}>
                                        <View style={styles.headerListContainer}>
                                            <View style={styles.iconHeader}>
                                                <AntDesign style={styles.check} name="checkcircleo" size={30} color="#3dbf82" />
                                            </View>
                                            <View style={styles.listHeaderTextContainer}>
                                                <Text style={styles.listHeaderText}>Themed quotes</Text>
                                            </View>
                                        </View>
                                        <View style={styles.textContainer}>
                                            <Text style={styles.contentTextStyle}>Access to 10 themed quote options, with many more to be added in the future.</Text>
                                        </View>
                                    </View>
                                </View>
                                </ScrollView>
                            </View>
                            {this.state.paid ?
                            <View style={styles.buttonContainer}>
                                <View style={styles.innerButtonContainer}>                                   
                                    <LinearGradient colors={["#4b6cb7", "#182848"]} style={styles.button}>
                                        <Text style={styles.buttonText}>THANK YOU</Text>
                                    </LinearGradient>
                                </View>
                            </View>  
                            :
                            <View style={styles.buttonContainer}>
                                <View style={styles.innerButtonContainer}>
                                    <TouchableOpacity onPress={() => {this.handlePressed()}}>
                                        <LinearGradient colors={["#4b6cb7", "#182848"]} style={styles.button}>
                                            <Text style={styles.buttonText}>Buy Now</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            }
                        </View>
                    </View>
                )
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
    contentContainer: {
        height: '85%',
        zIndex: 101,
        borderTopRightRadius: 40,
        borderTopLeftRadius: 40,
        backgroundColor: '#2C5484',
        borderBottomColor: '#EEB067',
        borderBottomWidth: 1,
        alignItems: 'center',
        paddingTop: '10%',
        paddingLeft: '10%',
        paddingRight: '10%'
    },
    row: {
        width: '100%',
        alignItems: 'center'
    },
    innerRow: {
        width: '100%',
        paddingBottom: '5%'
    },
    headerListContainer: {
        flexDirection: 'row',
        width: '100%'
    },

    
    iconHeader: {
        justifyContent: 'center',
        width: '12%'
    },

    scrollViewStyle: {
        width: '100%', 
        height: '100%', 
        borderBottomColor: '#F3F1E0', 
        borderBottomWidth: 1
    },
    chevron: {
        position: 'absolute',
        alignSelf: 'center',
        bottom: 0,
        zIndex: 10
    },

    listHeaderTextContainer: {
        justifyContent: 'center',
        borderBottomColor: '#EEB067',
        borderBottomWidth: 2,
        alignSelf: 'baseline'
    },
    listHeaderText: {
        fontSize: RFPercentage(2.8),
        color: '#F3F1E0',
        fontFamily: 'Montserrat'
    },

    textContainer: {
        paddingTop: '3%'
    },
    contentTextStyle: {
        fontFamily: 'Raleway',
        color: '#F3F1E0',
        fontSize: RFPercentage(2)
    },

    buttonContainer: {
        width: '100%',
        height: '17%',
        alignItems: 'center',
        justifyContent: 'center'
    },
    innerButtonContainer: {
        width: '85%',
        height: '50%'
    },
    button: {
        width: '100%',
        height: '100%',
        borderRadius: buttonLogic(),
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonText: {
        color: '#F3F1E0',
        fontFamily: 'Montserrat',
        fontSize: RFPercentage(2.4)
    }

})
