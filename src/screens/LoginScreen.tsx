import { View, Text, Button } from "react-native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { AppStackParamList } from "../navigation/AppNavigator"

type Props = NativeStackScreenProps<AppStackParamList, "Login">

export function LoginScreen({ navigation }: Props) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Login Screen</Text>
      <Button title="Go to Home" onPress={() => navigation.replace("Home")} />
    </View>
  )
}
