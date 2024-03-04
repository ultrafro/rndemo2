import { View, Text, Button, Pressable } from "react-native";
import DatePage from "./DatePage";
import CanvasTest from "./CanvasTest";
import SpineTest from "./SpineTest";
import { ReactNode } from "react";
import ProgressiveLoading from "./ProgressiveLoading";
import ReanimatedTest from "./ReanimatedTest";
import CityView from "./CityView";
import { Particle } from "tsparticles-engine";
import ParticlesTest from "./ParticlesTest";

export type ExperimentChip = {
  name: string;
  component?: ReactNode;
  underConstruction: boolean;
};

export const experiments = [
  { name: "Yarnspinner", component: <DatePage />, underConstruction: false },
  { name: "Three JS", component: <CanvasTest />, underConstruction: false },
  { name: "Spine", component: <SpineTest />, underConstruction: false },
  {
    name: "Progressive Loading",
    component: <ProgressiveLoading />,
    underConstruction: false,
  },
  {
    name: "Reanimated",
    component: <ReanimatedTest />,
    underConstruction: false,
  },
  {
    name: "Rive",
    underConstruction: true,
  },
  {
    name: "Particles",
    component: <ParticlesTest />,
    underConstruction: false,
  },
  {
    name: "City View Nav",
    component: <CityView />,
    underConstruction: false,
  },
  {
    name: "Date Commands",
    underConstruction: true,
  },
  {
    name: "Auth",
    underConstruction: true,
  },
];

export function Experiments({
  OnSelect,
}: {
  OnSelect: (experiment: string) => void;
}) {
  return (
    <View className="flex flex-wrap justify-start items-center w-full h-full  gap-8  p-12">
      {experiments.map((experiment) => {
        const OnPress = () => {
          if (experiment.component) {
            OnSelect(experiment.name);
          }
        };

        return (
          <Pressable
            key={experiment.name}
            className={` p-4 bg-blue-500 w-[30%] h-[20%] justify-center items-center text-center text-white rounded-lg focus:outline-none ${
              experiment.underConstruction
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            onPress={OnPress}
          >
            <View className="w-full h-full flex-col justify-around items-center">
              <Text className="text-black dark:text-white">
                {experiment.name}
              </Text>
              {experiment.underConstruction && (
                <Text className="block text-xs mt-1">Under Construction</Text>
              )}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
