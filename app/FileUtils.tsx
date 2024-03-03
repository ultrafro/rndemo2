import * as FileSystem from "expo-file-system";
import { Button, View, Text, Platform } from "react-native";
import { getRemoteSourceRN, getRemoteSourceWeb } from "./GetRemoteSource";
export const CACHE_IMAGE_FOLDER = FileSystem.cacheDirectory + "IMAGE_CACHE";

export const wylanImage = require("../assets/images/Wylan.png");

export const getRemoteSource = async (
  source: string,
  OnProgress?: (percent: number) => void,
  dontFetch?: boolean
): Promise<{ localFile: string; contents: string } | null> => {
  if (Platform.OS !== "web") {
    return getRemoteSourceRN(source, OnProgress, dontFetch);
  } else {
    return getRemoteSourceWeb(source, OnProgress, dontFetch);
  }
};

export const cleanupCache = async () => {
  if (Platform.OS !== "web") {
    return cleanupCacheRN();
  } else {
    return cleanupCacheWeb();
  }
};

const cleanupCacheRN = async () => {
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
  }
};

async function cleanupCacheWeb() {}
