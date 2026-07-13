import type { Menu, MenuItem } from "@/lib/cms/types";

function buildTree(items: MenuItem[]): MenuItem[] {
  const roots: MenuItem[] = [];
  items.forEach((i) => {
    if (!i.parent_id || !items.some((x) => x.id === i.parent_id)) {
      roots.push(i);
    }
  });
  return roots.sort((a, b) => a.sort_order - b.sort_order);
}

function getChildren(itemId: string, items: MenuItem[]): MenuItem[] {
  return items.filter((i) => i.parent_id === itemId).sort((a, b) => a.sort_order - b.sort_order);
}

function renderItem(item: MenuItem, items: MenuItem[], depth = 0): React.ReactNode {
  const children = getChildren(item.id, items);
  return (
    <div key={item.id} className={`menu-preview-item depth-${depth} ${!item.is_visible ? "menu-preview-hidden" : ""}`}>
      <span className="menu-preview-dot" />
      <span className="menu-preview-label">{item.label}</span>
      {item.url ? <span className="menu-preview-url">{item.url}</span> : null}
      {!item.is_visible ? <span className="menu-preview-badge">oculto</span> : null}
      {item.open_in_new_tab ? <span className="menu-preview-badge">new tab</span> : null}
      {children.length > 0 && (
        <div className="menu-preview-children">
          {children.map((c) => renderItem(c, items, depth + 1))}
        </div>
      )}
    </div>
  );
}

export default function MenuPreview({ menu }: { menu: Menu }) {
  const roots = buildTree(menu.items);
  return (
    <div className="menu-preview-box">
      <div className="menu-preview-header">
        <strong>{menu.name}</strong>
        <span className="entity-badge">{menu.location}</span>
      </div>
      {roots.length === 0 ? (
        <p className="muted">Sin items</p>
      ) : (
        <div className="menu-preview-tree">
          {roots.map((item) => renderItem(item, menu.items))}
        </div>
      )}
    </div>
  );
}
