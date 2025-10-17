// /presentation-upload/js/test.js

/**
 * Test data generator for Presentation Upload form.
 * Note: File inputs cannot be programmatically populated for security reasons.
 * Usage (already wired in script.js): visit the page with #test
 *   populateFields(testData, { noEmpty: true })
 */
const testData = ({ noEmpty = false } = {}) => {
	const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
	const pad = (n) => String(n).padStart(2, '0');

	// Helpers
	const maybe = (val, chance = 0.7) => (Math.random() < chance ? val : '');
	const randomDate = () => {
		const start = new Date(2025, 5, 24); // 2025-06-24
		const end = new Date(2025, 6, 2);   // 2025-07-02
		const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
		return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
	};
	const randomTime = () => `${pad(8 + Math.floor(Math.random() * 9))}:${Math.random() > 0.5 ? '00' : '30'}`;

	return {
		// Abstract
		'abstract-id': () => `CG2025-${Math.floor(1000 + Math.random() * 9000)}`,
		'abstract-title': () => pick([
			'Integrating WGS in Clinical Cardio-Genetics',
			'miRNA Networks in Post-MI Remodeling',
			'Polygenic Risk and Early-Onset Cardiomyopathy',
			'Rare Variant Burden in Arrhythmia Syndromes'
		]),

		// Presenter
		'presenter-name': () => pick(['Emma Rossi','Marco Pereira','Ana Carvalho','Jonas Weber','Lucía Torres']),
		'presenter-email': () => `presenter.${Math.floor(Math.random()*1000)}@example.org`,

		// Session
		'session-title': () => pick([
			'Genomics in Clinical Practice',
			'Inherited Cardiomyopathies',
			'Arrhythmias & Channelopathies',
			'Population Genomics & Risk'
		]),
		'session-date': () => randomDate(),
		'session-time': () => randomTime(),
		'session-order': () => maybe(String(1 + Math.floor(Math.random() * 12)), noEmpty ? 1 : 0.7),

		// Upload (file cannot be set via JS)
		// 'file': (not set)

		// Confirmations
		'filename-confirm': () => true,
		'comments': () => maybe(pick([
			'Please confirm HDMI output is available.',
			'Slides include embedded videos.',
			'Title updated per programme coordinator.'
		]), noEmpty ? 1 : 0.6),
		'terms': () => true
	};
};

export default testData;
