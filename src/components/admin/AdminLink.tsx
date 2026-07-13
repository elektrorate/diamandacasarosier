import Link, { type LinkProps } from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

type AdminLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
    children?: ReactNode;
  };

export default function AdminLink({ prefetch = false, ...props }: AdminLinkProps) {
  return <Link prefetch={prefetch} {...props} />;
}
