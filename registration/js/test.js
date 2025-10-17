/**
 * Test data generator factory
 * @param {Object} [options] Configuration options
 * @param {boolean} [options.noEmpty=false] Whether to skip empty values
 * @returns {Object} Test data generators
 */
const testData = ({ noEmpty = false } = {}) => {
    // Helper to optionally return empty values
    const maybeEmpty = (generator, emptyChance = 0.3) => 
        noEmpty ? generator() : (Math.random() > emptyChance ? generator() : '');

    return {
        // ===== PERSONAL INFORMATION =====
        'person-esc-id': () => Math.floor(100000 + Math.random() * 900000),
        'person-title': () => ({
            'Professor': Math.random() > 0.7,
            'Assoc. Professor Doctor': Math.random() > 0.7,
            'Mr': Math.random() > 0.8,
            'Mrs': Math.random() > 0.8,
            'Miss': Math.random() > 0.8,
            'Mx': Math.random() > 0.9
        }),
        'person-first-name': () => ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava'][Math.floor(Math.random() * 5)],
        'person-last-name': () => ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'][Math.floor(Math.random() * 5)],
        'person-email': () => `test${Math.floor(Math.random() * 1000)}@example.com`,
        'person-mobile': () => `+${[1, 33, 44, 49, 61][Math.floor(Math.random() * 5)]}${Math.floor(100000000 + Math.random() * 900000000)}`,
        'person-dob': () => {
            const start = new Date(1950, 0, 1);
            const end = new Date(2000, 0, 1);
            return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().split('T')[0];
        },
        'person-age': () => Math.floor(25 + Math.random() * 40),
        'person-gender': () => ['Male', 'Female', 'X'][Math.floor(Math.random() * 3)],
        
        // ===== ADDRESS INFORMATION =====
        'address': () => `${Math.floor(10 + Math.random() * 90)} ${['Main', 'Oak', 'Pine', 'Maple', 'Cedar'][Math.floor(Math.random() * 5)]} St`,
        'address-city': () => ['London', 'Paris', 'Berlin', 'Madrid', 'Rome'][Math.floor(Math.random() * 5)],
        'address-postcode': () => Math.floor(10000 + Math.random() * 90000).toString(),
        'address-state': () => maybeEmpty(() => ['County', 'Province', 'State'][Math.floor(Math.random() * 3)]),
        'address-country': () => ['United States', 'United Kingdom', 'France', 'Germany', 'Japan'][Math.floor(Math.random() * 5)],
        
        // ===== PROFESSIONAL INFORMATION =====
        'prof-institute': () => `${['Harvard', 'Oxford', 'Pasteur', 'Max Planck', 'Tokyo'][Math.floor(Math.random() * 5)]} University`,
        'prof-department': () => maybeEmpty(() => `Department of ${['Cardiology', 'Genetics', 'Biomedicine', 'Molecular Biology'][Math.floor(Math.random() * 4)]}`),
        'prof-specialty': () => maybeEmpty(() => ['Cardiology', 'Clinical Genetics', 'Pediatrics', 'Internal Medicine'][Math.floor(Math.random() * 4)]),
        'prof-address': () => `${Math.floor(10 + Math.random() * 90)} ${['Research', 'Science', 'Medical', 'University'][Math.floor(Math.random() * 4)]} Ave`,
        'prof-address-city': () => ['London', 'Paris', 'Berlin', 'Madrid', 'Rome'][Math.floor(Math.random() * 5)],
        'prof-address-postcode': () => Math.floor(10000 + Math.random() * 90000).toString(),
        'prof-address-state': () => maybeEmpty(() => ['County', 'Province', 'State'][Math.floor(Math.random() * 3)]),
        'prof-address-country': () => ['United States', 'United Kingdom', 'France', 'Germany', 'Japan'][Math.floor(Math.random() * 5)],
        
        // ===== REGISTRATION DETAILS =====
        'registration': () => ({
            'Early fee: Non-member': Math.random() > 0.5,
            'Early fee: Council member': Math.random() > 0.7,
            'Early fee: Student, Trainee, Nurse, Genetic Councilor': Math.random() > 0.8,
            'Late fee: Non-member': Math.random() > 0.5,
            'Late fee: Council member': Math.random() > 0.7,
            'Late fee: Student, Trainee, Nurse, Genetic Councilor': Math.random() > 0.8
        }),
        'workshops': () => ({
            'Workshop 1': Math.random() > 0.5,
            'Workshop 2': Math.random() > 0.5
        }),
        'comments': () => maybeEmpty(() => 
            ['Special dietary requirements', 'Accessibility needs', 'Additional information'][Math.floor(Math.random() * 3)]
        ),
        'terms': () => true
    };
};

export default testData;