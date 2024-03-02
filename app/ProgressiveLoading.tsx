import { Button, View, Text, Platform } from "react-native";
import { Image } from "expo-image";
import { useState } from "react";
import * as FileSystem from "expo-file-system";
import {
  CACHE_IMAGE_FOLDER,
  cleanupCache,
  getRemoteSource,
  wylanImage,
} from "./FileUtils";
import { useCachedFile } from "./useCachedFile";

const blurhash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

// const localWylan = require("./assets/images/Wylan.png");

export default function ProgressiveLoading() {
  const localSource = "../assets/images/Wylan.png";
  const remoteSource1 =
    "https://storage.googleapis.com/testcorsbucket/Logan.png";
  const remoteSource2 =
    "https://storage.googleapis.com/testcorsbucket/Jessa.png";

  const [remoteImage1, setRemoteImage1] = useState<string | undefined>(
    undefined
  );
  const [remoteImage2, setRemoteImage2] = useState<string | undefined>(
    undefined
  );

  const [downloadProgress1, setDownloadProgress1] = useState<number>(0);
  const [downloadProgress2, setDownloadProgress2] = useState<number>(0);

  const [shouldFetchImage1, setShouldFetchImage1] = useState<boolean>(false);
  const [shouldFetchImage2, setShouldFetchImage2] = useState<boolean>(false);

  const image1result = useCachedFile(
    remoteSource1,
    shouldFetchImage1,
    setDownloadProgress1
  );
  const image2result = useCachedFile(
    remoteSource2,
    shouldFetchImage2,
    setDownloadProgress2
  );

  //   return (
  //     <Image
  //       className="w-full h-full"
  //       style={{ width: 100, height: 100 }}
  //       source={require("../assets/images/Wylan.png")}
  //       //source={wylanImage}
  //       placeholder={blurhash}
  //       contentFit="contain"
  //       transition={1000}
  //     />
  //   );

  return (
    <View className="flex-col w-full h-full justify-around items-center">
      <View className="w-48 h-48 bg-slate-500 flex-col justify-center items-center">
        <Image
          className="w-full h-full"
          source={require(localSource)}
          placeholder={blurhash}
          contentFit="contain"
          transition={1000}
        />

        <Button title="Local" onPress={() => {}} />
      </View>

      <View className="w-48 h-48 bg-slate-500 flex-col justify-center items-center">
        {!!image1result && (
          <Image
            className="w-full h-full"
            source={{ uri: image1result.localFile }}
            placeholder={blurhash}
            contentFit="contain"
            transition={1000}
          />
        )}
        {<Text>Progress: {(downloadProgress1 * 100).toFixed(1)}%</Text>}
        <Button
          title="Download remote image 1"
          onPress={async () => {
            setShouldFetchImage1(true);

            // const result = await getRemoteSource(
            //   remoteSource1,
            //   setDownloadProgress1
            // );
            // console.log("got remote source 1: ", result);

            // if (!!result) {
            //   setRemoteImage1(result.localFile);
            // }
          }}
        />
      </View>

      <View className="w-48 h-48 bg-slate-500 flex-col justify-center items-center">
        {!!remoteImage2 && (
          <Image
            className="w-full h-full"
            source={remoteImage2}
            placeholder={blurhash}
            contentFit="contain"
            transition={1000}
          />
        )}
        {downloadProgress2 > 0 && <Text>Progress: {downloadProgress2}</Text>}
        <Button
          title="Download remote image 2"
          onPress={async () => {
            // const result = getRemoteSource(remoteSource2);
          }}
        />
      </View>

      <Button
        title={"Clear cache"}
        onPress={() => {
          console.log("clean up cache button");
          cleanupCache();
        }}
      />
    </View>
  );
}
