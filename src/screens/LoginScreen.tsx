import React, { useState } from "react";
import { USER_ERROR , addUser , validateLoginRequest } from "../../lib/modules/UserManager.ts";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import  AuthStackParamList from "../../App.tsx";
import { drop } from "../../lib/modules/FileManager.ts";

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validateEmail = () => {
    if (!email) {
      setEmailError("Please enter an email address");
      return;
    }
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setEmailError("Not a valid email address.");
    } else { // Case it went through poll clear the error 
      if (emailError) {
        setEmailError("");
      }
    }
  };


  const pollDatabase = async ( email : string , password : string ) => { 
    console.log("pollDatabase evoked");
    const res = await validateLoginRequest( email , password ) ; 
    console.log(res) ;
    // res != null ? navigation.navigate("Home" , { firstname : res.firstname , lastname : res.lastname }) : Alert.alert(`Incorrect email or password\nPlease try again`) ;
    res != null ? navigation.navigate("Main" , { firstname : res.firstname , lastname : res.lastname }) : Alert.alert(`Incorrect email or password\nPlease try again`) ;
  }

  const validatePassword = () => {
    if (!password) {
      setPasswordError("Please enter a password");
      return;
    }
    if (password.length < 8) {
      setPasswordError("Invalid password.");
    } else {
      setPasswordError("");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome back!</Text>
      <Text style={styles.subHeader}>Sign in to access your files</Text>

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={[styles.input, emailError ? styles.errorBorder : null]}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            onBlur={validateEmail}
            keyboardType="email-address"
          />
          <Ionicons
            name="mail-outline"
            size={20}
            color="#999"
            style={styles.iconRight}
          />
        </View>
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

        <View style={styles.inputWrapper}>
          <TextInput
            style={[styles.input, passwordError ? styles.errorBorder : null]}
            placeholder="New Password"
            value={password}
            onChangeText={setPassword}
            onBlur={validatePassword}
            secureTextEntry={!passwordVisible}
          />
          <TouchableOpacity
            onPress={() => setPasswordVisible(!passwordVisible)}>
            <Ionicons
              name={passwordVisible ? "eye-off" : "eye"}
              size={20}
              color="#999"
            />
          </TouchableOpacity>
        </View>
        {passwordError ? (
          <Text style={styles.errorText}>{passwordError}</Text>
        ) : null}
      </View>

      <TouchableOpacity
        style={[
          styles.continueButton,
          email && password && !emailError && !passwordError
            ? styles.active
            : styles.disabled,
        ]}
        onPress={() => pollDatabase( email , password ) }
        disabled={!email || !password || !!emailError || !!passwordError}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>

      {/* <TouchableOpacity */}
      {/*   style={styles.continueButton} */}
      {/*   onPress={ () => addUser("a.moahmed17@gmail.com" , "testuser123" , "Ayub" , "Mohamed")} */}
      {/* > */}
      {/*   <Text> */}
      {/*     Add test user */}
      {/*   </Text> */}
      {/* </TouchableOpacity> */}

      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>Don’t have an account?</Text>
        <TouchableOpacity
          onPress={() =>{ navigation.navigate("Register")} }>
          <Text style={styles.registerText}> Register now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    padding: 20,
    backgroundColor: "#fff",
    paddingTop: 170,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subHeader: {
    fontSize: 16,
    color: "gray",
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  errorBorder: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
  },
  continueButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  disabled: {
    backgroundColor: "#ddd",
  },
  active: {
    backgroundColor: "#007AFF",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
  },
  footerText: {
    fontSize: 14,
  },
  registerText: {
    color: "#007AFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  iconRight: {
    marginLeft: 10,
  },
});

export default LoginScreen;
