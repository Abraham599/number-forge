import { create } from "zustand";
import type { GradeBand } from "@/curriculum/types";
import { setSoundEnabled } from "@/lib/sound";
import { getSetting, initLocalDb, savedGradeBand, setSetting } from "@/progress/db";

type AppState = {
  ready: boolean;
  onboardingDone: boolean;
  gradeBand: GradeBand | null;
  soundOn: boolean;
  hapticsOn: boolean;
  offlineChip: boolean;
  hydrate: () => void;
  completeOnboarding: (band: GradeBand) => void;
  setSoundOn: (value: boolean) => void;
  setHapticsOn: (value: boolean) => void;
  setOfflineChip: (value: boolean) => void;
};

export const useAppState = create<AppState>((set) => ({
  ready: false,
  onboardingDone: false,
  gradeBand: null,
  soundOn: true,
  hapticsOn: true,
  offlineChip: false,
  hydrate: () => {
    initLocalDb();
    const band = savedGradeBand();
    const soundOn = getSetting("sound_on") !== "0";
    setSoundEnabled(soundOn);
    set({
      ready: true,
      gradeBand: band,
      onboardingDone: getSetting("onboarding_done") === "1",
      soundOn,
      hapticsOn: getSetting("haptics_on") !== "0",
    });
  },
  completeOnboarding: (band) => {
    setSetting("grade_band", band);
    setSetting("onboarding_done", "1");
    set({ gradeBand: band, onboardingDone: true });
  },
  setSoundOn: (value) => {
    setSetting("sound_on", value ? "1" : "0");
    setSoundEnabled(value);
    set({ soundOn: value });
  },
  setHapticsOn: (value) => {
    setSetting("haptics_on", value ? "1" : "0");
    set({ hapticsOn: value });
  },
  setOfflineChip: (value) => set({ offlineChip: value }),
}));
