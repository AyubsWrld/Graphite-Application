import React, { useRef , useState , useEffect , useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Button,
  Easing,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppStackParamList } from "../navigation/AppNavigator";
import { AppDataSource } from "../../utils/database/data-source.ts";
import { openImagePicker } from '../../lib/modules/FileManager.ts' ;
import { useImages } from '../context/ImageContext' ;
import Image from '../../lib/models/Image'
import Svg, { Circle, Path } from 'react-native-svg';

import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';

type Props = NativeStackScreenProps<AppStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {

  const { images } = useImages(); 
  const [progress, setProgress] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(300));
  const [files, setFiles] = useState([]);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [fileProgress, setFileProgress] = useState({});
  const [totalFilesToUpload, setTotalFilesToUpload] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState(0);
  const [circularProgress, setCircularProgress] = useState(0);
  const circularProgressAnimation = useRef(new Animated.Value(0)).current;

  // Constants for the circular progress
  const CIRCLE_SIZE = 36;
  const CIRCLE_STROKE_WIDTH = 4;
  const CIRCLE_RADIUS = (CIRCLE_SIZE - CIRCLE_STROKE_WIDTH) / 2;
  const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

  useEffect(() => {
    // Animate the circular progress
    Animated.timing(circularProgressAnimation, {
      toValue: circularProgress,
      duration: 300,
      useNativeDriver: false,
      easing: Easing.linear
    }).start();
  }, [circularProgress]);

  useEffect(() => {
    console.log("Updated files state:", files);
  }, [files]);
  
  const handleToggleBottomSheet = () => {
    if (bottomSheetRef.current) {
      bottomSheetRef.current.expand();
      setIsBottomSheetOpen(true);
    }
  };

  const handleCloseBottomSheet = () => {
    if (bottomSheetRef.current) {
      bottomSheetRef.current.close();
      setIsBottomSheetOpen(false);
    }
  };

  // Backdrop component for the BottomSheet
  const renderBackdrop = useCallback(
    props => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  const handleLoadFiles = async () => {
    console.log("Attempting to open the image picker");
    try {
      const files_selected = await openImagePicker() ; 
      if(files_selected){
        setFiles((prev_files) => [...prev_files , files_selected]) ; 
        console.log( files_selected  , files ) ;
        
        // Set total files to upload
        setTotalFilesToUpload(prev => prev + 1);
        
        // Initialize progress for the new file
        setTimeout(() => {
          animateFileProgress(files_selected.fileName);
        } , 50);
      }
    } catch (error) {
      console.log(error) ; 
    }
  }

  const animateFileProgress = (fileName) => {
    setFileProgress(prev => ({
      ...prev,
      [fileName]: 0
    }));
    
    const interval = setInterval(() => {
      setFileProgress(prev => {
        const currentProgress = prev[fileName] || 0;
        if (currentProgress >= 100) {
          clearInterval(interval);
          setUploadedFiles(prevUploaded => prevUploaded + 1);
          return prev;
        }
        
        // Update circular progress based on all files
        const newProgress = currentProgress + 5;
        const allFilesProgress = Object.values({...prev, [fileName]: newProgress});
        const averageProgress = allFilesProgress.reduce((sum, val) => sum + Number(val), 0) / allFilesProgress.length;
        setCircularProgress(averageProgress);
        
        return {
          ...prev,
          [fileName]: newProgress
        };
      });
    }, 50);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 10));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleFetch = () => {
    console.log("File fetched")
  }

  const truncateString = (str: string, length: number , extension : string ) => {
    if (str.length > length) {
      return str.substring(0, length) + '.' + extension ;
    }
    return str;
  };
  const closePullUpScreen = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  if(!images){
    return(
    <View>
      </View>
    )
  }
  else{
    return (
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Greetings</Text>
            <Text style={styles.username}>Ayub</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={handleToggleBottomSheet}>
            <Icon name="add-circle-outline" size={32} color="#4F6EF7" />
          </TouchableOpacity>
        </View>

        {/* Storage Info */}
        <View style={styles.storageContainer}>
          <View style={styles.storageInfo}>
            <Text style={styles.storageLabel}>Used</Text>
            <Text style={styles.storageAmount}>98.8 GB</Text>
          </View>
          <Text style={styles.storageTotal}>of 128 GB</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={styles.progress} />
        </View>
      </View>
      <View style={styles.contentContainer}>
        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity style={[styles.tab, styles.activeTab]}>
            <Text style={styles.activeTabText}>Images</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}>
            <Text style={styles.tabText}>Videos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}>
            <Text style={styles.tabText}>Files</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.fileList}>

        {images?.map((image, index) => (
          <TouchableOpacity key={index} style={styles.fileItem} onPress={() => handleFetch() }>
            <View style={styles.fileIcon}>
              <Icon name="document-outline" size={24} color="#4F6EF7" />
            </View>
            <View style={styles.fileInfo}>
              <Text style={styles.filename}>{truncateString(image.filename, 10, image.extension)}</Text>
              <Text style={styles.filesize}>7.5 kBs</Text>
            </View>
            <View style={styles.fileDetailsContainer}>
              <Text style={styles.filePath}>/sdcard/folder</Text>
              <Text style={styles.filePercentage}>0.4%</Text>
            </View>
          </TouchableOpacity>
        ))}
        </ScrollView>
      </View>
      
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={["60%"]}
        index={-1}
        backdropComponent={renderBackdrop}
        onChange={(index) => {
          setIsBottomSheetOpen(index !== -1);
        }}
      >
        <BottomSheetView style={styles.SheetContentContainer}>
            <View style={styles.SheetHeader}>
              <Text style={styles.SheetHeaderText}>Add files</Text>
              <TouchableOpacity style={styles.addButton} onPress={handleCloseBottomSheet}>
                <Icon name="add-circle-outline" size={32} color="#4F6EF7" />
              </TouchableOpacity>
            </View>
            <View style={styles.SheetSwitchRow}>
              {/* Circular Progress Indicator without text */}
              {files.length > 0 ? (
                <View style={styles.uploadStatusContainer}>
                  <View style={styles.circularProgressContainer}>
                    <Animated.View style={styles.circularProgress}>
                      {/* Background Circle */}
                      <View style={styles.circularProgressBackground} />
                      
                      {/* Animated Circle Progress */}
                      <Animated.View
                        style={[
                          styles.circularProgressBar,
                          {
                            // Use strokeDashoffset for proper circular animation
                            transform: [
                              {
                                rotate: circularProgressAnimation.interpolate({
                                  inputRange: [0, 100],
                                  outputRange: ['0deg', '360deg']
                                })
                              }
                            ]
                          }
                        ]}
                      />
                    </Animated.View>
                  </View>
                  <Text style={styles.SwitchText}>
                    {uploadedFiles === totalFilesToUpload ? 
                      `${uploadedFiles} file${uploadedFiles !== 1 ? 's' : ''} uploaded` : 
                      `${totalFilesToUpload - uploadedFiles} file${totalFilesToUpload - uploadedFiles !== 1 ? 's' : ''} left`}
                  </Text>
                </View>
              ) : (
                <Text style={styles.SwitchText}>
                  No Files Selected
                </Text>
              )}
            </View>
            <View style={styles.AddButtonContainer}>
              { files[0]?
                (
                  <ScrollView style={styles.fileList}>
                  {files?.map((image, index) => (
                    <View key={index}>
                      <TouchableOpacity style={styles.fileItem} onPress={() => handleFetch() }>
                        <View style={styles.fileIcon}>
                          <Icon name="document-outline" size={24} color="#4F6EF7" />
                        </View>
                        <View style={styles.fileInfo}>
                          <Text style={styles.filename}>{truncateString(image.fileName, 10, image.extension)}</Text>
                          <Text style={styles.filesize}>7.5 kBs</Text>
                        </View>
                        <View style={styles.fileDetailsContainer}>
                          <Text style={styles.filePath}>/sdcard/folder</Text>
                          <Text style={styles.filePercentage}> {`${fileProgress[image.fileName] || 0 }%`}</Text>
                        </View>
                      </TouchableOpacity>
                      <View style={styles.fileProgressBarContainer}>
                        <View style={styles.fileProgressBar}>
                          <View 
                            style={[
                              styles.fileProgress, 
                              { width: `${fileProgress[image.fileName] || 0}%` }
                            ]} 
                          />
                        </View>
                      </View>
                    </View>
                  ))}
                  </ScrollView>
                ) : 
                (
                  <TouchableOpacity style={styles.SheetFileBox} onPress={ () => handleLoadFiles() }>
                    <Text style={styles.SheetFileText}>Add files +</Text>
                  </TouchableOpacity>
                )
              }
            </View>
            <TouchableOpacity style={styles.SheetButton}>
              <Text style={styles.SheetButtonText}>Continue</Text>
            </TouchableOpacity>
        </BottomSheetView>
      </BottomSheet>
    </View>
  )};
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal : 8 ,
    backgroundColor: "#F5F7FA",
    backgroundColor: "#F5F7FA",
  },
  infoContainer: {
    borderColor : "#E5E7EB" , 
    borderStyle : "solid",
    borderWidth : 1 ,
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 2,
    paddingTop: 65,
  },
  contentContainer: {

    borderColor : "#E5E7EB" , 
    borderStyle : "solid",
    borderWidth : 1 ,
    backgroundColor: "#FFFFFF",
    marginTop: 10,
    padding: 20,
    borderRadius: 20,
    elevation: 2,
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 80,
  },
  greeting: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#B0B0B0",
  },
  username: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1E2C4A",
  },
  addButton: {
    backgroundColor: "#F2F2F2",
    padding: 12,
    borderRadius: 50,
  },
  storageContainer: {

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  storageInfo: {
    flexDirection: "column",
    marginBottom: 0,
  },
  storageLabel: {
    fontSize: 14,
    color: "#7D8B99",
  },
  storageAmount: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#1E2C4A",
  },
  storageTotal: {
    fontSize: 14,
    color: "#7D8B99",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progress: {
    width: "75%",
    height: "100%",
    backgroundColor: "#4F6EF7",
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
  },
  tab: {
    flex: 1,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: "#4F6EF7",
  },
  tabText: {
    color: "#B0B0B0",
    fontSize: 16,
    paddingVertical: 10,
  },
  activeTabText: {
    color: "#4F6EF7",
    fontSize: 16,
    paddingVertical: 10,
  },
  fileList: {
    marginTop: 10,
  },
  fileItem: {
    flexDirection: "row",
    alignItems: "flext-start",
    paddingVertical: 10,
  },
  fileIcon: {
    marginRight: 16,
    backgroundColor : "#F9FAFB",
    alignItems : "center",
    justifyContent : "center",
    height : 48 , 
    width  : 48 ,
    borderRadius: 8 , 
  },
  fileInfo: {
    flex: 1,
    gap : 4 , 
  },
  filename: {
    fontSize: 14,
    fontWeight: "bold",
  },
  filesize: {
    fontSize: 13,
    fontWeight: "medium",
    color: "#6B7280",
  },

  fileDetailsContainer: {
    flexDirection: "column",
    alignItems: "flex-end",
    gap : 4 , 
  },
  fileDetails: {
    color: "#B0B0B0",
    fontSize: 12,
  },
  filePath: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
  },
  filePercentage: {
    fontSize: 12,
    fontWeight: "medium",
    color: "#7D8B99",
  },
  fileProgressBarContainer: {
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 10,
  },
  fileProgressBar: {
    height: 5,
    width: "100%",
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
  },
  fileProgress: {
    height: "100%",
    backgroundColor: "#4F6EF7",
    borderRadius: 2,
  },
  uploadStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  circularProgressContainer: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularProgress: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  circularProgressBackground: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 4,
    borderColor: '#E0E0E0',
    position: 'absolute',
  },
  circularProgressBar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 4,
    borderColor: '#4F6EF7',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    position: 'absolute',
  },
  scrim: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1,
  },
  pullUpContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
  },
  pullUpContent: {
    paddingBottom: 20,
  },
  pullUpTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1E2C4A",
    marginBottom: 15,
  },
  closeButton: {
    alignSelf: "flex-end",
  },
  fileSelectionContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#4F6EF7",
  },
  noFilesText: {
    fontSize: 14,
    color: "#7D8B99",
    marginLeft: 10,
  },
  fileListContainer: {
    marginTop: 10,
  },
  fileSelector: {
    marginTop: 20,
    paddingVertical: 10,
    backgroundColor: "#E0E0E0",
    borderRadius: 10,
    alignItems: "center",
  },
  addFileText: {
    color: "#4F6EF7",
    fontSize: 16,
  },
  continueButton: {
    backgroundColor: "#4F6EF7",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 20,
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  SheetContentContainer: {
    flex: 1,
    paddingHorizontal : 20,
    paddingVertical  : 12,
    alignItems: 'center',
  },
  SheetRowOne : {
    flex : 1 , 
    flexDirection : "row" , 
    width : 100 , 
  },
  SheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
  },
  SheetHeaderText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  SheetCloseButton: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#555",
  },
  SheetSwitchRow: {
    flexDirection: "row",
    width : "100%" , 
    alignItems: "center",
    marginBottom: 15,
  },
  SwitchText: {
    marginLeft: 16,
    fontSize: 16,
    fontWeight: "bold", 
  },
  AddButtonContainer : {
    borderRadius: 8,
    borderColor: "#E5E7EB",
    borderWidth : 1 , 
    borderStyle : "solid",
    width : "100%" ,
    height: 350,
    padding: 10 ,
    marginBottom: 32 , 
  },
  SheetFileBox: {
    width : "100%" ,
    height : "100%" , 
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "#f9f9f9",
  },
  SheetFileText: {
    fontSize: 16,
    fontWeight : "regular" ,
    color: "#555",
  },
  SheetButton: {
    width : "100%" , 
    padding : 16 , 
    height: 56 , 
    alignItems: 'center',
    justifyContent : 'center',
    borderRadius: 30 , 
    backgroundColor: "#007bff",
    paddingVertical: 12,
    alignItems: "center",
  },
  SheetButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
