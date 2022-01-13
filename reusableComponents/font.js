import * as Font from 'expo-font'

export default loadFont = async () => {
    await Font.loadAsync({
      Raleway: require('../assets/fonts/Raleway-Regular.ttf'),
      RalewayItalic: require('../assets/fonts/Raleway-Italic.ttf'),
      Montserrat: require('../assets/fonts/Montserrat-Regular.ttf'),
    })
}