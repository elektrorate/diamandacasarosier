import { requireAdminApi } from "@/lib/auth/supabase-auth";
import { getCampaignById, updateCampaign, deleteCampaign, generateCampaignUrl } from "@/lib/cms/marketing";
import { type NextRequest, NextResponse } from "next/server";

type CampaignRouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: CampaignRouteContext) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const campaign = await getCampaignById(id);
  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(campaign);
}

export async function PUT(request: NextRequest, { params }: CampaignRouteContext) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const body = await request.json();
    if (body.destination_url && body.utm_source && body.utm_medium && body.utm_campaign) {
      body.generated_url = generateCampaignUrl(body.destination_url, body.utm_source, body.utm_medium, body.utm_campaign, body.utm_content, body.utm_term);
    }
    const campaign = await updateCampaign(id, body);
    return NextResponse.json(campaign);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest, { params }: CampaignRouteContext) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await request.json();
  const statusMap: Record<string, string> = { archive: "archived", activate: "active", pause: "paused" };
  const status = statusMap[body.action] || body.action;
  try {
    const campaign = await updateCampaign(id, { status } as Partial<import("@/lib/cms/types").MarketingCampaign>);
    return NextResponse.json(campaign);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, { params }: CampaignRouteContext) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    await deleteCampaign(id);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
