import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  StatusBar,
  ImageBackground,
  Image,
} from "react-native";
import * as Animatable from "react-native-animatable";
// import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useTheme } from "@react-navigation/native";

const SplashScreen = ({ navigation }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../../assets/splash.png")}
        resizeMode="cover"
        style={styles.image}
      >
        <StatusBar barStyle="default" />
        <View style={styles.header}>
          {/* <Animatable.Image
					animation="bounceIn"
					duraton="1500"
					source={require('../../../assets/img/expo-bg1.png')}
					style={styles.logo}
					resizeMode="stretch"
				/> */}
        </View>
        <Animatable.View
          style={[
            styles.footer,
            {
              backgroundColor: colors.background,
            },
          ]}
          animation="fadeInUpBig"
        >
          <Text
            style={[
              styles.title,
              {
                color: colors.text,
              },
            ]}
          >
            Built for Every Stage of Life
          </Text>
          <Text style={styles.text}>Save, Borrow & Grow</Text>
          <View style={styles.button}>
            <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
              <View style={styles.signIn}>
                <Text style={styles.textSign}>Get Started</Text>
                <MaterialIcons name="navigate-next" color="#fff" size={20} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <View style={styles.signIn2}>
                <Text style={styles.textSign2}>Sign in</Text>
                <MaterialIcons name="navigate-next" color="#00ab55" size={20} />
              </View>
            </TouchableOpacity>
          </View>
        </Animatable.View>
      </ImageBackground>
    </View>
  );
};

export default SplashScreen;

const { height } = Dimensions.get("screen");
const height_logo = height * 0.28;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#00ab55',
  },
  header: {
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    flex: 1,
    justifyContent: "center",
  },
  footer: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingVertical: 50,
    paddingHorizontal: 30,
  },
  logo: {
    width: height_logo,
    height: height_logo,
  },
  title: {
    color: "#05375a",
    fontSize: 30,
    fontWeight: "bold",
  },
  text: {
    color: "grey",
    marginTop: 5,
    fontSize: 16,
  },
  button: {
    alignItems: "flex-end",
    marginTop: 30,
  },
  signIn: {
    backgroundColor: "#00ab55",
    width: 150,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
    flexDirection: "row",
  },
  signIn2: {
    // backgroundColor: '#00ab55',
    width: 150,
    height: 40,
    marginTop: 5,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
    flexDirection: "row",
  },
  textSign: {
    color: "white",
    fontWeight: "bold",
  },
  textSign2: {
    color: "#00ab55",
    fontWeight: "bold",
  },
});
