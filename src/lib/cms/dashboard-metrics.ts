import { createAdminClient } from "../supabase/admin";
import { getFormSubmissions } from "./form-submissions";
import { getOfferings } from "./offerings";
import { getPages } from "./pages";

export type DashboardMetrics = {
  activePages: number;
  publishedPages: number;
  activeClasses: number;
  publishedClasses: number;
  activeWorkshops: number;
  publishedWorkshops: number;
  activeMessages: number;
  unreadMessages: number;
};

function emptyMetrics(): DashboardMetrics {
  return {
    activePages: 0,
    publishedPages: 0,
    activeClasses: 0,
    publishedClasses: 0,
    activeWorkshops: 0,
    publishedWorkshops: 0,
    activeMessages: 0,
    unreadMessages: 0,
  };
}

async function getMetricsFromSupabase(): Promise<DashboardMetrics> {
  const supabase = createAdminClient();

  const [pages, offerings, messages] = await Promise.all([
    supabase.from("pages").select("status"),
    supabase.from("offerings").select("type,status").in("type", ["class", "workshop"]),
    supabase.from("form_submissions").select("status"),
  ]);

  const error = pages.error ?? offerings.error ?? messages.error;
  if (error) throw error;

  const activePages = (pages.data ?? []).filter((page) => page.status !== "deleted");
  const classes = (offerings.data ?? []).filter((offering) => offering.type === "class" && offering.status !== "deleted");
  const workshops = (offerings.data ?? []).filter((offering) => offering.type === "workshop" && offering.status !== "deleted");
  const activeMessages = (messages.data ?? []).filter((message) => message.status !== "deleted");

  return {
    activePages: activePages.length,
    publishedPages: activePages.filter((page) => page.status === "published").length,
    activeClasses: classes.length,
    publishedClasses: classes.filter((offering) => offering.status === "published").length,
    activeWorkshops: workshops.length,
    publishedWorkshops: workshops.filter((offering) => offering.status === "published").length,
    activeMessages: activeMessages.length,
    unreadMessages: activeMessages.filter((message) => message.status === "new").length,
  };
}

async function getMetricsFromFallback(): Promise<DashboardMetrics> {
  const metrics = emptyMetrics();
  const [offerings, pages, messages] = await Promise.all([
    getOfferings(),
    getPages(),
    getFormSubmissions(),
  ]);

  const activePages = pages.filter((page) => page.status !== "deleted");
  const classes = offerings.filter((offering) => offering.type === "class" && offering.status !== "deleted");
  const workshops = offerings.filter((offering) => offering.type === "workshop" && offering.status !== "deleted");
  const activeMessages = messages.filter((message) => message.status !== "deleted");

  metrics.activePages = activePages.length;
  metrics.publishedPages = activePages.filter((page) => page.status === "published").length;
  metrics.activeClasses = classes.length;
  metrics.publishedClasses = classes.filter((offering) => offering.status === "published").length;
  metrics.activeWorkshops = workshops.length;
  metrics.publishedWorkshops = workshops.filter((offering) => offering.status === "published").length;
  metrics.activeMessages = activeMessages.length;
  metrics.unreadMessages = activeMessages.filter((message) => message.status === "new").length;

  return metrics;
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  try {
    return await getMetricsFromSupabase();
  } catch {
    return getMetricsFromFallback();
  }
}
