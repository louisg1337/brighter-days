import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient';
import {RFPercentage} from 'react-native-responsive-fontsize'
import loadFont from '../reusableComponents/font'
import { AntDesign } from '@expo/vector-icons';
import { withNavigation } from 'react-navigation';
import {SimpleAnimation} from 'react-native-simple-animations'

class Thanks extends React.Component {

    async componentDidMount(){
        await loadFont()
    }

    render(){
        return (
                <SimpleAnimation duration={2500} delay={500} movementType='slide' direction='down' distance={1000} style={styles.mainContainer}>
                    <View style={styles.textContainer}>
                        <Text style={styles.headerText}>THANK YOU</Text>
                        <Text style={styles.bodyText}>From the bottom of my heart, thank you for supporting the app! It would not be possible without generous supporters like you! Now, please go enjoy the new features you just unlocked.</Text>
                    </View>
                    <TouchableOpacity style={styles.bottomButton} onPress={() => {this.props.navigation.navigate("Quotes")}}>
                        <LinearGradient colors={["#4b6cb7", "#182848"]} style={styles.buttonGradient}>
                            <Text style={styles.buttonText}>Explore Now</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </SimpleAnimation>
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
        width: '90%',
        borderWidth: 4,
        borderColor: '#EEB067',
        backgroundColor: '#2C5484',
        shadowColor: '#EEB067',
        shadowOffset: {
            width: 0,
            height: 0,
        },
        height: '44%',
        shadowOpacity: 0.80,
        shadowRadius: 15,
        elevation: 19,
        borderRadius: 20,
    },
    textContainer: {
    },
    headerText: {
        color: '#EEB067',
        fontSize: RFPercentage(5),
        paddingTop: '5%',
        textAlign: 'center',
        textAlignVertical: 'center',
        fontFamily: 'Montserrat'
    },
    bodyText: {
        color: '#F3F1E0',
        fontSize: RFPercentage(2.3),
        paddingTop: '2%',
        textAlign: 'center',
        paddingLeft: '3%',
        paddingRight: '3%',
        fontFamily: 'Raleway',
        paddingBottom: '3%'
    },
    bottomButton: {
        width: '80%',
        height: '20%',
        marginLeft: '10%',
        marginRight: '10%',
        justifyContent: 'center',
        alignItems: 'center',
      },
    buttonText: {
        color: '#F3F1E0',
        fontSize: RFPercentage(2.5),
        fontFamily: 'Montserrat'
    },
    buttonGradient: {
        borderRadius: 25, 
        justifyContent: 'center', 
        alignItems: 'center',
        width: '100%',
        height: '100%'
    },
})


export default withNavigation(Thanks)