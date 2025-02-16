import { Button , View, Text, StyleSheet, ScrollView } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppStackParamList } from "../navigation/AppNavigator";
import { useState, useEffect } from "react";
import { AppDataSource } from "../../utils/database/data-source";
import { Image } from "../../utils/database/entities/Image.ts";

type Props = NativeStackScreenProps<AppStackParamList, "Debugging">;

export function Debugging({ navigation }: Props) {
  const [images, setImages] = useState<Image[]>([]);

  const ImageRepository = AppDataSource.getRepository(Image);

  // Fetch image metadata from the repository
  useEffect(() => {
    const fetchImages = async () => {
      const imagesFromDb = await ImageRepository.find();
      setImages(imagesFromDb);
    };

    fetchImages();
  }, []);

  return (
    <View style={styles.container}>
      {/* Title for the images container */}
      <Text style={styles.title}>Images</Text>

      {/* ScrollView wrapped in a full-width container */}
      <View style={styles.scrollViewContainer}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {images.map((image, index) => (
            <View key={index} style={styles.card}>
              {/* Render image metadata as card content */}
              <Text style={styles.cardTitle}>Filename: {image.filename}</Text>
              <Text>Absolute Path: {image.abs_path}</Text>
              <Text>Height: {image.height}</Text>
              <Text>Width: {image.width}</Text>
              <Text>Extension: {image.extension}</Text>
              <Text>URI: {image.uri}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
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
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f4f4",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center", // Ensure the title is centered
  },
  scrollViewContainer: {
    width: "100%", // Make the container fill the screen horizontally
    height: "70%", // Adjust the height as needed
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    overflow: "hidden",
    padding: 10, // Add some padding inside the container for better aesthetics
  },
  scrollContainer: {
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    width: "100%", // Ensure each card fills the container width
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5, // for Android shadow
  },
  cardTitle: {
    fontWeight: "bold",
    marginBottom: 10,
  },
});

