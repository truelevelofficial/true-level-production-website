import fs from "fs";
import path from "path";

const configPath = path.join(process.cwd(), "config", "services-videos.json");

export function getServiceVideoUrls(): Record<string, string> {
  try {
    if (!fs.existsSync(configPath)) return {};
    const raw = fs.readFileSync(configPath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function setServiceVideoUrl(serviceTitle: string, url: string) {
  const data = getServiceVideoUrls();
  if (!url.trim()) {
    delete data[serviceTitle];
  } else {
    data[serviceTitle] = url.trim();
  }
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  fs.writeFileSync(configPath, JSON.stringify(data, null, 2));
}
