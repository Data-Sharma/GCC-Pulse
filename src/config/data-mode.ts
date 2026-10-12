export type DataMode = "demo" | "live";

export const dataMode: DataMode =
  process.env.NEXT_PUBLIC_GCC_PULSE_DATA_MODE === "live" ? "live" : "demo";

export const isDemoMode = dataMode === "demo";
