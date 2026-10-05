/*
|--------------------------------------------------------------------------
| Matelink Pricing
|--------------------------------------------------------------------------
|
| During the static frontend/demo phase we use fallback demo prices.
|
| IMPORTANT:
| If a real numeric value exists in settings/admin configuration,
| that value always takes priority over the demo value.
|
| This means you can later connect Laravel/admin pricing without
| rewriting the booking UI.
|
*/


/* =========================================================
   DEMO PRICING
   ========================================================= */

export const DEMO_PRICING = {
  serviceRates: {
    deep: {
      base: 180,
      bedroom: 25,
      bathroom: 35,
    },

    'move-in': {
      base: 220,
      bedroom: 30,
      bathroom: 40,
    },

    'end-of-lease': {
      base: 280,
      bedroom: 35,
      bathroom: 45,
    },
  },

  propertyAdjustments: {
    apartment: 0,
    house: 40,
    townhouse: 25,
  },

  addonPrices: {
    carpet: 35,
    windows: 12,
    garage: 30,
    deck: 45,
    patio: 35,
    'small-balcony': 25,
    'large-balcony': 40,
    fridge: 25,
    blinds: 8,
    keys: 40,
  },
};


/* =========================================================
   HELPERS
   ========================================================= */

export function isRate(value) {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= 0
  );
}


export function amountLabel(value) {
  if (!isRate(value)) {
    return 'To be confirmed';
  }

  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}


function money(value) {
  return Math.round(value * 100) / 100;
}


/* =========================================================
   SERVICE RATE
   ========================================================= */

export function getServiceRates(settings, serviceId) {
  const configured =
    settings?.serviceRates?.[serviceId] || {};

  const demo =
    DEMO_PRICING.serviceRates[serviceId] || {
      base: null,
      bedroom: null,
      bathroom: null,
    };

  return {
    base: isRate(configured.base)
      ? configured.base
      : demo.base,

    bedroom: isRate(configured.bedroom)
      ? configured.bedroom
      : demo.bedroom,

    bathroom: isRate(configured.bathroom)
      ? configured.bathroom
      : demo.bathroom,

    active:
      configured.active !== false,
  };
}


/* =========================================================
   PROPERTY PRICE
   ========================================================= */

export function getPropertyAdjustment(
  settings,
  property
) {
  const configured =
    settings?.propertyAdjustments?.[property];

  if (isRate(configured)) {
    return configured;
  }

  return (
    DEMO_PRICING.propertyAdjustments[
      property
    ] ?? 0
  );
}


/* =========================================================
   ADD-ONS
   ========================================================= */

export function availableAddons(
  settings,
  serviceId
) {
  const group =
    serviceId === 'deep'
      ? 'deep'
      : 'shared';

  return (settings?.addons || [])
    .filter(
      (addon) =>
        addon.active &&
        addon.group === group
    )
    .map((addon) => {
      const demoPrice =
        DEMO_PRICING.addonPrices[
          addon.id
        ];

      return {
        ...addon,

        price: isRate(addon.price)
          ? addon.price
          : isRate(demoPrice)
            ? demoPrice
            : null,
      };
    });
}


/* =========================================================
   ADD-ON LINE TOTAL
   ========================================================= */

export function calculateAddonAmount(
  addon,
  quantity
) {
  const qty = Number(quantity || 0);

  if (
    qty <= 0 ||
    !isRate(addon?.price)
  ) {
    return null;
  }

  return money(
    addon.price *
      (addon.quantity ? qty : 1)
  );
}


/* =========================================================
   COMPLETE BOOKING ESTIMATE
   ========================================================= */

export function calculatePrice(
  draft,
  settings
) {
  const rates = getServiceRates(
    settings,
    draft.service
  );

  const items = [];


  /* ---------------------------------------------------------
     Service
  --------------------------------------------------------- */

  items.push({
    id: 'service-base',

    label: 'Service base',

    amount: rates.base,
  });


  /* ---------------------------------------------------------
     Bedrooms
  --------------------------------------------------------- */

  const bedroomAmount =
    isRate(rates.bedroom)
      ? money(
          rates.bedroom *
            Number(
              draft.bedrooms || 0
            )
        )
      : null;

  items.push({
    id: 'bedrooms',

    label: `${draft.bedrooms} bedroom${
      Number(draft.bedrooms) === 1
        ? ''
        : 's'
    }`,

    amount: bedroomAmount,
  });


  /* ---------------------------------------------------------
     Bathrooms
  --------------------------------------------------------- */

  const bathroomAmount =
    isRate(rates.bathroom)
      ? money(
          rates.bathroom *
            Number(
              draft.bathrooms || 0
            )
        )
      : null;

  items.push({
    id: 'bathrooms',

    label: `${draft.bathrooms} bathroom${
      Number(draft.bathrooms) === 1
        ? ''
        : 's'
    }`,

    amount: bathroomAmount,
  });


  /* ---------------------------------------------------------
     Property
  --------------------------------------------------------- */

  items.push({
    id: 'property',

    label: 'Property adjustment',

    amount:
      getPropertyAdjustment(
        settings,
        draft.property
      ),
  });


  /* ---------------------------------------------------------
     Extras
  --------------------------------------------------------- */

  let knownExtras = 0;

  const addons =
    availableAddons(
      settings,
      draft.service
    );

  for (const addon of addons) {
    const quantity =
      Number(
        draft.addons?.[addon.id] ||
          0
      );

    if (quantity <= 0) {
      continue;
    }

    const amount =
      calculateAddonAmount(
        addon,
        quantity
      );

    items.push({
      id: `addon-${addon.id}`,

      label: addon.quantity
        ? `${addon.name} × ${quantity}`
        : addon.name,

      amount,
    });

    if (isRate(amount)) {
      knownExtras += amount;
    }
  }


  /* ---------------------------------------------------------
     Total
  --------------------------------------------------------- */

  const ready =
    items.every((item) =>
      isRate(item.amount)
    );

  const total = ready
    ? money(
        items.reduce(
          (sum, item) =>
            sum + item.amount,
          0
        )
      )
    : null;


  return {
    ready,
    total,
    items,

    knownExtras:
      money(knownExtras),
  };
}


/* =========================================================
   POSTCODE
   ========================================================= */

export function validPostcode(code) {
  return /^\d{4}$/.test(code);
}


export function postcodeAvailability(
  code,
  settings
) {
  if (!validPostcode(code)) {
    return 'invalid';
  }

  if (
    !settings?.postcodes?.length
  ) {
    return 'review';
  }

  return settings.postcodes.includes(
    code
  )
    ? 'available'
    : 'unavailable';
}