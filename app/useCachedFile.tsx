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
    setForceRefresh({});
  }, []);

  const [result, setResult] = useState<
    | { localFile: string; contents?: string; forceCacheCheck: () => void }
    | undefined
  >(undefined);

  useEffect(() => {
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
  }, [path, forceCacheCheck, dontFetch]);

  return result;
}