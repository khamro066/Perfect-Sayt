export const COLOR_NAMES: Record<string, string> = {
  "#1b1a16": "Qora",
  "#f4f1ea": "Oq",
  "#8a8880": "Kulrang",
  "#6b4a2f": "Jigarrang",
  "#2c4a7a": "Ko'k",
  "#0a5c3a": "Yashil",
  "#a83232": "Qizil",
  "#d8c7a8": "Bej",
};

export function colorName(hex: string): string {
  return COLOR_NAMES[hex] ?? hex;
}

export const ALL_COLORS = Object.keys(COLOR_NAMES);
