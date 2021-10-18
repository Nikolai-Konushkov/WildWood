import React from 'react';
import {
  BackHandler,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { WebView } from 'react-native-webview';
import SplashScreen from 'react-native-splash-screen';

const App = () => {
  const onMessage = (data: any) => { }
  const webview = React.useRef<WebView>(null);

  React.useEffect(() => {
    SplashScreen.hide();
  });

  React.useEffect(() => {
    const backAction = () => {
      if (webview.current) {
        webview.current.goBack();
        return true;
      }
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar hidden />
      <WebView source={{ uri: 'https://wiildwood.online/events' }}
        geolocationEnabled={true}
        onMessage={onMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        userAgent={"Chrome/56.0.0.0 Mobile"}
        allowsBackForwardNavigationGestures={true}
        ref={webview}
      />
    </SafeAreaView>
  );
}

export default App;
