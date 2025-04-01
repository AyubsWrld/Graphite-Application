import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Button,
  Image,
  Easing,
  Modal,
  ActivityIndicator,
  Image as RNImage,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import Add from "../assets/icons/add.png";
import Cancel from "../assets/icons/cancel.png";
import File from "../assets/icons/file.png";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { HomeStackParamList } from "../navigation/AppNavigator";
import { AppDataSource } from "../../utils/database/data-source.ts";
import { readBinaries , openDocumentPicker, writeFile, clearDB, testReading } from '../../lib/modules/FileManager.ts';
import { UploadProgress } from "../../lib/types/FileTypes";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useFiles } from '../context/FileContext';
import { Image as ImageContainer } from '../../lib/models/Image';
import FileContainer from '../../lib/models/FileContainer';
import Svg, { Circle, Path } from 'react-native-svg';
import { FILE_ERROR } from "../../lib/types/ErrorTypes";
import * as RNFS from 'react-native-fs' ;

import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';

const APP_DBG: string = "APP";

type Props = NativeStackScreenProps<HomeStackParamList, "Home">;

export default function HomeScreen({ route, navigation }: Props) {

  const navigateToConfig = () => {
    navigation.navigate("Config");
  };

  const navigateToProfile = () => {
    navigation.navigate("Profile");
  };
  const { firstname, email } = route.params;
  const BINARY_UPLOAD_URL = "192.168.1.83";

  const { files: existingFiles, reloadFiles, isLoading } = useFiles();
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(300));
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [fileProgress, setFileProgress] = useState<Record<string, number>>({});
  const [totalFilesToUpload, setTotalFilesToUpload] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState(0);
  const [circularProgress, setCircularProgress] = useState(0);
  const circularProgressAnimation = useRef(new Animated.Value(0)).current;
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("images");
  const [ uploadFiles , setUploadFiles] = useState<FileContainer[]>([]);

  const updateFiles = () => {
    reloadFiles();
  }
  

  const CIRCLE_SIZE = 36;
  const CIRCLE_STROKE_WIDTH = 4;
  const CIRCLE_RADIUS = (CIRCLE_SIZE - CIRCLE_STROKE_WIDTH) / 2;
    const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  const handleContinue = () => {
    setUploadFiles([]); 
    bottomSheetRef.current.close();
    setIsBottomSheetOpen(false);
  }

  useEffect( () => {
    setIsUploading(false);
  }, []);

  useEffect(() => {
    Animated.timing(circularProgressAnimation, {
      toValue: circularProgress,
      duration: 300,
      useNativeDriver: false,
      easing: Easing.linear
    }).start();
  }, [circularProgress]);

  const handleToggleBottomSheet = () => {
    if (bottomSheetRef.current) {
      bottomSheetRef.current.expand();
      setIsBottomSheetOpen(true);
    }
  };

  const handleLoadFiles = async () => {
    try {
      const selectedFile = await openDocumentPicker();
      if (!selectedFile) {
        throw new Error("Failed to parse file");
      }
      console.log("Successfully selected the file");
      setUploadFiles((previousFiles) => [...previousFiles, selectedFile]);
      setTotalFilesToUpload(prev => prev + 1);
      console.log(`${APP_DBG} : Successfully set file: ${selectedFile}`);
    } catch (error) {
      console.error(`${APP_DBG} : Error selecting file:`, error);
    }
  }

  const handleUploadSingleFile = async (fileToUpload: FileContainer) => {
    try {
      const fileName = fileToUpload.getFileName() || 'unknown';
      console.log("Attempting to write:", fileToUpload.getFileName());
      setFileProgress(prev => ({...prev, [fileName]: 0}));

      const updateProgress = (progress: UploadProgress) => {
        const progressPercent = Math.round((progress.loaded / progress.total) * 100);
        setFileProgress(prev => ({...prev, [fileName]: progressPercent}));
        
        const allFiles = Object.values(fileProgress);
        const totalProgress = [...allFiles, progressPercent].reduce((sum, val) => sum + val, 0);
        const averageProgress = totalProgress / (allFiles.length + 1);
        setCircularProgress(averageProgress);
      };

      if (typeof fileToUpload.setUploadProgressListener === 'function') {
        fileToUpload.setUploadProgressListener(updateProgress);
      }

      if (!fileToUpload.binaryData) {
        await fileToUpload.loadBinaryData();
      }

      const uploadResult = await fileToUpload.uploadFile(BINARY_UPLOAD_URL);
      const writeError = await fileToUpload.saveFile();
      
      if (writeError !== FILE_ERROR.FILE_SUCCESS) {
        console.error(`${APP_DBG}: File upload failed with error: ${writeError}`);
        console.log(writeError, uploadResult.status);
      } else {
        console.log(`${APP_DBG}: File wrote & upload successful`);
        setUploadedFiles(prev => prev + 1);
        setFileProgress(prev => ({...prev, [fileName]: 100}));
      }
      
      return writeError === FILE_ERROR.FILE_SUCCESS;
    } catch (error) {
      console.error(`${APP_DBG}: Error during upload:`, error);
      return false;
    }
  };

  const handleUpload = async () => {
      setIsUploading(false);
      if (!uploadFiles.length) {
        console.log(`${APP_DBG} : No files to upload`);
        return;
      }
      
      try {
        setIsUploading(true);
        
        for (const file of uploadFiles) {
          await handleUploadSingleFile(file);
        }
        
        console.log(`${APP_DBG} : All files processed`);
        updateFiles(); // Make sure this function exists to reload files
      } catch (error) {
        console.error(`${APP_DBG} : Error during batch upload:`, error);
      } finally {
        setIsUploading(false);
        bottomSheetRef.current.close();
        setIsBottomSheetOpen(false);
        setUploadFiles([]);
      }
  };
  const handleUploadFiles = async (file: FileContainer) => {
    console.log("Attempting to save & upload file");
    await handleUploadSingleFile(file);
  };

  const handleCloseBottomSheet = () => {
    if (bottomSheetRef.current) {
      bottomSheetRef.current.close();
      setIsBottomSheetOpen(false);
    }
  };

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

  const animateFileProgress = (fileName: string) => {
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

  const truncateString = (str: string, length: number, extension: string) => {
    if (str.length > length) {
      return str.substring(0, length) + '.' + extension;
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

  const handleFetch = async (filename: string) => {
    const res = await testReading(filename) ; 
    if( res.data )
    {
      console.log('Data recieved')
    }else{
      console.log('Data not found') ; 
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedImage(null);
    setImageError(null);
  };

  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
      reloadFiles();
    if (tab === "images") {
    }
  };

  if ( false ) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F6EF7" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  } else {
    return (
      <View style={styles.container}>
        <View style={styles.infoContainer}>
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Greetings</Text>
              <Text style={styles.username}>{firstname || "User"}</Text>
            </View>
            <TouchableOpacity style={styles.addButton} onPress={handleToggleBottomSheet}>
              <Image
                style={styles.tinyLogo}
                source={Add}
              />
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
            <TouchableOpacity 
              style={[styles.tab, activeTab === "images" && styles.activeTab]} 
              onPress={() => { handleTabPress("images") ;}}
            >
              <Text style={activeTab === "images" ? styles.activeTabText : styles.tabText}>Images</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === "videos" && styles.activeTab]}
              onPress={() => { handleTabPress("videos") ; console.log(`files: ${existingFiles}`)}}
            >
              <Text style={activeTab === "videos" ? styles.activeTabText : styles.tabText}>Videos</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === "files" && styles.activeTab]}
              onPress={() => handleTabPress("files")}
            >
              <Text style={activeTab === "files" ? styles.activeTabText : styles.tabText}>Files</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.fileList}>
            {existingFiles?.map((file , index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.fileItem} 
                onPress={() => { handleFetch(file.filename); } } 
              >
                <View style={styles.fileIcon}>
                  <Image
                    style={styles.tinyLogo}
                    source={File}
                  />
                </View>
                <View style={styles.fileInfo}>
                  <Text style={styles.filename}>{truncateString(file.filename, 10, file.extension)}</Text>
                  <Text style={styles.filesize}>{file.size? file.size : "7.5kB"}</Text>
                </View>
                <View style={styles.fileDetailsContainer}>
                  <Text style={styles.filePath}>/sdcard/folder</Text>
                  <Text style={styles.filePercentage}>0.4%</Text>
                </View>
                <TouchableOpacity
                  onPress={() => { () => console.log('Handling Deletion'); } } 
                  style={styles.dots}
                > 
                  <Text>
                    x
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        {/* Image Preview Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TouchableOpacity style={styles.modalCloseButton} onPress={closeModal}>
                <Image
                  style={styles.tinyLogo}
                  source={Cancel}
                />
              </TouchableOpacity>
              
              {isImageLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#4F6EF7" />
                  <Text style={styles.loadingText}>Loading file...</Text>
                </View>
              ) : imageError ? (
                <View style={styles.errorContainer}>
                  <Icon name="alert-circle-outline" size={50} color="#FF6B6B" />
                  <Text style={styles.errorText}>{imageError}</Text>
                </View>
              ) : selectedImage ? (
                <View style={styles.imageContainer}>
                  <RNImage
                    source={{ uri: selectedImage }}
                    style={styles.previewImage}
                    resizeMode="contain"
                    onError={(e) => {
                      console.error('Image loading error:', e.nativeEvent.error);
                      setImageError('Error displaying image');
                    }}
                  />
                </View>
              ) : null}
            </View>
          </View>
        </Modal>
        
        <BottomSheet
          ref={bottomSheetRef}
          snapPoints={["80%"]}
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
                <Image
                  style={styles.tinyLogo}
                  source={Cancel}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.SheetSwitchRow}>
              {/* Circular Progress Indicator without text */}
              {existingFiles?.length > 0 ? (
                <View style={styles.uploadStatusContainer}>
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
              {uploadFiles.length > 0 ? (
                <ScrollView style={styles.fileList}>
                  {uploadFiles?.map((file, index) => (
                    <View key={index}>
                      <TouchableOpacity 
                        style={styles.fileItem} 
                        onPress={() => handleFetch(file.getFileName()|| 'Unnamed')}
                      >
                        <View style={styles.fileIcon}>
                          <Image
                            style={styles.tinyLogo}
                            source={File}
                          />
                        </View>
                        <View style={styles.fileInfo}>
                          <Text style={styles.filename}>{truncateString(file.getFileName()|| 'Unnamed', 10, file.getExtension()|| 'unknown')}</Text>
                          <Text style={styles.filesize}>{file.getFileSize() ? `${(file.getFileSize() / 1024).toFixed(1)} kBs` : '0 kBs'}</Text>
                        </View>
                        <View style={styles.fileDetailsContainer}>
                          <Text style={styles.filePath}>{file?.getUri()? file?.getUri().split('/').slice(-2, -1)[0] : '/folder'}</Text>
                          <Text style={styles.filePercentage}>{`${fileProgress[file.getFileName()|| 'unknown'] || 0}%`}</Text>
                        </View>
                      </TouchableOpacity>
                      <View style={styles.fileProgressBarContainer}>
                        <View style={styles.fileProgressBar}>
                          <View 
                            style={[
                              styles.fileProgress, 
                              { width: `${fileProgress[file.fileName || 'unknown'] || 0}%` }
                            ]} 
                          />
                        </View>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              ) : (
                <TouchableOpacity style={styles.SheetFileBox} onPress={() => handleLoadFiles()}>
                  <Text style={styles.SheetFileText}>Add files to Graphite +</Text>
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity 
              style={[
                styles.SheetButton,
                isUploading ? { backgroundColor: '#cccccc' } : {}
              ]} 
              onPress={handleUpload}
              disabled={isUploading || uploadFiles.length === 0}
            >
              <Text style={styles.SheetButtonText}>
                {isUploading ? 'Uploading...' : 'Continue'}
              </Text>
            </TouchableOpacity>
          </BottomSheetView>
        </BottomSheet>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 8,
    backgroundColor: "#F5F7FA",
  },
  infoContainer: {
    borderColor: "#E5E7EB",
    borderStyle: "solid",
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 2,
    paddingTop: 65,
  },
  contentContainer: {
    borderColor: "#E5E7EB",
    borderStyle: "solid",
    borderWidth: 1,
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
    alignItems: "flex-start",
    paddingVertical: 10,
  },
  fileIcon: {
    marginRight: 16,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    width: 48,
    borderRadius: 8,
  },
  fileInfo: {
    flex: 1,
    gap: 4,
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
    gap: 4,
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  SheetRowOne: {
    flex: 1,
    flexDirection: "row",
    width: 100,
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
    width: "100%",
    alignItems: "center",
    marginBottom: 15,
  },
  SwitchText: {
    marginLeft: 16,
    fontSize: 16,
    fontWeight: "bold",
  },
  AddButtonContainer: {
    borderRadius: 8,
    borderColor: "#E5E7EB",
    borderWidth: 1,
    borderStyle: "solid",
    width: "100%",
    height: 400,
    padding: 10,
    marginBottom: 32,
  },
  SheetFileBox: {
    width: "100%",
    height: "100%",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "#f9f9f9",
  },
  SheetFileText: {
    fontSize: 16,
    fontWeight: "regular",
    color: "#555",
  },
  SheetButton: {
    width: "100%",
    padding: 16,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    backgroundColor: "#007bff",
    paddingVertical: 12,
    alignItems: "center",
  },
  SheetButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  imageContainer: {
    width: '100%',
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#4F6EF7',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  tinyLogo: {
    width: 24,
    height: 24,
  },

  dots: {
    alignItems : 'center',
    justifyContent: 'center',
    backgroundColor : 'red' , 
    width: 24,
    height: 36,
  },

  })
