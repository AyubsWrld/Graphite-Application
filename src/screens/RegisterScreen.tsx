import React, { useState , useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert
} from "react-native";

type Props = NativeStackScreenProps<AppStackParamList, "Login">; // What does this do

export function RegisterScreen( { navigation } : Props )  // Why didn't default export work ? 
{
  return(
    <>
      <View style={styles.container}>
        <Text>
          Navigation Screen
        </Text>
      </View>
    </>
  )
}


const styles = StyleSheet.create({
  container : {
    flex : 1 ,
    alignItems : 'center',
    justifyContent: 'center',
  },
});

export default RegisterScreen ;
