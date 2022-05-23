import React, {useEffect} from 'react';
import {
  BackHandler,
  Image,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  View,
  Linking,
  Text,
} from 'react-native';
import {WebView} from 'react-native-webview';
import SplashScreen from 'react-native-splash-screen';
import shareContent from './Feature/Sharing';
import {styles} from './Style';
import {SafeAreaProvider} from 'react-native-safe-area-context';

const App = () => {
  const [isLoad, setIsLoad] = React.useState<boolean>(false);
  const webview = React.useRef<WebView>(null);

  React.useEffect(() => {
    SplashScreen.hide();
  });

  const wwMode = () => {
    if (webview.current) {
      webview.current.injectJavaScript('window.setWebViewMode()');
      setIsLoad(true);
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

  const [url, setUrl] = React.useState<string>(
    'https://wiildwood.online/events',
  );

  useEffect(() => {
    const getUrl = async () => {
      Linking.addEventListener('url', event => {
        console.warn('URL', event.url);
        setUrl(event.url);
      });
      Linking.getInitialURL().then(url => {
        console.warn('INITIAL', url);
      });
    };
    getUrl();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      {!isLoad && (
        <View style={styles.loader}>
          <Image
            style={styles.logo}
            source={require('./src/ic_launcher.png')}
          />
        </View>
      )}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}>
        <Text>{url}</Text>
        <WebView
          source={{uri: url}}
          geolocationEnabled={true}
          onMessage={messageHandler}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          userAgent={'Chrome/56.0.0.0 Mobile'}
          allowsBackForwardNavigationGestures={true}
          ref={webview}
          scrollEnabled={false}
        />
      </KeyboardAvoidingView>
    </SafeAreaProvider>
  );
};

export default App;
