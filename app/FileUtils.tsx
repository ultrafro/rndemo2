import * as FileSystem from "expo-file-system";
import { Button, View, Text, Platform } from "react-native";
export const CACHE_IMAGE_FOLDER = FileSystem.cacheDirectory + "IMAGE_CACHE";

export const wylanImage = require("../assets/images/Wylan.png");

export const getRemoteSource = async (
  source: string,
  OnProgress?: (percent: number) => void,
  dontFetch?: boolean
): Promise<{ localFile: string; contents: string } | null> => {
  await MakeSureCacheDirectoryExists();

  const hash = getHashFromSource(source);

  const cachedFileSource = `${CACHE_IMAGE_FOLDER}/${hash}`;
  console.log("retrieving image hash: " + cachedFileSource);

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
    const fileContents = await FileSystem.readAsStringAsync(cachedFileSource);

    console.log(
      "fileContents",
      fileContents,
      "cachedFileSource",
      cachedFileSource
    );

    OnProgress?.(1);

    return { localFile: cachedFileSource, contents: fileContents };
  } else {
    if (dontFetch) {
      return null;
    }

    console.warn(
      `File at path ${source} does not exist in the FS. Attempting to fetch from the network.` +
        cachedFileSource +
        " dont fetch: " +
        dontFetch
    );

    const progressCB = (progress: FileSystem.DownloadProgressData) => {
      OnProgress?.(
        progress.totalBytesWritten / progress.totalBytesExpectedToWrite
      );
    };

    const downloadResumable = FileSystem.createDownloadResumable(
      source,
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
        console.log("Finished downloading to ", downloadResult);

        return { localFile: downloadResult.uri, contents: "" };
      }
    } catch (e) {
      console.error("failed to download: ", cachedFileSource, e);
      return null;
    }
  }
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
    console.log("cache directory exists", CACHE_IMAGE_FOLDER);

    //print contents
    const cachedFiles = await FileSystem.readDirectoryAsync(
      `${CACHE_IMAGE_FOLDER}`
    );
    console.log("cachedFiles", cachedFiles);
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

export const cleanupCache = async () => {
  console.log("begin cache cleanup!");
  const cacheDirectory = await FileSystem.getInfoAsync(CACHE_IMAGE_FOLDER);
  //   create cacheDir if does not exist
  if (!cacheDirectory.exists) {
    console.log(
      "cache directory doesnt exist, going to create it",
      CACHE_IMAGE_FOLDER
    );
    await FileSystem.makeDirectoryAsync(CACHE_IMAGE_FOLDER);
  }

  if (Platform.OS !== "web") {
    // cleanup old cached files
    const cachedFiles = await FileSystem.readDirectoryAsync(
      `${CACHE_IMAGE_FOLDER}`
    );

    for (let i = 0; i < cachedFiles.length; i++) {
      let fileUnreadable = false;
      try {
        //get info about cache file
        const fileInfo = await FileSystem.getInfoAsync(
          `${CACHE_IMAGE_FOLDER}/${cachedFiles[i]}`
        );
        if (!fileInfo.exists) {
          console.warn(
            "trying to delet file, but it does not exist",
            cachedFiles[i]
          );
          fileUnreadable = true;
        }
      } catch (e) {
        fileUnreadable = true;
        console.warn(
          "could not read info about file: " +
            cachedFiles[i] +
            " " +
            "skipping delete" +
            " error: " +
            e
        );
      }
      if (!fileUnreadable) {
        //console.log("deleting cache file: " + cachedFiles[i]);
        await FileSystem.deleteAsync(`${CACHE_IMAGE_FOLDER}/${cachedFiles[i]}`);
      }
    }

    //cache clearing done, print new results

    const cachedFilesAfter = await FileSystem.readDirectoryAsync(
      `${CACHE_IMAGE_FOLDER}`
    );
    console.log(
      "cache clearing done, printing new results of cache, cachedFilesAfter",
      cachedFilesAfter
    );
  }
};
