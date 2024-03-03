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
    getRemoteSource(path, OnProgress, !!dontFetch, false)
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
  isLocal?: boolean
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
    getRemoteSource(requirePath, OnProgress, !!dontFetch, isLocal, path)
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
