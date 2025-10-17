import initApp from '../../assets/core/js/app.js';
import { populateFields } from '../../assets/core/js/form.js';
import dynamicFields from '../../assets/core/js/form-dynamicfields.js';
import CONFIG from '../../assets/implementations/js/config.js';
import testData from './test.js';


//===== registration/js/submit.js =====
document.addEventListener('DOMContentLoaded', function() {
	// Using non-async wrapper since initApp() handles its own async operations
	// Switch to async/await only if you need to chain additional async tasks:
	// 
	// document.addEventListener('DOMContentLoaded', async function() {
	//   await initApp(...);
	//   await otherAsyncTask();
	// });
	
	initApp({ scriptURL: 'process/process.php', formConfig: CONFIG.formConfig });

    // Check for test mode activation
    if (typeof testData !== 'undefined' && window.location.hash === '#test') {
        populateFields(testData, { noEmpty: true });
    }

    // Initialize dynamic author fields
    const authorInput = document.querySelector('#abstract-authors-list .form-group');
    if (authorInput) {
        const authorSelect = document.querySelector('[name="abstract-authors-number"]');
        
        // Calculate maxFields exactly as specified
        const maxFields = authorSelect ? 
            authorSelect.querySelectorAll('option[value]:not([value=""])').length :
            10; // Fallback value

        dynamicFields(authorInput.closest('#abstract-authors-list'), {
            template: authorInput,
            maxFields: maxFields,
            trigger: authorSelect // Pass the actual DOM element
        });
    }

  });
