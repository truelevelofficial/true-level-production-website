import { getPrisma } from "./prisma";

export async function getServiceVideoUrls(): Promise<Record<string, string>> {
  try {
    const prisma = getPrisma();
    if (!prisma) return {};
    const rows = await prisma.companySettings.findMany({
      where: { key: { startsWith: "service_video_" } },
    });
    const result: Record<string, string> = {};
    for (const row of rows) {
      const title = row.key.replace("service_video_", "");
      if (row.value) result[title] = row.value;
    }
    return result;
  } catch {
    return {};
  }
}

export async function setServiceVideoUrl(title: string, url: string) {
  const prisma = getPrisma();
  if (!prisma) return;
  const key = `service_video_${title}`;
  try {
    if (!url.trim()) {
      await prisma.companySettings.deleteMany({ where: { key } });
    } else {
      await prisma.companySettings.upsert({
        where: { key },
        update: { value: url.trim() },
        create: { key, value: url.trim() },
      });
    }
  } catch { /* silent */ }
}
