/**
 * Test data generator for Presenting Author form
 * Usage: populateFields(testData, { noEmpty: true })
 */
const testData = ({ noEmpty = false } = {}) => {
	// Helper: optionally allow empty values unless noEmpty=true
	const maybeEmpty = (generator, emptyChance = 0.3) =>
		noEmpty ? generator() : (Math.random() > emptyChance ? generator() : '');

	// Helpers
	const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
	const pad = (n) => String(n).padStart(2, '0');

	// Random date in June/July 2025
	const randomDate = () => {
		const start = new Date(2025, 5, 1);   // Jun 1, 2025
		const end   = new Date(2025, 6, 15);  // Jul 15, 2025
		const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
		return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
	};

	// Random time in conference hours
	const randomTime = () => {
		const hh = 8 + Math.floor(Math.random() * 9); // 08–16h
		const mm = Math.random() > 0.5 ? '00' : '30';
		return `${pad(hh)}:${mm}`;
	};

	// Values
	return {
		// ===== ABSTRACT DETAILS =====
		'abstract-id': () => `CG2025-${Math.floor(1000 + Math.random() * 9000)}`,
		'abstract-title': () => pick([
			'Polygenic Risk and Early-Onset Cardiomyopathy',
			'Transcriptomic Signatures in Familial Hypercholesterolemia',
			'Integrating WGS in Clinical Cardio-Genetics',
			'miRNA Networks in Post-MI Remodeling',
			'Rare Variant Burden in Arrhythmia Syndromes'
		]),
		'presentation-type': () => ({
			'Oral': Math.random() > 0.5,
			'Poster': Math.random() > 0.5
		}),

		// ===== SESSION INFO (optional for Poster) =====
		'session-title': () => maybeEmpty(() => pick([
			'Genomics in Clinical Practice',
			'Inherited Cardiomyopathies',
			'Arrhythmias & Channelopathies',
			'Population Genomics & Risk'
		])),
		'session-date': () => maybeEmpty(randomDate),
		'session-time': () => maybeEmpty(randomTime),
		'session-order': () => maybeEmpty(() => `${Math.floor(1 + Math.random() * 12)}`),

		// ===== ORIGINAL PRESENTER =====
		'orig-presenter-name': () => pick(['Emma Rossi','Liam Müller','Olivia García','Noah Dubois','Ava Schmidt']),
		'orig-presenter-email': () => `presenter.${Math.floor(Math.random()*1000)}@example.org`,
		'orig-presenter-affiliation': () => maybeEmpty(() => pick([
			'Institute of Cardiovascular Genomics, Lisbon',
			'Department of Medical Genetics, Oxford',
			'Max Planck Heart Institute, Berlin',
			'CNIC Genomics Unit, Madrid'
		])),

		// ===== CONFIRMATION / CHANGE =====
		'presenting-author-on-site': () => ({
			'Yes': Math.random() > 0.5,
			'No': Math.random() > 0.5
		}),
		'new-presenter-name': () => maybeEmpty(() => pick(['Marco Pereira','Sofia Almeida','Jonas Weber','Lucía Torres'])),
		'new-presenter-email': () => maybeEmpty(() => `new.present.${Math.floor(Math.random()*1000)}@example.com`),
		'new-presenter-affiliation': () => maybeEmpty(() => pick([
			'Centro de Genética Clínica, Porto',
			'Cardio-Genomics Lab, Paris',
			'University Hospital, Rome'
		])),

		// ===== MISC =====
		'comments': () => maybeEmpty(() => pick([
			'Please confirm AV connection (HDMI).',
			'Title updated per program coordinator.',
			'Presenter flight ETA changed (evening).'
		])),
		'terms': () => true
	};
};

export default testData;
