import { recordMarketingEvent } from "@/lib/cms/marketing";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body?.eventName) {
      return NextResponse.json({ error: "eventName es obligatorio." }, { status: 400 });
    }

    const userAgent = request.headers.get("user-agent") ?? "";
    const result = await recordMarketingEvent({
      eventName: body.eventName,
      pageUrl: body.pageUrl,
      pageTitle: body.pageTitle,
      contentType: body.contentType,
      contentId: body.contentId,
      campaignId: body.campaignId,
      source: body.source,
      medium: body.medium,
      device: body.device || userAgent,
      country: body.country,
      city: body.city,
      metadata: body.metadata,
    });

    return NextResponse.json({ ok: Boolean(result), event: result });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "No se pudo registrar el evento." }, { status: 500 });
  }
}
