import { initializeForm } from './form.js';

const initApp = async ({ 
	scriptURL, 
	scriptURLFile,
	container = document.getElementById('app'),
	formConfig = {} // New form configuration object
  } = {}) => {
	if (!container) {
	  console.error('App container not found');
	  return;
	}
  
	const form = container.querySelector('form');
	if (!form) {
	  console.error('No form element found in container');
	  return;
	}
  
	// Optional intro/button behavior
	const intro = container.querySelector('.intro');
	if (intro) {
	  const button = intro.querySelector('button') || intro;
	  button.addEventListener('click', () => {
		container.classList.add('on');
	  }, { once: true });
	}
  
	const getScriptURL = async () => {
	  if (scriptURL) return scriptURL;
	  if (!scriptURLFile) throw new Error('No URL source provided');
	  
	  const response = await fetch(scriptURLFile);
	  if (!response.ok) throw new Error('Failed to load configuration');
	  return (await response.text()).trim();
	};
  
	const showError = (message) => {
	  const alert = container.querySelector('.alert') || document.createElement('div');
	  alert.className = 'alert error';
	  alert.textContent = message;
	  form.prepend(alert);
	};
  
	try {
	  if (typeof initializeForm === 'function') {
		initializeForm({
		  form,
		  scriptURL: await getScriptURL(),
		  ...formConfig // Spread all form configuration
		});
	  }
	} catch (error) {
	  console.error('Initialization error:', error);
	  showError('System error. Please contact support.');
	}
  };

  export default initApp;