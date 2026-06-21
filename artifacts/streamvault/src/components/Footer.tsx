import { useI18n } from "@/lib/i18n";
import { ExternalLink } from "lucide-react";

const SOCIALS = [
  { key: "discord" as const, href: "https://discord.gg/sarad", color: "hover:text-indigo-400" },
  { key: "instagram" as const, href: "https://instagram.com/sarad.app", color: "hover:text-pink-400" },
  { key: "telegram" as const, href: "https://t.me/sarad_app", color: "hover:text-sky-400" },
];

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="mt-auto border-t border-border/40 py-5 px-4 md:px-8 bg-[#0a0a0b]/80">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-muted-foreground/70">
          © 2025{" "}
          <span className="text-primary font-bold tracking-wide">سراد Sarad</span>
          {" "}— All rights reserved.
        </div>
        <div className="flex items-center gap-5">
          <span className="text-xs text-muted-foreground/60">{t("followUs")}:</span>
          {SOCIALS.map(({ key, href, color }) => (
            <a key={key} href={href} target="_blank" rel="noopener noreferrer"
              data-testid={`social-${key}`}
              className={`flex items-center gap-1 text-xs text-muted-foreground/70 transition-colors duration-200 ${color}`}>
              {t(key)}
              <ExternalLink className="w-3 h-3 opacity-50" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}