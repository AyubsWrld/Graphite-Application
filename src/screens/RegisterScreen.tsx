import React, { useState } from "react";
import{
  View,
  Text,
  Alert, 
  TextInput,
  StyleSheet,
  TouchableOpacity
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { addUser , USER_ERROR } from "../../lib/modules/UserManager.ts";

type Props = NativeStackScreenProps<AppStackParamList, "Register">;

export function RegisterScreen( {navigation} : props ) {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");


  const writeUser = async () => {
    console.log("writeUser invoked");
    const res : USER_ERROR = await addUser( email , password , name.split(' ')[0] , name.split(' ')[1]) ; 
    if ( res != USER_ERROR.USER_OK ) {
      Alert.alert(`User exists already\nPlease try again`) ;
    }else{
      Alert.alert(`Sucessfully created user`) ;
      navigation.navigate("Login") ;
    }
  }

  const validateEmail = () => {
    if (!email) {
      setEmailError("");
      return;
    }
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setEmailError("Not a valid email address.");
    }
  };

  const validatePassword = () => {
    if (!password) {
      setPasswordError("");
      return;
    }
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
    } else {
      setPasswordError("");
    }
  };

  const validateConfirmPassword = () => {
    if (confirmPassword !== password) {
      setConfirmPasswordError("Passwords don’t match.");
    } else {
      setConfirmPasswordError("");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.header}>Get Started</Text>
        <Text style={styles.subHeader}>By creating a free account.</Text>

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Full name"
              value={name}
              onChangeText={setName}
            />
            <Ionicons
              name="person-outline"
              size={20}
              color="#999"
              style={styles.iconRight}
            />
          </View>

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
          {emailError ? (
            <Text style={styles.errorText}>{emailError}</Text>
          ) : null}

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

          <View style={styles.inputWrapper}>
            <TextInput
              style={[
                styles.input,
                confirmPasswordError ? styles.errorBorder : null,
              ]}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              onBlur={validateConfirmPassword}
              secureTextEntry={!confirmPasswordVisible}
            />
            <TouchableOpacity
              onPress={() =>
                setConfirmPasswordVisible(!confirmPasswordVisible)
              }>
              <Ionicons
                name={confirmPasswordVisible ? "eye-off" : "eye"}
                size={20}
                color="#999"
              />
            </TouchableOpacity>
          </View>
          {confirmPasswordError ? (
            <Text style={styles.errorText}>{confirmPasswordError}</Text>
          ) : null}
        </View>
        <TouchableOpacity
          style={[
            styles.continueButton,
            name &&
            email &&
            password &&
            confirmPassword &&
            !emailError &&
            !passwordError &&
            !confirmPasswordError
              ? styles.active
              : styles.disabled,
          ]}
          disabled={
            !name ||
            !email ||
            !password ||
            !confirmPassword ||
            Boolean(emailError || passwordError || confirmPasswordError)
          }
          onPress={ () => writeUser() }
        > 
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login" , { aName: name  , aEmail : email })}>
            <Text style={styles.loginButton}> Log in</Text>
          </TouchableOpacity>
        </View>
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
    paddingTop: 150,
  },
  innerContainer: {
    marginTop: 20,
  },
  iconRight: {
    marginLeft: 10,
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
  footerText: {
    marginTop: 15,
    textAlign: "center",
    fontSize: 14,
  },
  loginText: {
    color: "#007AFF",
    fontWeight: "bold",
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  loginButton: {
    color: "#007AFF",
    fontWeight: "bold",
    fontSize: 14,
    marginTop: 15,
  },
});

export default RegisterScreen
