import { Button, View, Text, Platform } from "react-native";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
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

export default function ProgressiveLoading() {
  const localSource = "../assets/images/Wylan.png";
  const remoteSource1 =
    "https://storage.googleapis.com/testcorsbucket/Logan.png";
  const remoteSource2 =
    "https://storage.googleapis.com/testcorsbucket/Jessa.png";

  const [downloadProgress1, setDownloadProgress1] = useState<number>(0);
  const [downloadProgress2, setDownloadProgress2] = useState<number>(0);

  const [shouldNotFetchImage1, setShouldNotFetchImage1] =
    useState<boolean>(true);
  const [shouldNotFetchImage2, setShouldNotFetchImage2] =
    useState<boolean>(true);

  const [clearingCache, setClearingCache] = useState<boolean>(false);

  const image1result = useCachedFile(
    remoteSource1,
    shouldNotFetchImage1,
    setDownloadProgress1
  );
  const image2result = useCachedFile(
    remoteSource2,
    shouldNotFetchImage2,
    setDownloadProgress2
  );

  useEffect(() => {
    if (clearingCache) {
      cleanupCache().then(() => {
        image1result?.forceCacheCheck();
        image2result?.forceCacheCheck();
        setClearingCache(false);
      });
    }
  }, [clearingCache]);

  if (clearingCache) {
    return <Text>Clearing cache......</Text>;
  }

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
            setShouldNotFetchImage1(false);
          }}
        />
      </View>

      <View className="w-48 h-48 bg-slate-500 flex-col justify-center items-center">
        {!!image2result && (
          <Image
            className="w-full h-full"
            source={{ uri: image2result.localFile }}
            placeholder={blurhash}
            contentFit="contain"
            transition={1000}
          />
        )}
        {<Text>Progress: {(downloadProgress2 * 100).toFixed(1)}%</Text>}
        <Button
          title="Download remote image 2"
          onPress={async () => {
            setShouldNotFetchImage2(false);
          }}
        />
      </View>
      <Button
        title={"Clear cache"}
        onPress={() => {
          setShouldNotFetchImage1(true);
          setShouldNotFetchImage2(true);

          setDownloadProgress1(0);
          setDownloadProgress2(0);

          setClearingCache(true);
        }}
      />
    </View>
  );
}
