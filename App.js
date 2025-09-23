import { NavigationContainer } from '@react-navigation/native';
import StackNavigator from './src/navigation/StackNavigator.js';


export default function App() {
  

  return (
      <NavigationContainer>
        <StackNavigator />
      </NavigationContainer>
  );
}