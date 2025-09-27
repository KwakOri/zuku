// Design Tokens Export
import { colors } from "./colors";
import { spacing } from "./spacing";
import { typography } from "./typography";

export { colors, type ColorKeys, type ColorVariant } from "./colors";
export { spacing, type SpacingKeys } from "./spacing";
export { typography, type FontSize, type FontWeight } from "./typography";

// Theme object
export const theme = {
  colors,
  typography,
  spacing,
} as const;
