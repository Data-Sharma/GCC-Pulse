"use client";

import { useMemo, useState } from "react";
import { BarChart3, Check, MapPin, RotateCcw } from "lucide-react";
import { DemoBadge } from "@/components/demo-badge";
import type { DemoMetric } from "@/lib/mock-data";
import { demoSignals } from "@/lib/mock-data";

type Metric = {
  id: string;
  city: string;
  metric_name: string;
  metric_value: number | null;
  unit: string | null;
  definition: string;
  period_label: string | null;
  sector_mix?: DemoMetric["sector_mix"];
  activity?: DemoMetric["activity"];
};

export function CityWorkspace({ cities }: { cities: Metric[] }) {
  const [selected, setSelected] = useState<string[]>(["Bengaluru", "Hyderabad", "Pune"]);
  const [measure, setMeasure] = useState<"profiles" | "signals">("profiles");
  const activeCities = useMemo(() => cities.filter((city) => selected.includes(city.city)), [cities, selected]);
  const maximum = Math.max(1, ...activeCities.map((city) => valueFor(city.city)));

  function valueFor(cityName: string) {
    if (measure === "profiles") return cities.find((city) => city.city === cityName)?.metric_value ?? 0;
    return demoSignals.filter((signal) => signal.city === cityName).length;
  }

  function toggleCity(cityName: string) {
    setSelected((current) => {
      if (current.includes(cityName)) return current.length > 2 ? current.filter((city) => city !== cityName) : current;
      return current.length < 4 ? [...current, cityName] : [...current.slice(1), cityName];
    });
  }

  return (
    <div className="city-workspace">
      <section className="surface city-selector">
        <div className="workspace-card-heading"><div><p className="eyebrow">Market comparison</p><h2>Select cities to compare</h2></div><DemoBadge /></div>
        <p className="muted">Choose 2–4 cities. These are counts from the fictional sample dataset, not market rankings.</p>
        <div className="city-pills">{cities.map((city) => <button key={city.id} className={`city-pill ${selected.includes(city.city) ? "is-selected" : ""}`} aria-pressed={selected.includes(city.city)} onClick={() => toggleCity(city.city)}><span className="city-pill-check">{selected.includes(city.city) && <Check size={12} />}</span>{city.city}</button>)}</div>
        <div className="city-selection-actions"><span>{selected.length < 2 ? "Select at least two cities to compare." : `${selected.length} of 4 cities selected.`}</span><button className="text-action" onClick={() => setSelected([])}>Clear selection</button><button className="text-action" onClick={() => setSelected(cities.slice(0, 3).map((city) => city.city))}><RotateCcw size={14} />Reset</button></div>
      </section>

      <section className="surface comparison-card">
        <div className="workspace-card-heading"><div><p className="eyebrow">Illustrative comparison</p><h2>Sample ecosystem snapshot</h2></div><label className="filter-control measure-control"><span>Compare</span><select aria-label="Comparison metric" value={measure} onChange={(event) => setMeasure(event.target.value as typeof measure)}><option value="profiles">Sample profiles</option><option value="signals">Demo signals</option></select></label></div>
        <div className="comparison-chart" role="img" aria-label={`${measure === "profiles" ? "Sample profile" : "Demo signal"} comparison for selected cities`}>
          {activeCities.length < 2 ? <p className="comparison-empty">Select two or more cities to display the comparison.</p> : activeCities.map((city) => {
            const value = valueFor(city.city);
            return <div className="comparison-row" key={city.id}><div className="comparison-row-label"><MapPin size={15} /><span>{city.city}</span><strong>{value}</strong></div><div className="comparison-track"><span style={{ width: `${Math.max(5, value / maximum * 100)}%` }} /></div><p>{measure === "profiles" ? city.definition : "Count of synthetic example signals linked to this city."}</p></div>;
          })}
        </div>
      </section>

      <section className="city-insight-grid">
        {activeCities.map((city) => (
          <article className="surface city-insight-card" key={city.id}>
            <div className="city-card-title"><div className="city-icon"><MapPin size={18} /></div><div><h3>{city.city}</h3><span>Illustrative sample</span></div><span className="city-count">{valueFor(city.city)}</span></div>
            <div className="city-sector-list"><p>Example profile distribution</p>{(city.sector_mix ?? [{ sector: "Sample records", value: city.metric_value ?? 0 }]).map((sector) => <div className="city-sector-row" key={sector.sector}><span>{sector.sector}</span><span className="city-sector-track"><i style={{ width: `${Math.min(100, sector.value / Math.max(1, city.metric_value ?? 0) * 100)}%` }} /></span><b>{sector.value}</b></div>)}</div>
            {city.activity?.length ? <div className="city-mini-activity"><p>Illustrative activity · quarterly</p><div>{city.activity.map((period) => <span key={period.period} title={`${period.period}: ${period.value} sample records`}><i style={{ height: `${Math.max(14, period.value / Math.max(1, ...city.activity!.map((item) => item.value)) * 100)}%` }} />{period.period}</span>)}</div></div> : null}
            <p className="city-period"><BarChart3 size={14} />{city.period_label || "Illustrative period"} · Metrics not independently verified</p>
            <p className="city-source-coverage"><span /> Source coverage: sample-only · No external citation attached</p>
          </article>
        ))}
      </section>
    </div>
  );
}
