import { NextResponse, type NextRequest } from "next/server";
import { getFormBySlug } from "@/lib/cms/forms";
import { createFormSubmission, updateFormSubmission } from "@/lib/cms/form-submissions";
import type { Form, FormField } from "@/lib/cms/types";
import { sendFormNotificationEmail } from "@/lib/email/form-notifications";

type SubmittedData = Record<string, unknown>;

function isRecord(value: unknown): value is SubmittedData {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function valueFrom(data: SubmittedData, field: FormField) {
  const raw = data[field.name] ?? data[field.label] ?? field.default_value;
  if (raw === undefined || raw === null) return "";
  return raw;
}

function stringValue(value: unknown) {
  if (Array.isArray(value)) return value.join(", ").trim();
  return String(value ?? "").trim();
}

function hasValue(value: unknown) {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "boolean") return value;
  return stringValue(value).length > 0;
}

function validateFormData(form: Form, data: SubmittedData) {
  const errors: string[] = [];
  const normalized: SubmittedData = { ...data };

  for (const field of form.fields) {
    if (!field.is_visible && field.type !== "hidden") continue;
    const value = valueFrom(data, field);
    normalized[field.name] = value;

    if (field.required && !hasValue(value)) {
      errors.push(`${field.label || field.name} es obligatorio.`);
      continue;
    }

    if (!hasValue(value)) continue;
    const text = stringValue(value);

    if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
      errors.push(`${field.label || field.name} debe ser un email valido.`);
    }

    if (field.type === "number" && Number.isNaN(Number(text))) {
      errors.push(`${field.label || field.name} debe ser un numero.`);
    }

    if (field.type === "date" && Number.isNaN(Date.parse(text))) {
      errors.push(`${field.label || field.name} debe ser una fecha valida.`);
    }

    if ((field.type === "select" || field.type === "radio") && field.options.length > 0 && !field.options.includes(text)) {
      errors.push(`${field.label || field.name} tiene una opcion no valida.`);
    }

    if (field.type === "checkbox" && field.options.length > 0) {
      const values = Array.isArray(value) ? value.map(String) : [text];
      const invalid = values.some((item) => item && !field.options.includes(item));
      if (invalid) errors.push(`${field.label || field.name} tiene una opcion no valida.`);
    }
  }

  if (!stringValue(normalized.name) && !stringValue(data.nombre)) {
    errors.push("Nombre es obligatorio.");
  }

  if (!stringValue(normalized.email)) {
    errors.push("Email es obligatorio.");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(stringValue(normalized.email))) {
    errors.push("Email debe ser valido.");
  }

  return { errors, data: normalized };
}

function firstByType(form: Form, data: SubmittedData, type: FormField["type"]) {
  const field = form.fields.find((item) => item.type === type && hasValue(data[item.name]));
  return field ? stringValue(data[field.name]) : "";
}

function submissionName(form: Form, data: SubmittedData) {
  return stringValue(data.name) || stringValue(data.nombre) || firstByType(form, data, "text");
}

function submissionEmail(form: Form, data: SubmittedData) {
  return stringValue(data.email) || firstByType(form, data, "email");
}

function submissionPhone(form: Form, data: SubmittedData) {
  return stringValue(data.phone) || stringValue(data.telefono) || stringValue(data.whatsapp) || firstByType(form, data, "phone");
}

function submissionMessage(form: Form, data: SubmittedData) {
  return stringValue(data.message) || stringValue(data.mensaje) || firstByType(form, data, "textarea");
}

export async function POST(request: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const form = await getFormBySlug((await ctx.params).slug);
  if (!form || form.status !== "active") {
    return NextResponse.json({ error: "Formulario no encontrado o inactivo." }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  if (!isRecord(body)) {
    return NextResponse.json({ error: "Solicitud no valida." }, { status: 400 });
  }

  if (stringValue(body.website || body.company_url)) {
    return NextResponse.json({ ok: true, message: form.success_message || "Mensaje enviado correctamente." });
  }

  const baseData = isRecord(body.data) ? { ...body.data, ...body } : { ...body };
  delete baseData.data;

  const validation = validateFormData(form, baseData);
  if (validation.errors.length > 0) {
    return NextResponse.json({ error: validation.errors[0], errors: validation.errors }, { status: 400 });
  }

  const data = validation.data;
  const submission = await createFormSubmission({
    form_id: form.id,
    form_slug: form.slug,
    form_name: form.name,
    name: submissionName(form, data),
    email: submissionEmail(form, data),
    phone: submissionPhone(form, data),
    subject: stringValue(data.subject) || stringValue(data.asunto) || form.title || form.name,
    message: submissionMessage(form, data),
    data: {
      ...data,
      source_page: stringValue(data.source_page),
    },
    source_page: stringValue(data.source_page),
    status: "new",
  });

  const notification = await sendFormNotificationEmail(form, submission);
  await updateFormSubmission(submission.id, {
    ...submission,
    notification_status: notification.status,
    notification_provider: notification.provider,
    notification_to: notification.to ?? "",
    notification_from: notification.from ?? "",
    notification_message_id: notification.message_id ?? "",
    notification_error: notification.error ?? "",
    notification_attempted_at: notification.attempted_at,
  });

  return NextResponse.json({
    ok: true,
    message: form.success_message || "Mensaje enviado correctamente.",
    redirect_url: form.redirect_url || "",
    submission_id: submission.id,
    notification_status: notification.status,
  });
}