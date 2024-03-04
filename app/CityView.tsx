import { View, Text } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDecay,
  withSpring,
} from "react-native-reanimated";
import { Image } from "expo-image";
import { useState } from "react";
import CityViewHeads from "./CityViewHeads";

export default function CityView() {
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const toggle = useSharedValue(false);

  const BOUNDS = 500;

  const IMWIDTH = 3072;
  const IMHEIGHT = 2816;

  const pan = Gesture.Pan()
    .onBegin((event) => {
      offsetX.value = 0;
      offsetY.value = 0;
    })
    .onChange((event) => {
      let factor = 1;
      offsetX.value = factor * event.translationX;
      offsetY.value = factor * event.translationY;

      //console.log("ex", event.translationX, "ey", event.translationY);
      //   console.log("offsetX", offsetX.value, "offsetY", offsetY.value);
    })
    .onFinalize((event) => {
      startX.value += offsetX.value;
      startY.value += offsetY.value;
      offsetX.value = 0;
      offsetY.value = 0;

      startX.value = withDecay({
        velocity: event.velocityX,
        rubberBandEffect: true,
        clamp: [-BOUNDS, BOUNDS],
      });
      startY.value = withDecay({
        velocity: event.velocityY,
        rubberBandEffect: true,
        clamp: [-BOUNDS, BOUNDS],
      });
    });

  const animatedStyles = useAnimatedStyle(() => {
    let tx = startX.value + offsetX.value - IMWIDTH / 2;
    let ty = startY.value + offsetY.value - IMHEIGHT / 2;

    // console.log("start x", startX.value, "offset x", offsetX.value);

    return {
      transform: [{ translateX: tx }, { translateY: ty }],
    };
  });

  const animatedStylesHeads = useAnimatedStyle(() => {
    let tx = startX.value + offsetX.value;
    let ty = startY.value + offsetY.value;

    // console.log("start x", startX.value, "offset x", offsetX.value);

    return {
      transform: [{ translateX: tx }, { translateY: ty }],
    };
  });

  return (
    <View className="w-full h-full">
      <GestureHandlerRootView className="w-full h-full ">
        <View className="w-full h-full flex-col justify-center items-center relative ">
          {/* <Animated.View
              className="w-24 h-24 bg-violet-500"
              style={animatedStyles}
            /> */}

          <GestureDetector gesture={pan}>
            <Animated.Image
              className="absolute top-0 left-0 "
              style={animatedStyles}
              source={require("../assets/images/Extended.png")}
            />
          </GestureDetector>

          <Animated.View
            className="absolute top-0 left-0 w-full h-full pointer-events-none select-none "
            pointerEvents={"box-none"}
            style={animatedStylesHeads}
          >
            <CityViewHeads />
          </Animated.View>

          {/* <Animated.View style={animatedStyles}>

              <View className="w-24 h-24  bg-violet-500">
                <Animated.Image
                  className="w-full h-full"
                  source={require("../assets/images/Extended.png")}
                />
              </View>

            </Animated.View> */}
        </View>
      </GestureHandlerRootView>
    </View>
  );
}
