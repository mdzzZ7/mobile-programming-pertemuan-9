import { useEffect, useRef } from "react";
import { Animated, Platform, type StyleProp, type ViewStyle } from "react-native";

type AnimatedCardProps = {
  children: React.ReactNode;
  index?: number;
  style?: StyleProp<ViewStyle>;
};

export function AnimatedCard({ children, index = 0, style }: AnimatedCardProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    const useNative = Platform.OS !== "web";
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 360,
        delay: index * 75,
        useNativeDriver: useNative,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        speed: 14,
        bounciness: 6,
        delay: index * 75,
        useNativeDriver: useNative,
      }),
    ]).start();
  }, [index, opacity, translateY]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}