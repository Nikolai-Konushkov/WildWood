import {Alert, Platform} from 'react-native';
import PushNotificationIOS from '../Notify/index';

const pushInit = (webview: any) => {
  const sendLocalNotification = () => {
    PushNotificationIOS.presentLocalNotification({
      alertTitle: 'Sample Title',
      alertBody: 'Sample local notification',
      applicationIconBadgeNumber: 1,
    });
  };

  const onRegistered = deviceToken => {
    if (webview.current) {
      webview.current.injectJavaScript(
        `window.setDevice({token: "${deviceToken}", platform: "${Platform.OS}"})`,
      );
      return true;
    }
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
        Notification is clicked: ${String(isClicked)};\n
        Notification is clicked : ${notification.getActionIdentifier()};.`;

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
};

export default pushInit;
