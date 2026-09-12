import type { Href } from "expo-router";
import { playForSkill, townLessonById } from "@/curriculum/tens-town";
import type { WorldNode } from "@/curriculum/types";

type Nav = {
  push: (href: Href) => void;
  replace: (href: Href) => void;
};

/** Play is often the only stack entry after a Safari open or complete→retry. Do not `back()`. */
export function leavePlay(router: Pick<Nav, "replace">): void {
  router.replace("/(tabs)");
}

export function openForgeLesson(router: Nav, lessonId: string, mode: "push" | "replace" = "push"): void {
  const go = mode === "replace" ? router.replace.bind(router) : router.push.bind(router);
  const lesson = townLessonById(lessonId);
  const play = lesson ? playForSkill(lesson.skillId) : "forge";
  switch (play) {
    case "heap":
      go({ pathname: "/play/heap", params: { lessonId } });
      return;
    case "bunch":
      go({ pathname: "/play/bunch", params: { lessonId } });
      return;
    case "share":
      go({ pathname: "/play/share", params: { lessonId } });
      return;
    case "slice":
      go({ pathname: "/play/slice", params: { lessonId } });
      return;
    case "weave":
    case "forge":
      go({ pathname: "/play/forge", params: { lessonId } });
      return;
    default: {
      const _exhaustive: never = play;
      return _exhaustive;
    }
  }
}

export function openWorldNode(router: Nav, node: WorldNode, mode: "push" | "replace" = "push"): void {
  const go = mode === "replace" ? router.replace.bind(router) : router.push.bind(router);
  switch (node.kind) {
    case "forge":
      openForgeLesson(router, node.lessonId, mode);
      return;
    case "weave":
      go({ pathname: "/play/weave", params: { puzzleId: node.puzzleId } });
      return;
    case "chest":
      go("/(tabs)/smith");
      return;
    default: {
      const _exhaustive: never = node;
      return _exhaustive;
    }
  }
}
