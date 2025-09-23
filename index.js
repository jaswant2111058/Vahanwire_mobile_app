import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

function Root() {
  return (
      <App />
  );
}

AppRegistry.registerComponent(appName, () => Root);