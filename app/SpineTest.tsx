import * as React from "react";
import { ExpoWebGLRenderingContext, GLView } from "expo-gl";
import { Renderer } from "expo-three";
import { MutableRefObject, useEffect } from "react";
import { THREE } from "expo-three";
import { Button, Dimensions, View } from "react-native";
import SpineThing from "./SpineThing";
// import { Scene, Camera, WebGL2DRenderer } from "three";
// import * as spine from "@esotericsoftware/spine-threejs";

// global.THREE = global.THREE || THREE;
//https://github.com/EvanBacon/Expo-Crossy-Road/blob/d817a0dfd632913832e95023519b545c165b6ad9/src/GameEngine.js

export default function App() {
  const cameraRef = React.useRef<THREE.Camera | null>(null);
  const sceneRef = React.useRef<THREE.Scene | null>(null);
  const rendererRef = React.useRef<THREE.WebGL2DRenderer | null>(null);
  const [renderer, setRenderer] = React.useState<THREE.WebGL2DRenderer | null>(
    null
  );
  const meshRef = React.useRef<THREE.Mesh | null>(null);
  const spineThingRef = React.useRef<SpineThing | null>(null);
  const lastTime = React.useRef<number>(0);
  //   const spineAnimationRef = React.useRef<SpineAnimation | null>(null);

  const OnPress = React.useCallback(() => {
    const anim = spineThingRef.current;
    if (!!anim) {
      anim.state.setAnimationByName(0, "jump", false);
      anim.state.addAnimationByName(0, "run", true, 0);
    }
  }, []);

  useEffect(() => {
    let raf: number = 0;

    const onRender = (newTime: number) => {
      if (
        renderer === null ||
        sceneRef.current === null ||
        cameraRef.current === null
      ) {
        return;
      }

      //rotate the cube
      if (meshRef.current) {
        meshRef.current.rotation.x += 0.01;
        meshRef.current.rotation.y += 0.01;
      }

      const anim = spineThingRef.current;
      if (!!anim) {
        anim.update((newTime - lastTime.current) / 1000, 0.001);
      }

      //   spineAnimationRef.current.update();

      renderer.render(sceneRef.current, cameraRef.current);

      const gl = renderer.getContext();

      gl.endFrameEXP();

      lastTime.current = newTime;

      raf = requestAnimationFrame(onRender);
    };

    raf = requestAnimationFrame(onRender);

    return () => {
      cancelAnimationFrame(raf);
    };
  }, [renderer]);

  return (
    <View className="w-full h-full absolute">
      <GLView
        style={{ flex: 1, width: "100%", height: "100%", position: "relative" }}
        onContextCreate={(gl: ExpoWebGLRenderingContext) => {
          // Create a WebGLRenderer without a DOM element
          const renderer = new Renderer({ gl });
          renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);

          const windowWidth = Dimensions.get("window").width;
          const windowHeight = Dimensions.get("window").height;

          //set clear color to black
          renderer.setClearColor(0x000000, 1.0);

          //create three js scene
          sceneRef.current = new THREE.Scene();
          cameraRef.current = new THREE.Camera();

          //create a box and add it to the scene
          const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
          const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
          const cube = new THREE.Mesh(geometry, material);
          //sceneRef.current.add(cube);
          meshRef.current = cube;

          const spineThing = new SpineThing({
            //   name: "Billie_Willow_Spine",
            //   path: "assets/spine/Billie",
            name: "spineboy",
            path: "https://storage.googleapis.com/testcorsbucket/rndemo/spine/spineboy",
            scale: 0.001,
            onLoad: () => {
              console.log("spineThing loaded!!!");
              spineThingRef.current = spineThing;

              const anim = spineThingRef.current;
              if (!!anim) {
                anim.stateData.setMixByName("walk", "jump", 0.2);
                anim.stateData.setMixByName("run", "jump", 0.2);
                anim.stateData.setMixByName("jump", "run", 0.2);
                anim.state.setAnimationByName(0, "walk", true);

                (anim as THREE.Object3D).rotation.y = Math.PI;

                sceneRef.current.add(anim);

                // meshRef.current.add(anim);

                //add a window on click listener
                // window.addEventListener("click", () => {
              }

              setRenderer(renderer);
            },
            onError: () => {
              console.error("spineThing error!");
            },
          });

          console.log("🟩test spine: ", spineThing);
        }}
      />
      <Button
        onPress={OnPress}
        title="Press Me"
        className="absolute bottom-[20%] left-[50%]"
      />
    </View>
  );
}
