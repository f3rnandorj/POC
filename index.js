/**
 * @format
 */

import { AppRegistry, LogBox } from "react-native";

import App from "./src/App";
import { name as appName } from "./app.json";

if (__DEV__) {
  // lottie-react-native drives progress through RN's legacy Animated module on
  // iOS and keeps emitting value updates after the view unmounts. Dev-only
  // console.warn from NativeAnimatedHelper, stripped in release.
  LogBox.ignoreLogs([
    "Sending `onAnimatedValueUpdate` with no listeners registered.",
  ]);
}

AppRegistry.registerComponent(appName, () => App);
