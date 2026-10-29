import * as WebBrowser from 'expo-web-browser';
import { Linking } from 'react-native';

import { showToast } from '@/stores/toastStore';
import { lightPalette } from '@/theme/palette';

/** Opens a web page in the in-app browser. */
export async function openWebPage(url: string, failureMessage = 'Could not open link') {
  try {
    await WebBrowser.openBrowserAsync(url, {
      controlsColor: lightPalette.action,
      toolbarColor: lightPalette.surface,
    });
  } catch {
    showToast(failureMessage, 'error');
  }
}

/** Starts a phone call (shows a message where calling isn't possible). */
export async function callPhone(phone: string) {
  try {
    await Linking.openURL(`tel:${phone.replace(/[^\d+]/g, '')}`);
  } catch {
    showToast("Couldn't start the call", 'error');
  }
}
