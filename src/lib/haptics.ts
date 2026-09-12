import * as Haptics from "expo-haptics";
import { useAppState } from "@/progress/store";

export async function kidHaptic(
  style: "light" | "success" | "error" = "light",
): Promise<void> {
  if (!useAppState.getState().hapticsOn) return;
  switch (style) {
    case "light":
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return;
    case "success":
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return;
    case "error":
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    default: {
      const _exhaustive: never = style;
      return _exhaustive;
    }
  }
}
