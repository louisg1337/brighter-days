import React from 'react'
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, FlatList, Dimensions, ScrollView } from 'react-native'
import { Entypo } from '@expo/vector-icons';
import Constants from 'expo-constants'
import AsyncStorage from '@react-native-community/async-storage';
import { AntDesign } from '@expo/vector-icons';
import { gradients } from '../data/getGradients'
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import {RFPercentage} from 'react-native-responsive-fontsize'
import loadFont from '../reusableComponents/font'

export default class selfLoveListScreen extends React.Component {
    static navigationOptions = {
      headerShown: false
    }  

    constructor(props){
        super(props);
        this.state = {
          isLoading: true,
          data: [],
          hasData: true,
          paid: false,
        }
    }

    async componentDidMount() {
        this.setState({isLoading: true})
        const { navigation } = this.props
        this.focusListener = navigation.addListener("didFocus", async () => {
            this.setState({isLoading: true})
            await loadFont()
            this.getData().then((val) => {
                this.setState({
                    data: val.data,
                    hasData: val.hasData,
                    isLoading: false,
                })
            })
        });

        await loadFont()
        await this.getData().then((val) => {
            this.setState({
                data: val.data,
                hasData: val.hasData,
                isLoading: false,
            })
        })
    }

    componentWillUnmount() {
        this.focusListener.remove()
        this.setState({isLoading: true})
    }

    getData = async () => {
        const dataJSON = await AsyncStorage.getItem("SelfLove")
        const data = JSON.parse(dataJSON)
        let hasData = false

        if (data === null){
            hasData = false
        } else {
            if (data.length === 0) {
                hasData = false 
            } else {
                data.map(value => {
                    value['gradient'] = this.getGradient()
                })
                hasData = true
            }
        }

        return {data, hasData}
    }

    delete = async (index) => {
        this.setState({isLoading: true})
        const data = this.state.data
        data.splice(index, 1)
        const dataJSON = JSON.stringify(data)
        await AsyncStorage.setItem("SelfLove", dataJSON)
        await this.getData().then((val) => {
            this.setState({
                data: val.data,
                hasData: val.hasData,
                isLoading: false,
            })
        })
    }

    getGradient = () => {
        const rand = Math.floor(Math.random() * gradients.length)
        return gradients[rand]
    }

    RightActions = ({progress, dragX, index}) => {
        const scale = dragX.interpolate({
          inputRange: [0, 100],
          outputRange: [0, 1],
          etrapolate: "clamp"
        })
        return (
          <View style={styles.hiddenItems}>
            <TouchableOpacity style={styles.deleteContainer} onPress={()=>{this.delete(index)}}>
              <AntDesign name="delete" size={35} color="#F3F1E0" style={styles.deleteIcon}/>
            </TouchableOpacity> 
            <TouchableOpacity style={styles.editContainer} onPress={() => {this.props.navigation.navigate("SelfLoveEdit", {index: index}), this.setState({isLoading: true})}}>
              <Feather name="edit-2" size={35} color="#F3F1E0" style={styles.editIcon} />
              {/* <FontAwesome5 name="edit" size={35} color="#F3F1E0" style={styles.editIcon}/> */}
            </TouchableOpacity>
          </View>
        );
    };

    render() {
        if (this.state.isLoading) {
            return (
                <View style={[styles.mainContainer, {justifyContent: 'center', alignItems: 'center'}]}>
                    <ActivityIndicator size="large" color="#F3F1E0"/>
                </View>
            );
        } else {
            if (this.state.hasData){
                return (
                        <View style={styles.mainContainer}>
                            <View style={styles.headerContainer}>
                                <Text style={styles.headerText}>Notes List</Text>
                            </View>
                            <View style={styles.contentContainer}>
                                <View style={styles.innerContentContainer}>
                                    <FlatList
                                        showsVerticalScrollIndicator={false} 
                                        style={{width: '100%'}}
                                        data={this.state.data}
                                        ItemSeparatorComponent={() => (<View style={{height: Dimensions.get('window').height * 0.025, flex: 1}}/>)}
                                        renderItem={({item, index}) => (
                                            <Swipeable 
                                            renderRightActions={(progress, dragX) => <this.RightActions progress={progress} dragX={dragX} index={index}/>}
                                            rightThreshold={30}
                                            >
                                                <LinearGradient colors={item.gradient} style={styles.individualContainer}>
                                                    <Text style={styles.message}>{item.text}</Text>
                                                </LinearGradient>
                                            </Swipeable>
                                        )}
                                        keyExtractor={(item, index) => index.toString()}
                                    />
                                </View>
                            </View>
                        </View>
                );
            } else {
                return (
                    <View style={styles.mainContainer}>
                        <View style={styles.headerContainer}>
                            <Text style={styles.headerText}>Notes List</Text>
                        </View>
                        <View style={styles.contentContainer}>
                            <ScrollView style={styles.innerContentContainer}>
                                <TouchableOpacity style={styles.outerCreateNewContainer} onPress={() => {this.props.navigation.navigate('SelfLoveNew')}}>
                                    <LinearGradient colors={this.getGradient()} style={styles.individualContainerCreateNew}>
                                        <Text style={styles.createNewText}>Create a new note!</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    </View>
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
        borderBottomColor: '#F3F1E0',
        borderBottomWidth: 1,
        alignItems: 'center',
        paddingTop: '4%',
        paddingBottom: '1%',
        
    },
    innerContentContainer: {
        width: '90%',
        height: '100%'
    },




    individualContainer: {
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center'
    },
    message: {
        color: '#F3F1E0',
        fontSize: RFPercentage(2.5),
        padding: 20,
        fontFamily: 'Raleway'
    },
    floatButton: {
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.2)",
        alignItems: "center",
        justifyContent: "center",
        width: 60,
        position: "absolute",
        bottom: 15,
        right: 10,
        height: 60,
        backgroundColor: "#EEB067",
        borderRadius: 100
    }, 

    // CREATE NEW
    createNewText: {
        color: '#F3F1E0',
        fontSize: RFPercentage(3),
        fontFamily: 'Raleway'
    },
    createNewContainer: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
    },
    individualContainerCreateNew: {
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        height: '150%'
    },

    // HIDDEN
    hiddenItems: {
        flex: 1,
        flexDirection: 'row',
        borderRadius: 30,
      },
      deleteContainer: {  
        backgroundColor: '#fc7784',
        flex: 1,
        borderBottomLeftRadius: 30,
        borderTopLeftRadius: 30,
        justifyContent: 'center',
        alignItems: 'center'
      },
      deleteIcon: {
    
      },
      editContainer: {
        backgroundColor: '#3dbf82',
        flex: 1,
        borderBottomRightRadius: 30,
        borderTopRightRadius: 30,
        justifyContent: 'center',
        alignItems: 'center'
      }, 
      editIcon: {
    
      }
})