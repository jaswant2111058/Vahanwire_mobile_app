import Toast from 'react-native-simple-toast';

export const showToast = (message) => {
  // Check if the message is not a string, then stringify it
  const formattedMessage = typeof message === 'string' ? message : JSON.stringify(message);

  // Show the toast message on both Android and iOS
  Toast.show(formattedMessage, Toast.SHORT);
};