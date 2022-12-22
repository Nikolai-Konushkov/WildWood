import React, {useEffect} from 'react';
import {
  BackHandler,
  Image,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  View,
  Linking,
  AppState,
} from 'react-native';
import {WebView} from 'react-native-webview';
import SplashScreen from 'react-native-splash-screen';
import shareContent from './Feature/Sharing';
import {styles} from './Style';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import NotifService from './Feature/Push/NotifService';

const App = () => {
  const [isLoad, setIsLoad] = React.useState<boolean>(false);
  const webview = React.useRef<WebView>(null);

  React.useEffect(() => {
    SplashScreen.hide();
  });

  const wwMode = () => {
    if (webview.current) {
      webview.current.injectJavaScript('window.setWebViewMode();');
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

  // Linking
  const [url, setUrl] = React.useState<string>('');
  useEffect(() => {
    const getUrl = async () => {
      Linking.addEventListener('url', event => {
        // console.warn('URL', event.url);
        setUrl(event.url);
      });
      Linking.getInitialURL().then(url => {
        // console.warn('INITIAL', url);
        setUrl(url === null ? 'https://wiildwood.online/events' : url);
      });
    };
    getUrl();
  }, []);

  AppState.addEventListener('change', state => {
    console.log('AppState changed to', state);
    if (webview.current) {
      webview.current.injectJavaScript('window.backToApp()');
      return true;
    }
  });

  const [token, setToken] = React.useState();

  const onRegister = token => {
    setToken(token.token);
  };

  const onNotif = notif => {
    const pushLink = JSON.stringify(notif.data.link).replace(/^"(.*)"$/, '$1');
    setUrl(pushLink);
    Linking.getInitialURL().then(() => {
      setUrl(`'${pushLink}'`);
    });
  };

  const notif = new NotifService(onRegister, onNotif);

  // Set Device
  let setDevice = () => {
    if (webview.current) {
      webview.current.injectJavaScript(
        `window.setDevice({token: "${token}", platform: "${Platform.OS}"})`,
      );
      return true;
    }
  };

  // Delete Device
  let deleteDevice = () => {
    if (webview.current) {
      webview.current.injectJavaScript(
        `window.deleteDevice({device: {token: "${token}", platform: "${Platform.OS}"}})`,
      );
      return true;
    }
  };

  // User Info
  let saveUser = params => {
    console.log(params);
  };

  const _signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices({
        //Check if device has Google Play Services installed.
        //Always resolves to true on iOS.
        showPlayServicesUpdateDialog: true,
      });
      const userInfo = await GoogleSignin.signIn();
      console.log('User Info --> ', userInfo);
      // setState({userInfo: userInfo});

      if (webview.current) {
        webview.current.injectJavaScript(
          `window.rnLoginGoogle({accessToken: "${userInfo.serverAuthCode}", idToken: "${userInfo.idToken}"})`,
        );
        return true;
      }
    } catch (error) {
      console.log('Message', error.message);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User Cancelled the Login Flow');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Signing In');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('Play Services Not Available or Outdated');
      } else {
        console.log('Some Other Error Happened');
      }
    }
  };

  const googleLogin = () => {
    GoogleSignin.configure({
      //It is mandatory to call this method before attempting to call signIn()
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
      offlineAccess: false,
      // Repleace with your webClientId generated from Firebase console
      iosClientId:
        '211416878264-kqot5bp6q1vr9kouidnuln4ljkit9nnm.apps.googleusercontent.com',
      webClientId:
        '211416878264-p7msnt7204sn02s8f2gsqbtb4a2ne2ma.apps.googleusercontent.com',
    });

    _signIn();
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
          break;
        case 'readyForRequests':
          setDevice();
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
        case 'logout':
          deleteDevice();
          break;
      }
    } catch (err) {
      console.log('error', err);
    }
  };

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
