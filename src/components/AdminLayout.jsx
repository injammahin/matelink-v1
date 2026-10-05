import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Tooltip } from 'radix-ui';
import {
  LayoutDashboard,
  ClipboardList,
  MessageSquare,
  ShieldCheck,
  CreditCard,
  SlidersHorizontal,
  CircleDollarSign,
  Settings,
  Menu,
  House,
  Info,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

import { Wordmark } from '@/components/SiteLayout';
import { useApp } from '@/context/AppContext';

const storageKey = 'matelink.admin.sidebar-collapsed';

const navigation = [
  ['/admin', 'Overview', LayoutDashboard],
  ['/admin/bookings', 'Bookings', ClipboardList],
  ['/admin/quotes', 'Quote requests', MessageSquare],
  ['/admin/recleans', 'Re-clean requests', ShieldCheck],
  ['/admin/payments', 'Payments', CreditCard],
  ['/admin/services', 'Services & add-ons', SlidersHorizontal],
  ['/admin/pricing', 'Pricing', CircleDollarSign],
  ['/admin/settings', 'Settings', Settings],
];

const sidebarStyles = `
  .admin-layout.matelink-admin-layout {
    --admin-expanded-width: 245px;
    grid-template-columns: var(--admin-sidebar-width) minmax(0, 1fr);
    transition: grid-template-columns 220ms ease;
  }

  .matelink-admin-layout .admin-sidebar {
    height: 100dvh;
    min-height: 0;
    transition: padding 220ms ease;
  }

  .matelink-admin-layout .admin-sidebar-heading {
    min-height: 79px;
    flex-shrink: 0;
  }

  .matelink-admin-layout .admin-brand {
    min-height: 43px;
    white-space: nowrap;
  }

  .matelink-admin-layout .admin-sidebar-menu {
    flex: 1;
    min-height: 0;
    overflow-x: hidden;
    overflow-y: auto;
    scrollbar-width: thin;
    padding-bottom: 12px;
  }

  .matelink-admin-navigation {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .matelink-admin-navigation .admin-navlink,
  .matelink-admin-layout .admin-sidebar-footer .admin-navlink {
    display: flex;
    align-items: center;
    min-height: 48px;
    flex-shrink: 0;
  }

  .matelink-admin-navigation .admin-navlink svg,
  .matelink-admin-layout .admin-sidebar-footer .admin-navlink svg {
    flex-shrink: 0;
  }

  .matelink-admin-layout .admin-sidebar-footer {
    flex-shrink: 0;
  }

  .matelink-admin-layout[data-collapsed='true'] .admin-sidebar {
    padding-inline: 12px;
  }

  .matelink-admin-layout[data-collapsed='true'] .admin-brand {
    justify-content: center;
  }

  .matelink-admin-layout[data-collapsed='true'] .wordmark-type {
    display: none;
  }

  .matelink-admin-layout[data-collapsed='true'] .admin-workspace-label {
    visibility: hidden;
    white-space: nowrap;
  }

  .matelink-admin-layout .admin-navlink.admin-icon-link {
    width: 52px;
    height: 48px;
    min-height: 48px;
    padding: 12px 16px;
    justify-content: center;
    gap: 0;
  }

  .matelink-admin-tooltip {
    z-index: 1000;
    padding: 9px 13px;
    border-radius: 8px;
    background: #102d43;
    color: #ffffff;
    font-size: 12px;
    font-weight: 600;
    line-height: 1.5;
    white-space: nowrap;
    box-shadow: 0 6px 20px rgba(16, 45, 67, 0.16);
  }

  .matelink-admin-tooltip-arrow {
    fill: #102d43;
  }

  @media (min-width: 901px) and (max-width: 1100px) {
    .admin-layout.matelink-admin-layout {
      --admin-expanded-width: 215px;
    }
  }

  @media (max-width: 900px) {
    .admin-layout.matelink-admin-layout {
      display: block;
    }

    .matelink-admin-layout .admin-sidebar,
    .matelink-admin-layout .admin-desktop-toggle {
      display: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .admin-layout.matelink-admin-layout,
    .matelink-admin-layout .admin-sidebar {
      transition: none;
    }
  }
`;

function SidebarLink({
  to,
  label,
  Icon,
  collapsed = false,
  className = '',
}) {
  // A string className preserves styling inside Tooltip.Trigger.
  // NavLink automatically adds "active" for the current page.
  const link = (
    <NavLink
      to={to}
      end={to === '/admin' || to === '/'}
      className={`admin-navlink ${
        collapsed ? 'admin-icon-link' : ''
      } ${className}`.trim()}
      aria-label={collapsed ? label : undefined}
    >
      <Icon size={18} aria-hidden="true" />

      <span className={collapsed ? 'sr-only' : undefined}>
        {label}
      </span>
    </NavLink>
  );

  if (!collapsed) {
    return link;
  }

  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        {link}
      </Tooltip.Trigger>

      <Tooltip.Portal>
        <Tooltip.Content
          side="right"
          sideOffset={12}
          collisionPadding={12}
          className="matelink-admin-tooltip"
        >
          {label}

          <Tooltip.Arrow className="matelink-admin-tooltip-arrow" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

function AdminNavigation({ collapsed = false }) {
  return (
    <nav
      aria-label="Administration"
      className="matelink-admin-navigation mt-9"
    >
      {navigation.map(([to, label, Icon]) => (
        <SidebarLink
          key={to}
          to={to}
          label={label}
          Icon={Icon}
          collapsed={collapsed}
        />
      ))}
    </nav>
  );
}

export default function AdminLayout() {
  const [open, setOpen] = useState(false);

  const [collapsed, setCollapsed] = useState(() => {
    try {
      return (
        typeof window !== 'undefined' &&
        window.localStorage.getItem(storageKey) === 'true'
      );
    } catch {
      return false;
    }
  });

  const location = useLocation();
  const { bookings } = useApp();

  const pending = bookings.filter(
    booking => booking.status === 'pending'
  ).length;

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, String(collapsed));
    } catch {
      // Collapsing still works when browser storage is unavailable.
    }
  }, [collapsed]);

  return (
    <Tooltip.Provider delayDuration={200}>
      <div
        className="admin-layout matelink-admin-layout"
        data-collapsed={String(collapsed)}
        style={{
          '--admin-sidebar-width': collapsed
            ? '76px'
            : 'var(--admin-expanded-width)',
        }}
      >
        <style>{sidebarStyles}</style>

        <aside
          id="desktop-admin-sidebar"
          className="admin-sidebar"
        >
          <div className="admin-sidebar-heading">
            <Wordmark className="admin-brand" />

            <p className="admin-workspace-label mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Your cleaning workspace
            </p>
          </div>

          <div className="admin-sidebar-menu">
            <AdminNavigation collapsed={collapsed} />
          </div>

          <div className="admin-sidebar-footer mt-auto">
            {!collapsed && (
              <div className="rounded-xl bg-secondary p-4">
                <p className="text-sm font-semibold">
                  {pending} request{pending === 1 ? '' : 's'} to review
                </p>

                <p className="field-help mt-2">
                  Keep your next fresh starts moving.
                </p>
              </div>
            )}

            <SidebarLink
              to="/"
              label="View website"
              Icon={House}
              collapsed={collapsed}
              className="mt-5"
            />
          </div>
        </aside>

        <div className="admin-main">
          <header className="admin-topbar">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="admin-desktop-toggle"
                onClick={() => setCollapsed(value => !value)}
                aria-label={
                  collapsed ? 'Expand sidebar' : 'Collapse sidebar'
                }
                aria-expanded={!collapsed}
                aria-controls="desktop-admin-sidebar"
              >
                <Menu size={19} />
              </Button>

              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button
                    type="button"
                    className="admin-mobile-nav"
                    variant="outline"
                    size="icon"
                    aria-label="Open admin navigation"
                  >
                    <Menu size={19} />
                  </Button>
                </SheetTrigger>

                <SheetContent
                  side="left"
                  className="w-[300px] p-6"
                >
                  <SheetHeader>
                    <SheetTitle>Matelink workspace</SheetTitle>
                  </SheetHeader>

                  <AdminNavigation />

                  <Link
                    to="/"
                    className="admin-navlink mt-5"
                  >
                    <House size={18} />
                    View website
                  </Link>
                </SheetContent>
              </Sheet>

              <p className="text-sm font-semibold">
                Matelink workspace
              </p>
            </div>

            <div className="flex items-center gap-4">
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">
                Frontend preview
              </span>

              <span className="hidden h-9 w-9 items-center justify-center rounded-full bg-navy text-xs font-bold text-white sm:flex">
                MC
              </span>
            </div>
          </header>

          <div className="mb-7 flex items-start gap-2 rounded-lg border border-dashed bg-white px-4 py-3 text-xs text-muted-foreground">
            <Info
              className="mt-0.5 shrink-0"
              size={15}
            />

            <span>
              Demo workspace. Data stays in this browser. Status updates
              create email previews; they do not send messages.
              Production requires authenticated server access.
            </span>
          </div>

          <main id="main-content">
            <Outlet />
          </main>
        </div>
      </div>
    </Tooltip.Provider>
  );
}