import { useCallback, useEffect, useRef, useState } from "react";
import OMMYS, { OMMOption } from "./OMMYS";
import { Asset, useAssets } from "expo-asset";
import useFile from "./useFile";
import { useCachedFile } from "./useCachedFile";

export function useRawYSString(yarnspinnerString: string) {
  return useYS(yarnspinnerString, false);
}

export function useYSFromPath(path: string) {
  return useYS(path, true);
}

export function useYS(
  dateTextOrPath: string,
  isPath: boolean
): {
  currentLine: string;
  currentOptions: string[];
  selectOption: (optionIdx: number) => void;
  nextLine: () => void;
  nextAvailable: boolean;
  availableCommands: string[];
} {
  const dateTextFromPath = useFetchedYarn(dateTextOrPath);

  const [forceRefresh, setForceRefresh] = useState({});

  const [OMMYSParser, setOMMYSParser] = useState<OMMYS | null>(null);

  useEffect(() => {
    setOMMYSParser(new OMMYS(setForceRefresh as any));

    return () => {
      setOMMYSParser(null);
    };
  }, []);

  useEffect(() => {
    if (!OMMYSParser) return;
    OMMYSParser.SetYarnString(isPath ? dateTextFromPath : dateTextOrPath);
    setForceRefresh({});
  }, [OMMYSParser, dateTextFromPath, dateTextOrPath, isPath]);

  const currentLine = OMMYSParser?.GetCurrentLine()?.content || "";

  const availableOptions = OMMYSParser?.GetOptions() || [];

  const currentOptions = availableOptions.map((option) => option.choiceText);

  const isDone = OMMYSParser?.isDone() || false;

  const availableCommands = OMMYSParser?.GetCommands() || [];

  const selectOption = useCallback(
    (optionIdx: number) => {
      OMMYSParser?.SelectOption(optionIdx);
      setForceRefresh({});
    },
    [OMMYSParser]
  );

  const nextLine = useCallback(() => {
    OMMYSParser?.next();
    setForceRefresh({});
  }, [OMMYSParser]);

  return {
    currentLine,
    currentOptions,
    selectOption,
    nextLine,
    nextAvailable: availableOptions.length <= 0 && !isDone,
    availableCommands,
  };
}

function useFetchedYarn(path: string) {
  const [fileContent, setFileContent] = useState("");

  const result = useCachedFile(path, false, undefined, true);

  useEffect(() => {
    if (result?.contents) {
      setFileContent(result.contents);
    }
  }, [result]);

  //return result ?? "";

  return fileContent;
}
