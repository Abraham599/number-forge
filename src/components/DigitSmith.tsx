import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, { cubicBezier, useReducedMotion } from "react-native-reanimated";
import type { SmithPartId } from "@/smith/parts";
import { colors, shadow } from "@/theme/tokens";

type Mood = "idle" | "glad" | "sad";

type Props = {
  size?: number;
  mood?: Mood;
  unlocked?: SmithPartId[];
  highlight?: SmithPartId;
  compact?: boolean;
  lively?: boolean;
  tempered?: boolean;
};

const EASE_OUT = cubicBezier(0.23, 1, 0.32, 1);
const EASE_MOVE = cubicBezier(0.77, 0, 0.175, 1);

const breathe = {
  "0%": { transform: [{ scaleY: 1 }] },
  "50%": { transform: [{ scaleY: 1.028 }] },
  "100%": { transform: [{ scaleY: 1 }] },
};

const sway = {
  "0%": { transform: [{ rotate: "-2deg" }] },
  "50%": { transform: [{ rotate: "2deg" }] },
  "100%": { transform: [{ rotate: "-2deg" }] },
};

const blink = {
  "0%": { opacity: 0, transform: [{ scaleY: 0.95 }] },
  "41%": { opacity: 0, transform: [{ scaleY: 0.95 }] },
  "44%": { opacity: 1, transform: [{ scaleY: 1 }] },
  "47%": { opacity: 0, transform: [{ scaleY: 0.95 }] },
  "100%": { opacity: 0, transform: [{ scaleY: 0.95 }] },
};

const tap = {
  "0%": { transform: [{ rotate: "-12deg" }] },
  "18%": { transform: [{ rotate: "18deg" }] },
  "40%": { transform: [{ rotate: "-12deg" }] },
  "100%": { transform: [{ rotate: "-12deg" }] },
};

const hop = {
  "0%": { transform: [{ translateY: 8 }, { scale: 0.96 }], opacity: 0.88 },
  "100%": { transform: [{ translateY: 0 }, { scale: 1 }], opacity: 1 },
};

const twinkle = {
  "0%": { opacity: 0.25, transform: [{ scale: 0.94 }] },
  "50%": { opacity: 1, transform: [{ scale: 1 }] },
  "100%": { opacity: 0.25, transform: [{ scale: 0.94 }] },
};

const skin = "#E8A45A";
const skinDeep = "#C9843A";
const blush = "rgba(196, 92, 92, 0.4)";
const shirt = "#D2B48C";

export function DigitSmith({
  size = 120,
  mood = "idle",
  unlocked = [],
  highlight,
  compact = false,
  lively,
  tempered = false,
}: Props) {
  const reduced = useReducedMotion();
  const alive = lively ?? !compact;
  const on = new Set(unlocked);
  const ghost = (id: SmithPartId) => highlight === id && !on.has(id);
  const s = size / 100;
  const px = (n: number) => Math.max(1, Math.round(n * s));
  const box = compact
    ? { width: px(100), height: px(80) }
    : { width: px(112), height: px(152) };

  const loop = !reduced;
  const showSway = loop && alive && mood !== "glad";
  const showHop = loop && alive && mood === "glad";
  const showHammer = on.has("hammer") && on.has("armR");
  const showTap = loop && alive && showHammer;
  const showTwinkle = loop && ((mood === "glad" && Boolean(highlight)) || tempered);

  return (
    <View accessibilityLabel={labelFor(unlocked, highlight)} style={[styles.stage, box]}>
      {!compact ? (
        <View
          style={[
            styles.floor,
            { width: px(58), height: px(9), borderRadius: px(5), left: px(27), top: px(140) },
          ]}
        />
      ) : null}

      <Animated.View
        style={[
          styles.actor,
          box,
          showHop
            ? {
                animationName: hop,
                animationDuration: "280ms",
                animationTimingFunction: EASE_OUT,
                animationFillMode: "forwards",
              }
            : null,
          showSway
            ? {
                animationName: sway,
                animationDuration: "3.2s",
                animationTimingFunction: EASE_MOVE,
                animationIterationCount: "infinite",
              }
            : null,
        ]}
      >
        {!compact && on.has("cape") ? (
          <View
            style={[
              styles.cape,
              glow(highlight === "cape"),
              { width: px(62), height: px(68), borderRadius: px(30), left: px(25), top: px(50) },
            ]}
          />
        ) : null}

        {!compact ? (
          <>
            {on.has("armL") || ghost("armL") ? (
              <Limb px={px} side="left" strong={on.has("armL")} hot={highlight === "armL"} ghost={ghost("armL")} />
            ) : null}
            {on.has("armR") || ghost("armR") ? (
              <Limb px={px} side="right" strong={on.has("armR")} hot={highlight === "armR"} ghost={ghost("armR")} />
            ) : null}
            {showHammer || (ghost("hammer") && on.has("armR")) ? (
              <Animated.View
                style={[
                  styles.hammer,
                  glow(highlight === "hammer"),
                  {
                    left: px(82),
                    top: px(48),
                    width: px(16),
                    height: px(40),
                    transformOrigin: "50% 100%",
                    opacity: ghost("hammer") && !showHammer ? 0.28 : 1,
                  },
                  showTap
                    ? {
                        animationName: tap,
                        animationDuration: "1.8s",
                        animationTimingFunction: EASE_MOVE,
                        animationIterationCount: "infinite",
                      }
                    : { transform: [{ rotate: "-12deg" }] },
                ]}
              >
                <View style={[styles.hammerHead, { width: px(20), height: px(11), borderRadius: px(3) }]} />
                <View style={[styles.hammerHaft, { width: px(6), height: px(28), borderRadius: px(3) }]} />
              </Animated.View>
            ) : null}
          </>
        ) : null}

        <Animated.View
          style={[
            styles.torso,
            {
              width: px(compact ? 56 : 46),
              height: px(compact ? 30 : 56),
              left: px(compact ? 22 : 33),
              top: px(compact ? 50 : 54),
              transformOrigin: "50% 100%",
            },
            loop
              ? {
                  animationName: breathe,
                  animationDuration: alive ? "2.4s" : "3.6s",
                  animationTimingFunction: EASE_MOVE,
                  animationIterationCount: "infinite",
                }
              : null,
          ]}
        >
          <View
            style={[
              styles.body,
              {
                borderRadius: px(compact ? 20 : 24),
                backgroundColor: shirt,
              },
            ]}
          >
            <View style={[styles.bodyShine, { width: "46%", height: "34%", borderRadius: px(14), top: px(7), left: px(7) }]} />
            {tempered ? (
              <View style={[styles.temper, { height: px(compact ? 6 : 8), borderRadius: px(4) }]} />
            ) : null}
            {on.has("apron") ? (
              <View
                style={[
                  styles.apron,
                  glow(highlight === "apron"),
                  { width: "86%", height: compact ? "70%" : "72%", borderRadius: px(16) },
                ]}
              >
                {!compact ? <View style={[styles.pocket, { width: px(16), height: px(13), borderRadius: px(4) }]} /> : null}
              </View>
            ) : null}
          </View>
        </Animated.View>

        {!compact && (on.has("boots") || ghost("boots")) ? (
          <View style={[styles.boots, { top: px(104), left: px(36), gap: px(8) }]}>
            <Foot px={px} booted={on.has("boots")} hot={highlight === "boots"} ghost={ghost("boots")} />
            <Foot px={px} booted={on.has("boots")} hot={highlight === "boots"} ghost={ghost("boots")} />
          </View>
        ) : null}

        <View
          style={[
            styles.neck,
            {
              width: px(compact ? 16 : 14),
              height: px(compact ? 8 : 10),
              borderRadius: px(6),
              left: px(compact ? 42 : 49),
              top: px(compact ? 48 : 52),
            },
          ]}
        />
        <Face
          px={px}
          compact={compact}
          mood={mood}
          hat={on.has("hat")}
          hatHot={highlight === "hat"}
          canBlink={loop}
        />
      </Animated.View>

      {showTwinkle ? (
        <>
          <Animated.View
            style={[
              styles.spark,
              { left: px(6), top: px(20), width: px(8), height: px(8) },
              {
                animationName: twinkle,
                animationDuration: "1.6s",
                animationTimingFunction: "ease-in-out",
                animationIterationCount: "infinite",
              },
            ]}
          />
          <Animated.View
            style={[
              styles.spark,
              { right: px(8), top: px(34), width: px(6), height: px(6) },
              {
                animationName: twinkle,
                animationDuration: "1.8s",
                animationDelay: "220ms",
                animationTimingFunction: "ease-in-out",
                animationIterationCount: "infinite",
              },
            ]}
          />
        </>
      ) : null}
    </View>
  );
}

function Face({
  px,
  compact,
  mood,
  hat,
  hatHot,
  canBlink,
}: {
  px: (n: number) => number;
  compact: boolean;
  mood: Mood;
  hat: boolean;
  hatHot: boolean;
  canBlink: boolean;
}) {
  const head = px(compact ? 54 : 50);
  const eye = px(compact ? 12 : 11);
  const pupil = Math.max(4, px(5));
  const look = mood === "sad" ? 1 : mood === "glad" ? -1 : 0;
  const mouthW = px(mood === "idle" ? 13 : 17);

  return (
    <View style={[styles.headWrap, { width: head, height: head, left: px(compact ? 23 : 31), top: px(compact ? 6 : 10) }]}>
      {hat ? (
        <View style={[styles.hat, glow(hatHot), { width: px(42), height: px(17), borderRadius: px(9), top: px(-11) }]}>
          <View style={[styles.hatBrim, { width: px(50), height: px(6), borderRadius: px(3), top: px(12) }]} />
        </View>
      ) : null}
      <View style={[styles.ear, { width: px(11), height: px(15), borderRadius: px(7), left: px(-7), top: px(18) }]} />
      <View style={[styles.ear, { width: px(11), height: px(15), borderRadius: px(7), right: px(-7), top: px(18) }]} />
      <View style={[styles.head, shadow.rest, { width: head, height: head, borderRadius: head / 2 }]}>
        <View style={[styles.shine, { width: px(18), height: px(11), borderRadius: px(8), top: px(8), left: px(11) }]} />
        <View style={[styles.brows, { top: px(15), gap: px(14) }]}>
          <View style={[styles.brow, mood === "sad" ? styles.browSad : null, { width: px(11) }]} />
          <View style={[styles.brow, mood === "sad" ? styles.browSad : null, { width: px(11) }]} />
        </View>
        <View style={[styles.eyes, { top: px(21), gap: px(8) }]}>
          <Eye size={eye} pupil={pupil} look={look} canBlink={canBlink} />
          <Eye size={eye} pupil={pupil} look={look} canBlink={canBlink} />
        </View>
        <View style={[styles.cheeks, { top: px(34), gap: px(20) }]}>
          <View style={[styles.cheek, { width: px(9), height: px(6), borderRadius: px(4) }]} />
          <View style={[styles.cheek, { width: px(9), height: px(6), borderRadius: px(4) }]} />
        </View>
        <View
          style={[
            styles.mouth,
            mood === "sad" ? styles.mouthSad : styles.mouthGlad,
            {
              width: mouthW,
              height: px(8),
              marginLeft: -mouthW / 2,
              borderBottomWidth: mood === "sad" ? 0 : 2.5,
              borderTopWidth: mood === "sad" ? 2.5 : 0,
              top: px(42),
            },
          ]}
        />
      </View>
    </View>
  );
}

function Eye({
  size,
  pupil,
  look,
  canBlink,
}: {
  size: number;
  pupil: number;
  look: number;
  canBlink: boolean;
}) {
  return (
    <View style={[styles.eyeWhite, { width: size, height: size * 1.2, borderRadius: size / 2 }]}>
      <View
        style={[
          styles.pupil,
          { width: pupil, height: pupil, borderRadius: pupil / 2, transform: [{ translateY: look }] },
        ]}
      >
        <View style={styles.glint} />
      </View>
      {canBlink ? (
        <Animated.View
          style={[
            styles.lid,
            {
              borderRadius: size / 2,
              transformOrigin: "50% 0%",
              opacity: 0,
              animationName: blink,
              animationDuration: "3.2s",
              animationTimingFunction: "ease-in-out",
              animationIterationCount: "infinite",
            },
          ]}
        />
      ) : null}
    </View>
  );
}

function Limb({
  px,
  side,
  strong,
  hot,
  ghost,
}: {
  px: (n: number) => number;
  side: "left" | "right";
  strong: boolean;
  hot: boolean;
  ghost: boolean;
}) {
  const left = side === "left";
  const thick = strong ? 18 : 15;
  return (
    <View
      style={[
        styles.arm,
        glow(hot),
        {
          width: px(thick),
          height: px(34),
          borderRadius: px(9),
          left: px(left ? 22 : 74),
          top: px(58),
          backgroundColor: ghost ? "transparent" : strong ? "#E0A14A" : skin,
          borderWidth: ghost ? 2 : 0,
          borderColor: colors.amber,
          borderStyle: ghost ? "dashed" : "solid",
          opacity: ghost ? 0.45 : 1,
          transform: [{ rotate: left ? "22deg" : "-22deg" }],
        },
      ]}
    >
      {ghost ? null : (
        <View
          style={[
            styles.hand,
            {
              width: px(13),
              height: px(13),
              borderRadius: px(7),
              backgroundColor: skinDeep,
              bottom: px(-5),
            },
          ]}
        />
      )}
    </View>
  );
}

function Foot({
  px,
  booted,
  hot,
  ghost,
}: {
  px: (n: number) => number;
  booted: boolean;
  hot: boolean;
  ghost: boolean;
}) {
  return (
    <View
      style={[
        styles.boot,
        glow(hot),
        {
          width: px(18),
          height: px(13),
          borderRadius: px(7),
          backgroundColor: ghost ? "transparent" : booted ? colors.ink : skinDeep,
          borderWidth: ghost ? 2 : 0,
          borderColor: colors.amber,
          borderStyle: ghost ? "dashed" : "solid",
          opacity: ghost ? 0.45 : 1,
        },
      ]}
    />
  );
}

function glow(on: boolean) {
  return on ? styles.hot : null;
}

function labelFor(unlocked: SmithPartId[], highlight?: SmithPartId): string {
  if (highlight) return `Digit smith forged a new ${highlight}`;
  if (unlocked.length === 0) return "Digit smith, still waiting for parts";
  return `Digit smith with ${unlocked.length} parts`;
}

const styles = StyleSheet.create({
  stage: {
    position: "relative",
  },
  floor: {
    position: "absolute",
    backgroundColor: "rgba(58, 42, 31, 0.12)",
  },
  actor: {
    position: "absolute",
    left: 0,
    top: 0,
  },
  cape: {
    position: "absolute",
    backgroundColor: colors.tealDeep,
    opacity: 0.92,
  },
  neck: {
    position: "absolute",
    backgroundColor: skin,
    zIndex: 3,
  },
  torso: {
    position: "absolute",
    zIndex: 2,
  },
  body: {
    flex: 1,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  bodyShine: {
    position: "absolute",
    backgroundColor: "rgba(255, 253, 248, 0.28)",
  },
  apron: {
    backgroundColor: colors.teal,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 8,
  },
  pocket: {
    backgroundColor: colors.tealDeep,
    opacity: 0.4,
    marginBottom: 6,
  },
  temper: {
    position: "absolute",
    top: 8,
    left: "18%",
    right: "18%",
    backgroundColor: colors.amber,
    opacity: 0.55,
  },
  arm: {
    position: "absolute",
    alignItems: "center",
    zIndex: 1,
  },
  hand: {
    position: "absolute",
  },
  hammer: {
    position: "absolute",
    alignItems: "center",
    zIndex: 3,
  },
  hammerHead: {
    backgroundColor: colors.inkSoft,
  },
  hammerHaft: {
    backgroundColor: "#6B4634",
  },
  boots: {
    position: "absolute",
    flexDirection: "row",
    zIndex: 1,
  },
  boot: {},
  headWrap: {
    position: "absolute",
    zIndex: 4,
    alignItems: "center",
  },
  hat: {
    position: "absolute",
    backgroundColor: colors.teal,
    zIndex: 5,
    alignItems: "center",
  },
  hatBrim: {
    position: "absolute",
    backgroundColor: colors.tealDeep,
  },
  ear: {
    position: "absolute",
    backgroundColor: skinDeep,
    zIndex: 0,
  },
  head: {
    backgroundColor: skin,
    overflow: "hidden",
  },
  shine: {
    position: "absolute",
    backgroundColor: "rgba(255, 253, 248, 0.5)",
  },
  brows: {
    position: "absolute",
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
  },
  brow: {
    height: 2.5,
    borderRadius: 2,
    backgroundColor: colors.ink,
  },
  browSad: {
    transform: [{ rotate: "16deg" }],
  },
  eyes: {
    position: "absolute",
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
  },
  eyeWhite: {
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(58, 42, 31, 0.08)",
  },
  pupil: {
    backgroundColor: colors.ink,
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  glint: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.white,
    marginTop: 1,
    marginLeft: 1,
  },
  lid: {
    ...StyleSheet.absoluteFill,
    backgroundColor: skin,
  },
  cheeks: {
    position: "absolute",
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
  },
  cheek: {
    backgroundColor: blush,
  },
  mouth: {
    position: "absolute",
    left: "50%",
    borderColor: colors.ink,
    backgroundColor: "transparent",
  },
  mouthGlad: {
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  mouthSad: {
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  hot: {
    borderWidth: 2,
    borderColor: colors.amber,
  },
  spark: {
    position: "absolute",
    backgroundColor: colors.amber,
    transform: [{ rotate: "45deg" }],
    borderRadius: 1,
  },
});
