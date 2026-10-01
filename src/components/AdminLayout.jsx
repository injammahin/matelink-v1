import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, MessageSquare, ShieldCheck, CreditCard, SlidersHorizontal, CircleDollarSign, Settings, Menu, House, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Wordmark } from '@/components/SiteLayout';
import { useApp } from '@/context/AppContext';

const navigation=[['/admin','Overview',LayoutDashboard],['/admin/bookings','Bookings',ClipboardList],['/admin/quotes','Quote requests',MessageSquare],['/admin/recleans','Re-clean requests',ShieldCheck],['/admin/payments','Payments',CreditCard],['/admin/services','Services & add-ons',SlidersHorizontal],['/admin/pricing','Pricing',CircleDollarSign],['/admin/settings','Settings',Settings]];
function AdminNavigation() {
  return <nav aria-label="Administration" className="mt-9 space-y-2">{navigation.map(([path,title,Icon])=><NavLink end={path==='/admin'} key={path} className="admin-navlink" to={path}><Icon size={18}/>{title}</NavLink>)}</nav>;
}
export default function AdminLayout() {
  const [open,setOpen]=useState(false);
  const location=useLocation();
  const {bookings}=useApp();
  const pending=bookings.filter(b=>b.status==='pending').length;
  useEffect(()=>setOpen(false),[location.pathname]);
  return <div className="admin-layout"><aside className="admin-sidebar"><Wordmark/><p className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your cleaning workspace</p><AdminNavigation/><div className="mt-auto"><div className="rounded-xl bg-secondary p-4"><p className="text-sm font-semibold">{pending} request{pending===1?'':'s'} to review</p><p className="field-help mt-2">Keep your next fresh starts moving.</p></div><Link to="/" className="admin-navlink mt-5"><House size={18}/>View website</Link></div></aside><div className="admin-main"><header className="admin-topbar"><div className="flex items-center gap-3"><Sheet open={open} onOpenChange={setOpen}><SheetTrigger asChild><Button className="admin-mobile-nav" variant="outline" size="icon" aria-label="Open admin navigation"><Menu size={19}/></Button></SheetTrigger><SheetContent side="left" className="w-[300px] p-6"><SheetHeader><SheetTitle>Matelink workspace</SheetTitle></SheetHeader><AdminNavigation/><Link to="/" className="admin-navlink mt-5">View website</Link></SheetContent></Sheet><p className="text-sm font-semibold">Matelink workspace</p></div><div className="flex items-center gap-4"><span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">Frontend preview</span><span className="hidden h-9 w-9 items-center justify-center rounded-full bg-navy text-xs font-bold text-white sm:flex">MC</span></div></header><div className="mb-7 flex items-start gap-2 rounded-lg border border-dashed bg-white px-4 py-3 text-xs text-muted-foreground"><Info className="mt-0.5 shrink-0" size={15}/><span>Demo workspace. Data stays in this browser. Status updates create email previews; they do not send messages. Production requires authenticated server access.</span></div><main id="main-content"><Outlet/></main></div></div>;
}
