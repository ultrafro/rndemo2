import React, { useState } from "react";
import {
  Button,
  View,
  Text,
  NativeSyntheticEvent,
  NativePointerEvent,
  TouchableWithoutFeedback,
  GestureResponderEvent,
  Platform,
} from "react-native";
import { Image } from "expo-image";

import { Emitter } from "react-native-particles";
import { BurstAndMoveEmitter } from "react-native-particles";
import { GestureHandlerEvent } from "react-native-reanimated/lib/typescript/reanimated2/hook";

export default function ParticlesTest() {
  const [pos, setPos] = useState<{ x: Number; y: number }>({ x: 0, y: 0 });
  const emitter = React.useRef<any | null>(null);

  const [emitters, setEmitters] = useState<
    Record<string, { id: String; x: Number; y: Number }>
  >({});

  const handleParticle = (x: number, y: number) => {
    const newId = Date.now().toString();
    const newEmitters = { ...emitters, [newId]: { id: newId, x, y } };
    setEmitters(newEmitters);
  };

  //create a pointer down handler with x,y
  const handlePointerDown = (e: NativeSyntheticEvent<NativePointerEvent>) => {
    //if not web, return
    if (Platform.OS !== "web") return;

    const clickX = e.nativeEvent.clientX;
    const clickY = e.nativeEvent.clientY;
    handleParticle(clickX, clickY);
  };

  const handlePress = (e: GestureResponderEvent) => {
    if (Platform.OS === "web") return;

    const clickX = e.nativeEvent.locationX;
    const clickY = e.nativeEvent.locationY;
    handleParticle(clickX, clickY);
  };

  return (
    <View className="w-full h-full" onPointerDown={handlePointerDown}>
      <TouchableWithoutFeedback onPress={handlePress}>
        <View className="w-full h-full">
          <Text>ParticlesTest</Text>

          {Object.keys(emitters).map((key) => {
            return (
              <Emitter
                key={key}
                id={emitters[key].id}
                fromPosition={{ x: emitters[key].x, y: emitters[key].y }}
                //finalPoint={{ x: 200, y: 200 }}
                autoStart={true}
                numberOfParticles={15}
                emissionRate={20}
                interval={1}
                particleLife={1500}
                direction={-90}
                spread={190}
                speed={100}
                gravity={50}
              >
                <Image
                  source={require("../assets/images/star.png")}
                  className={
                    "w-12 h-12 origin-center -translate-x-1/2 -translate-y-1/2 select-none"
                  }
                  contentFit="contain"
                />
              </Emitter>
            );
          })}
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
}
