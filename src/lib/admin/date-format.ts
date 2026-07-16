const ADMIN_LOCALE = "es-ES";
const ADMIN_TIME_ZONE = "Europe/Madrid";

const adminDateFormatter = new Intl.DateTimeFormat(ADMIN_LOCALE, {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: ADMIN_TIME_ZONE,
});

const adminDateTimeFormatter = new Intl.DateTimeFormat(ADMIN_LOCALE, {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: ADMIN_TIME_ZONE,
});

const adminShortDateFormatter = new Intl.DateTimeFormat(ADMIN_LOCALE, {
  day: "2-digit",
  month: "short",
  timeZone: ADMIN_TIME_ZONE,
});

function toValidDate(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatAdminDate(value: string | Date | null | undefined, fallback = "—") {
  if (!value) return fallback;
  const date = toValidDate(value);
  return date ? adminDateFormatter.format(date) : fallback;
}

export function formatAdminDateTime(value: string | Date | null | undefined, fallback = "—") {
  if (!value) return fallback;
  const date = toValidDate(value);
  return date ? adminDateTimeFormatter.format(date) : fallback;
}

export function formatAdminShortDate(value: string | Date | null | undefined, fallback = "—") {
  if (!value) return fallback;
  const date = toValidDate(value);
  return date ? adminShortDateFormatter.format(date) : fallback;
}
