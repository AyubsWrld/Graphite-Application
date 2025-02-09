import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppStackParamList } from "../navigation/AppNavigator";
import { AppDataSource } from "../../utils/database/data-source";
import { User } from "../../utils/database/entities/User";

type Props = NativeStackScreenProps<AppStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const handleCreateUser = async () => {
    try {
      if (!AppDataSource.isInitialized) {
        console.log("Database not initialized yet");
        return;
      }
      
      const userRepository = AppDataSource.getRepository(User);
      const user = new User();
      user.username = username;
      user.email = email;
      
      const savedUser = await userRepository.save(user);
      console.log("User created successfully:", savedUser);
      navigation.replace("Home");
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create User</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Button 
        title="Create User" 
        onPress={handleCreateUser}
      />
      <Button 
        title="Go to Home" 
        onPress={() => navigation.replace("Home")} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
});
