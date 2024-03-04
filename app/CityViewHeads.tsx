import { Button, View } from "react-native";
import { Image } from "expo-image";

const TEMP_HEADS = [
  {
    id: "Wylan",
    x: 250,
    y: 250,
    source: require("../assets/images/Wylan.png"),
  },
  {
    id: "Mei",
    x: -250,
    y: -250,
    source: require("../assets/images/Mei.png"),
  },
];

export default function CityViewHeads() {
  return (
    <View
      className={
        "flex-col justify-center items-center w-full h-full  pointer-events-none select-none"
      }
      pointerEvents="none"
    >
      <View
        className="w-24 h-24  relative  pointer-events-none select-none"
        pointerEvents="none"
      >
        {TEMP_HEADS.map((head) => {
          console.log("head", head);
          return (
            <View
              key={head.id}
              pointerEvents="auto"
              style={{
                position: "absolute",
                left: head.x,
                top: head.y,
              }}
            >
              <CityIndividualHead src={head.source} />
            </View>
          );
        })}
      </View>
    </View>
  );
}

function CityIndividualHead({ src }: { src: any }) {
  return (
    <View>
      <Image
        source={src}
        className="w-[100px] h-[300px]"
        contentFit={"contain"}
      />
    </View>
  );
}
