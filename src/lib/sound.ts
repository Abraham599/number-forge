import { Platform } from "react-native";
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from "expo-audio";

export type SoundCue = "click" | "tile" | "correct" | "almost" | "unlock";

const sources: Record<SoundCue | "loop", number> = {
  click: require("../../assets/sounds/click.wav"),
  tile: require("../../assets/sounds/tile.wav"),
  correct: require("../../assets/sounds/correct.wav"),
  almost: require("../../assets/sounds/almost.wav"),
  unlock: require("../../assets/sounds/unlock.wav"),
  loop: require("../../assets/sounds/loop.wav"),
};

const sfx = new Map<SoundCue, AudioPlayer>();
let music: AudioPlayer | null = null;
let configured = false;
let musicWanted = false;
let soundEnabled = true;
let audioUnlocked = Platform.OS !== "web";

function unlockAudio(): void {
  const wasLocked = !audioUnlocked;
  audioUnlocked = true;
  if (wasLocked && musicWanted) startMusic();
}

export function setSoundEnabled(value: boolean): void {
  soundEnabled = value;
  if (!value) stopAllSound();
}

export async function configureAudio(): Promise<void> {
  if (configured) return;
  configured = true;
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: "mixWithOthers",
    });
  } catch {
    configured = false;
  }
}

function safePlay(player: AudioPlayer): void {
  try {
    const result = player.play() as void | Promise<void>;
    if (result && typeof result.catch === "function") {
      void result.catch(() => undefined);
    }
  } catch {
    // Safari and the simulator may reject autoplay.
  }
}

function playerFor(cue: SoundCue): AudioPlayer | null {
  const existing = sfx.get(cue);
  if (existing) return existing;
  try {
    const player = createAudioPlayer(sources[cue]);
    player.volume = 0.85;
    sfx.set(cue, player);
    return player;
  } catch {
    return null;
  }
}

export function playSfx(cue: SoundCue): void {
  if (!soundEnabled) return;
  unlockAudio();
  void (async () => {
    await configureAudio();
    if (!soundEnabled) return;
    const player = playerFor(cue);
    if (!player) return;
    try {
      await player.seekTo(0);
      safePlay(player);
    } catch {
      safePlay(player);
    }
  })();
}

export function startMusic(): void {
  musicWanted = true;
  if (!soundEnabled || !audioUnlocked) return;
  void (async () => {
    await configureAudio();
    if (!soundEnabled || !musicWanted) return;
    try {
      if (!music) {
        music = createAudioPlayer(sources.loop);
        music.loop = true;
        music.volume = 0.28;
      }
      safePlay(music);
    } catch {
      music = null;
    }
  })();
}

export function stopMusic(): void {
  musicWanted = false;
  try {
    music?.pause();
  } catch {
    // ignore
  }
}

export function stopAllSound(): void {
  musicWanted = false;
  try {
    music?.pause();
  } catch {
    // ignore
  }
  for (const player of sfx.values()) {
    try {
      player.pause();
    } catch {
      // ignore
    }
  }
}
