import "server-only";
import { isDemoMode } from "@/config/data-mode";
import {
  demoCities,
  demoCompanies,
  demoProviders,
  demoSignals,
  demoClaims,
} from "@/lib/mock-data";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function loadCompanies(query = "") {
  if (isDemoMode) {
    const needle = query.trim().toLocaleLowerCase();
    return demoCompanies
      .filter((company) => !needle || company.name.toLocaleLowerCase().includes(needle));
  }

  const db = await getSupabaseServer();
  let q = db.from("companies").select("id,name,parent_company,industry,website,description,created_at,gcc_locations(id,city),evidence_claims(review_status)").order("name").limit(100);
  if (query.trim()) q = q.ilike("name", `%${query.trim().replace(/[%_]/g, "")}%`);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function loadCompany(id: string) {
  if (isDemoMode) {
    return demoCompanies.find((company) => company.id === id) ?? null;
  }

  const db = await getSupabaseServer();
  const { data, error } = await db.from("companies")
    .select("id,name,parent_company,industry,website,description,created_at,gcc_locations(id,city,state,address,function_areas,status),evidence_claims(id,claim_type,claim_text,evidence_quote,confidence,review_status,uncertainty,created_at,sources(id,title,url,publisher,published_at,retrieved_at))")
    .eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function loadMetrics() {
  if (isDemoMode) return demoCities;

  const db = await getSupabaseServer();
  const { data, error } = await db.from("city_metrics")
    .select("id,city,metric_name,metric_value,unit,definition,period_label,sources(title,url,publisher,published_at)")
    .order("city").limit(200);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function loadProviders() {
  if (isDemoMode) return demoProviders;

  const db = await getSupabaseServer();
  const { data, error } = await db.from("providers")
    .select("id,name,category,website,description,evidence_note").order("name").limit(200);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function loadSignals() {
  if (isDemoMode) return demoSignals;

  const db = await getSupabaseServer();
  const { data, error } = await db.from("expansion_signals")
    .select("id,city,signal_type,summary,signal_status,event_date,created_at,companies(name),sources(title,url,publisher,published_at)")
    .order("created_at", { ascending: false }).limit(100);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function loadPendingClaims() {
  if (isDemoMode) return demoClaims;

  const db = await getSupabaseServer();
  const { data, error } = await db.from("evidence_claims")
    .select("id,claim_text,claim_type,evidence_quote,uncertainty,review_status,created_at,companies(name),sources(title,url,publisher,published_at)")
    .eq("review_status", "pending").order("created_at", { ascending: false }).limit(100);
  if (error) throw new Error(error.message);
  return data ?? [];
}
