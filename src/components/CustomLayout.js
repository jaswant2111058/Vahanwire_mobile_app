import React from 'react';
import {SafeAreaView } from 'react-native';


const CustomLayout = ({ children, routeName, navigation }) => {
    return (
    <>
      <SafeAreaView style={{
        flex: 1,
        backgroundColor:"#FFFFFF",
      }}>
        {children}
      </SafeAreaView>
    </>
  );
};


export default CustomLayout;