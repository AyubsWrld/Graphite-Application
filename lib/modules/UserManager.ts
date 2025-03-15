import React , { useState , useEffect  } from "react";
import { User } from "../../utils/database/entities/User.ts";
import { AppDataSource } from "../../utils/database/data-source.ts";

export enum USER_ERROR { 
  USER_OK, 
  USER_NOT_FOUND, 
  USER_REPOSITORY_LOADING_ERROR, 
  USER_CREATION_FAILURE,
}



// I want to throw error here . 

const initializeDB = async () : USER_ERROR => {
  if (!AppDataSource.isInitialized){
    try {
      await AppDataSource.initialize() ; 
      return  USER_ERROR.USER_OK ; 
    } catch (error) {
      console.log(`Error occured while initalizing DB ${error}`);
      return USER_ERROR.USER_REPOSITORY_LOADING_ERROR ; 
    }
  }else {
    return  USER_ERROR.USER_OK ; 
  }
}

/*
 * @signature : createUser( aEmail : string , aPassword : string , aFirstname : string , aLastname : string ) ;
 * @purpose   : creates user object to be saved. 
 * @param     : aEmail : Users email 
 * @param     : aPassword  : Users password 
 * @param     : aFirstname : Users firstname 
 * @param     : aLastname  : Users lastname 
 * @return    : user : User object to be saved . 
*/ 

const createUser = ( aEmail : string , aPassword : string , aFirstname : string , aLastname : string ) : User => {
  console.log("createUser called") ;
  const user = new User() ; 
  user.email = aEmail ; 
  user.password = aPassword ; 
  user.firstname = aFirstname ; 
  user.lastname = aLastname; 
  return user ; 
}

/*
 * @signature : addUser( aEmail : string , aPassword : string , aFirstname : string , aLastname : string ) ;
 * @purpose   : adds user to database 
 * @param     : aEmail : Users email 
 * @param     : aPassword  : Users password 
 * @param     : aFirstname : Users firstname 
 * @param     : aLastname  : Users lastname 
 * @return    : USER_ERROR : USER_OK if adding user worked , otherwise a different err code . 
*/ 

export const addUser = async ( aEmail : string , aPassword : string , aFirstname : string , aLastname : string ) : USER_ERROR => {
  //  Create user from USer class 
  try {
    const user = createUser( aEmail , aPassword , aFirstname , aLastname ) ; 
    if (!user) {
      throw new Error("Failed to create user") ;
      return USER_ERROR.USER_CREATION_FAILURE ;
    }
    await initializeDB() ; 
    const dUser = AppDataSource.getRepository(User) ;  // Haven't tested this 
    if ( await dUser.findOneBy({ email : aEmail}) ) {
      console.log("Attempting to overwrite email") ;
      return USER_ERROR.USER_EXISTS ;
    }
    await dUser.save(user) ; 
    console.log("User addition successful") ;
    return USER_ERROR.USER_OK ; 
  } catch (error) {
    console.log(`Error occured while initializing database : ${error}`);
    return USER_ERROR.USER_REPOSITORY_LOADING_ERROR ; 
  }
}

/*
 * @signature : userExists( aEmail : string , dUser ) ; // Potentially unsafe
 * @purpose   : validtates users existence based on whether email . 
 * @param     : aEmail : users email 
 * @param     : dUser : user database 
 * @return    : string if user exists null if not 
*/ 

const userExists  = async ( aEmail : string  , dUser) : string | null  => {
  try {
    const res = await dUser.findOneBy({
      email : aEmail,
    })
    if (res == null) {
      return null ; 
    }else { 
      return res.password ; 
    }
  } catch (error) {
    console.log(`Error occured : ${error}`);
  }
}

/*
 * @signature : validateuser( aEmail : string , aPassword : string ) ; // Potentially unsafe
 * @purpose   : validates users existence  
 * @param     : aEmail : users email 
 * @param     : aPassword : users password
 * @return    : USER_ERROR : USER_OK if adding user worked , otherwise a different err code . 
*/ 

export const validateLoginRequest = async ( aEmail : string , aPassword : string ) : USER_ERROR => { 
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize() 
    }
    const dUser = await AppDataSource.getRepository(User) ;
    const user_password = await userExists( aEmail , dUser  ) 
    if( user_password != null ){
      console.log(user_password) ;
      return user_password == aPassword ? USER_ERROR.USER_OK : USER_ERROR.USER_NOT_FOUND ;
    }else{
      console.log("User not found") ;
      return USER_ERROR.USER_NOT_FOUND ; 
    }
  } catch (error) {
    console.log(`Error occured : ${error}`);
    return USER_ERROR.USER_REPOSITORY_LOADING_ERROR ;
  }
}
