import * as React from "react";
import { ExpoWebGLRenderingContext, GLView } from "expo-gl";
import { Renderer } from "expo-three";
import { MutableRefObject, useEffect } from "react";
import { THREE } from "expo-three";
// import { Scene, Camera, WebGL2DRenderer } from "three";

// global.THREE = global.THREE || THREE;

export default function App() {
  const cameraRef = React.useRef<THREE.Camera | null>(null);
  const sceneRef = React.useRef<THREE.Scene | null>(null);
  const rendererRef = React.useRef<THREE.WebGL2DRenderer | null>(null);
  const [renderer, setRenderer] = React.useState<THREE.WebGL2DRenderer | null>(
    null
  );
  const meshRef = React.useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    let raf: number = 0;

    const onRender = () => {
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

      renderer.render(sceneRef.current, cameraRef.current);

      // console.log(renderer);
      const gl = renderer.getContext();
      // console.log(gl);
      // debugger;

      gl.endFrameEXP();
      // // NOTE: At the end of each frame, notify `Expo.GLView` with the below
      // renderer.__gl.endFrameEXP();

      raf = requestAnimationFrame(onRender);
    };

    raf = requestAnimationFrame(onRender);

    return () => {
      cancelAnimationFrame(raf);
    };
  }, [renderer]);

  return (
    <GLView
      style={{ flex: 1 }}
      onContextCreate={(gl: ExpoWebGLRenderingContext) => {
        // Create a WebGLRenderer without a DOM element
        const renderer = new Renderer({ gl });
        renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);

        //set clear color to black
        renderer.setClearColor(0x000000, 1.0);

        //create three js scene
        sceneRef.current = new THREE.Scene();
        cameraRef.current = new THREE.Camera();

        //create a box and add it to the scene
        const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);
        sceneRef.current.add(cube);
        meshRef.current = cube;

        setRenderer(renderer);
      }}
    />
  );
}
