/*
|--------------------------------------------------------------------------
| Matelink Pricing
|--------------------------------------------------------------------------
|
| Static frontend / demo pricing system.
|
| CURRENT PRICING RULE:
|
| Estimated Total =
|
| Bedrooms
| + Bathrooms
| + Selected Add-ons
|
| There is NO:
| - Service base price
| - Apartment / House / Townhouse adjustment
| - Property adjustment
|
| Later, when Laravel/admin pricing is connected, configured numeric
| values will take priority over these demo fallback values.
|
*/


/* =========================================================
   DEMO PRICING
   ========================================================= */

export const DEMO_PRICING = {
  serviceRates: {
    general: {
      bedroom: 20,
      bathroom: 30,
    },

    deep: {
      bedroom: 25,
      bathroom: 35,
    },

    'move-in': {
      bedroom: 30,
      bathroom: 40,
    },

    'end-of-lease': {
      bedroom: 35,
      bathroom: 45,
    },
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
   RATE VALIDATION
   ========================================================= */

export function isRate(value) {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= 0
  );
}


/* =========================================================
   CURRENCY FORMATTER
   ========================================================= */

export function amountLabel(value) {
  if (!isRate(value)) {
    return 'To be confirmed';
  }

  return new Intl.NumberFormat(
    'en-AU',
    {
      style: 'currency',

      currency: 'AUD',

      minimumFractionDigits: 2,

      maximumFractionDigits: 2,
    }
  ).format(value);
}


/* =========================================================
   MONEY ROUNDING
   ========================================================= */

function money(value) {
  return (
    Math.round(
      Number(value) * 100
    ) / 100
  );
}


/* =========================================================
   SERVICE ROOM RATES
   ========================================================= */

/*
|--------------------------------------------------------------------------
| getServiceRates()
|--------------------------------------------------------------------------
|
| This function only returns:
|
| - bedroom price
| - bathroom price
| - active status
|
| It DOES NOT return a service base price.
|
*/

export function getServiceRates(
  settings,
  serviceId
) {
  const configured =
    settings?.serviceRates?.[
      serviceId
    ] || {};

  const demo =
    DEMO_PRICING.serviceRates[
      serviceId
    ] || {
      bedroom: null,
      bathroom: null,
    };

  return {
    bedroom: isRate(
      configured.bedroom
    )
      ? configured.bedroom
      : demo.bedroom,

    bathroom: isRate(
      configured.bathroom
    )
      ? configured.bathroom
      : demo.bathroom,

    active:
      configured.active !== false,
  };
}


/* =========================================================
   BACKWARD COMPATIBILITY
   ========================================================= */

/*
|--------------------------------------------------------------------------
| getPropertyAdjustment()
|--------------------------------------------------------------------------
|
| Property pricing has been removed from the booking flow.
|
| We keep this export temporarily so another old component importing it
| does not crash the application.
|
| It will ALWAYS return 0.
|
| You can completely remove this function later if nothing imports it.
|
*/

export function getPropertyAdjustment() {
  return 0;
}


/* =========================================================
   AVAILABLE ADD-ONS
   ========================================================= */

/* =========================================================
   AVAILABLE ADD-ONS
   ========================================================= */

export function availableAddons(
  settings,
  serviceId
) {
  return (settings?.addons || [])
    .filter(
      (addon) =>
        addon.active !== false
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
  const qty = Math.max(
    0,
    Number(quantity || 0)
  );

  /*
   * Add-on is not selected.
   */
  if (qty <= 0) {
    return null;
  }

  /*
   * Add-on does not have a valid price.
   */
  if (!isRate(addon?.price)) {
    return null;
  }

  /*
   * EVERY add-on is now quantity based.
   *
   * Examples:
   *
   * Garage Sweep:
   * $30 × 2 = $60
   *
   * Deck Clean:
   * $45 × 3 = $135
   *
   * Carpet:
   * $35 × 4 = $140
   */
  return money(
    addon.price * qty
  );
}


/* =========================================================
   COMPLETE BOOKING ESTIMATE
   ========================================================= */

/*
|--------------------------------------------------------------------------
| calculatePrice()
|--------------------------------------------------------------------------
|
| FINAL FORMULA:
|
| Bedrooms
| + Bathrooms
| + Selected Add-ons
| ------------------------
| Estimated Total
|
| NO service base.
| NO property adjustment.
|
*/

export function calculatePrice(
  draft,
  settings
) {
  /*
  |--------------------------------------------------------------------------
  | GET SELECTED SERVICE'S ROOM RATES
  |--------------------------------------------------------------------------
  */

  const rates =
    getServiceRates(
      settings,
      draft.service
    );


  const items = [];


  /* =========================================================
     BEDROOMS
     ========================================================= */

  const bedrooms =
    Math.max(
      0,
      Number(
        draft.bedrooms || 0
      )
    );


  const bedroomAmount =
    isRate(
      rates.bedroom
    )
      ? money(
          rates.bedroom *
            bedrooms
        )
      : null;


  items.push({
    id: 'bedrooms',

    label: `${bedrooms} bedroom${
      bedrooms === 1
        ? ''
        : 's'
    }`,

    amount:
      bedroomAmount,
  });


  /* =========================================================
     BATHROOMS
     ========================================================= */

  const bathrooms =
    Math.max(
      0,
      Number(
        draft.bathrooms || 0
      )
    );


  const bathroomAmount =
    isRate(
      rates.bathroom
    )
      ? money(
          rates.bathroom *
            bathrooms
        )
      : null;


  items.push({
    id: 'bathrooms',

    label: `${bathrooms} bathroom${
      bathrooms === 1
        ? ''
        : 's'
    }`,

    amount:
      bathroomAmount,
  });


  /* =========================================================
     ADD-ONS
     ========================================================= */

  let knownExtras = 0;


  const addons =
    availableAddons(
      settings,
      draft.service
    );


  for (
    const addon of addons
  ) {
    const quantity =
      Number(
        draft.addons?.[
          addon.id
        ] || 0
      );


    /*
     * Skip add-ons that have not been selected.
     */

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

      /*
      * Every add-on has quantity now.
      */
      label: `${addon.name} × ${quantity}`,

      amount,
    });


    if (
      isRate(amount)
    ) {
      knownExtras +=
        amount;
    }
  }


  /* =========================================================
     CAN WE SHOW A FINAL ESTIMATE?
     ========================================================= */

  /*
   * Every visible line must have a numeric amount.
   *
   * If one required price is missing, we'll return:
   *
   * ready: false
   * total: null
   */

  const ready =
    items.length > 0 &&
    items.every(
      (item) =>
        isRate(
          item.amount
        )
    );


  /* =========================================================
     TOTAL
     ========================================================= */

  const total =
    ready
      ? money(
          items.reduce(
            (
              sum,
              item
            ) => {
              return (
                sum +
                Number(
                  item.amount
                )
              );
            },
            0
          )
        )
      : null;


  /* =========================================================
     RETURN
     ========================================================= */

  return {
    /*
     * Is complete pricing available?
     */

    ready,


    /*
     * Complete estimated total.
     */

    total,


    /*
     * Used by right-side summary,
     * mobile drawer and review.
     */

    items,


    /*
     * Total selected add-ons only.
     */

    knownExtras:
      money(
        knownExtras
      ),


    /*
     * Optional useful breakdown values.
     */

    bedroomAmount,

    bathroomAmount,
  };
}


/* =========================================================
   POSTCODE VALIDATION
   ========================================================= */

export function validPostcode(
  code
) {
  return /^\d{4}$/.test(
    String(
      code || ''
    ).trim()
  );
}


/* =========================================================
   POSTCODE AVAILABILITY
   ========================================================= */

export function postcodeAvailability(
  code,
  settings
) {
  const postcode =
    String(
      code || ''
    ).trim();


  /*
   * Must be an Australian-style
   * four-digit postcode.
   */

  if (
    !validPostcode(
      postcode
    )
  ) {
    return 'invalid';
  }


  /*
   * If no postcodes have been configured yet,
   * let the request continue for manual review.
   */

  if (
    !Array.isArray(
      settings?.postcodes
    ) ||
    settings.postcodes
      .length === 0
  ) {
    return 'review';
  }


  /*
   * Convert configured postcodes to strings.
   *
   * This protects against:
   *
   * 2000
   *
   * versus:
   *
   * "2000"
   */

  const configuredPostcodes =
    settings.postcodes.map(
      (item) =>
        String(
          item
        ).trim()
    );


  return configuredPostcodes.includes(
    postcode
  )
    ? 'available'
    : 'unavailable';
}