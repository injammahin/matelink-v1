import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import {
  Menu,
  ChevronDown,
  X,
  MapPin,
  Mail,
  Instagram,
  Facebook,
  Phone,
  Check,
  CalendarDays,
  ShieldCheck,
  Sparkles,
  House,
  Truck,
  KeyRound,
  UserRound,
  LogOut,
  LogIn,
  UserPlus,
} from 'lucide-react';

import {
  Button,
} from '@/components/ui/button';

import {
  Input,
} from '@/components/ui/input';

import {
  Label,
} from '@/components/ui/label';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

import {
  services,
} from '@/data/content';

import {
  postcodeAvailability,
} from '@/lib/pricing';

import {
  useApp,
} from '@/context/AppContext';

import {
  useAuth,
} from '@/context/AuthContext';

export function Wordmark({ className = '' }) {
  return <Link to="/" className={`wordmark ${className}`} aria-label="Matelink Cleaning home">
    <img className="brand-mark" src="/images/favicon.png" alt="" width="43" height="43" />
    <span className="wordmark-type">MATELINK<small>C L E A N I N G</small></span>
  </Link>;
}

function Header() {
  const [open, setOpen] = useState(false);

  const [servicesOpen, setServicesOpen] = useState(false);

  const [accountOpen, setAccountOpen] = useState(false);

  const [headerVisible, setHeaderVisible] = useState(true);

  const [headerScrolled, setHeaderScrolled] = useState(false);

  const lastScrollY = useRef(0);

  const scrollTicking = useRef(false);

  const serviceMenuRef = useRef(null);

  const accountMenuRef = useRef(null);

  const location = useLocation();

  const {
    user,
    logout,
  } = useAuth();
  const serviceIcons = {
    general: House,
    deep: Sparkles,
    'move-in': Truck,
    'end-of-lease': KeyRound,
  };


  function getServiceIcon(serviceId) {
    return (
      serviceIcons[serviceId] ||
      Sparkles
    );
  }
  /*
  |--------------------------------------------------------------------------
  | CLOSE MENUS WHEN ROUTE CHANGES
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    setOpen(false);

    setServicesOpen(false);

    setAccountOpen(false);

    setHeaderVisible(true);
  }, [location.pathname]);

  /*
  |--------------------------------------------------------------------------
  | CLOSE ACCOUNT MENU WHEN CLICKING OUTSIDE
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    function handleDocumentClick(event) {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target)
      ) {
        setAccountOpen(false);
      }
    }

    document.addEventListener(
      'pointerdown',
      handleDocumentClick
    );

    return () => {
      document.removeEventListener(
        'pointerdown',
        handleDocumentClick
      );
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | ESC KEY
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    function handleEscape(event) {
      if (event.key !== 'Escape') {
        return;
      }

      setServicesOpen(false);

      setAccountOpen(false);
    }

    document.addEventListener(
      'keydown',
      handleEscape
    );

    return () => {
      document.removeEventListener(
        'keydown',
        handleEscape
      );
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | HEADER SCROLL BEHAVIOUR
  |--------------------------------------------------------------------------
  |
  | Scroll down  -> header slides upward
  | Scroll up    -> header comes back
  | Near top     -> header always visible
  |
  */

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    function updateHeader() {
      const currentScrollY = window.scrollY;

      /*
       * Header gets shadow after a little scrolling.
       */
      setHeaderScrolled(currentScrollY > 15);

      /*
       * Always show near top of page.
       */
      if (currentScrollY <= 40) {
        setHeaderVisible(true);

        lastScrollY.current = currentScrollY;

        scrollTicking.current = false;

        return;
      }

      const difference =
        currentScrollY - lastScrollY.current;

      /*
       * User scrolling DOWN.
       *
       * We only hide after 100px so tiny movements
       * near the top don't make the header disappear.
       */
      if (
        difference > 4 &&
        currentScrollY > 100
      ) {
        setHeaderVisible(false);

        setServicesOpen(false);

        setAccountOpen(false);
      }

      /*
       * User scrolling UP.
       */
      if (difference < -4) {
        setHeaderVisible(true);
      }

      lastScrollY.current = currentScrollY;

      scrollTicking.current = false;
    }

    function handleScroll() {
      if (scrollTicking.current) {
        return;
      }

      scrollTicking.current = true;

      window.requestAnimationFrame(
        updateHeader
      );
    }

    window.addEventListener(
      'scroll',
      handleScroll,
      {
        passive: true,
      }
    );

    return () => {
      window.removeEventListener(
        'scroll',
        handleScroll
      );
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | LOGOUT
  |--------------------------------------------------------------------------
  */

  function handleLogout() {
    logout();

    setAccountOpen(false);

    setOpen(false);
  }

  const firstName =
    user?.name
      ?.trim()
      .split(/\s+/)[0] || '';

  return (
    <header
      className={[
        'site-header',

        headerVisible
          ? 'site-header-visible'
          : 'site-header-hidden',

        headerScrolled
          ? 'site-header-scrolled'
          : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="container-site nav-row">

        {/* =====================================================
            LOGO
        ====================================================== */}

        <Wordmark />

        {/* =====================================================
            DESKTOP NAVIGATION
        ====================================================== */}

        <nav
          className="nav-links desktop-navigation"
          aria-label="Main navigation"
        >

          {/* =================================================
              SERVICES DROPDOWN
          ================================================== */}

          <div
            ref={serviceMenuRef}
            className="service-menu"
            onMouseEnter={() => {
              setServicesOpen(true);

              setAccountOpen(false);
            }}
            onMouseLeave={() => {
              setServicesOpen(false);
            }}
          >
            <button
              type="button"
              className={`nav-link service-menu-trigger ${
                servicesOpen
                  ? 'service-menu-trigger-active'
                  : ''
              }`}
              aria-haspopup="true"
              aria-expanded={servicesOpen}

              /*
               * Clicking still works for laptops/touch devices.
               */
              onClick={() => {
                setServicesOpen(
                  (previous) => !previous
                );

                setAccountOpen(false);
              }}

              /*
               * Keyboard users can tab to Services.
               */
              onFocus={() => {
                setServicesOpen(true);

                setAccountOpen(false);
              }}
            >
              <span>
                Our services
              </span>

              <ChevronDown
                size={14}
                strokeWidth={2}
                className={`service-chevron ${
                  servicesOpen
                    ? 'service-chevron-open'
                    : ''
                }`}
              />
            </button>

            {/* DROPDOWN */}

            <div
              className={`service-dropdown ${
                servicesOpen
                  ? 'service-dropdown-visible'
                  : ''
              }`}
            >
              <div className="service-dropdown-content">

                <p className="service-dropdown-heading">
                  Find the right clean
                </p>

                <div className="service-dropdown-list">

                  {services.map((service) => {
                    const ServiceIcon =
                      getServiceIcon(
                        service.id
                      );

                    return (
                      <Link
                        key={service.id}
                        to={`/${service.slug}`}
                        className="service-dropdown-link"
                        onClick={() =>
                          setServicesOpen(false)
                        }
                      >

                        {/* ICON */}

                        <span className="service-dropdown-icon">

                          <ServiceIcon
                            size={18}
                            strokeWidth={1.9}
                          />

                        </span>


                        {/* TEXT */}

                        <span className="service-dropdown-text">

                          <span className="service-dropdown-title">
                            {service.name}
                          </span>

                          <span className="service-dropdown-description">
                            {service.ideal}
                          </span>

                        </span>

                      </Link>
                    );
                  })}

                </div>

                <div className="service-dropdown-footer">
                  <Link
                    to="/whats-included"
                    onClick={() =>
                      setServicesOpen(false)
                    }
                  >
                    Compare what’s included
                  </Link>
                </div>

              </div>
            </div>

          </div>

          {/* OTHER NAVIGATION */}

          <NavLink
            className="nav-link"
            to="/whats-included"
          >
            What’s included
          </NavLink>

          <NavLink
            className="nav-link"
            to="/about"
          >
            About us
          </NavLink>

          <NavLink
            className="nav-link"
            to="/faq"
          >
            FAQs
          </NavLink>

        </nav>

        {/* =====================================================
            DESKTOP ACTIONS
        ====================================================== */}

        <div className="desktop-actions flex items-center gap-4">

          <Link
            to="/get-a-quote"
            className="text-sm font-semibold transition-colors hover:text-primary"
          >
            Get a quote
          </Link>

          {/* =================================================
              USER ACCOUNT
          ================================================== */}

          <div
            ref={accountMenuRef}
            className="relative"
          >

            <button
              type="button"
              className={`header-user-button ${
                accountOpen
                  ? 'is-active'
                  : ''
              }`}
              aria-haspopup="menu"
              aria-expanded={accountOpen}
              aria-label={
                user
                  ? 'Open account menu'
                  : 'Sign in or register'
              }
              onClick={() => {
                setAccountOpen(
                  (previous) => !previous
                );

                setServicesOpen(false);
              }}
            >
              <UserRound
                size={18}
                strokeWidth={1.8}
              />

              {user && (
                <span className="header-user-name">
                  {firstName}
                </span>
              )}

              {user && (
                <span
                  className="header-user-status"
                  aria-hidden="true"
                />
              )}
            </button>

            {/* ACCOUNT DROPDOWN */}

            <div
              className={`account-dropdown ${
                accountOpen
                  ? 'is-visible'
                  : ''
              }`}
              role="menu"
            >

              {user ? (
                <>

                  <div className="account-dropdown-profile">

                    <div className="account-avatar">
                      <UserRound
                        size={19}
                      />
                    </div>

                    <div className="min-w-0">

                      <p className="truncate text-sm font-bold text-navy">
                        {user.name}
                      </p>

                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {user.email}
                      </p>

                    </div>

                  </div>

                  <div className="account-dropdown-divider" />

                  <Link
                    to="/"
                    role="menuitem"
                    className="account-dropdown-item"
                    onClick={() =>
                      setAccountOpen(false)
                    }
                  >
                    <UserRound
                      size={17}
                    />

                    My account
                  </Link>

                  <button
                    type="button"
                    role="menuitem"
                    className="account-dropdown-item account-dropdown-logout"
                    onClick={handleLogout}
                  >
                    <LogOut
                      size={17}
                    />

                    Log out
                  </button>

                </>
              ) : (
                <>

                  <div className="account-login-intro">

                    <div className="account-login-icon">
                      <UserRound
                        size={19}
                      />
                    </div>

                    <p className="account-login-title">
                      Your account
                    </p>

                    <p className="account-login-description">
                      Sign in to keep your cleaning
                      details together.
                    </p>

                  </div>

                  <div className="account-login-actions">

                    <Button
                      asChild
                      className="h-10 w-full"
                    >
                      <Link
                        to="/login"
                        onClick={() =>
                          setAccountOpen(false)
                        }
                      >
                        <LogIn
                          size={16}
                        />

                        Sign in
                      </Link>
                    </Button>

                    <Link
                      to="/register"
                      className="account-register-link"
                      onClick={() =>
                        setAccountOpen(false)
                      }
                    >
                      <UserPlus
                        size={16}
                      />

                      Create an account
                    </Link>

                  </div>

                </>
              )}

            </div>

          </div>

          {/* BOOK NOW */}

          <Button
            asChild
            className="h-11 px-6"
          >
            <Link to="/book">
              Book now
            </Link>
          </Button>

        </div>

        {/* =====================================================
            MOBILE NAV
        ====================================================== */}

        <div className="mobile-menu-button flex items-center gap-2">

          {/* USER */}

          <Button
            asChild
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full border"
          >
            <Link
              to={
                user
                  ? '/'
                  : '/login'
              }
              aria-label={
                user
                  ? 'Customer account'
                  : 'Sign in'
              }
            >
              <UserRound
                size={19}
              />
            </Link>
          </Button>

          {/* BOOK */}

          <Button
            asChild
            size="sm"
            className="h-10 px-4"
          >
            <Link to="/book">
              Book now
            </Link>
          </Button>

          {/* MENU */}

          <Sheet
            open={open}
            onOpenChange={setOpen}
          >

            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open navigation"
              >
                <Menu
                  size={22}
                />
              </Button>
            </SheetTrigger>

            <SheetContent className="w-[330px] max-w-[90vw] p-6">

              <SheetHeader>
                <SheetTitle className="text-left text-xl">
                  Explore Matelink
                </SheetTitle>
              </SheetHeader>

              {/* MOBILE ACCOUNT */}

              <div className="mt-6 rounded-xl bg-secondary p-4">

                {user ? (
                  <>

                    <div className="flex items-center gap-3">

                      <div className="grid h-10 w-10 place-items-center rounded-full bg-white text-primary">
                        <UserRound
                          size={18}
                        />
                      </div>

                      <div className="min-w-0">

                        <p className="truncate text-sm font-bold">
                          {user.name}
                        </p>

                        <p className="truncate text-xs text-muted-foreground">
                          {user.email}
                        </p>

                      </div>

                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        logout();

                        setOpen(false);
                      }}
                      className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#993636]"
                    >
                      <LogOut
                        size={16}
                      />

                      Log out
                    </button>

                  </>
                ) : (
                  <>

                    <p className="text-sm font-bold">
                      Your account
                    </p>

                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Sign in or create an account
                      to manage your details.
                    </p>

                    <div className="mt-4 flex gap-2">

                      <Button
                        asChild
                        size="sm"
                      >
                        <Link to="/login">
                          Sign in
                        </Link>
                      </Button>

                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                      >
                        <Link to="/register">
                          Register
                        </Link>
                      </Button>

                    </div>

                  </>
                )}

              </div>

              {/* MOBILE LINKS */}

              <nav
                aria-label="Mobile navigation"
                className="mt-6 flex flex-col gap-1"
              >

                <Link
                  className="nav-link border-b py-3"
                  to="/"
                >
                  Home
                </Link>

                <p className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-primary">
                  Our services
                </p>

                {services.map(
                  (service) => (
                    <Link
                      key={service.id}
                      className="nav-link border-b py-3"
                      to={`/${service.slug}`}
                    >
                      {service.name}
                    </Link>
                  )
                )}

                <Link
                  className="nav-link py-2"
                  to="/whats-included"
                >
                  What’s included
                </Link>

                <Link
                  className="nav-link py-2"
                  to="/bond-back-guarantee"
                >
                  Bond Back Guarantee
                </Link>

                <Link
                  className="nav-link py-2"
                  to="/about"
                >
                  About us
                </Link>

                <Link
                  className="nav-link py-2"
                  to="/faq"
                >
                  FAQs
                </Link>

                <Link
                  className="nav-link py-2"
                  to="/contact"
                >
                  Contact
                </Link>

                <Button
                  asChild
                  className="mt-4"
                >
                  <Link to="/book">
                    Book now
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                >
                  <Link to="/get-a-quote">
                    Get a quote
                  </Link>
                </Button>

              </nav>

            </SheetContent>

          </Sheet>

        </div>

      </div>
    </header>
  );
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
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:p-3"
      >
        Skip to content
      </a>

      <Header />

      <main id="main-content">
        <Outlet />
      </main>

      <Footer />
    </>
  );
}
export function PostcodeCheck({ compact = false, onValid, initialValue = '' }) {
  const [code, setCode] = useState(initialValue);
  const [error, setError] = useState('');
  const { settings } = useApp();
  const navigate = useNavigate();

  function submit(event) {
    event.preventDefault();

    const availability = postcodeAvailability(code.trim(), settings);

    if (availability === 'invalid') {
      setError('Enter a four-digit Australian postcode.');
      return;
    }

    if (availability === 'unavailable') {
      setError(
        'This postcode is outside the current service area. Please request a quote so we can review it.'
      );
      return;
    }

    setError('');

    if (onValid) {
      onValid(code.trim(), availability);
    } else {
      navigate(`/book?postcode=${code.trim()}`);
    }
  }

  return (
    <form
      onSubmit={submit}
      className={compact ? '' : 'postcode-panel postcode-panel-featured'}
      noValidate
    >
      {!compact && (
        <div className="postcode-start-cue" aria-hidden="true">
          <span className="postcode-start-dot"></span>
          Start here
        </div>
      )}
      <Label
        htmlFor={compact ? 'booking-postcode' : 'home-postcode'}
        className={
          compact
            ? 'mb-3 block text-sm font-semibold'
            : 'postcode-panel-label mb-3 block text-sm font-semibold'
        }
      >
        Let’s start with your postcode
      </Label>

      <div className="postcode-input-row flex gap-2">
        <div className="relative min-w-0 flex-1">
          <MapPin
            className="postcode-map-icon absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={18}
          />

          <Input
            id={compact ? 'booking-postcode' : 'home-postcode'}
            aria-describedby="postcode-help"
            aria-invalid={!!error}
            value={code}
            onChange={(e) => {
              setCode(
                e.target.value
                  .replace(/\D/g, '')
                  .slice(0, 4)
              );

              setError('');
            }}
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="e.g. 2000"
            className={
              compact
                ? 'h-12 pl-10 text-base'
                : 'postcode-home-input h-12 pl-10 text-base'
            }
            maxLength={4}
          />
        </div>

        <Button
          className={
            compact
              ? 'h-12 px-5'
              : 'postcode-submit-button h-12 px-5'
          }
          type="submit"
        >
          {compact ? 'Continue' : 'Find my clean'}
        </Button>
      </div>

      <p
        id="postcode-help"
        className={
          error
            ? 'field-error mt-3'
            : 'field-help mt-3'
        }
        aria-live="polite"
      >
        {error }
      </p>

      {error.includes('outside') && (
        <Link
          to="/get-a-quote"
          className="link-line mt-2"
        >
          Request a quote
        </Link>
      )}
    </form>
  );
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
