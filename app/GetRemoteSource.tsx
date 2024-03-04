import * as FileSystem from "expo-file-system";
import { Button, View, Text, Platform } from "react-native";
export const CACHE_IMAGE_FOLDER = FileSystem.cacheDirectory + "IMAGE_CACHE";
import { Asset } from "expo-asset";
import { Buffer } from "buffer";
import { resolveAsync } from "expo-asset-utils";

const isImage = (source: string) => {
  return (
    source.toLocaleLowerCase().endsWith(".png") ||
    source.toLocaleLowerCase().endsWith(".jpg") ||
    source.toLocaleLowerCase().endsWith(".jpeg") ||
    source.toLocaleLowerCase().endsWith(".bmp") ||
    source.toLocaleLowerCase().endsWith(".gif") ||
    source.toLocaleLowerCase().endsWith(".tiff")
  );
};

const getEncodingType = (source: string | number, isBase64?: boolean) => {
  if (isBase64) return FileSystem.EncodingType.Base64;

  if (typeof source === "number") {
    return FileSystem.EncodingType.UTF8;
  }

  return isImage(source as string)
    ? FileSystem.EncodingType.Base64
    : FileSystem.EncodingType.UTF8;
};

export const getRemoteSourceRNExperimental = async (
  source: string,
  OnProgress?: (percent: number) => void,
  dontFetch?: boolean,
  isLocal?: boolean,
  isBase64?: boolean
): Promise<{ localFile: string; contents: string } | null> => {
  if (isLocal) {
    try {
      // const asset = await resolveAsync(source);

      // const contents = await asset.downloadAsync();

      const assets = await Asset.loadAsync(source);

      if (assets.length < 1) {
        console.error("No assets found for source: ", source);
        return null;
      }

      const asset = assets[0];

      if (!asset.localUri) {
        console.error("No localUri found for asset: ", asset);
        return null;
      }

      const fileContents = await FileSystem.readAsStringAsync(asset.localUri, {
        encoding: getEncodingType(source, isBase64),
      });
      const localUri = asset.localUri;

      return { localFile: localUri, contents: fileContents };
    } catch (e) {
      console.error("Error resolving asset: ", e);
      return null;
    }
  } else {
    try {
      const asset = Asset.fromURI(source);
      await asset.downloadAsync();

      if (!asset.localUri) {
        console.error("No localUri found for asset: ", asset);
        return null;
      }

      const fileContents = await FileSystem.readAsStringAsync(asset.localUri, {
        encoding: getEncodingType(source, isBase64),
      });
      const localUri = asset.localUri;

      return { localFile: localUri, contents: fileContents };
    } catch (e) {
      console.error("Error resolving asset: ", e);
      return null;
    }
  }
};

export const getRemoteSourceRN = async (
  source: string | number,
  OnProgress?: (percent: number) => void,
  dontFetch?: boolean,
  isLocal?: boolean,
  isBase64?: boolean
): Promise<{ localFile: string; contents: string } | null> => {
  if (isLocal) {
    try {
      const [{ localUri }] = await Asset.loadAsync(source);

      //read the localUri
      if (!!localUri) {
        const fileContents = await FileSystem.readAsStringAsync(localUri, {
          encoding: getEncodingType(source, isBase64),
        });

        return { localFile: localUri, contents: fileContents };
      } else {
        return null;
      }
    } catch (e) {
      console.error("Error creating asset from URI", e);
    }
  }

  await MakeSureCacheDirectoryExists();

  const hash = getHashFromSource(source as string);

  const cachedFileSource = `${CACHE_IMAGE_FOLDER}/${hash}`;

  let cacheFileRetrievalSuccess = false;

  try {
    const fileInfo = await FileSystem.getInfoAsync(cachedFileSource);
    if (fileInfo.exists) {
      cacheFileRetrievalSuccess = true;
    }
  } catch (e) {
    console.error("Error checking for file in cache: ", cachedFileSource, e);
  }

  if (cacheFileRetrievalSuccess) {
    const fileContents = await FileSystem.readAsStringAsync(cachedFileSource, {
      encoding: getEncodingType(source, isBase64),
    });

    OnProgress?.(1);

    return { localFile: cachedFileSource, contents: fileContents };
  } else {
    if (dontFetch) {
      return null;
    }

    console.warn(
      `File at path ${source} does not exist in the FS. Attempting to fetch from the network: ` +
        source +
        " and put it in: " +
        cachedFileSource +
        " dont fetch?: " +
        dontFetch
    );

    const progressCB = (progress: FileSystem.DownloadProgressData) => {
      OnProgress?.(
        progress.totalBytesWritten / progress.totalBytesExpectedToWrite
      );
    };

    const downloadResumable = FileSystem.createDownloadResumable(
      source as string,
      cachedFileSource,
      {},
      progressCB
    );

    try {
      const downloadResult = await downloadResumable.downloadAsync();
      if (!downloadResult) {
        console.error("Failed to download image");
        return null;
      } else {
        console.log("Finished downloading ", source);

        const fileContents = await FileSystem.readAsStringAsync(
          cachedFileSource,
          {
            encoding: getEncodingType(source, isBase64),
          }
        );

        return {
          localFile: downloadResult.uri,
          contents: fileContents,
        };
      }
    } catch (e) {
      console.error("failed to download: ", source, e);
      return null;
    }
  }
};

export const getRemoteSourceWeb = async (
  source: string | number,
  OnProgress?: (percent: number) => void,
  dontFetch?: boolean
): Promise<{ localFile: string; contents: string } | null> => {
  const response = await fetch(source as string); // Adjust the path as per your file location
  if (!response.ok) {
    console.warn("Failed to fetch file: " + source);
  }
  const content = await response.text();
  OnProgress?.(1);
  return { localFile: source as string, contents: content };
};

async function MakeSureCacheDirectoryExists() {
  //make sure cache directory exists

  const cacheDirectory = await FileSystem.getInfoAsync(CACHE_IMAGE_FOLDER);
  //   create cacheDir if does not exist
  if (!cacheDirectory.exists) {
    console.log(
      "cache directory doesnt exist, going to create it",
      CACHE_IMAGE_FOLDER
    );
    try {
      await FileSystem.makeDirectoryAsync(CACHE_IMAGE_FOLDER);
    } catch (e) {
      console.error("Error creating cache dir: ", e);
    }
  } else {
    //print contents
    const cachedFiles = await FileSystem.readDirectoryAsync(
      `${CACHE_IMAGE_FOLDER}`
    );
  }
}

const getHashFromSource = (source: string) => {
  // return source;
  const clean = source
    .replaceAll("/", "OMM_FORWARD_SLASH")
    .replaceAll(":", "OMM_COLON");
  //replace all dots but the last one
  const lastDot = clean.lastIndexOf(".");

  const parts = clean.split(".");
  let cleanNoDots = "";
  for (let i = 0; i < parts.length - 1; i++) {
    cleanNoDots += parts[i] + "OMM_DOT";
  }

  const cleanNoDotsLast = cleanNoDots + "." + parts[parts.length - 1];

  return cleanNoDotsLast;
};
