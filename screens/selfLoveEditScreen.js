import React from 'react'
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, Dimensions, TextInput, TouchableWithoutFeedback, Keyboard } from 'react-native'
import Constants from 'expo-constants'
import AsyncStorage from '@react-native-community/async-storage';
import { LinearGradient } from 'expo-linear-gradient'
import {RFPercentage} from 'react-native-responsive-fontsize'
import loadFont from '../reusableComponents/font'

export default class selfLoveEditScreen extends React.Component {
    static navigationOptions = {
      headerShown: false
    }  

    constructor(props){
        super(props);
        this.state = {
          isLoading: true,
          text: "",
          newText: "Okay sir we in",
          data: [],
        }
    }

    async componentDidMount() {
      await loadFont()
      this.getData()
    }

    getData = async () => {
      const index = this.props.navigation.getParam('index', 'none')
      const dataJSON = await AsyncStorage.getItem('SelfLove')
      const data = JSON.parse(dataJSON)
      this.setState({text: data[index].text, data, index, isLoading: false})
    }

    updateData = async (newText) => {
      const data = this.state.data

      if (newText.length === 0){
        Alert.alert("Please fill out the form.")
        return
      }

      if (data === 1) {
        const newData = [{
          text: newText
        }]
        const newJSON = JSON.stringify(newData)
        await AsyncStorage.removeItem("SelfLove")
        await AsyncStorage.setItem("SelfLove", newJSON)
      } else {
        const newData = {
          text: newText
        }
        data.splice(this.state.index, 1, newData)
        const dataJSON = JSON.stringify(data)
        await AsyncStorage.setItem("SelfLove", dataJSON)
      }
    }

    render() {
      if (this.state.isLoading) {
        return (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1D3663'}}>
                <ActivityIndicator size="large" color="#F3F1E0"/>
            </View>
        );
      } else {
        return (
            <TouchableWithoutFeedback onPress={() => {Keyboard.dismiss()}}>
                <View style={styles.mainContainer}>
                    <View style={styles.headerContainer}>
                        <Text style={styles.headerText}>Edit Note</Text>
                    </View>
                    <View style={styles.inputContainer}>
                        <View style={styles.inputTextContainer}>
                            <Text style={styles.inputText}>Note</Text>
                        </View>
                        <TextInput 
                        style={styles.inputStyle}
                        multiline={true}
                        maxLength={150}
                        value={this.state.text}
                        onChangeText={(text) => {this.setState({text})}}
                        />
                        <View style={styles.inputCharacterContainer}>
                            <Text style={styles.characterText}><Text style={this.state.text.length === 150 ? {color: '#EEB067', fontSize: RFPercentage(2.7), fontFamily: 'Montserrat'} : {color: '#F3F1E0', fontSize: RFPercentage(2.7), fontFamily: 'Montserrat'}}>{this.state.text.length}</Text> / 200</Text>
                        </View>
                    </View>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.bottomButton} onPress={() => {this.updateData(this.state.text), this.props.navigation.navigate("SelfLoveHome")}}>
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