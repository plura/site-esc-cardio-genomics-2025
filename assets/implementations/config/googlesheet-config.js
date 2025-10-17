const CONFIG = [
	// ===== Presenting Author =====
	{
		key: "presentation-author",
		sheetId: "1pEP8pXuRxKUlhhZwVCyDwtH7jUeNNpjeIzJFW3VqIfA",
		sheetName: "Presenting Author",
		allowedDomains: ["dev.plura.pt", "plura.pt", "www.plura.pt"],

		// Required fields shown as required in the form
		requiredFields: [
			"esc-id", "email", "civility", "first-name", "last-name",
			"gender", "age", "country", "institution",
			"abstract-title",
			"submitter-information"
		],

		// Column order mirrors the form grouping
		fieldOrder: [
			// Group 1 — Presenting Author Information
			"esc-id", "email", "civility", "last-name", "first-name", "gender", "age", "country", "institution",

			// Group 2 — Abstract information
			"abstract-title",

			// Group 3 — Submitter Information
			"submitter-information",

			// Auto
			"timestamp",

			//comment
			"comments"

		],

		addTimestamp: true,
		logErrors: true
	},

	// ===== Presentation Upload =====
	{
		key: "presentation-upload",
		sheetId: "1pEP8pXuRxKUlhhZwVCyDwtH7jUeNNpjeIzJFW3VqIfA",
		sheetName: "Presentation Upload",
		allowedDomains: ["dev.plura.pt", "plura.pt", "www.plura.pt"],

		requiredFields: [
			"abstract-title",
			"esc-id", "presenter-name", "presenter-email",
			"filename-confirm", "terms"
		],

		fieldOrder: [
			"esc-id", "presenter-name", "presenter-email",
			"abstract-title",
			"filename-confirm", "terms",
			"timestamp"
		],

		transforms: {
			"filename-confirm": { type: "bool" },
			"terms": { type: "bool" }
		},

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
			"person-esc-id", "person-title", "person-first-name", "person-last-name", "person-email", "person-mobile", "person-age", "person-gender",

			// Personal Address
			"address", "address-city", "address-postcode", "address-country",

			// Professional Info
			"prof-institute", "prof-address", "prof-address-city", "prof-address-postcode", "prof-address-country",

			// Registration & Consent
			"registration", "terms"
		],

		// Field order (grouped)
		fieldOrder: [
			// Personal
			"person-esc-id", "person-title", "person-first-name", "person-last-name", "person-email", "person-mobile", "person-age", "person-gender",

			// Personal Address
			"address", "address-city", "address-postcode", "address-state", "address-country",

			// Professional
			"prof-institute", "prof-department", "prof-specialty",
			"prof-address", "prof-address-city", "prof-address-postcode", "prof-address-state", "prof-address-country",

			// Registration
			"registration", "workshops",

			// Timestamp before comments (per legacy config)
			"timestamp", "comments"
		],

		transforms: { "workshops": { type: "join", sep: ", " }, "terms": { type: "bool" } },
		addTimestamp: true,
		logErrors: true
	}
];

function doPost(e) {
	return PluraSheetBridge.handlePost(e, CONFIG);
}
