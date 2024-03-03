import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRawYSString, useYSFromPath } from "./DateHooks";

//todo, figure out why local text files arent loading
//const billieDate = require("../assets/ysdates/billie.yarn").text;
// const billieDate = require("../assets/images/Jessa.png");
// const billieDate = require("../assets/images/billieyarn.txt");

export default function Date() {
  const {
    currentLine,
    currentOptions,
    selectOption,
    nextLine,
    nextAvailable,
    availableCommands,
    // } = useYSFromPath("../assets/ysdates/billie.yarn");
  } = useYSFromPath(
    "https://storage.googleapis.com/testcorsbucket/rndemo/ysdates/billie.yarn"
  );

  return (
    <View className="flex-col w-full h-full bg-white justify-center space-y-12 items-center">
      <Text className="text-center">YS Date Demo</Text>
      {!!currentLine && <Text>{currentLine}</Text>}

      <View className="flex-col justify-center items-center">
        {currentOptions.map((option, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => selectOption(idx)}
            className="bg-blue-500 p-4 rounded-xl m-2"
          >
            <Text className="text-white">{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {!!nextAvailable && (
        <TouchableOpacity
          onPress={nextLine}
          className="bg-blue-700 rounded-xl p-4"
        >
          <Text className="text-white">Next</Text>
        </TouchableOpacity>
      )}
      {availableCommands?.length > 0 && (
        <View>
          <Text>Commands</Text>
          <ScrollView>
            {availableCommands.map((command, idx) => (
              <Text key={idx}>{command}</Text>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
