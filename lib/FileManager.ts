import { launchCamera , launchImageLibrary } from "react-native-image-picker" ; 



enum FILE_ERROR { 
  FILE_SUCCESS  , 
  USER_CANCEL   , 
}


export const printHello = ( word : string ) : void => {
  console.log(word) ; 
}



/*
 * @params  : None 
 * @purpose : Allows user to open and select image of their choice 
 * @return  : FILE_ERROR 
 * 
 *
*/

export const openImagePicker = () => {
    const options = {
      mediaType: 'any',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('Image picker error: ', response.error);
      } else {
        let imageUri = response.uri || response.assets?.[0]?.uri;
        console.log(response.assets[0]) ; 
      }
    });
  };
