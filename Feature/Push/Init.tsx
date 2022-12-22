import {Alert, Platform} from 'react-native';
import NotifService from './NotifService';

const initPush = (webview?: any) => {
  const onRegister = token => {
    Alert.alert('функция выполненась');
    Alert.alert(token.token);
    if (webview.current) {
      webview.current.injectJavaScript(
        `window.setDevice({token: "t22est", platform: "моп2с"})`,
      );
      return true;
    }
  };

  const onNotif = notif => {
    Alert.alert(notif.title, notif.message);
  };

  const notif = new NotifService(onRegister, onNotif);

};
export default initPush;
