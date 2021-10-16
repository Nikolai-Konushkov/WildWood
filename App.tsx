import React from 'react';
import {
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { WebView } from 'react-native-webview';
import SplashScreen from  'react-native-splash-screen';

const App = () => {
  const onMessage = (data: any) => { }

  React.useEffect(() => {
    SplashScreen.hide();
  });

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
