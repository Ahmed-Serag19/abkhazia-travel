import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";

const NAV = [
  { href: "/stay", key: "stay" },
  { href: "/village", key: "village" },
  { href: "/cars", key: "cars" },
  { href: "/rent", key: "rent" },
  { href: "/explore", key: "explore" },
] as const;

export function Footer() {
  const t = useTranslations();

  return (
    <footer className="mt-24 border-t border-ink/10 bg-cream-dim">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-2">
          <span className="block font-serif text-2xl italic text-ink">
            {t("brand.name")}
          </span>
          <span className="label-caps mt-1 block text-ink-faint">
            {t("brand.kicker")}
          </span>
          <p className="mt-4 max-w-sm text-[0.95rem] leading-relaxed text-ink-soft">
            {t("footer.tagline")}
          </p>
        </div>

        <div>
          <p className="label-caps text-ink-faint">
            {t("footer.sections.explore")}
          </p>
          <ul className="mt-4 space-y-2.5">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-[0.95rem] text-ink-soft transition-colors hover:text-ink"
                >
                  {t(`nav.${item.key}`)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="label-caps text-ink-faint">{t("footer.contact")}</p>
          <ul className="mt-4 space-y-2.5 text-[0.95rem] text-ink-soft">
            <li>
              <a
                href="mailto:hello@casacolina.example"
                className="transition-colors hover:text-ink"
              >
                hello@casacolina.example
              </a>
            </li>
            <li>
              <a
                href="https://wa.me/00000000000"
                className="transition-colors hover:text-ink"
              >
                WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-ink/10">
        <Container className="flex flex-col gap-2 py-5 text-[0.8rem] text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {new Date().getFullYear()} {t("brand.name")}. {t("footer.rights")}.
          </span>
          <span className="label-caps">{t("footer.madeIn")}</span>
        </Container>
      </div>
    </footer>
  );
}
