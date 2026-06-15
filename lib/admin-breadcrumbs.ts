const segmentLabels: Record<string, string> = {
  dashboard: "Dashboard", workflow: "Workflow", "team-center": "Team Center",
  studio: "Studio", content: "Content", approvals: "Approvals",
  clients: "Clients", meetings: "Meetings", quotations: "Quotations",
  contracts: "Contracts", accounting: "Accounting", reporting: "Reporting",
  automation: "Automation", settings: "Settings", notifications: "Notifications",
};

export function getAdminBreadcrumbs(path: string) {
  const segments = path.replace("/admin", "").split("/").filter(Boolean);
  const crumbs: { label: string; href: string }[] = [{ label: "Dashboard", href: "/admin/dashboard" }];
  let accumulated = "/admin";
  for (const seg of segments) {
    accumulated += "/" + seg;
    const label = segmentLabels[seg] || seg.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    if (accumulated !== "/admin/dashboard") crumbs.push({ label, href: accumulated });
  }
  return crumbs;
}
