import { View, Text, Button } from "react-native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { AppStackParamList } from "../navigation/AppNavigator"
import { openImagePicker } from "../../lib/FileManager"

type Props = NativeStackScreenProps<AppStackParamList, "Profile">

export function ProfileScreen({ navigation }: Props) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Profile Screen</Text>
      <Button
        title="Go Back"
        onPress={() => navigation.goBack()} 
      />

      <Button
        title="Select Image"
        onPress={() => openImagePicker()} 
      />
    </View>
  )
}
