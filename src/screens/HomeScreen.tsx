import { View, Text, Button, TextInput, StyleSheet } from "react-native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { AppStackParamList } from "../navigation/AppNavigator"
import { useState } from "react"
import { AppDataSource } from "../../utils/database/data-source"
import { User } from "../../utils/database/entities/User" // adjust path as needed

type Props = NativeStackScreenProps<AppStackParamList, "Home">

export function HomeScreen({ navigation }: Props) {
  const [searchUsername, setSearchUsername] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");

  const searchUser = async () => {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const foundUser = await userRepository.findOne({
        where: { username: searchUsername }
      });

      if (foundUser) {
        setUser(foundUser);
        setError("");
      } else {
        setUser(null);
        setError("User not found");
      }
    } catch (err) {
      setError("Error searching for user");
      console.error(err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home Screen</Text>
      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          value={searchUsername}
          onChangeText={setSearchUsername}
          placeholder="Enter username to search"
          autoCapitalize="none"
        />
        <Button title="Search" onPress={searchUser} />
      </View>

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : user ? (
        <View style={styles.userInfo}>
          <Text style={styles.label}>Username:</Text>
          <Text style={styles.value}>{user.username}</Text>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{user.email}</Text>
        </View>
      ) : null}

      <Button 
        title="Go to Profile" 
        onPress={() => navigation.navigate("Profile")} 
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center"
  },
  title: {
    fontSize: 24,
    marginBottom: 20
  },
  searchContainer: {
    width: "100%",
    marginBottom: 20
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    width: "100%"
  },
  userInfo: {
    width: "100%",
    padding: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 5,
    marginBottom: 20
  },
  label: {
    fontWeight: "bold",
    marginBottom: 5
  },
  value: {
    marginBottom: 15
  },
  error: {
    color: "red",
    marginBottom: 20
  }
});
