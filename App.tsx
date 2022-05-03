import React from 'react';
import {BackHandler, SafeAreaView, StatusBar} from 'react-native';
import {WebView} from 'react-native-webview';
import SplashScreen from 'react-native-splash-screen';
import shareContent from './Feature/Sharing';
import {styles} from './Style';

const App = () => {
  const webview = React.useRef<WebView>(null);

  React.useEffect(() => {
    SplashScreen.hide();
  });

  const wwMode = () => {
    if (webview.current) {
      webview.current.injectJavaScript('window.setWebViewMode()');
      return true;
    }
  };

  React.useEffect(() => {
    const backAction = () => {
      if (webview.current) {
        webview.current.goBack();
        return true;
      }
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  }, []);

  // User Info
  let saveUser = params => {
    console.log(params);
  };

  // Main Handler
  let messageHandler = event => {
    let message;
    try {
      message = JSON.parse(event.nativeEvent.data);
      console.log(message);
      switch (message.method) {
        case 'ready':
          wwMode();
          // this.webview.injectJavaScript('window.setWebViewMode()');
          break;
        case 'googleLogin':
          googleLogin();
          break;
        case 'yandexLogin':
          yandexLogin();
          break;
        case 'share':
          shareContent(message.params);
          break;
        case 'saveUser':
          saveUser(message.params);
          break;
      }
    } catch (err) {
      console.log('error', err);
    }
  };

  return (
    <SafeAreaView style={styles.flex}>
      <StatusBar
        backgroundColor="#fff"
        barStyle="dark-content"
        animated={true}
      />
      <WebView
        source={{uri: 'https://wiildwood.online/events'}}
        geolocationEnabled={true}
        onMessage={messageHandler}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        userAgent={'Chrome/56.0.0.0 Mobile'}
        allowsBackForwardNavigationGestures={true}
        ref={webview}
        scrollEnabled={false}
      />
    </SafeAreaView>
  );
};

export default App;
