import type { DemoMetric, DemoSource } from "./types";

const source: DemoSource = {
  id: "demo-city-source",
  title: "Illustrative sample metric — no external citation",
  url: null,
  publisher: "GCC Pulse demo dataset",
  published_at: null,
  retrieved_at: "2026-10-01T00:00:00.000Z",
};

const cities: [string, number, [number, number, number, number]][] = [
  ["Bengaluru", 8, [4, 6, 7, 8]],
  ["Hyderabad", 6, [3, 4, 5, 6]],
  ["Pune", 5, [2, 3, 4, 5]],
  ["Chennai", 4, [2, 2, 3, 4]],
  ["Mumbai", 4, [3, 3, 4, 4]],
  ["Delhi NCR", 3, [2, 2, 3, 3]],
  ["Gurugram", 4, [1, 2, 3, 4]],
];

export const demoCities: DemoMetric[] = cities.map(([city, records, activity], index) => ({
  id: `demo-city-${city.toLowerCase().replaceAll(" ", "-")}`,
  city,
  metric_name: "Sample company profiles",
  metric_value: records,
  unit: "illustrative records",
  definition: "Count of fictional company profiles in this demo dataset associated with the city.",
  period_label: "Demo dataset, Oct 2026",
  sources: [{ ...source, id: `demo-city-source-${index + 1}` }],
  sector_mix: [
    { sector: "Enterprise technology", value: Math.max(1, records - 4) },
    { sector: "Financial services", value: Math.max(1, Math.round(records * 0.35)) },
    { sector: "Healthcare & life sciences", value: Math.max(1, Math.round(records * 0.25)) },
  ],
  activity: activity.map((value, periodIndex) => ({
    period: ["Q1", "Q2", "Q3", "Q4"][periodIndex],
    value,
  })),
}));
