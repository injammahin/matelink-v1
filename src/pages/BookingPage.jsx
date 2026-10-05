import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Link,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

import {
  BedDouble,
  Bath,
  Check,
  MapPin,
  Sparkles,
  CalendarDays,
  Clock,
  ShieldCheck,
  Pencil,
  ChevronDown,
  X,
  ReceiptText,
  Waves,
  AppWindow,
  Warehouse,
  Fence,
  Sun,
  Building2,
  Building,
  Refrigerator,
  PanelsTopLeft,
  KeyRound,
} from 'lucide-react';

import {
  toast,
} from 'sonner';

import {
  Button,
} from '@/components/ui/button';

import {
  Card,
} from '@/components/ui/card';

import {
  Label,
} from '@/components/ui/label';

import {
  Textarea,
} from '@/components/ui/textarea';

import {
  Checkbox,
} from '@/components/ui/checkbox';

import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';

import {
  Calendar,
} from '@/components/ui/calendar';

import {
  PostcodeCheck,
} from '@/components/SiteLayout';

import {
  Counter,
  FormField,
  FieldSelect,
} from '@/components/Shared';

import {
  useApp,
} from '@/context/AppContext';

import {
  services,
} from '@/data/content';

import {
  availableAddons,
  amountLabel,
  calculateAddonAmount,
  calculatePrice,
  getServiceRates,
  postcodeAvailability,
} from '@/lib/pricing';

import {
  localISODate,
  formatDate,
} from '@/lib/dates';


/* =========================================================
   STEPS
   ========================================================= */

const steps = [
  'Your clean',
  'Services',
  'Add-on',
  'Your date',
  'About you',
  'Review',
];


const stepTitles = [
  'What kind of fresh start?',
  'Choose your service details.',
  'Choose your add-ons.',
  'When works for you?',
  'A few details about you.',
  'Everything look right?',
];


const stepDescriptions = [
  'Choose the clean that fits this moment.',

  'Tell us how many bedrooms and bathrooms need cleaning.',

  'Choose any optional add-ons for your selected clean.',

  'This is your preferred date, subject to Matelink’s confirmation.',

  'We’ll use these details to review and confirm your request.',

  'Review your request. There’s no payment at this stage.',
];


/* =========================================================
   ADD-ON ICONS
   ========================================================= */

const addonIcons = {
  carpet: Waves,

  windows: AppWindow,

  garage: Warehouse,

  deck: Fence,

  patio: Sun,

  'small-balcony': Building2,

  'large-balcony': Building,

  fridge: Refrigerator,

  blinds: PanelsTopLeft,

  keys: KeyRound,
};


function getAddonIcon(addonId) {
  return (
    addonIcons[addonId] ||
    Sparkles
  );
}
/* =========================================================
   DEFAULT DRAFT
   ========================================================= */

function defaultDraft(params) {
  let stored;

  try {
    stored = JSON.parse(
      sessionStorage.getItem(
        'matelink.booking-draft'
      )
    );
  } catch {
    /*
     * Ignore invalid stored data.
     */
  }

  const queryService =
    params.get('service');

  const service =
    services.some(
      (item) =>
        item.id === queryService
    )
      ? queryService
      : stored?.service ||
        'deep';

  return {
    service,

    bedrooms:
      stored?.bedrooms ?? 0,

    bathrooms:
      stored?.bathrooms ?? 0,

    addons:
      queryService &&
      queryService !==
        stored?.service
        ? {}
        : stored?.addons || {},

    postcode:
      params.get('postcode') ||
      stored?.postcode ||
      '',

    date:
      stored?.date || '',

    time:
      stored?.time || '',

    customer:
      stored?.customer || {
        name: '',
        email: '',
        mobile: '',
        address: '',
        notes: '',
      },
  };
}


/* =========================================================
   SUMMARY CARD
   ========================================================= */

function BookingSummaryCard({
  draft,
  settings,
  estimate,
}) {
  const service = services.find(
    (item) => item.id === draft.service
  );

  if (!service) {
    return null;
  }

  return (
    <Card className="booking-summary-card gap-0 overflow-hidden p-0 shadow-none">
      <div className="booking-summary-content">

        {/* =========================================
            TITLE
        ========================================== */}

        <p className="eyebrow !text-xs">
          Your clean, at a glance
        </p>

        <h2 className="booking-summary-service-name">
          {service.name}
        </h2>


        {/* =========================================
            BOOKING DETAILS
        ========================================== */}

        <div className="booking-summary-details">

          {/* POSTCODE */}

          <p className="booking-summary-detail-row">
            <MapPin
              size={16}
              className="shrink-0"
            />

            <span>
              {draft.postcode || 'Your postcode'}
            </span>
          </p>


          {/* SERVICE DETAILS */}

          <p className="booking-summary-detail-row">
            <BedDouble
              size={16}
              className="shrink-0"
            />

            <span>
              {draft.bedrooms} bedroom{Number(draft.bedrooms) === 1 ? '' : 's'}
              {' · '}
              {draft.bathrooms} bathroom{Number(draft.bathrooms) === 1 ? '' : 's'}
            </span>
          </p>


          {/* DATE */}

          <p className="booking-summary-detail-row">
            <CalendarDays
              size={16}
              className="shrink-0"
            />

            <span>
              {draft.date
                ? formatDate(draft.date)
                : 'Choose a preferred date'}
            </span>
          </p>


          {/* TIME */}

          {draft.time && (
            <p className="booking-summary-detail-row">
              <Clock
                size={16}
                className="shrink-0"
              />

              <span>
                {draft.time}
              </span>
            </p>
          )}

        </div>


        {/* =========================================
            PRICE BREAKDOWN
        ========================================== */}

        <div className="booking-price-breakdown">

          {estimate.items.map((item) => (
            <div
              key={item.id || item.label}
              className="booking-price-line"
            >
              <span>
                {item.label}
              </span>

              <strong>
                {item.amount === null ||
                item.amount === undefined
                  ? '—'
                  : amountLabel(item.amount)}
              </strong>
            </div>
          ))}

        </div>


        {/* =========================================
            TOTAL
        ========================================== */}

        <div className="booking-summary-total">

          <div className="booking-summary-total-row">

            <span className="booking-summary-total-label">
              Estimated total
            </span>

            <strong
              className="booking-summary-total-price"
              aria-live="polite"
            >
              {estimate.ready
                ? amountLabel(estimate.total)
                : 'To be confirmed'}
            </strong>

          </div>

        </div>

      </div>
    </Card>
  );
}


/* =========================================================
   MOBILE STICKY ESTIMATE + DRAWER
   ========================================================= */

function MobileBookingSummary({
  draft,
  settings,
  estimate,
}) {
  /*
  |--------------------------------------------------------------------------
  | open
  |--------------------------------------------------------------------------
  |
  | Controls visual open/closed state.
  |
  */

  const [open, setOpen] =
    useState(false);


  /*
  |--------------------------------------------------------------------------
  | mounted
  |--------------------------------------------------------------------------
  |
  | We keep the drawer mounted while the closing animation is playing.
  |
  | Without this, React removes the drawer instantly and CSS never gets
  | enough time to animate the drawer back upward.
  |
  */

  const [mounted, setMounted] =
    useState(false);


  const touchStartY =
    useRef(null);


  const closeTimer =
    useRef(null);


  /* =========================================================
     OPEN DRAWER
     ========================================================= */

  function openDrawer() {
    /*
     * First mount it.
     */

    setMounted(true);


    /*
     * Then on the next animation frame change its visual state.
     *
     * Two requestAnimationFrame calls make sure the browser has
     * painted the closed position before transitioning to open.
     */

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setOpen(true);
      });
    });
  }


  /* =========================================================
     CLOSE DRAWER
     ========================================================= */

  function closeDrawer() {
    /*
     * Start CSS closing transition.
     */

    setOpen(false);


    /*
     * Keep it in the DOM until the transition finishes.
     *
     * CSS transition below = 520ms
     * We give React slightly more time = 560ms.
     */

    window.clearTimeout(
      closeTimer.current
    );


    closeTimer.current =
      window.setTimeout(() => {
        setMounted(false);
      }, 560);
  }


  /* =========================================================
     CLEAN TIMER
     ========================================================= */

  useEffect(() => {
    return () => {
      window.clearTimeout(
        closeTimer.current
      );
    };
  }, []);


  /* =========================================================
     BODY LOCK + ESCAPE
     ========================================================= */

  useEffect(() => {
    if (!mounted) {
      return undefined;
    }


    const oldOverflow =
      document.body.style.overflow;


    /*
     * Prevent page scrolling behind the open drawer.
     */

    document.body.style.overflow =
      'hidden';


    function handleKeyDown(
      event
    ) {
      if (
        event.key === 'Escape'
      ) {
        closeDrawer();
      }
    }


    document.addEventListener(
      'keydown',
      handleKeyDown
    );


    return () => {
      document.body.style.overflow =
        oldOverflow;


      document.removeEventListener(
        'keydown',
        handleKeyDown
      );
    };
  }, [mounted]);


  /* =========================================================
     SWIPE START
     ========================================================= */

  function handleTouchStart(
    event
  ) {
    touchStartY.current =
      event.touches?.[0]
        ?.clientY ?? null;
  }


  /* =========================================================
     SWIPE END
     ========================================================= */

  function handleTouchEnd(
    event
  ) {
    if (
      touchStartY.current ===
      null
    ) {
      return;
    }


    const endY =
      event.changedTouches?.[0]
        ?.clientY;


    if (
      typeof endY ===
      'number'
    ) {
      const movement =
        touchStartY.current -
        endY;


      /*
       * Swipe UP by 55px or more.
       */

      if (movement > 55) {
        closeDrawer();
      }
    }


    touchStartY.current =
      null;
  }


  return (
    <>

      {/* =====================================================
          COMPACT STICKY ESTIMATE BAR
      ====================================================== */}

      <div className="mobile-estimate-sticky">

        <button
          type="button"
          className="mobile-estimate-button"
          onClick={openDrawer}
          aria-expanded={open}
          aria-label="Open booking price summary"
        >

          <div className="min-w-0 text-left">

            <span className="mobile-estimate-label">
              Estimated total
            </span>


            <strong className="mobile-estimate-price">

              {estimate.ready
                ? amountLabel(
                    estimate.total
                  )
                : 'To be confirmed'}

            </strong>

          </div>


          <span className="mobile-estimate-view">

            View summary

            <ChevronDown
              size={17}
            />

          </span>

        </button>

      </div>


      {/* =====================================================
          MOBILE DRAWER
      ====================================================== */}

      {mounted && (

        <div
          className={`mobile-summary-overlay ${
            open
              ? 'is-open'
              : 'is-closing'
          }`}
          onClick={
            closeDrawer
          }
          role="presentation"
        >

          <section
            className={`mobile-summary-drawer ${
              open
                ? 'is-open'
                : 'is-closing'
            }`}
            role="dialog"
            aria-modal="true"
            aria-label="Booking summary"

            onClick={(event) =>
              event.stopPropagation()
            }

            onTouchStart={
              handleTouchStart
            }

            onTouchEnd={
              handleTouchEnd
            }
          >

            {/* =============================================
                SWIPE HANDLE
            ============================================== */}

            <button
              type="button"
              className="mobile-summary-handle-area"
              onClick={closeDrawer}
              aria-label="Close booking summary"
            >

              <span
                className="mobile-summary-handle"
                aria-hidden="true"
              />

            </button>


            {/* =============================================
                DRAWER HEADER
            ============================================== */}

            <div className="mobile-summary-drawer-header">

              <div>

                <p className="text-xs font-bold uppercase tracking-wider text-primary">
                  Your estimate
                </p>


                <p className="mt-1 text-xl font-semibold">

                  {estimate.ready
                    ? amountLabel(
                        estimate.total
                      )
                    : 'To be confirmed'}

                </p>

              </div>


              <button
                type="button"
                className="mobile-summary-close"
                aria-label="Close summary"
                onClick={
                  closeDrawer
                }
              >

                <X size={20} />

              </button>

            </div>


            {/* =============================================
                FULL SUMMARY
            ============================================== */}

            <div className="mobile-summary-drawer-scroll">

              <BookingSummaryCard
                draft={draft}
                settings={settings}
                estimate={estimate}
              />

            </div>

          </section>

        </div>

      )}

    </>
  );
}


/* =========================================================
   BOOKING PAGE
   ========================================================= */

export default function BookingPage() {

  const [params] =
    useSearchParams();

  const {
    settings,
    createBooking,
  } = useApp();


  const [draft, setDraft] =
    useState(() =>
      defaultDraft(params)
    );


  const [
    postcodeChecked,
    setPostcodeChecked,
  ] = useState(() =>
    [
      'available',
      'review',
    ].includes(
      postcodeAvailability(
        defaultDraft(
          params
        ).postcode,
        settings
      )
    )
  );


  const [step, setStep] =
    useState(0);

  const [errors, setErrors] =
    useState({});

  const [consent, setConsent] =
    useState(false);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);


  const heading =
    useRef(null);

  const navigate =
    useNavigate();


  /* ---------------------------------------------------------
     LIVE PRICE
  --------------------------------------------------------- */

  const estimate =
    calculatePrice(
      draft,
      settings
    );


  const extras =
    availableAddons(
      settings,
      draft.service
    );


  const selectedExtras =
    extras.filter(
      (addon) =>
        Number(
          draft.addons?.[
            addon.id
          ] || 0
        ) > 0
    );


  /* =========================================================
     SAVE DRAFT
     ========================================================= */

  useEffect(() => {
    try {
      sessionStorage.setItem(
        'matelink.booking-draft',
        JSON.stringify(draft)
      );
    } catch {
      /*
       * In-memory state still works.
       */
    }
  }, [draft]);


  /* =========================================================
     PATCH
     ========================================================= */

  function patch(values) {
    setDraft(
      (previous) => ({
        ...previous,
        ...values,
      })
    );

    setErrors({});
  }


  function patchCustomer(
    field,
    value
  ) {
    setDraft(
      (previous) => ({
        ...previous,

        customer: {
          ...previous.customer,

          [field]: value,
        },
      })
    );

    setErrors(
      (previous) => ({
        ...previous,

        [field]: undefined,
      })
    );
  }


  /* =========================================================
     CHANGE STEP
     ========================================================= */

  function changeStep(next) {
    setStep(next);

    setErrors({});

    requestAnimationFrame(() => {
      heading.current?.focus();

      heading.current?.scrollIntoView(
        {
          block: 'start',
          behavior: 'smooth',
        }
      );
    });
  }


  /* =========================================================
     VALIDATE
     ========================================================= */

  function validate() {
    const found = {};


    if (step === 0) {
      const rates =
        getServiceRates(
          settings,
          draft.service
        );

      if (!rates.active) {
        found.general =
          'This service is not currently available. Please choose another service or request a quote.';
      }
    }


    if (step === 3) {
      if (
        !draft.date ||
        draft.date <
          localISODate()
      ) {
        found.date =
          'Please choose today or a future preferred date.';
      }

      if (!draft.time) {
        found.time =
          'Choose your preferred time window.';
      }
    }


    if (step === 4) {
      if (
        draft.customer.name
          .trim()
          .length < 2
      ) {
        found.name =
          'Enter your full name.';
      }

      if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          draft.customer.email.trim()
        )
      ) {
        found.email =
          'Enter a valid email address.';
      }

      const digits =
        draft.customer.mobile.replace(
          /\D/g,
          ''
        );

      if (
        digits.length < 8 ||
        digits.length > 15
      ) {
        found.mobile =
          'Enter a valid mobile number.';
      }

      if (
        draft.customer.address
          .trim()
          .length < 5
      ) {
        found.address =
          'Enter the address to be cleaned.';
      }
    }


    if (
      step === 5 &&
      !consent
    ) {
      found.consent =
        'Please acknowledge the request and privacy details before continuing.';
    }


    setErrors(found);

    return (
      Object.keys(found).length ===
      0
    );
  }


  /* =========================================================
     NEXT
     ========================================================= */

  function next() {
    if (validate()) {
      changeStep(
        step + 1
      );
    }
  }


  /* =========================================================
     SUBMIT
     ========================================================= */

  function submit() {
    if (
      !validate() ||
      submitting
    ) {
      return;
    }

    setSubmitting(true);

    try {
      const booking =
        createBooking(draft);

      sessionStorage.removeItem(
        'matelink.booking-draft'
      );

      navigate(
        `/booking/${booking.token}?requested=1`
      );
    } catch {
      toast.error(
        'Your preview request could not be saved. Please try again.'
      );

      setSubmitting(false);
    }
  }


  /* =========================================================
     PAGE
     ========================================================= */

  return (
    <div className="bg-muted pb-20">

      <div className="container-site pt-6">

        {/* INTRO */}

        <div className="mb-5">

          <p className="eyebrow mb-2">
            A fresh start, made simple
          </p>
{/* 
          <h1 className="text-3xl sm:text-4xl">
            Let’s make it your clean.
          </h1>

          <p className="body-copy mt-4 text-sm">
            Choose what your home
            needs. We’ll confirm the
            details personally.
          </p> */}

        </div>


        {/* =====================================================
            POSTCODE FIRST
        ====================================================== */}

        {!postcodeChecked ? (

          <div className="mx-auto grid max-w-4xl gap-8 rounded-2xl border bg-white p-7 sm:grid-cols-[1fr_.8fr] sm:p-10">

            <div>

              <div className="icon-square mb-6">
                <MapPin size={24} />
              </div>

              <h2 className="mb-3 text-2xl">
                First, where’s your
                home?
              </h2>

              <p className="body-copy mb-7 text-sm">
                Your postcode helps us
                check the service area
                before you start.
              </p>

              <PostcodeCheck
                compact
                initialValue={
                  draft.postcode
                }
                onValid={(code) => {
                  patch({
                    postcode: code,
                  });

                  setPostcodeChecked(
                    true
                  );
                }}
              />

            </div>


            <img
              className="hidden h-full max-h-80 w-full rounded-xl object-cover sm:block"
              src="/images/hero.webp"
              alt="Calm light-filled living space"
            />

          </div>

        ) : (

          <>

            {/* POSTCODE STATUS */}

            <div className="mb-7 flex flex-wrap items-center gap-3 text-sm">

              <span className="inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2">

                <MapPin
                  size={15}
                  className="text-primary"
                />

                Postcode{' '}
                {draft.postcode}

                <button
                  type="button"
                  className="ml-1 underline underline-offset-4"
                  onClick={() =>
                    setPostcodeChecked(
                      false
                    )
                  }
                  aria-label="Change postcode"
                >
                  Change
                </button>

              </span>


              <span className="text-muted-foreground">

                {postcodeAvailability(
                  draft.postcode,
                  settings
                ) === 'available'
                  ? 'Within the configured service area'
                  : 'Service availability will be confirmed with your request'}

              </span>

            </div>


            {/* =================================================
                MOBILE STICKY ESTIMATE
            ================================================== */}

            <MobileBookingSummary
              draft={draft}
              settings={settings}
              estimate={estimate}
            />


            {/* =================================================
                BOOKING LAYOUT
            ================================================== */}

            <div className="booking-layout">

              {/* LEFT */}

              <div className="min-w-0">

                {/* PROGRESS */}

                <div
                  className="step-track"
                  aria-label="Booking progress"
                >

                  {steps.map(
                    (
                      label,
                      index
                    ) => (

                      <div
                        className={`step-item ${
                          index === step
                            ? 'current'
                            : ''
                        } ${
                          index < step
                            ? 'done'
                            : ''
                        }`}
                        key={label}
                        aria-current={
                          index === step
                            ? 'step'
                            : undefined
                        }
                      >

                        <span className="step-circle">

                          {index <
                          step ? (
                            <Check
                              size={15}
                            />
                          ) : (
                            index + 1
                          )}

                        </span>

                        <span>
                          {label}
                        </span>

                      </div>

                    )
                  )}

                </div>


                {/* =================================================
                    STEP CARD
                ================================================== */}

                <section
                  className="surface booking-surface fade-in"
                  key={step}
                >

                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-primary">
                    Step {step + 1} of 6
                  </p>

                  <h2
                    ref={heading}
                    tabIndex={-1}
                    className="mb-3 text-2xl outline-none sm:text-3xl"
                  >
                    {stepTitles[step]}
                  </h2>

                  <p className="body-copy mb-7 text-sm">
                    {
                      stepDescriptions[
                        step
                      ]
                    }
                  </p>


                  {/* =============================================
                      STEP 1 - SERVICE
                  ============================================== */}

                  {step === 0 && (

                      <RadioGroup
                        value={draft.service}
                        onValueChange={(value) =>
                          patch({
                            service: value,

                            // Start service details from zero.
                            bedrooms: 0,
                            bathrooms: 0,

                            // Add-ons belong to the previous service,
                            // so reset them too.
                            addons: {},
                          })
                        }
                        aria-label="Cleaning service"
                        className="gap-3"
                      >

                      {services.map(
                        (service) => {
                          const rates =
                            getServiceRates(
                              settings,
                              service.id
                            );

                          return (

                            <Label
                              key={
                                service.id
                              }
                              htmlFor={`service-${service.id}`}
                              className="option-card service-choice-card cursor-pointer"
                              data-selected={
                                draft.service ===
                                service.id
                              }
                            >

                              <img
                                className="h-16 w-20 shrink-0 rounded-lg object-cover"
                                src={
                                  service.image
                                }
                                alt=""
                              />


                              <div className="min-w-0 flex-1">

                                <p className="text-base font-semibold">
                                  {
                                    service.name
                                  }
                                </p>

                                <p className="field-help mt-1">
                                  {
                                    service.ideal
                                  }

                                  {!rates.active &&
                                    ' · Currently unavailable'}
                                </p>

                              </div>


                              <RadioGroupItem
                                id={`service-${service.id}`}
                                value={
                                  service.id
                                }
                                disabled={
                                  !rates.active
                                }
                              />

                            </Label>

                          );
                        }
                      )}

                    </RadioGroup>

                  )}


                  {/* =============================================
                      STEP 2 - SERVICES
                  ============================================== */}

                  {step === 1 && (
                    <>
                      <div>
                        <Counter
                          icon={BedDouble}
                          label="Bedrooms"
                          helper="Studio? Select 0 bedrooms."
                          value={draft.bedrooms}
                          min={0}
                          max={8}
                          onChange={(bedrooms) =>
                            patch({
                              bedrooms,
                            })
                          }
                        />

                        <Counter
                          icon={Bath}
                          label="Bathrooms"
                          helper="Select the number of bathrooms."
                          value={draft.bathrooms}
                          min={0}
                          max={8}
                          onChange={(bathrooms) =>
                            patch({
                              bathrooms,
                            })
                          }
                        />
                      </div>

                      <div className="booking-inline-total">
                        <span>
                          Current estimate
                        </span>

                        <strong>
                          {estimate.ready
                            ? amountLabel(
                                estimate.total
                              )
                            : 'To be confirmed'}
                        </strong>
                      </div>

                      <p className="field-help mt-5">
                        Larger or unusual cleaning requirement?{' '}

                        <Link
                          to="/get-a-quote"
                          className="font-semibold text-primary underline"
                        >
                          Request a tailored quote.
                        </Link>
                      </p>
                    </>
                  )}


                  {/* =============================================
                      STEP 3 - ADD-ON
                  ============================================== */}

                  {step === 2 && (
                    <>
                      {extras.length > 0 ? (
                        <div className="addon-grid">

                          {extras.map((extra) => {
                            const quantity = Number(
                              draft.addons?.[extra.id] || 0
                            );

                            const selected =
                              quantity > 0;

                            const lineTotal =
                              calculateAddonAmount(
                                extra,
                                quantity
                              );
                            
                            const AddonIcon =
                               getAddonIcon(extra.id);


                            /*
                            * Optional unit label.
                            *
                            * If your addon already has a unit,
                            * use it.
                            *
                            * Otherwise use "item".
                            */
                            const unit =
                              extra.unit ||
                              'item';


                            return (
                              <div
                                key={extra.id}
                                className={`booking-addon-card ${
                                  selected
                                    ? 'is-selected'
                                    : ''
                                }`}
                              >

                                {/* =================================
                                    TITLE + CHECKBOX
                                ================================== */}

                              <div className="flex items-start justify-between gap-4">

                                <Label
                                  htmlFor={`extra-${extra.id}`}
                                  className="flex min-w-0 flex-1 cursor-pointer items-start gap-3"
                                >

                                  {/* ICON */}

                                  <span className="addon-card-icon">
                                    <AddonIcon
                                      size={20}
                                      strokeWidth={1.8}
                                    />
                                  </span>


                                  {/* TEXT */}

                                  <span className="min-w-0 flex-1">

                                    <span className="block text-sm font-semibold">
                                      {extra.name}
                                    </span>

                                    <span className="field-help mt-2 block">
                                      {extra.description}
                                    </span>

                                  </span>

                                </Label>


                                {/* CHECKBOX */}

                                <Checkbox
                                  id={`extra-${extra.id}`}
                                  checked={quantity > 0}
                                  onCheckedChange={(checked) =>
                                    patch({
                                      addons: {
                                        ...draft.addons,

                                        [extra.id]:
                                          checked
                                            ? 1
                                            : 0,
                                      },
                                    })
                                  }
                                />

                              </div>


                                {/* =================================
                                    PRICE
                                ================================== */}

                                <div className="addon-price-row">

                                  <span>
                                    {amountLabel(
                                      extra.price
                                    )}{' '}
                                    / {unit}
                                  </span>


                                  {selected &&
                                    lineTotal !== null && (
                                      <strong>
                                        {amountLabel(
                                          lineTotal
                                        )}
                                      </strong>
                                    )}

                                </div>


                                {/* =================================
                                    QUANTITY FOR EVERY ADD-ON
                                ================================== */}

                                {selected && (
                                  <div className="addon-quantity-section">

                                    <Counter
                                      label="Quantity"
                                      value={quantity}
                                      min={0}
                                      max={30}
                                      onChange={(
                                        value
                                      ) => {
                                        patch({
                                          addons: {
                                            ...draft.addons,

                                            [extra.id]:
                                              value,
                                          },
                                        });
                                      }}
                                    />

                                  </div>
                                )}

                              </div>
                            );
                          })}

                        </div>
                      ) : (
                        <div className="rounded-xl bg-secondary p-7">

                          <Sparkles
                            className="mb-4 text-primary"
                            size={25}
                          />

                          <h3 className="text-xl">
                            Keep it simple, or tell us more.
                          </h3>

                          <p className="body-copy mt-3 text-sm">
                            You can share any special
                            requirements in your notes,
                            or request a tailored quote
                            for extra work.
                          </p>

                          <Button
                            asChild
                            variant="outline"
                            className="mt-5"
                          >
                            <Link to="/get-a-quote">
                              Get a tailored quote
                            </Link>
                          </Button>

                        </div>
                      )}


                      {/* =========================================
                          TOTAL
                      ========================================== */}

                      <div className="booking-inline-total">

                        <span>
                          Estimated total
                        </span>

                        <strong>
                          {estimate.ready
                            ? amountLabel(
                                estimate.total
                              )
                            : 'To be confirmed'}
                        </strong>

                      </div>


                      <p className="field-help mt-5">
                        Add-ons are optional. You can
                        continue with just your selected
                        clean.
                      </p>

                    </>
                  )}


                  {/* =============================================
                      STEP 4 - DATE
                  ============================================== */}

                  {step === 3 && (

                    <div className="grid gap-6 lg:grid-cols-[1.05fr_.95fr]">

                      <div className="rounded-xl border p-3">

                        <Calendar
                          mode="single"
                          selected={
                            draft.date
                              ? new Date(
                                  `${draft.date}T12:00:00`
                                )
                              : undefined
                          }
                          onSelect={(
                            date
                          ) =>
                            patch({
                              date: date
                                ? localISODate(
                                    date
                                  )
                                : '',
                            })
                          }
                          disabled={{
                            before:
                              new Date(
                                new Date().setHours(
                                  0,
                                  0,
                                  0,
                                  0
                                )
                              ),
                          }}
                          defaultMonth={
                            draft.date
                              ? new Date(
                                  `${draft.date}T12:00:00`
                                )
                              : new Date()
                          }
                          className="w-full [--cell-size:2.4rem]"
                          weekStartsOn={
                            1
                          }
                          required
                          aria-label="Choose your preferred cleaning date"
                        />

                      </div>


                      <div>

                        <FormField
                          id="preferred-date"
                          label="Preferred date"
                          type="date"
                          min={
                            localISODate()
                          }
                          value={
                            draft.date
                          }
                          onChange={(
                            event
                          ) =>
                            patch({
                              date: event
                                .target
                                .value,
                            })
                          }
                          error={
                            errors.date
                          }
                        />


                        <div className="mt-5">

                          <FieldSelect
                            id="preferred-time"
                            label="Preferred time"
                            value={
                              draft.time
                            }
                            onChange={(
                              time
                            ) =>
                              patch({
                                time,
                              })
                            }
                            options={[
                              'Morning (8 am – 12 pm)',
                              'Afternoon (12 pm – 5 pm)',
                              'Flexible',
                            ].map(
                              (
                                value
                              ) => ({
                                label:
                                  value,

                                value,
                              })
                            )}
                          />

                          {errors.time && (
                            <p className="field-error mt-2">
                              {
                                errors.time
                              }
                            </p>
                          )}

                        </div>


                        <div className="mt-6 rounded-lg bg-secondary p-4">

                          <p className="flex items-center gap-2 text-sm font-semibold">

                            <CalendarDays
                              size={17}
                              className="text-primary"
                            />

                            A preference,
                            not a
                            reservation

                          </p>

                          <p className="field-help mt-2">
                            Matelink checks
                            availability
                            and agrees the
                            final date and
                            time with you.
                          </p>

                        </div>

                      </div>

                    </div>

                  )}


                  {/* =============================================
                      STEP 5 - CUSTOMER DETAILS
                  ============================================== */}

                  {step === 4 && (

                    <div className="grid gap-5 sm:grid-cols-2">

                      <FormField
                        id="customer-name"
                        label="Full name"
                        autoComplete="name"
                        value={
                          draft.customer
                            .name
                        }
                        onChange={(
                          event
                        ) =>
                          patchCustomer(
                            'name',
                            event.target
                              .value
                          )
                        }
                        error={
                          errors.name
                        }
                      />


                      <FormField
                        id="customer-mobile"
                        label="Mobile number"
                        type="tel"
                        autoComplete="tel"
                        value={
                          draft.customer
                            .mobile
                        }
                        onChange={(
                          event
                        ) =>
                          patchCustomer(
                            'mobile',
                            event.target
                              .value
                          )
                        }
                        error={
                          errors.mobile
                        }
                      />


                      <FormField
                        id="customer-email"
                        label="Email address"
                        type="email"
                        autoComplete="email"
                        className="sm:col-span-2"
                        value={
                          draft.customer
                            .email
                        }
                        onChange={(
                          event
                        ) =>
                          patchCustomer(
                            'email',
                            event.target
                              .value
                          )
                        }
                        error={
                          errors.email
                        }
                      />


                      <FormField
                        id="customer-address"
                        label="Property address"
                        autoComplete="street-address"
                        className="sm:col-span-2"
                        value={
                          draft.customer
                            .address
                        }
                        onChange={(
                          event
                        ) =>
                          patchCustomer(
                            'address',
                            event.target
                              .value
                          )
                        }
                        error={
                          errors.address
                        }
                      />


                      <div className="sm:col-span-2">

                        <Label
                          className="input-label mb-2 block"
                          htmlFor="customer-notes"
                        >
                          Anything we
                          should know?{' '}

                          <span className="font-normal text-muted-foreground">
                            (optional)
                          </span>
                        </Label>


                        <Textarea
                          id="customer-notes"
                          className="min-h-28 bg-white"
                          placeholder="Access, parking, pets or areas that need extra care…"
                          value={
                            draft.customer
                              .notes
                          }
                          onChange={(
                            event
                          ) =>
                            patchCustomer(
                              'notes',
                              event.target
                                .value
                            )
                          }
                          maxLength={
                            2500
                          }
                        />

                      </div>

                    </div>

                  )}


                  {/* =============================================
                      STEP 6 - REVIEW
                  ============================================== */}

                  {step === 5 && (

                    <>

                      <div className="space-y-5">

                        {/* CLEAN */}

                        <ReviewBlock
                          title="Your clean"
                          onEdit={() =>
                            changeStep(
                              0
                            )
                          }
                        >

                          <p>
                            {
                              services.find(
                                (
                                  service
                                ) =>
                                  service.id ===
                                  draft.service
                              )?.name
                            }
                          </p>

                          <p className="text-muted-foreground">
                            {draft.bedrooms}{' '}
                            bedroom{Number(draft.bedrooms) === 1 ? '' : 's'}
                            {' · '}
                            {draft.bathrooms}{' '}
                            bathroom{Number(draft.bathrooms) === 1 ? '' : 's'}
                          </p>


                          {selectedExtras.length >
                            0 && (

                            <div className="mt-3">

                              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Add-ons
                              </p>

                              {selectedExtras.map(
                                (
                                  addon
                                ) => {
                                  const quantity =
                                    Number(
                                      draft
                                        .addons[
                                        addon
                                          .id
                                      ] ||
                                        0
                                    );

                                  return (

                                    <p
                                      key={addon.id}
                                      className="text-muted-foreground"
                                    >
                                      {addon.name} × {quantity}
                                    </p>

                                  );
                                }
                              )}

                            </div>

                          )}

                        </ReviewBlock>


                        {/* DATE */}

                        <ReviewBlock
                          title="Preferred date"
                          onEdit={() =>
                            changeStep(
                              3
                            )
                          }
                        >

                          <p>
                            {formatDate(
                              draft.date
                            )}{' '}
                            ·{' '}
                            {draft.time}
                          </p>

                        </ReviewBlock>


                        {/* CUSTOMER */}

                        <ReviewBlock
                          title="Your details"
                          onEdit={() =>
                            changeStep(
                              4
                            )
                          }
                        >

                          <p>
                            {
                              draft.customer
                                .name
                            }
                          </p>

                          <p className="break-words text-muted-foreground">
                            {
                              draft.customer
                                .email
                            }{' '}
                            ·{' '}
                            {
                              draft.customer
                                .mobile
                            }
                          </p>

                          <p className="text-muted-foreground">
                            {
                              draft.customer
                                .address
                            }
                            ,{' '}
                            {
                              draft.postcode
                            }
                          </p>

                          {draft.customer
                            .notes && (

                            <p className="mt-2 text-muted-foreground">
                              {
                                draft
                                  .customer
                                  .notes
                              }
                            </p>

                          )}

                        </ReviewBlock>


                        {/* =========================================
                            REVIEW PRICE
                        ========================================== */}

                        <div className="review-estimate-card">

                          <div className="review-estimate-heading">

                            <div>

                              <p className="text-sm font-semibold">
                                Your
                                estimated
                                total
                              </p>

                              <p className="mt-1 text-xs text-muted-foreground">
                                Based on
                                your
                                selected
                                cleaning details
                                and add-ons.
                              </p>

                            </div>

                            <ReceiptText
                              size={22}
                              className="text-primary"
                            />

                          </div>


                          <div className="review-estimate-lines">

                            {estimate.items.map(
                              (
                                item
                              ) => (

                                <div
                                  key={
                                    item.id ||
                                    item.label
                                  }
                                  className="review-estimate-line"
                                >

                                  <span>
                                    {
                                      item.label
                                    }
                                  </span>

                                  <strong>
                                    {item.amount ===
                                      null ||
                                    item.amount ===
                                      undefined
                                      ? '—'
                                      : amountLabel(
                                          item.amount
                                        )}
                                  </strong>

                                </div>

                              )
                            )}

                          </div>


                          <div className="review-estimate-total">

                            <span>
                              Estimated
                              total
                            </span>

                            <strong>
                              {estimate.ready
                                ? amountLabel(
                                    estimate.total
                                  )
                                : 'To be confirmed'}
                            </strong>

                          </div>


                          <p className="field-help mt-4">
                            This estimate
                            updates from
                            the options
                            you selected.
                            Matelink can
                            review the
                            final scope
                            before
                            confirmation.
                          </p>

                        </div>

                      </div>


                      {/* CONSENT */}

                      <div className="mt-6 flex items-start gap-3">

                        <Checkbox
                          id="booking-consent"
                          className="mt-1"
                          checked={
                            consent
                          }
                          onCheckedChange={(
                            value
                          ) => {
                            setConsent(
                              value ===
                                true
                            );

                            setErrors(
                              {}
                            );
                          }}
                          aria-invalid={
                            !!errors.consent
                          }
                        />

                        <Label
                          className="block text-sm font-normal leading-relaxed"
                          htmlFor="booking-consent"
                        >
                          I understand
                          this is a
                          booking
                          request, and
                          my date and
                          price require
                          confirmation.
                          I acknowledge
                          the{' '}

                          <Link
                            className="text-primary underline"
                            to="/terms"
                            target="_blank"
                          >
                            terms
                          </Link>

                          {' '}and{' '}

                          <Link
                            className="text-primary underline"
                            to="/privacy"
                            target="_blank"
                          >
                            privacy
                            details
                          </Link>
                          .
                        </Label>

                      </div>


                      {errors.consent && (
                        <p className="field-error mt-3">
                          {
                            errors.consent
                          }
                        </p>
                      )}

                    </>

                  )}


                  {/* GENERAL ERROR */}

                  {errors.general && (
                    <p
                      className="field-error mt-4"
                      role="alert"
                    >
                      {
                        errors.general
                      }
                    </p>
                  )}


                  {/* =============================================
                      BUTTONS
                  ============================================== */}

                  <div className="mt-8 flex items-center justify-between gap-4 border-t pt-6">

                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() =>
                        step === 0
                          ? setPostcodeChecked(
                              false
                            )
                          : changeStep(
                              step - 1
                            )
                      }
                    >
                      Back
                    </Button>


                    {step < 5 ? (

                      <Button
                        type="button"
                        className="h-12 px-7"
                        onClick={next}
                      >
                        Continue
                      </Button>

                    ) : (

                      <Button
                        type="button"
                        className="h-12 px-5 text-xs sm:px-7 sm:text-sm"
                        disabled={
                          submitting
                        }
                        onClick={
                          submit
                        }
                      >
                        {submitting
                          ? 'Saving request…'
                          : 'REQUEST MY CLEAN'}
                      </Button>

                    )}

                  </div>

                </section>


                <p className="field-help mt-5 flex items-center justify-center gap-2">

                  <ShieldCheck
                    size={15}
                  />

                  No upfront payment.

                </p>

              </div>


              {/* =================================================
                  DESKTOP STICKY SUMMARY
              ================================================== */}

              <aside className="booking-summary-column">

                <BookingSummaryCard
                  draft={draft}
                  settings={settings}
                  estimate={estimate}
                />

              </aside>

            </div>

          </>

        )}

      </div>

    </div>
  );
}


/* =========================================================
   REVIEW BLOCK
   ========================================================= */

function ReviewBlock({
  title,
  children,
  onEdit,
}) {
  return (
    <div className="border-b pb-5">

      <div className="mb-3 flex justify-between gap-3">

        <h3 className="text-sm font-semibold tracking-normal">
          {title}
        </h3>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 text-xs text-primary"
          onClick={onEdit}
        >
          <Pencil size={12} />

          Edit
        </Button>

      </div>

      <div className="space-y-1 text-sm">
        {children}
      </div>

    </div>
  );
}