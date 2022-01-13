import React from 'react'
import { StyleSheet, Text, View, SectionList, SafeAreaView, Dimensions, ActivityIndicator, TouchableOpacity } from 'react-native'
import Constants from 'expo-constants'
import {RFPercentage} from 'react-native-responsive-fontsize'
import loadFont from '../reusableComponents/font'
import { ScrollView } from 'react-native-gesture-handler'

export default class settingUpdateScreen extends React.Component {
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
                </View>
            );
        } else {
            return(
                <View style={styles.mainContainer}>
                    <View style={styles.headerContainer}>
                        <Text style={styles.headerText}>Updates</Text>
                    </View>
                    <View style={styles.contentContainer}>
                        <ScrollView style={styles.mainScroll}>
                            <View style={styles.row}>
                                <View style={styles.dateContainer}>
                                    <Text style={styles.dateText}>Version 1.1</Text>
                                </View>
                                <View style={styles.textContainer}>
                                    <Text style={styles.text}>Fixed visual glitches, issue with in app purchases, and added new quotes.</Text>
                                </View>
                            </View>
                        </ScrollView>
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

    mainScroll: {
        width: '85%',
        height: '100%',
    },

    row: {
        width: '100%',
        borderWidth: 2,
        borderColor: '#F3F1E0',
        borderRadius: 30,
        padding: '5%'
    },
    dateContainer: {
        width: '100%',
    },
    dateText: {
        fontSize: RFPercentage(2.5),
        color: "#EEB067",
        fontFamily: 'Montserrat'
    },
    textContainer: {
        width: '100%',
        marginTop: '2%'
    },
    text: {
        fontSize: RFPercentage(2.2),
        color: '#F3F1E0',
        fontFamily: 'Raleway'
    },

    contentContainer: {
        height: '85%',
        zIndex: 101,
        borderTopRightRadius: 40,
        borderTopLeftRadius: 40,
        backgroundColor: '#2C5484',
        borderBottomColor: '#F3F1E0',
        borderBottomWidth: 2,
        alignItems: 'center',
        paddingTop: '10%',
        
    },

})