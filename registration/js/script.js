// registration/js/script.js
import initApp from '../../assets/core/js/app.js';
import { populateFields } from '../../assets/core/js/form.js';
import CONFIG from '../../assets/implementations/js/config.js';
import testData from './test.js';

document.addEventListener('DOMContentLoaded', function () {
	// Using non-async wrapper since initApp() handles its own async operations
	// Switch to async/await only if you need to chain additional async tasks:
	// 
	// document.addEventListener('DOMContentLoaded', async function() {
	//   await initApp(...);
	//   await otherAsyncTask();
	// });

	initApp({
		scriptURLFile: '../assets/implementations/config/gas.txt',
		formConfig: {
			...CONFIG.formConfig,
			googlesheets: true
		}
	});

	// Check for test mode activation
	if (typeof testData !== 'undefined' && window.location.hash === '#test') {
		populateFields(testData, { noEmpty: true });
	}

});