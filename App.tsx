import React, {useEffect, useState} from 'react';
import {
  BackHandler,
  Image,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  View,
  Linking,
  Alert,
  Button,
  DeviceEventEmitter,
  Text,
  ScrollView,
} from 'react-native';
import {WebView} from 'react-native-webview';
import SplashScreen from 'react-native-splash-screen';
import shareContent from './Feature/Sharing';
import {styles} from './Style';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import DeviceInfo from 'react-native-device-info';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import PushNotificationIOS from './Feature/Notify';

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

  const deviceId = DeviceInfo.getDeviceToken();
  const platform = 'android';

  // Set Device
  let setDevice = () => {
    if (webview.current) {
      webview.current.injectJavaScript(
        `window.setDevice({token: "${deviceId}", platform: "${platform}"})`,
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
          setDevice();
          break;
      }
    } catch (err) {
      console.log('error', err);
    }
  };

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

  const [permissions, setPermissions] = useState({});

  useEffect(() => {
    PushNotificationIOS.addEventListener('register', onRegistered);
    PushNotificationIOS.addEventListener(
      'registrationError',
      onRegistrationError,
    );
    PushNotificationIOS.addEventListener('notification', onRemoteNotification);
    PushNotificationIOS.addEventListener(
      'localNotification',
      onLocalNotification,
    );

    PushNotificationIOS.requestPermissions({
      alert: true,
      badge: true,
      sound: true,
      critical: true,
    }).then(
      data => {
        console.log('PushNotificationIOS.requestPermissions', data);
      },
      data => {
        console.log('PushNotificationIOS.requestPermissions failed', data);
      },
    );

    return () => {
      PushNotificationIOS.removeEventListener('register');
      PushNotificationIOS.removeEventListener('registrationError');
      PushNotificationIOS.removeEventListener('notification');
      PushNotificationIOS.removeEventListener('localNotification');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendNotification = () => {
    DeviceEventEmitter.emit('remoteNotificationReceived', {
      remote: true,
      aps: {
        alert: {title: 'title', subtitle: 'subtitle', body: 'body'},
        badge: 1,
        sound: 'default',
        category: 'REACT_NATIVE',
        'content-available': 1,
        'mutable-content': 1,
      },
    });
  };

  const sendSilentNotification = () => {
    DeviceEventEmitter.emit('remoteNotificationReceived', {
      remote: true,
      aps: {
        category: 'REACT_NATIVE',
        'content-available': 1,
      },
    });
  };

  const sendLocalNotification = () => {
    PushNotificationIOS.presentLocalNotification({
      alertTitle: 'Sample Title',
      alertBody: 'Sample local notification',
      applicationIconBadgeNumber: 1,
    });
  };

  const sendLocalNotificationWithSound = () => {
    PushNotificationIOS.addNotificationRequest({
      id: 'notificationWithSound',
      title: 'Sample Title',
      subtitle: 'Sample Subtitle',
      body: 'Sample local notification with custom sound',
      sound: 'customSound.wav',
      badge: 1,
    });
  };

  const scheduleLocalNotification = () => {
    PushNotificationIOS.scheduleLocalNotification({
      alertBody: 'Test Local Notification',
      fireDate: new Date(new Date().valueOf() + 2000).toISOString(),
    });
  };

  const addNotificationRequest = () => {
    PushNotificationIOS.addNotificationRequest({
      id: 'test',
      title: 'title',
      subtitle: 'subtitle',
      body: 'body',
      category: 'test',
      threadId: 'thread-id',
      fireDate: new Date(new Date().valueOf() + 2000),
      repeats: true,
      userInfo: {
        image: 'https://www.github.com/Naturalclar.png',
      },
    });
  };

  const addCriticalNotificationRequest = () => {
    PushNotificationIOS.addNotificationRequest({
      id: 'critical',
      title: 'Critical Alert',
      subtitle: 'subtitle',
      body: 'This is a critical alert',
      category: 'test',
      threadId: 'thread-id',
      isCritical: true,
      fireDate: new Date(new Date().valueOf() + 2000),
      repeats: true,
    });
  };

  const addMultipleRequests = () => {
    PushNotificationIOS.addNotificationRequest({
      id: 'test-1',
      title: 'First',
      subtitle: 'subtitle',
      body: 'First Notification out of 3',
      category: 'test',
      threadId: 'thread-id',
      fireDate: new Date(new Date().valueOf() + 10000),
      repeats: true,
    });

    PushNotificationIOS.addNotificationRequest({
      id: 'test-2',
      title: 'Second',
      subtitle: 'subtitle',
      body: 'Second Notification out of 3',
      category: 'test',
      threadId: 'thread-id',
      fireDate: new Date(new Date().valueOf() + 12000),
      repeats: true,
    });

    PushNotificationIOS.addNotificationRequest({
      id: 'test-3',
      title: 'Third',
      subtitle: 'subtitle',
      body: 'Third Notification out of 3',
      category: 'test',
      threadId: 'thread-id',
      fireDate: new Date(new Date().valueOf() + 14000),
      repeats: true,
    });
  };

  const getPendingNotificationRequests = () => {
    PushNotificationIOS.getPendingNotificationRequests(requests => {
      Alert.alert('Push Notification Received', JSON.stringify(requests), [
        {
          text: 'Dismiss',
          onPress: null,
        },
      ]);
    });
  };

  const setNotificationCategories = async () => {
    PushNotificationIOS.setNotificationCategories([
      {
        id: 'test',
        actions: [
          {id: 'open', title: 'Open', options: {foreground: true}},
          {
            id: 'ignore',
            title: 'Desruptive',
            options: {foreground: true, destructive: true},
          },
          {
            id: 'text',
            title: 'Text Input',
            options: {foreground: true},
            textInput: {buttonTitle: 'Send'},
          },
        ],
      },
    ]);
    Alert.alert(
      'setNotificationCategories',
      'Set notification category complete',
      [
        {
          text: 'Dismiss',
          onPress: null,
        },
      ],
    );
  };

  const removeAllPendingNotificationRequests = () => {
    PushNotificationIOS.removeAllPendingNotificationRequests();
  };

  const removePendingNotificationRequests = () => {
    PushNotificationIOS.removePendingNotificationRequests(['test-1', 'test-2']);
  };

  const onRegistered = deviceToken => {
    Alert.alert('Registered For Remote Push', `Device Token: ${deviceToken}`, [
      {
        text: 'Dismiss',
        onPress: null,
      },
    ]);
  };

  const onRegistrationError = error => {
    Alert.alert(
      'Failed To Register For Remote Push',
      `Error (${error.code}): ${error.message}`,
      [
        {
          text: 'Dismiss',
          onPress: null,
        },
      ],
    );
  };

  const onRemoteNotification = notification => {
    const isClicked = notification.getData().userInteraction === 1;

    const result = `
      Title:  ${notification.getTitle()};\n
      Subtitle:  ${notification.getSubtitle()};\n
      Message: ${notification.getMessage()};\n
      badge: ${notification.getBadgeCount()};\n
      sound: ${notification.getSound()};\n
      category: ${notification.getCategory()};\n
      content-available: ${notification.getContentAvailable()};\n
      Notification is clicked: ${String(isClicked)}.`;

    if (notification.getTitle() == undefined) {
      Alert.alert('Silent push notification Received', result, [
        {
          text: 'Send local push',
          onPress: sendLocalNotification,
        },
      ]);
    } else {
      Alert.alert('Push Notification Received', result, [
        {
          text: 'Dismiss',
          onPress: null,
        },
      ]);
    }
  };

  const onLocalNotification = notification => {
    const isClicked = notification.getData().userInteraction === 1;

    Alert.alert(
      'Local Notification Received',
      `Alert title:  ${notification.getTitle()},
      Alert subtitle:  ${notification.getSubtitle()},
      Alert message:  ${notification.getMessage()},
      Badge: ${notification.getBadgeCount()},
      Sound: ${notification.getSound()},
      Thread Id:  ${notification.getThreadID()},
      Action Id:  ${notification.getActionIdentifier()},
      User Text:  ${notification.getUserText()},
      Notification is clicked: ${String(isClicked)}.`,
      [
        {
          text: 'Dismiss',
          onPress: null,
        },
      ],
    );
  };

  const showPermissions = () => {
    PushNotificationIOS.checkPermissions(permissions => {
      setPermissions({permissions});
    });
  };

  return (
    <SafeAreaProvider>
      <View style={{padding: 20}}>
        <ScrollView
          style={{backgroundColor: '#fff', marginTop: 50, height: 200}}>
          <Button onPress={sendNotification} title="Send fake notification" />
          <Button
            onPress={sendLocalNotification}
            title="Send fake local notification"
          />
          <Button
            onPress={sendLocalNotificationWithSound}
            title="Send fake local notification with custom sound"
          />
          <Button
            onPress={scheduleLocalNotification}
            title="Schedule fake local notification"
          />
          <Button
            onPress={addNotificationRequest}
            title="Add Notification Request"
          />
          <Button
            onPress={addCriticalNotificationRequest}
            title="Add Critical Notification Request (only works with Critical Notification entitlement)"
          />
          <Button
            onPress={addMultipleRequests}
            title="Add Multiple Notification Requests"
          />
          <Button
            onPress={setNotificationCategories}
            title="Set notification categories"
          />
          <Button
            onPress={removePendingNotificationRequests}
            title="Remove Partial Pending Notification Requests"
          />
          <Button
            onPress={removeAllPendingNotificationRequests}
            title="Remove All Pending Notification Requests"
          />
          <Button
            onPress={sendSilentNotification}
            title="Send fake silent notification"
          />

          <Button
            onPress={() =>
              PushNotificationIOS.setApplicationIconBadgeNumber(42)
            }
            title="Set app's icon badge to 42"
          />
          <Button
            onPress={() => PushNotificationIOS.setApplicationIconBadgeNumber(0)}
            title="Clear app's icon badge"
          />
          <Button
            onPress={getPendingNotificationRequests}
            title="Get Pending Notification Requests"
          />
          <View>
            <Button
              onPress={showPermissions}
              title="Show enabled permissions"
            />
            <Text>{JSON.stringify(permissions)}</Text>
          </View>
        </ScrollView>
      </View>

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
