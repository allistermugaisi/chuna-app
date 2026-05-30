import React from "react";
import { Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

export function PressScale({ children, onPress, style, scaleTo = 0.97 }) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPressIn={() => {
        scale.value = withTiming(scaleTo, { duration: 130 });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 220 });
      }}
      onPress={onPress}
      style={style}
    >
      <Animated.View style={[{ flex: 1 }, animStyle]}>{children}</Animated.View>
    </Pressable>
  );
}
