import React from 'react';
import {
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { WebView } from 'react-native-webview';

const App = () => {
  return (
    <SafeAreaView>
      <StatusBar hidden />
      <WebView source={{uri: 'ya.ru'}} />
    </SafeAreaView>
  );
}

export default App;
