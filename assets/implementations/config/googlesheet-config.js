const CONFIG = [
	// ===== Presenting Author =====
  {
    key: "presentation-author",
    sheetId: "1pEP8pXuRxKUlhhZwVCyDwtH7jUeNNpjeIzJFW3VqIfA",
    sheetName: "Presenting Author",
    allowedDomains: ["dev.plura.pt", "plura.pt", "www.plura.pt"],

    requiredFields: ["esc-id","email","civility","first-name","last-name","gender","age","country","presenting-author-on-site"],

    fieldOrder: [
      "esc-id","email","civility","last-name","first-name","gender","age","country",
      "session-title","session-date","session-time","session-order",
      "presenting-author-on-site",
      "new-presenter-first-name","new-presenter-last-name","new-presenter-email","new-presenter-affiliation",
      "terms","timestamp","comments"
    ],

    transforms: { "terms": { type: "bool" }, "presenting-author-on-site": { type: "bool" } },
    addTimestamp: true,
    logErrors: true
  },

	// ===== Registration (reformatted) =====
	{
		key: "registration",
		sheetId: "1pEP8pXuRxKUlhhZwVCyDwtH7jUeNNpjeIzJFW3VqIfA",
		sheetName: "Registration",
		allowedDomains: ["dev.plura.pt", "plura.pt", "www.plura.pt"],

		// Required fields (grouped)
		requiredFields: [
			// Personal Info
			"person-esc-id","person-title","person-first-name","person-last-name","person-email","person-mobile","person-age","person-gender",

			// Personal Address
			"address","address-city","address-postcode","address-country",

			// Professional Info
			"prof-institute","prof-address","prof-address-city","prof-address-postcode","prof-address-country",

			// Registration & Consent
			"registration","terms"
		],

		// Field order (grouped)
		fieldOrder: [
			// Personal
			"person-esc-id","person-title","person-first-name","person-last-name","person-email","person-mobile","person-age","person-gender",

			// Personal Address
			"address","address-city","address-postcode","address-state","address-country",

			// Professional
			"prof-institute","prof-department","prof-specialty",
			"prof-address","prof-address-city","prof-address-postcode","prof-address-state","prof-address-country",

			// Registration
			"registration","workshops",

			// Timestamp before comments (per legacy config)
			"timestamp","comments"
		],

		transforms: { "workshops": { type: "join", sep: ", " }, "terms": { type: "bool" } },
		addTimestamp: true,
		logErrors: true
	}
];

function doPost(e) {
	return PluraSheetBridge.handlePost(e, CONFIG);
}
