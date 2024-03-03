import { useCallback, useEffect, useState } from "react";
import { getRemoteSource } from "./FileUtils";

export function useCachedFile(
  path: string,
  dontFetch?: boolean,
  OnProgress?: (percent: number) => void,
  readContents?: boolean
):
  | { localFile: string; contents?: string; forceCacheCheck: () => void }
  | undefined {
  const [forceRefresh, setForceRefresh] = useState({});

  const forceCacheCheck = useCallback(() => {
    console.log("forcing cache check");
    setForceRefresh({});
  }, []);

  const [result, setResult] = useState<
    | { localFile: string; contents?: string; forceCacheCheck: () => void }
    | undefined
  >(undefined);

  useEffect(() => {
    console.log(
      "doing use cached file on: " + path + " dont fetch " + dontFetch
    );
    getRemoteSource(path, OnProgress, !!dontFetch)
      .then((result) => {
        if (result) {
          setResult({ ...result, forceCacheCheck });
        } else {
          setResult(undefined);
        }
      })
      .catch((e) => {
        setResult(undefined);
      });
  }, [path, forceCacheCheck, dontFetch, forceRefresh]);

  return result;
}
