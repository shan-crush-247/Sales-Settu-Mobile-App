// On the web, React Native's Alert.alert is a no-op. Map it to the browser's alert / confirm dialogs.
import { Alert, Platform } from 'react-native';

if (Platform.OS === 'web' && typeof window !== 'undefined') {
  Alert.alert = (title, message, buttons) => {
    const text = [title, message].filter(Boolean).join('\n\n');
    const list = buttons && buttons.length ? buttons : [{ text: 'OK' }];
    if (list.length === 1) {
      window.alert(text);
      if (list[0].onPress) list[0].onPress();
      return;
    }
    // Two or more buttons: OK = the last non-cancel button, Cancel = the cancel / first button
    const action = [...list].reverse().find((b) => b.style !== 'cancel' && !/^cancel$/i.test(b.text || '')) || list[list.length - 1];
    const cancel = list.find((b) => b !== action);
    if (window.confirm(text + '\n\n[OK] = ' + (action.text || 'OK'))) { if (action.onPress) action.onPress(); }
    else if (cancel && cancel.onPress) cancel.onPress();
  };
}
