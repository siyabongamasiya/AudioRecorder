import { Audio } from "expo-av";
import { useRef, useState } from "react";

export function useAudioPlayer() {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentUri, setCurrentUri] = useState<string | null>(null);
  const [positionMillis, setPositionMillis] = useState<number>(0);
  const [durationMillis, setDurationMillis] = useState<number>(0);

  async function loadAndPlay(uri: string) {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true }
      );
      soundRef.current = sound;
      setCurrentUri(uri);
      setIsPlaying(true);
      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status) return;
        if (status.isLoaded) {
          setPositionMillis(status.positionMillis || 0);
          setDurationMillis(status.durationMillis || 0);
          setIsPlaying(!!status.isPlaying);
          if (status.didJustFinish) {
            setCurrentUri(null);
            try {
              sound.unloadAsync();
            } catch {}
          }
        }
      });
    } catch (e) {
      console.warn("loadAndPlay", e);
      throw e;
    }
  }

  async function stop() {
    try {
      if (!soundRef.current) return;
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
      setIsPlaying(false);
      setCurrentUri(null);
      setPositionMillis(0);
      setDurationMillis(0);
    } catch (e) {
      console.warn("stop", e);
    }
  }

  async function pause() {
    try {
      if (!soundRef.current) return;
      await soundRef.current.pauseAsync();
      setIsPlaying(false);
    } catch (e) {
      console.warn("pause", e);
    }
  }

  async function resume() {
    try {
      if (!soundRef.current) return;
      await soundRef.current.playAsync();
      setIsPlaying(true);
    } catch (e) {
      console.warn("resume", e);
    }
  }

  async function seekTo(positionMillis: number) {
    try {
      if (!soundRef.current) return;
      await soundRef.current.setPositionAsync(positionMillis);
      setPositionMillis(positionMillis);
    } catch (e) {
      console.warn("seek", e);
    }
  }

  return {
    isPlaying,
    currentUri,
    loadAndPlay,
    stop,
    positionMillis,
    durationMillis,
    seekTo,
    pause,
    resume,
  };
}
