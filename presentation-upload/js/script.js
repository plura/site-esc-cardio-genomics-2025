// /presentation-upload/js/script.js
import initApp from '../../assets/core/js/app.js';
import { populateFields } from '../../assets/core/js/form.js';
import CONFIG from '../../assets/implementations/js/config.js';
import testData from './test.js';

document.addEventListener('DOMContentLoaded', () => {
	// Uses PHP endpoint (multipart/form-data). GAS key is included as a hidden input for future use.
	initApp({
		scriptURL: 'process/process.php',
		formConfig: {
			...(CONFIG?.formConfig || {})
			// googlesheets: false // not needed; default flow uses FormData
		}
	});

	// Optional: autofill test data with #test
	if (window.location.hash === '#test') {
		populateFields(testData, { noEmpty: true });
	}
});
