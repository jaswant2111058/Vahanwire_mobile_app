import React, { useEffect, useState } from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {screens} from '../screens';
import CustomLayout from '../components/CustomLayout.js';
import { getUserData } from '../utils/storageData.js';
import { ActivityIndicator } from 'react-native';

const Stack = createNativeStackNavigator();

const StackNavigator = () => {

  const screensWithOutHeader = ['Login','Signup','OTPValidation', "ForgetChangePassword"]
  const [intialScreen, setIntialScreen] = useState(null)  

  useEffect(()=>{

    const getUser = async ()=>{
      const user = await getUserData("user")
      console.log("user in stack navigator", user)
      if(user){
        setIntialScreen("Homepage")
      }
      else{
        setIntialScreen("Login")
      }
    }
    getUser()

  })

  if(!intialScreen){
    return (
        <ActivityIndicator style={{flex:1}} size="large" color={"black"} />
    );
  }


  return (
    <Stack.Navigator
      initialRouteName={intialScreen}
      screenOptions={({route, navigation}) => ({
        header: () => {
          if (!screensWithOutHeader.includes(route.name)) {
            return (
              <>
                {/* <Header /> */}
              </>
            );
          }
          return null;
        },
        contentStyle: {
          flex: 1,
          backgroundColor: "#fff",
          paddingHorizontal: 0,
        },
      })}>
      {screens.map(screen => {
        const ScreenComponent = (props) => (
          <CustomLayout routeName={screen.name} navigation={props.navigation}>
            <screen.component {...props} />
          </CustomLayout>
        );
        return (
          <Stack.Screen
            key={screen.name}
            name={screen.name}
            component={ScreenComponent}
          />
        );
      })}
    </Stack.Navigator>
  );
};

export default StackNavigator;