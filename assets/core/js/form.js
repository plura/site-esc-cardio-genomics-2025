/**
 * Gets form data and identifies optional fields
 * @param {HTMLFormElement} form - The form element
 * @returns {Object} Form data and optional fields
 */
function getFormDataAndOptionalFields(form) {
	const formData = {};
	const optionalFields = [];
	const elements = form.elements;

	for (let element of elements) {
		if (!element.name) continue;

		// Mark optional fields
		if (!element.required && !optionalFields.includes(element.name)) {
			optionalFields.push(element.name);
		}

		// Handle different input types
		if ((element.type === 'radio' || element.type === 'checkbox') && element.checked) {
			if (element.type === 'checkbox') {
				formData[element.name] = formData[element.name] || [];
				formData[element.name].push(element.value);
			} else {
				formData[element.name] = element.value; // Radio button
			}
		}
		else if (element.type !== 'checkbox' && element.type !== 'radio') {
			formData[element.name] = element.value.trim();
		}
	}

	// Simplify single checkbox values
	for (const key in formData) {
		if (Array.isArray(formData[key]) && formData[key].length === 1) {
			formData[key] = formData[key][0];
		}
	}

	return { formData, optionalFields };
}

/**
 * Creates alert controller and element
 * @returns {Object} { message: function, element: DOMElement }
 */
function createAlert() {
    const alertElement = document.createElement('div');
    alertElement.className = 'alert';

    return {
        element: alertElement,
        
        /**
         * Display a message in the alert
         * @param {string} content - HTML content to display
         * @param {string} type - Type of alert ('success', 'error', etc.)
         */
        message: (content, type) => {
            if (typeof content === 'string') {
                alertElement.innerHTML = content;
                alertElement.className = `alert ${type}`;
                if (type === 'success') {
                    setTimeout(() => {
                        alertElement.className = 'alert';
                        alertElement.innerHTML = '';
                    }, 10000);
                }
            } else {
                alertElement.className = 'alert';
                alertElement.innerHTML = '';
            }
        },
        
        /**
         * Replace template placeholders with data
         * @param {string} template - String with %placeholders%
         * @param {object} data - Key-value pairs for replacement
         * @returns {string} Processed template
         */
        template: (template, data) => {
            return template.replace(/%([\w-]+)%/g, (match, key) => {
                return data[key] !== undefined ? data[key] : match;
            });
        }
    };
}

/**
 * Initializes form handling
 * @param {Object} config - Configuration
 * @param {HTMLFormElement} config.form - Form element
 * @param {string} config.scriptURL - Submission URL
 * @param {Object} [config.alerts={}] - Custom alert messages
 * @param {boolean} [config.googlesheets=false] - Google Sheets mode
 * @param {Object} [config.fetchOptions] - Custom fetch options (overrides defaults)
 */
function initializeForm({
    form,
    scriptURL,
    alerts = {},
    googlesheets = false,
    fetchOptions = {}
}) {
    if (!form || !scriptURL) {
        console.error('Missing required configuration');
        return;
    }

    const alert = createAlert();
    form.prepend(alert.element);
    const submitButton = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Set processing state (using 'info' class)
		alert.message(
			alerts.processing || 'Processing your submission...', 
			'info has-spinner'
		  );
        
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.setAttribute('aria-busy', 'true');
            submitButton.classList.add('processing');
        }

        const { formData, optionalFields } = getFormDataAndOptionalFields(form);
        
        try {
            if (!validateForm(formData, optionalFields, alert)) {
                throw new Error('Validation failed');
            }

            const payload = {
                ...formData,
                _referrer: window.location.href
            };

            // Configure fetch options
            let options = {
                method: 'POST',
                ...fetchOptions
            };

            if (googlesheets) {
                options = {
                    ...options,
                    mode: 'no-cors',
                    body: JSON.stringify(payload),
                    headers: {
                        'Content-Type': 'text/plain',
                        ...(fetchOptions.headers || {})
                    }
                };
            } else {
                const formDataObj = new FormData(form);
                formDataObj.append('_referrer', window.location.href);
                options = {
                    ...options,
                    body: formDataObj
                };
            }
console.log(googlesheets, scriptURL, options);
            const response = await fetch(
                googlesheets ? `${scriptURL}?authuser=0` : scriptURL,
                options
            );
console.log('Response:', response);
            if (!googlesheets && !response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Server error');
            }

            // Success state
            const successMessage = alert.template(
                alerts.success || 'Submission successful, %person-first-name%!',
                formData
            );
            alert.message(successMessage, 'success');
            form.reset();

        } catch (error) {
            // Error state
            const errorMessage = alert.template(
                alerts.error || 'Error: %error-message%',
                { 
                    ...formData,
                    'error-message': error.message || 'Submission failed'
                }
            );
            alert.message(errorMessage, 'error');
            console.error('Submission error:', error);
            
        } finally {
            // Reset UI state
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.removeAttribute('aria-busy');
                submitButton.classList.remove('processing');
            }
        }
    });
}

/**
 * Validates required fields
 * @param {Object} formData - Collected form data
 * @param {Array} optionalFields - Optional field names
 * @param {Object} alert - Alert controller
 * @returns {boolean} Validation result
 */
function validateForm(formData, optionalFields = [], alert) {
	for (const field in formData) {
		if (!optionalFields.includes(field)) {
			const value = formData[field];
			if (!value || (Array.isArray(value) && value.length === 0)) {
				const fieldName = field.replace(/([A-Z])/g, ' $1')
					.replace(/^./, str => str.toUpperCase());
				const validationMessage = alerts.validation
					? alerts.validation.replace('%field%', fieldName)
					: `${fieldName} is required!`;
				alert.message(validationMessage, 'error');
				return false;
			}
		}
	}
	return true;
}


/**
 * Populates form fields with test data
 * @param {Object|Function} testData Test data generator object or factory function
 * @param {Object} [options] Configuration options
 * @param {boolean} [options.noEmpty=false] Whether to force all fields to have values
 * @throws {Error} If invalid test data is provided
 */
function populateFields(testData, options = {}) {
    const { noEmpty = false } = options;

    // Validate test data input
    if (typeof testData !== 'object' && typeof testData !== 'function') {
        throw new Error('Test data must be an object or factory function');
    }

    // Get the data (handle both object and function cases)
    const data = typeof testData === 'function' 
        ? testData({ noEmpty })
        : testData;

    // Process each field in the test data
    Object.entries(data).forEach(([fieldName, generator]) => {
        try {
            // Get the field value
            const value = typeof generator === 'function' ? generator() : generator;

            // Find all matching elements (by ID or name)
            const elements = [
                document.getElementById(fieldName),
                ...Array.from(document.querySelectorAll(`[name="${fieldName}"]`))
            ].filter(el => el !== null);

            // Skip if no elements found
            if (elements.length === 0) {
                console.warn(`Field not found: ${fieldName}`);
                return;
            }

            // Set the appropriate value for each element type
            elements.forEach(el => {
                if (el.type === 'radio') {
                    el.checked = value[el.value] || false;
                } 
                else if (el.type === 'checkbox') {
                    el.checked = Boolean(value);
                }
                else if (el.tagName === 'SELECT') {
                    el.value = value;
                    el.dispatchEvent(new Event('change'));
                }
                else {
                    el.value = value;
                }
            });
        } catch (error) {
            console.error(`Error populating field ${fieldName}:`, error);
        }
    });

    console.log(`Form populated with ${noEmpty ? 'non-empty' : 'standard'} test data`);
}

export { initializeForm, populateFields };