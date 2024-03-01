import { useState, useEffect } from "react";
import * as FileSystem from "expo-file-system";

const useFile = (path: string): { result?: string; error: boolean } => {
  const [fileData, setFileData] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFile = async () => {
      try {
        const fileInfo = await FileSystem.getInfoAsync(path);
        if (fileInfo.exists) {
          const fileContents = await FileSystem.readAsStringAsync(path);
          setFileData(fileContents);
        } else {
          setError(`File at path ${path} does not exist.`);
        }
      } catch (error) {
        setError((error as any)?.message);
        console.log("error with file: " + error);
      }
    };

    fetchFile();

    return () => {
      // Cleanup code if needed
    };
  }, [path]);

  return { result: fileData, error: !!error };
};

export default useFile;
