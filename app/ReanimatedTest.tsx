import React, { useState } from "react";
import { View, Text, Button } from "react-native";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  Easing,
  withSpring,
  withSequence,
  interpolateColor,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
// import ConfettiExplosion from "react-confetti-explosion";

export default function ReanimatedTest() {
  const [hovered, setHovered] = useState(false);

  const pressed = useSharedValue(false);

  const width = useSharedValue(100);
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const rotation = useSharedValue(0);
  const progress = useSharedValue(0);

  const [explode, setExplode] = useState(false);

  const timeOutRef = React.useRef<any | null>(null);

  const tap = Gesture.Tap()
    .onBegin(() => {
      pressed.value = true;

      //make width go big for a bit, then return back to the original size
      const originalSize = width.value;
      const newSize = originalSize + 50;

      width.value = withSequence(
        withTiming(newSize, { duration: 100 }),
        withTiming(originalSize, { duration: 100 })
      );

      progress.value = withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0, { duration: 300 })
      );

      //   width.value = withTiming(newSize, { duration: 200 }, () => {
      //     // After growing, shrink the box back to its original size for another second
      //     width.value = withTiming(originalSize, { duration: 200 });
      //   });

      //   width.value = Math.random() * 50 + 100;
      x.value = (Math.random() - 0.5) * 300;
      y.value = (Math.random() - 0.5) * 300;
      rotation.value = withSpring(rotation.value + 360);

      //   setExplode(false);
      //   setTimeout(() => {
      //     setExplode(true);
      //   }, 100);

      //   setExplode(true);
      //   if (timeOutRef.current) {
      //     clearTimeout(timeOutRef.current);
      //   }

      //   timeOutRef.current = setTimeout(() => {
      //     setExplode(false);
      //   }, 1000);
    })
    .onFinalize(() => {
      pressed.value = false;
    });

  //   const handlePress = () => {
  //     width.value = withSpring(Math.random() * 300 + 100);
  //     x.value = withSpring((Math.random() - 0.5) * 300);
  //     y.value = withSpring((Math.random() - 0.5) * 300);
  //     // width.value = width.value + 50;
  //   };

  const animatedStyles = useAnimatedStyle(() => {
    let rotate = rotation.value + "deg"; //"12deg";

    let tx = withSpring(x.value - width.value / 2);
    let ty = withSpring(y.value - width.value / 2);

    const color = interpolateColor(
      progress.value,
      [0, 1],
      ["rgba(100, 100, 255, 1.0)", "rgba(200, 200, 255, 1.0)"]
    );

    return {
      width: withSpring(width.value),
      height: withSpring(width.value),
      backgroundColor: color,
      transform: [{ translateX: tx }, { translateY: ty }, { rotateZ: rotate }],
    };
  });

  //   const testHoverStyles = `w-24 h-24 ${hovered ? "bg-yellow-500" : "bg-blue-500"}`;

  //   const testHoverStyles = `w-24 h-24 bg-blue-500 hover:bg-yellow-500`;

  return (
    <View className="w-full h-full">
      <GestureHandlerRootView className="w-full h-full ">
        {/* <Animated.View className={"w-24 h-24"} style={[style]} /> */}
        {/* <Animated.View className={nativeStyles} /> */}
        <View className="flex-col justify-around items-center w-full h-full">
          <GestureDetector gesture={tap}>
            <Animated.View
              // onPointerDown={handlePress}
              className={
                "bg-violet-400 rounded h-[100px] flex-col justify-center items-center text-center"
              }
              style={animatedStyles}
              // style={{
              //   width: width,
              //   height: 100,
              // }}
            >
              <Text>Catch me!</Text>
              {/* {explode && <ConfettiExplosion />} */}
            </Animated.View>
          </GestureDetector>

          {/* <View className="w-24 h-24">
            <Button title={"Press Me"} onPress={handlePress} />
          </View> */}

          {/* <Button
        title="toggle"
        onPress={() => {
          randomWidth.value = Math.random() * 350;
        }}
      /> */}
        </View>
      </GestureHandlerRootView>
    </View>
  );
}
