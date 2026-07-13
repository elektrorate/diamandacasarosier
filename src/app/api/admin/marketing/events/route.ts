import { requireAdminApi } from "@/lib/auth/supabase-auth";
import { getEventTypes, getMarketingSettings, updateEventType, updateMarketingSettings } from "@/lib/cms/marketing";
import { MARKETING_EVENTS, type MarketingEvent } from "@/lib/cms/types";
import { type NextRequest, NextResponse } from "next/server";

function isMarketingEvent(value: string): value is MarketingEvent {
  return (MARKETING_EVENTS as readonly string[]).includes(value);
}

export async function GET() {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const events = await getEventTypes();
  return NextResponse.json(events);
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export async function PUT(request: NextRequest) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    if (typeof body.id !== "string" || typeof body.is_active !== "boolean") {
      return NextResponse.json({ error: "Evento o estado inválido." }, { status: 400 });
    }

    const updated = await updateEventType(body.id, { is_active: body.is_active });
    if (isMarketingEvent(updated.name)) {
      const settings = await getMarketingSettings();
      const nextEvents = body.is_active
        ? Array.from(new Set<MarketingEvent>([...settings.events, updated.name]))
        : settings.events.filter((eventName) => eventName !== updated.name);
      await updateMarketingSettings({ events: nextEvents });
    }

    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
