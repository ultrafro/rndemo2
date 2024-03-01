import { useCallback, useEffect, useRef, useState } from "react";
import OMMYS, { OMMOption } from "./OMMYS";
import { Asset, useAssets } from "expo-asset";
import useFile from "./useFile";

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

  //   const { result, error } = useFile(path);

  //   useEffect(() => {
  //     async function testFetch() {
  //       const response = await fetch(path); // Adjust the path as per your file location
  //       console.log("respsone", response);
  //     }
  //     testFetch();
  //   }, []);

  //   const [assets, error] = useAssets([require(path)]);

  //   console.log("assets", assets);

  useEffect(() => {
    async function fetchFile() {
      try {
        const response = await fetch(path); // Adjust the path as per your file location
        if (!response.ok) {
          throw new Error("Failed to fetch file");
        }
        const content = await response.text();
        setFileContent(content);
      } catch (error) {
        console.error("Error fetching file:", error);
      }
    }

    fetchFile();
  }, [path]);

  //return result ?? "";

  return fileContent;
}
