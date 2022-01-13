import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient';
import {RFPercentage} from 'react-native-responsive-fontsize'
import loadFont from '../reusableComponents/font'
import { AntDesign } from '@expo/vector-icons';
import { withNavigation } from 'react-navigation';


class PremiumAd extends React.Component {

    async componentDidMount(){
        await loadFont()
    }

    handleInputChange = () => {
        console.log('1')
        this.props.boughtPressed()
    }

    goToScreen = async () => {
            this.props.navigation.navigate('SettingsBoost')
    }

    render(){
        return (
            <View intensity={30} style={styles.mainContainer}>
                <View style={styles.contentContainer}>
                    <View style={styles.priceContainer}>
                        <Text style={styles.priceText}>$2.00</Text>
                    </View>
                    <View style={styles.headerContainer}>
                        <View style={styles.innerHeaderOne}>
                            <Text style={styles.proText}>Boost</Text>
                        </View>
                    </View>
                    <View style={styles.container}>
                        <AntDesign style={styles.check} name="checkcircleo" size={20} color="#3dbf82" />
                        <View style={styles.lineThroughContainer}>
                            <View style={styles.line}/>
                            <Text style={styles.lineThrough}>20</Text>
                        </View>
                        <Text style={styles.contentText}><Text style={styles.hundred}> 100</Text> Notes</Text>
                    </View>
                    <View style={styles.container}>
                        <AntDesign style={styles.check} name="checkcircleo" size={20} color="#3dbf82" />
                        <Text style={styles.contentText}>Access to themed quotes</Text>
                    </View>
                    <View style={styles.container}>
                        <AntDesign style={styles.check} name="checkcircleo" size={20} color="#3dbf82" />
                        <View style={styles.lineThroughContainer}>
                            <View style={styles.line}/>
                            <Text style={styles.lineThrough}>300</Text>
                        </View>
                        <Text style={styles.contentText}><Text style={styles.hundred}> 3000+</Text> New Quotes</Text>
                    </View>
                    <View style={styles.container}>
                        <AntDesign style={styles.check} name="checkcircleo" size={20} color="#3dbf82" />
                        <Text style={styles.contentText}>Access to new features</Text>
                    </View>
                    <View style={styles.container}>
                        <AntDesign style={styles.check} name="checkcircleo" size={20} color="#3dbf82" />
                        <Text style={styles.contentText}>Help keep the app alive</Text>
                    </View>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.bottomButton} onPress={() => {this.handleInputChange()}}>
                            <LinearGradient colors={["#4b6cb7", "#182848"]} style={styles.buttonGradient}>
                                <Text style={styles.buttonText}>Buy Now</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {this.goToScreen()}} style={{position: 'absolute', right: '1%'}}>
                            <AntDesign name="questioncircleo" size={30} color="#EEB067" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        )
    }
}

// PORSCHE #EEB067 GOLD
// CREAM #F3F1E0
// RUM #776388 PURPLE

// FROM BACKGROUND ON QUOTE SCREEN
// DARK BLUE #1D3663
// BLUE #2C5484

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: '10%',
        paddingRight: '10%'
    },
    contentContainer: {
        width: '100%',
        height: '60%',
        backgroundColor: '#2C5484',
        borderRadius: 20,
        padding: 15,
        overflow: 'hidden',
        borderWidth: 3,
        borderColor: '#EEB067',
    },
    priceContainer: {
        position: 'absolute',
        top: '5%',
        left: '60%',
        transform: [{rotate: '45 deg'}],
        width: '70%',
        height: '11%',
        backgroundColor: '#EEB067',
        justifyContent: 'center',
        alignItems: 'center',
    },
    priceText: {
        fontSize: RFPercentage(3),
        color: '#F3F1E0',
        fontFamily: 'Montserrat'
    },
    headerContainer: {
        flex: 1,
        flexDirection: 'row'
    },
    innerHeaderOne: {
        alignSelf: 'baseline',
        borderBottomWidth: 3, 
        borderColor: '#EEB067',
        justifyContent: 'center',
    },
    proText: {
        fontSize: RFPercentage(5),
        color: '#F3F1E0',
        borderBottomWidth: 3, 
        borderColor: '#EEB067',
        fontFamily: 'Montserrat'
    },
    contentText: {
        fontSize: RFPercentage(2.65),
        color: '#F3F1E0',
        fontFamily: 'Raleway',
        flexDirection: 'row'
    },
    lineThroughContainer: {
    },
    line: {
        position: 'absolute',
        borderWidth: 1.5,
        width: '100%',
        zIndex: 102,
        borderColor: '#fc7784',
        top: '18%',
        
    },
    lineThrough: {
        fontSize: RFPercentage(2.5),
        fontFamily: 'Montserrat',
        color: '#F3F1E0'
    },
    hundred: {
        fontSize: RFPercentage(3.5),
        color: '#EEB067',
        fontFamily: 'Montserrat'
    },
    container: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center'
    },
    check: {
        marginRight: 10
    },


    // BUTTON
    buttonContainer: {
        flex: 1,
        paddingLeft: Dimensions.get('window').width * 0.1,
        paddingRight: Dimensions.get('window').width * 0.1,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row'
        // paddingTop: Dimensions.get('window').height * 0.05,
        // paddingBottom: Dimensions.get('window').height * 0.05,
      }, 
      bottomButton: {
        marginTop: 30,
        marginBottom: 30,
        width: '100%',
        height: '70%',
      },
      buttonText: {
        color: '#F3F1E0',
        fontSize: RFPercentage(2.5),
        fontFamily: 'Montserrat'
      },
      buttonGradient: {
        flex: 1, 
        borderRadius: 25, 
        justifyContent: 'center', 
        alignItems: 'center',
        width: '100%'
      },
})


export default withNavigation(PremiumAd)