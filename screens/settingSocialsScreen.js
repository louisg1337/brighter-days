import React from 'react'
import { StyleSheet, Text, View, Dimensions, ActivityIndicator} from 'react-native'
import Constants from 'expo-constants'
import {RFPercentage} from 'react-native-responsive-fontsize'
import loadFont from '../reusableComponents/font'
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';

export default class settingSocialsScreen extends React.Component {
    static navigationOptions = {
        headerShown: false,
    }  

    constructor(props){
        super(props);
        this.state = {
            isLoading: true
        }
    }

    async componentDidMount() {
        await loadFont()
        this.setState({isLoading: false})
    }

    iconSize = () => {
        const height = Dimensions.get('window').height
        if (height < 700){
            return 30
        } else {
            return 40
        }
    }

    render(){
        if (this.state.isLoading){
            return (
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1D3663'}}>
                  <ActivityIndicator size="large" color="#F3F1E0"/>
                </View>
            );
        } else {
            return(
                <View style={styles.mainContainer}>
                    <View style={styles.headerContainer}>
                        <Text style={styles.headerText}>Instagram</Text>
                    </View>
                    <View style={styles.contentContainer}>
                        <View style={styles.emailContainer}>
                            <View style={styles.emailIcon}>
                                <AntDesign name="instagram" size={this.iconSize()} color="#EEB067" />
                            </View>
                            <View style={styles.emailTextContainer}>
                                <Text style={styles.emailText}>Brighter Days App</Text>
                            </View>
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.textStyle}>Follow us here for inspirational content!</Text>
                        </View>
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

    contentContainer: {
        height: '85%',
        zIndex: 101,
        borderTopRightRadius: 40,
        borderTopLeftRadius: 40,
        backgroundColor: '#2C5484',
        alignItems: 'center',
        paddingTop: '10%',
        paddingLeft: Dimensions.get('window').width * 0.1,
        paddingRight: Dimensions.get('window').width * 0.1,
        borderBottomColor: '#F3F1E0',
        borderBottomWidth: 1,
    },
    
    emailContainer: {
        width: '100%',
        flexDirection: 'row',
        height: '10%',
    },
    emailIcon: {
        width: '15%',
        height: '100%',
        justifyContent: 'center',
        borderBottomWidth: 2,
        borderColor: '#EEB067',
        alignItems: 'center'
    },
    emailTextContainer: {
        height: '100%',
        borderBottomWidth: 2,
        borderColor: '#EEB067',
        justifyContent: 'center',
        alignSelf: 'baseline',
        marginLeft: '5%'
    },
    emailText: {
        color: '#F3F1E0',
        fontSize: RFPercentage(2.7),
        fontFamily: 'Montserrat'
    },

    textContainer: {
        width: '100%',
        marginTop: '10%'
    },
    textStyle: {
        fontFamily: 'Montserrat',
        color: '#F3F1E0',
        fontSize: RFPercentage(2.5)
    }
})