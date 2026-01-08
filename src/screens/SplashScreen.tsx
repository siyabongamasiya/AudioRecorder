import React, { useEffect } from "react";
import { Animated, Image, StyleSheet, Text, View } from "react-native";

export default function SplashScreen({ navigation }: { navigation: any }) {
  const anim = new Animated.Value(0);
  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
    const t = setTimeout(() => navigation.replace("Home"), 2000);
    return () => clearTimeout(t);
  }, []);
  return (
    <View style={styles.container}>
      <Animated.View style={{ alignItems: "center", opacity: anim }}>
        <Image
          source={require("../../assets/images/logo_audio_recorder.png")}
          style={styles.icon}
          resizeMode="contain"
        />
        <Text style={styles.title}>Voice Journal</Text>
        <Text style={styles.subtitle}>Your personal audio diary</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#667eea",
  },
  icon: {
    width: 120,
    height: 120,
    borderRadius: 32,
    backgroundColor: "transparent",
    marginBottom: 20,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "500",
    textAlign: "center",
  },
  subtitle: {
    color: "rgba(255,255,255,0.9)",
    marginTop: 6,
    textAlign: "center",
  },
});
