import React from 'react';
import {
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { WebView } from 'react-native-webview';

const App = () => {
  const onMessage = (data: any) => { }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar hidden />
      <WebView source={{ uri: 'https://wiildwood.online/events' }}
        geolocationEnabled={true}
        onMessage={onMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        userAgent={"Chrome/56.0.0.0 Mobile"} />
    </SafeAreaView>
  );
}

export default App;
