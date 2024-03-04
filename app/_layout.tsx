import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";

import { useColorScheme } from "@/components/useColorScheme";

import { NativeWindStyleSheet } from "nativewind";
import DatePage from "./DatePage";
import CanvasTest from "./CanvasTest";
import SpineTest from "./SpineTest";
import { Experiments, experiments } from "./Experiments";
import { Button, View } from "react-native";

NativeWindStyleSheet.setOutput({
  default: "native",
});

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

// export const unstable_settings = {
//   // Ensure that reloading on `/modal` keeps a back button present.
//   initialRouteName: "date",
// };

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const [selectedExperiment, setSelectedExperiment] = useState<string | null>(
    null
  );

  const selectedExperimentComponent = experiments.find(
    (e) => e.name === selectedExperiment
  )?.component;

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      {!!!selectedExperiment && (
        <Experiments OnSelect={setSelectedExperiment} />
      )}
      {!!selectedExperiment &&
        !!selectedExperimentComponent &&
        selectedExperimentComponent}

      {!!selectedExperiment && (
        <View className="absolute top-[50px] right-[50px] m-4">
          <Button
            title="Back"
            onPress={() => {
              setSelectedExperiment(null);
            }}
          />
        </View>
      )}

      {/* <DatePage /> */}
      {/* <CanvasTest /> */}
      {/* <SpineTest /> */}
      {/* <Stack initialRouteName="date">
     <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: "modal" }} />
            <Stack.Screen name="date" options={{ headerShown: false }} />
          </Stack> */}
    </ThemeProvider>
  );
}
