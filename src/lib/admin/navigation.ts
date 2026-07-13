export interface AdminNavLink {
  label: string;
  href: string;
}

export interface AdminNavSection {
  label: string;
  icon: string;
  href?: string;
  children?: AdminNavLink[];
}

export const adminRoutes = {
  dashboard: "/admin/dashboard",
  classes: "/admin/clases",
  newClass: "/admin/clases/new",
  workshops: "/admin/workshops",
  experiences: "/admin/experiencias",
  giftCards: "/admin/gift-cards",
  pages: "/admin/pages",
  home: "/admin/home",
  studio: "/admin/estudio",
  landingPages: "/admin/landing-pages",
  blog: "/admin/bitacora",
  redirects: "/admin/redirecciones",
  forms: "/admin/formularios",
  messages: "/admin/mensajes",
  headers: "/admin/components/headers",
  socialGalleries: "/admin/components/social-galleries",
  testimonials: "/admin/components/testimonials",
  footers: "/admin/components/footers",
  promoBanners: "/admin/components/promo-banners",
  faqs: "/admin/components/faqs",
  menus: "/admin/menu",
  shop: "/admin/shop",
  products: "/admin/shop/products",
  categories: "/admin/shop/categories",
  orders: "/admin/shop/orders",
  coupons: "/admin/shop/coupons",
  shipping: "/admin/shop/shipping",
  media: "/admin/media",
  users: "/admin/users",
  settings: "/admin/settings",
  marketing: "/admin/marketing",
  marketingAnalytics: "/admin/marketing/analytics",
  marketingSearchConsole: "/admin/marketing/search-console",
  marketingPages: "/admin/marketing/pages",
  marketingEvents: "/admin/marketing/events",
  marketingCampaigns: "/admin/marketing/campaigns",
  marketingConversions: "/admin/marketing/conversions",
  marketingSeo: "/admin/marketing/seo",
  marketingReports: "/admin/marketing/reports",
  marketingSettings: "/admin/marketing/settings",
  legal: "/admin/legal-cookies",
  historyLogs: "/admin/history-logs",
  trash: "/admin/trash",
} as const;

export const adminSections: AdminNavSection[] = [
  {
    label: "Dashboard",
    icon: "home",
    href: adminRoutes.dashboard,
  },
  {
    label: "Componentes",
    icon: "extension",
    children: [
      { label: "Galerías Sociales", href: adminRoutes.socialGalleries },
      { label: "Testimonios", href: adminRoutes.testimonials },
      { label: "Banners Promocionales", href: adminRoutes.promoBanners },
    ],
  },
  {
    label: "Clases",
    icon: "school",
    children: [
      { label: "Clases", href: adminRoutes.classes },
      { label: "Workshops", href: adminRoutes.workshops },
      { label: "Experiencias", href: adminRoutes.experiences },
      { label: "Gift Cards", href: adminRoutes.giftCards },
    ],
  },
  {
    label: "Contenido",
    icon: "description",
    children: [
      { label: "Shop", href: adminRoutes.shop },
      { label: "El estudio", href: adminRoutes.studio },
      { label: "Bitácora", href: adminRoutes.blog },
    ],
  },
  {
    label: "Setup Página",
    icon: "sync_alt",
    children: [
      { label: "Home", href: adminRoutes.home },
      { label: "Footer", href: adminRoutes.footers },
      { label: "Menú", href: adminRoutes.menus },
      { label: "Multimedia", href: adminRoutes.media },
      { label: "Redirecciones", href: adminRoutes.redirects },
    ],
  },
  {
    label: "Marketing",
    icon: "analytics",
    children: [
      { label: "Configuración", href: adminRoutes.marketingSettings },
      { label: "Resumen", href: adminRoutes.marketing },
      { label: "Analytics", href: adminRoutes.marketingAnalytics },
      { label: "Search Console", href: adminRoutes.marketingSearchConsole },
      { label: "Páginas", href: adminRoutes.marketingPages },
      { label: "Eventos", href: adminRoutes.marketingEvents },
      { label: "Campañas UTM", href: adminRoutes.marketingCampaigns },
      { label: "Conversiones", href: adminRoutes.marketingConversions },
      { label: "SEO", href: adminRoutes.marketingSeo },
      { label: "Reportes", href: adminRoutes.marketingReports },
    ],
  },
  {
    label: "Mensajes",
    icon: "mail",
    href: adminRoutes.messages,
  },
  {
    label: "Usuarios",
    icon: "group",
    href: adminRoutes.users,
  },
  {
    label: "Configuración",
    icon: "settings",
    children: [
      { label: "Políticas de privacidad", href: adminRoutes.legal },
      { label: "Historial de actividad", href: adminRoutes.historyLogs },
      { label: "Papelera", href: adminRoutes.trash },
    ],
  },
];
