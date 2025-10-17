// presenting-author/js/script.js
import initApp from '../../assets/core/js/app.js';
import { populateFields } from '../../assets/core/js/form.js';
import CONFIG from '../../assets/implementations/js/config.js';
import testData from './test.js';

document.addEventListener('DOMContentLoaded', () => {
	initApp({
		// Shared GAS endpoint (plain text, no quotes)
		scriptURLFile: '../assets/implementations/config/gas.txt',

		// Form configuration (Google Sheets mode enabled)
		formConfig: {
			...(CONFIG?.formConfig || {}),
			googlesheets: true
		}
	});

	// Optional test autofill: visit with #test
	if (window.location.hash === '#test') {
		populateFields(testData, { noEmpty: true });
	}
});
