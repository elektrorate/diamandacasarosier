import type { ReactNode } from "react";
import { BodyClass } from "@/components/layout/BodyClass";
import { Footer } from "@/components/layout/Footer";

interface SitePageProps {
  bodyClass: string;
  bodyData?: Record<string, string>;
  beforeHeader?: ReactNode;
  header: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

export function SitePage({
  bodyClass,
  bodyData,
  beforeHeader,
  header,
  children,
  footer = <Footer />
}: SitePageProps) {
  return (
    <>
      <BodyClass className={bodyClass} data={bodyData} />
      {beforeHeader}
      {header}
      <main>{children}</main>
      {footer}
    </>
  );
}
