import ExpoTHREE, { THREE } from "expo-three";
import { getRemoteSource } from "./FileUtils";

export async function LoadText(
  path: string
): Promise<{ result?: string; error?: any }> {
  console.log("loading text at path: ", path);
  try {
    const RSResult = await getRemoteSource(
      path,
      undefined,
      false,
      false,
      undefined
    );
    if (!!RSResult?.contents) {
      return { result: RSResult.contents };
    } else {
      return { error: "No contents found in remote source result: " + path };
    }
  } catch (error) {
    return { error };
  }
}

export async function LoadTexture(path: string): Promise<{
  texture?: HTMLImageElement;
  width?: number;
  height?: number;
  error?: any;
}> {
  console.log("loading texture at path: ", path);
  let texture: THREE.Texture | null = null;
  try {
    // texture = await ExpoTHREE.loadAsync(RSResult.localFile);
    texture = await ExpoTHREE.loadAsync(path);
  } catch (e) {
    console.error("Error loading texture: ", e);
    return { error: e };
  }

  console.log("loaded texture.", texture.image.width, texture.image.height);

  return {
    texture,
    width: texture.image.width,
    height: texture.image.height,
  };

  // try {
  //   const RSResult = await getRemoteSource(
  //     path,
  //     undefined,
  //     false,
  //     false,
  //     undefined
  //   );
  //   if (!!RSResult?.contents) {
  //     let texture: THREE.Texture | null = null;
  //     console.log("TRYING TO LOAD TEXTURE");
  //     try {
  //       // texture = await ExpoTHREE.loadAsync(RSResult.localFile);
  //       texture = await ExpoTHREE.loadAsync(path);
  //     } catch (e) {
  //       console.error("Error loading texture: ", e);
  //     }

  //     console.log("loaded texture.", texture.image.width, texture.image.height);

  //     return {
  //       texture,
  //       width: texture.image.width,
  //       height: texture.image.height,
  //     };
  //   } else {
  //     return { error: "No contents found in remote source result: " + path };
  //   }
  // } catch (error) {
  //   return { error };
  // }
}

export function LoadTextWithCallback(
  path: string,
  callback: (text: string) => void
) {
  LoadText(path).then(({ result, error }) => {
    console.log("result", result, "error", error);
    if (!!error) {
      console.error(error);
      return;
    }

    callback(result ?? "");
  });
}

export function LoadTextureWithCallback(
  url: string,
  callback: (texture: THREE.Texture, width: number, height: number) => void
) {
  LoadTexture(url).then(({ texture, width, height, error }) => {
    if (error) {
      console.error(error);
      return;
    }

    callback(texture, width ?? 0, height ?? 0);
  });
}
