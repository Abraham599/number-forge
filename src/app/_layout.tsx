import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { bootstrapRemote } from "@/api/client";
import { configureAudio } from "@/lib/sound";
import { useAppState } from "@/progress/store";
import { colors } from "@/theme/tokens";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

const queryClient = new QueryClient();

export default function RootLayout() {
  const hydrate = useAppState((state) => state.hydrate);
  const ready = useAppState((state) => state.ready);
  const setOfflineChip = useAppState((state) => state.setOfflineChip);

  useEffect(() => {
    hydrate();
    void configureAudio();
  }, [hydrate]);

  useEffect(() => {
    if (!ready) return;
    void bootstrapRemote().then((ok) => setOfflineChip(!ok));
  }, [ready, setOfflineChip]);

  useEffect(() => {
    if (!ready) return;
    SplashScreen.hideAsync().catch(() => undefined);
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.paper }}>
      <QueryClientProvider client={queryClient}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.paper },
            animation: "fade",
          }}
        />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
