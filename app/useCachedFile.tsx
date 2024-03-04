import { useCallback, useEffect, useState } from "react";
import { getRemoteSource } from "./FileUtils";

export function useCachedFile(
  path: string,
  dontFetch?: boolean,
  OnProgress?: (percent: number) => void,
  readContents?: boolean,
  isBase64?: boolean
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
    getRemoteSource(path, OnProgress, !!dontFetch, false, undefined, isBase64)
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

export function useLocalFile(
  requirePath: string,
  path: string,
  dontFetch?: boolean,
  OnProgress?: (percent: number) => void,
  readContents?: boolean,
  isLocal?: boolean,
  isBase64?: boolean
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
    console.log("useLocalFile: ", requirePath, path, dontFetch, forceRefresh);
    getRemoteSource(requirePath, OnProgress, !!dontFetch, true, path, isBase64)
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
