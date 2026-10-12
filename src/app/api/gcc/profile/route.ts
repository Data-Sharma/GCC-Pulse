import { NextResponse } from "next/server";
import { getAuthenticatedGccUser } from "@/lib/gcc/auth";
import { RequirementsSchema } from "@/lib/reporting/requirements";

const companyFields = [
  "organizationName",
  "organizationType",
  "industry",
  "businessModel",
  "website",
  "contactName",
  "contactRole",
  "contactEmail",
  "operatingCountries",
  "indiaPresence",
  "existingIndiaLocations",
  "companySize",
  "indiaHeadcount",
  "currentFunctions",
] as const;

export async function GET() {
  const { supabase, user } = await getAuthenticatedGccUser();
  if (!supabase) return NextResponse.json({ error: "GCC workspace authentication is not configured on the server." }, { status: 503 });
  if (!user) return NextResponse.json({ error: "Sign in to access your saved profile." }, { status: 401 });

  const { data, error } = await supabase.from("gcc_profiles")
    .select("id,company_name,profile,requirements,created_at,updated_at")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) {
    console.error("GCC profile read failed.", error.message);
    return NextResponse.json({ error: "Could not load the saved profile. Check that the GCC profile migration has been applied." }, { status: 500 });
  }
  if (!data) return NextResponse.json({ profile: null });
  return NextResponse.json({ profile: data });
}

export async function PUT(request: Request) {
  const { supabase, user } = await getAuthenticatedGccUser();
  if (!supabase) return NextResponse.json({ error: "GCC workspace authentication is not configured on the server." }, { status: 503 });
  if (!user) return NextResponse.json({ error: "Sign in to save your profile." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = RequirementsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Profile data is invalid.", details: parsed.error.flatten() }, { status: 400 });
  }

  const profile = Object.fromEntries(companyFields.map((field) => [field, parsed.data[field]]));
  const { data, error } = await supabase.from("gcc_profiles").upsert({
    user_id: user.id,
    company_name: parsed.data.organizationName,
    profile,
    requirements: parsed.data,
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id" })
    .select("id,company_name,profile,requirements,created_at,updated_at")
    .single();

  if (error || !data) {
    console.error("GCC profile save failed.", error?.message);
    return NextResponse.json({ error: "Could not save the profile. Confirm the GCC profile migration is applied and try again." }, { status: 500 });
  }
  return NextResponse.json({ profile: data }, { status: 200 });
}
