import UAParser from "ua-parser-js";
import { Laptop, LucideIcon, Smartphone } from "lucide-react";
import { format, formatDistanceToNow, isPast } from "date-fns";

interface AgentType {
  deviceType: string;
  browser: string;
  os: string;
  timeAgo: string;
  icon: LucideIcon;
}

export const parseUserAgent = (
  userAgent: string,
  createdAt: string
): AgentType => {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  const deviceType = result.device.type || "Desktop";
  const browser = result.browser.name || "Web";
  const os = `${result.os.name} ${result.os.version}` || "";

  const icon = deviceType === "mobile" ? Smartphone : Laptop;

  const formatedAt = isPast(new Date(createdAt))
    ? `${formatDistanceToNow(new Date(createdAt))} ago`
    : format(new Date(createdAt), "dd/MM/yyyy");

  return {
    deviceType,
    browser,
    os,
    timeAgo: formatedAt,
    icon,
  };
};
