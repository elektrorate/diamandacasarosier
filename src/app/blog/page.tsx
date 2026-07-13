import type { Metadata } from "next";
import { BlogIndexPage } from "@/features/blog/BlogIndexPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Blog | Casa Rosier Ceramica" },
  description:
    "Articulos, procesos y reflexiones sobre ceramica, talleres, tecnicas y creacion en Casa Rosier Ceramica Barcelona."
};

export default function BlogPage() {
  return <BlogIndexPage />;
}
