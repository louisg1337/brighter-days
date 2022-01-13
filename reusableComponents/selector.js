import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import { AntDesign } from '@expo/vector-icons';

export default class Selector extends React.Component {
    state = {
        number: 2
    }

    componentDidMount() {
        // this.props.value = this.state.number
    }

    handleChange = (val) => {
        this.props.numberChange(val.target.value);
    }

    render(){
        const currentNumber = this.props.number
        return (
            <View style={styles.mainContainer}>
                <TouchableOpacity onPress={() => {this.handleChange('minus')}}>
                    <AntDesign name="minuscircleo" size={25} color="#F3F1E0" />
                </TouchableOpacity>
                <Text style={styles.text}>{currentNumber}</Text>
                <TouchableOpacity onPress={() => {this.handleChange('plus')}}>
                    <AntDesign name="pluscircleo" size={25} color="#F3F1E0" />
                </TouchableOpacity>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    mainContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    text: {
        color: '#F3F1E0',
        fontSize: 25,
        marginLeft: 10,
        marginRight: 10,

    }
})