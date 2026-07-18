import type { Form, FormSubmission } from "@/lib/cms/types";

export type FormNotificationStatus =
  | "disabled"
  | "missing_recipient"
  | "missing_api_key"
  | "sent"
  | "failed";

export type FormNotificationResult = {
  status: FormNotificationStatus;
  provider: "resend";
  attempted_at: string;
  to?: string;
  from?: string;
  message_id?: string;
  error?: string;
};

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function dataEntries(submission: FormSubmission) {
  const hiddenKeys = new Set(["__notification", "name", "email", "phone", "subject", "message", "source_page"]);
  return Object.entries(submission.data ?? {}).filter(([key]) => !hiddenKeys.has(key));
}

function buildText(form: Form, submission: FormSubmission) {
  const lines = [
    `Nuevo mensaje recibido desde ${form.name}`,
    "",
    `Nombre: ${submission.name || "-"}`,
    `Email: ${submission.email || "-"}`,
    `Telefono: ${submission.phone || "-"}`,
    `Asunto: ${submission.subject || "-"}`,
    `Origen: ${submission.source_page || "-"}`,
    "",
    "Mensaje:",
    submission.message || "-",
  ];

  const extra = dataEntries(submission);
  if (extra.length > 0) {
    lines.push("", "Datos adicionales:");
    for (const [key, value] of extra) {
      lines.push(`${key}: ${Array.isArray(value) ? value.join(", ") : String(value ?? "")}`);
    }
  }

  return lines.join("\n");
}

function buildHtml(form: Form, submission: FormSubmission) {
  const rows = [
    ["Formulario", form.name],
    ["Nombre", submission.name],
    ["Email", submission.email],
    ["Telefono", submission.phone],
    ["Asunto", submission.subject],
    ["Origen", submission.source_page],
  ];
  const extraRows = dataEntries(submission).map(([key, value]) => [
    key,
    Array.isArray(value) ? value.join(", ") : String(value ?? ""),
  ]);

  return `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#1d1a24">
      <h2 style="margin:0 0 16px">Nuevo mensaje desde ${escapeHtml(form.name)}</h2>
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
        ${rows.map(([label, value]) => `
          <tr>
            <td style="padding:8px;border-bottom:1px solid #eee;font-weight:700;width:140px">${escapeHtml(label)}</td>
            <td style="padding:8px;border-bottom:1px solid #eee">${escapeHtml(value || "-")}</td>
          </tr>
        `).join("")}
      </table>
      <h3 style="margin:0 0 8px">Mensaje</h3>
      <div style="white-space:pre-wrap;padding:14px;background:#f7f5fb;border:1px solid #e6e0ee;border-radius:8px">${escapeHtml(submission.message || "-")}</div>
      ${extraRows.length > 0 ? `
        <h3 style="margin:20px 0 8px">Datos adicionales</h3>
        <table style="width:100%;border-collapse:collapse">
          ${extraRows.map(([label, value]) => `
            <tr>
              <td style="padding:8px;border-bottom:1px solid #eee;font-weight:700;width:140px">${escapeHtml(label)}</td>
              <td style="padding:8px;border-bottom:1px solid #eee">${escapeHtml(value || "-")}</td>
            </tr>
          `).join("")}
        </table>
      ` : ""}
    </div>
  `;
}

export async function sendFormNotificationEmail(
  form: Form,
  submission: FormSubmission,
): Promise<FormNotificationResult> {
  const attemptedAt = new Date().toISOString();

  if (!form.email_notification_enabled) {
    return { status: "disabled", provider: "resend", attempted_at: attemptedAt };
  }

  const to = form.notification_email || process.env.FORM_NOTIFICATION_EMAIL || process.env.LOCAL_ADMIN_EMAIL || "";
  if (!to.trim()) {
    return { status: "missing_recipient", provider: "resend", attempted_at: attemptedAt };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { status: "missing_api_key", provider: "resend", attempted_at: attemptedAt, to };
  }

  const from = process.env.FORM_NOTIFICATION_FROM || "Casa Rosier <onboarding@resend.dev>";
  const subject = `Nuevo mensaje: ${submission.subject || form.name}`;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `form-submission-${submission.id}`,
        "User-Agent": "casa-rosier-cms/1.0",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html: buildHtml(form, submission),
        text: buildText(form, submission),
        reply_to: submission.email || undefined,
      }),
    });

    const payload = await response.json().catch(() => ({})) as { id?: string; message?: string; error?: { message?: string } };
    if (!response.ok) {
      return {
        status: "failed",
        provider: "resend",
        attempted_at: attemptedAt,
        to,
        from,
        error: payload.error?.message || payload.message || `Resend respondio ${response.status}`,
      };
    }

    return {
      status: "sent",
      provider: "resend",
      attempted_at: attemptedAt,
      to,
      from,
      message_id: payload.id,
    };
  } catch (error) {
    return {
      status: "failed",
      provider: "resend",
      attempted_at: attemptedAt,
      to,
      from,
      error: error instanceof Error ? error.message : "No se pudo enviar el email.",
    };
  }
}