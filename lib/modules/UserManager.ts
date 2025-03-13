import React , { useState , useEffect } from "react";
import { User } from "../../utils/database/entities/User.ts";
import { AppDataSource } from "../../utils/database/data-source.ts";

enum USER_ERROR { 
  USER_OK , 
  USER_NOT_FOUND , 
  USER_REPOSITORY_LOADING_ERROR , 
}

export const findUser = async ( useremail : string , userpassword : string ) : USER_ERROR =>{
  const UserRepository = AppDataSource.getRepository(User) ;
  if (!UserRepository) {
    return USER_REPOSITORY_LOADING_ERROR ; 
  }
  const cUsers = UserRepository.find();
  if (!cUsers) {
    return USER_NOT_FOUND ; 
  }if (cUsers) {
    console.log(cUsers.getAllData()) ;
  }
  return USER_OK ; 
}


export const addUser = async ( aEmail: string , aPassword : string  , aFirstname : string , aLastname : string ) : bool =>{
  console.log("Add user called") ;
  const UserRepository = AppDataSource.getRepository(User) ;
  const user = new User(); 
  user.email     = aEmail     ;
  user.password  = aPassword  ;
  user.firstname = aFirstname ;
  user.lastname  = aLastname  ;
  await UserRepository.save( user ) ;  // Might fail  , return true for now . 
  const savedUsers = await UserRepository.find() ;  // Might fail  , return true for now . 
  console.log("Fetched users" , savedUsers.getAllData()) ;
  return true ; 
}

export const testFunction = () =>{
  console.log("Hello wolrd"); 
}


