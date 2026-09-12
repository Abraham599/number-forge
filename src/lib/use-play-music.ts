import { useEffect } from "react";
import { AppState } from "react-native";
import { startMusic, stopMusic } from "@/lib/sound";
import { useAppState } from "@/progress/store";

export function usePlayMusic(): void {
  const soundOn = useAppState((state) => state.soundOn);

  useEffect(() => {
    if (soundOn) startMusic();
    else stopMusic();
    return () => stopMusic();
  }, [soundOn]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (status) => {
      if (status !== "active") {
        stopMusic();
        return;
      }
      if (useAppState.getState().soundOn) startMusic();
    });
    return () => sub.remove();
  }, []);
}
