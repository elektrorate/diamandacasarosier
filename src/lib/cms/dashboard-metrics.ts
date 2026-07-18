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

  const [
    activePages,
    publishedPages,
    activeClasses,
    publishedClasses,
    activeWorkshops,
    publishedWorkshops,
    activeMessages,
    unreadMessages,
  ] = await Promise.all([
    supabase.from("pages").select("id", { count: "exact", head: true }).neq("status", "deleted"),
    supabase.from("pages").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("offerings").select("id", { count: "exact", head: true }).eq("type", "class").neq("status", "deleted"),
    supabase.from("offerings").select("id", { count: "exact", head: true }).eq("type", "class").eq("status", "published"),
    supabase.from("offerings").select("id", { count: "exact", head: true }).eq("type", "workshop").neq("status", "deleted"),
    supabase.from("offerings").select("id", { count: "exact", head: true }).eq("type", "workshop").eq("status", "published"),
    supabase.from("form_submissions").select("id", { count: "exact", head: true }).neq("status", "deleted"),
    supabase.from("form_submissions").select("id", { count: "exact", head: true }).eq("status", "new"),
  ]);

  const results = [
    activePages,
    publishedPages,
    activeClasses,
    publishedClasses,
    activeWorkshops,
    publishedWorkshops,
    activeMessages,
    unreadMessages,
  ];
  const error = results.find((result) => result.error)?.error;
  if (error) throw error;

  return {
    activePages: activePages.count ?? 0,
    publishedPages: publishedPages.count ?? 0,
    activeClasses: activeClasses.count ?? 0,
    publishedClasses: publishedClasses.count ?? 0,
    activeWorkshops: activeWorkshops.count ?? 0,
    publishedWorkshops: publishedWorkshops.count ?? 0,
    activeMessages: activeMessages.count ?? 0,
    unreadMessages: unreadMessages.count ?? 0,
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
