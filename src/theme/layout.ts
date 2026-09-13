import { useWindowDimensions } from "react-native";
import { layoutFromSize, type AppLayout } from "@/theme/layout-core";

export {
  COMPACT_WIDTH,
  FOLD_GUTTER,
  layoutFromSize,
  type AppLayout,
} from "@/theme/layout-core";

export function useAppLayout(): AppLayout {
  const { width, height } = useWindowDimensions();
  return layoutFromSize(width, height);
}
