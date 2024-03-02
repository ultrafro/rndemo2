import { THREE } from "expo-three";

export async function LoadText(
  path: string
): Promise<{ result?: string; error?: any }> {
  console.log("loading text at path: ", path);
  try {
    const response = await fetch(path);
    console.log("loaded text:", response);
    const result = await response.text();
    return { result };
  } catch (error) {
    return { error };
  }
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

export async function LoadTexture(path: string): Promise<{
  texture?: HTMLImageElement;
  width?: number;
  height?: number;
  error?: any;
}> {
  console.log("loading texture at path: ", path);
  try {
    const response = await fetch(path);
    const blob = await response.blob();
    const result = await createImageBitmap(blob);

    const texture = new THREE.Texture(result);

    return { texture, width: result.width, height: result.height };
  } catch (error) {
    return { error };
  }
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
