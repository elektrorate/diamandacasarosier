import { requireAdminApi } from "@/lib/auth/supabase-auth";
import { getCampaigns, createCampaign, generateCampaignUrl } from "@/lib/cms/marketing";
import { type NextRequest, NextResponse } from "next/server";

export async function GET() {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const campaigns = await getCampaigns();
  return NextResponse.json(campaigns);
}

export async function POST(request: NextRequest) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const generatedUrl = generateCampaignUrl(body.destination_url, body.utm_source, body.utm_medium, body.utm_campaign, body.utm_content, body.utm_term);
    const campaign = await createCampaign({ ...body, generated_url: generatedUrl });
    return NextResponse.json(campaign, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
