import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Menu, ChevronDown, X, MapPin, Mail, Instagram, Facebook, Phone, Check, CalendarDays, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { services } from '@/data/content';
import { postcodeAvailability } from '@/lib/pricing';
import { useApp } from '@/context/AppContext';

export function Wordmark({ className = '' }) {
  return <Link to="/" className={`wordmark ${className}`} aria-label="Matelink Cleaning home">
    <img className="brand-mark" src="/images/favicon.png" alt="" width="43" height="43" />
    <span className="wordmark-type">MATELINK<small>C L E A N I N G</small></span>
  </Link>;
}
export function PreviewRibbon() {
  const [visible, setVisible] = useState(() => sessionStorage.getItem('matelink.hide-preview') !== '1');
  if (!visible) return null;
  return <div className="preview-ribbon"><span>Interactive preview</span><span aria-hidden="true">·</span><span>No live bookings or payments</span>
    <button type="button" aria-label="Dismiss preview notice" className="absolute right-3 p-1" onClick={() => { setVisible(false); sessionStorage.setItem('matelink.hide-preview', '1'); }}><X size={13} /></button>
  </div>;
}
function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => setOpen(false), [location.pathname]);
  return <header className="site-header">
    <div className="container-site nav-row">
      <Wordmark />
      <nav className="nav-links desktop-navigation" aria-label="Main navigation">
        <details className="service-menu group" onKeyDown={event => { if (event.key === 'Escape') event.currentTarget.open = false; }}>
          <summary className="nav-link list-none cursor-pointer">Our services <ChevronDown size={14} className="transition-transform group-open:rotate-180" /></summary>
          <div className="service-dropdown">{services.map(service => <Link key={service.id} to={`/${service.slug}`} onClick={event => event.currentTarget.closest('details').removeAttribute('open')}><span className="text-sm font-semibold">{service.name}</span><small>{service.ideal}</small></Link>)}</div>
        </details>
        <NavLink className="nav-link" to="/whats-included">What’s included</NavLink>
        <NavLink className="nav-link" to="/about">About us</NavLink>
        <NavLink className="nav-link" to="/faq">FAQs</NavLink>
      </nav>
      <div className="desktop-actions flex items-center gap-5"><Link to="/get-a-quote" className="text-sm font-semibold">Get a quote</Link><Button asChild className="h-11 px-6"><Link to="/book">Book now</Link></Button></div>
      <div className="mobile-menu-button flex items-center gap-3">
        <Button asChild size="sm" className="h-10 px-4"><Link to="/book">Book now</Link></Button>
        <Sheet open={open} onOpenChange={setOpen}><SheetTrigger asChild><Button variant="ghost" size="icon" aria-label="Open navigation"><Menu size={22} /></Button></SheetTrigger>
          <SheetContent className="w-[330px] max-w-[90vw] p-6"><SheetHeader><SheetTitle className="text-left text-xl">Explore Matelink</SheetTitle></SheetHeader>
            <nav aria-label="Mobile navigation" className="mt-7 flex flex-col gap-1">
              <Link className="nav-link border-b py-3" to="/">Home</Link>
              {services.map(s => <Link key={s.id} className="nav-link border-b py-3" to={`/${s.slug}`}>{s.name}</Link>)}
              {[['What’s included','/whats-included'],['Bond Back Guarantee','/bond-back-guarantee'],['About us','/about'],['FAQs','/faq'],['Contact','/contact']].map(([name,path]) => <Link key={path} className="nav-link py-2" to={path}>{name}</Link>)}
              <Button asChild className="mt-4"><Link to="/book">Book now</Link></Button><Button asChild variant="outline"><Link to="/get-a-quote">Get a quote</Link></Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  </header>;
}
function Footer() {
  const { settings } = useApp();
  return <footer className="site-footer">
    <div className="container-site footer-grid pb-12">
      <div className="footer-brand"><Wordmark /><p className="body-copy mt-6 max-w-[280px] text-sm">Thoughtful cleaning.<br />A fresh start for your home.</p><p className="mt-5 flex items-center gap-2 text-sm text-muted-foreground"><MapPin size={16} /> Sydney, Australia</p></div>
      <div><h3 className="text-sm font-bold tracking-normal">Our services</h3>{services.map(s => <Link key={s.id} className="footer-link" to={`/${s.slug}`}>{s.name}</Link>)}<Link className="footer-link" to="/whats-included">What’s included</Link></div>
      <div><h3 className="text-sm font-bold tracking-normal">A little more about us</h3><Link className="footer-link" to="/about">About Matelink</Link><Link className="footer-link" to="/bond-back-guarantee">Bond Back Guarantee</Link><Link className="footer-link" to="/faq">FAQs</Link><Link className="footer-link" to="/contact">Contact us</Link></div>
      <div><h3 className="text-sm font-bold tracking-normal">Let’s get started</h3><Link className="footer-link" to="/book">Book your clean</Link><Link className="footer-link" to="/get-a-quote">Get a tailored quote</Link>
        {settings.contactEmail && <a className="footer-link break-all" href={`mailto:${settings.contactEmail}`}><Mail className="mr-2 inline" size={14} />{settings.contactEmail}</a>}
        {settings.showPhone && settings.phone && <a className="footer-link" href={`tel:${settings.phone}`}><Phone className="mr-2 inline" size={14} />{settings.phone}</a>}
        <div className="mt-4 flex gap-3">{settings.instagram && <a className="rounded-full border p-2" aria-label="Matelink on Instagram" href={settings.instagram} target="_blank" rel="noopener noreferrer"><Instagram size={17} /></a>}{settings.facebook && <a className="rounded-full border p-2" aria-label="Matelink on Facebook" href={settings.facebook} target="_blank" rel="noopener noreferrer"><Facebook size={17} /></a>}</div>
      </div>
    </div>
    <div className="container-site flex flex-wrap items-center justify-between gap-5 border-t py-6 text-xs text-muted-foreground"><p>© {new Date().getFullYear()} Matelink Cleaning.</p><div className="flex flex-wrap gap-5"><Link to="/privacy">Privacy</Link><Link to="/terms">Terms & conditions</Link><Link to="/admin">Admin preview</Link></div></div>
  </footer>;
}
export default function SiteLayout() {
  return <><a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:p-3">Skip to content</a><PreviewRibbon /><Header /><main id="main-content"><Outlet /></main><Footer /></>;
}
export function PostcodeCheck({ compact = false, onValid, initialValue = '' }) {
  const [code, setCode] = useState(initialValue);
  const [error, setError] = useState('');
  const { settings } = useApp();
  const navigate = useNavigate();
  function submit(event) {
    event.preventDefault();
    const availability = postcodeAvailability(code.trim(), settings);
    if (availability === 'invalid') { setError('Enter a four-digit Australian postcode.'); return; }
    if (availability === 'unavailable') { setError('This postcode is outside the current service area. Please request a quote so we can review it.'); return; }
    setError('');
    if (onValid) onValid(code.trim(), availability);
    else navigate(`/book?postcode=${code.trim()}`);
  }
  return <form onSubmit={submit} className={compact ? '' : 'postcode-panel'} noValidate>
    <Label htmlFor={compact ? 'booking-postcode' : 'home-postcode'} className="mb-3 block text-sm font-semibold">Let’s start with your postcode</Label>
    <div className="flex gap-2"><div className="relative min-w-0 flex-1"><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} /><Input id={compact ? 'booking-postcode' : 'home-postcode'} aria-describedby="postcode-help" aria-invalid={!!error} value={code} onChange={e => { setCode(e.target.value.replace(/\D/g,'').slice(0,4)); setError(''); }} inputMode="numeric" autoComplete="postal-code" placeholder="e.g. 2000" className="h-12 pl-10 text-base" maxLength={4} /></div><Button className="h-12 px-5" type="submit">{compact ? 'Continue' : 'Find my clean'}</Button></div>
    <p id="postcode-help" className={error ? 'field-error mt-3' : 'field-help mt-3'} aria-live="polite">{error || 'No upfront payment. Your date is confirmed personally.'}</p>
    {error.includes('outside') && <Link to="/get-a-quote" className="link-line mt-2">Request a quote</Link>}
  </form>;
}
export function FeatureStrip() {
  return <div className="container-site feature-strip"><div className="feature-strip-item"><CalendarDays size={20} />A preferred date that works for you</div><div className="feature-strip-item"><ShieldCheck size={20} />No payment at the request stage</div><div className="feature-strip-item"><Sparkles size={20} />A clean shaped around your home</div></div>;
}
export function CTABand({ title = 'Your fresh start begins here.', description = 'Choose a clean for your home, or tell us what you need.' }) {
  return <div className="container-site"><div className="cta-band"><div><p className="eyebrow mb-4 !text-[#a7dddb]">A little less on your to-do list</p><h2 className="text-3xl lg:text-4xl">{title}</h2><p className="mt-4 max-w-lg text-sm leading-relaxed text-[#c7d6de]">{description}</p></div><div className="flex shrink-0 flex-wrap gap-3"><Button asChild className="h-12 bg-white px-6 text-navy hover:bg-[#edf6f5]"><Link to="/book">Book now</Link></Button><Button asChild variant="outline" className="h-12 border-white/40 bg-transparent px-6 text-white hover:bg-white/10 hover:text-white"><Link to="/get-a-quote">Get a quote</Link></Button></div></div></div>;
}
export function PageIntro({ eyebrow, title, description, children }) {
  return <section className="page-intro"><div className="container-site"><p className="eyebrow mb-5">{eyebrow}</p><h1 className="page-title">{title}</h1>{description && <p className="body-copy mt-6 max-w-2xl">{description}</p>}{children}</div></section>;
}
