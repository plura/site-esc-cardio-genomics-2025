/**
 * Test data generator factory
 * @param {Object} [options] Configuration options
 * @param {boolean} [options.noEmpty=false] Whether to skip empty values
 * @returns {Object} Test data generators
 */
function testData({ noEmpty = false } = {}) {
    // Helper to optionally return empty values
    const maybeEmpty = (generator, emptyChance = 0.3) => 
        noEmpty ? generator() : (Math.random() > emptyChance ? generator() : '');

    return {
        // ===== PERSONAL INFORMATION =====
        'person-esc-id': () => Math.floor(100000 + Math.random() * 900000),
        'person-first-name': () => ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava'][Math.floor(Math.random() * 5)],
        'person-last-name': () => ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'][Math.floor(Math.random() * 5)],
        'person-email': () => `test${Math.floor(Math.random() * 1000)}@example.com`,
        'person-mobile': () => `+${[1, 33, 44, 49, 61][Math.floor(Math.random() * 5)]}${Math.floor(100000000 + Math.random() * 900000000)}`,
        'person-age': () => Math.floor(25 + Math.random() * 40),
        'person-institute': () => ['Harvard', 'Oxford', 'Pasteur', 'Max Planck', 'Tokyo'][Math.floor(Math.random() * 5)] + ' University',
        
        // Civility (radio buttons)
        'person-title': () => ({
            'Professor': Math.random() > 0.7,
            'Assoc. Professor': Math.random() > 0.7,
            'Dr': true, // Default fallback
            'Mr': Math.random() > 0.8,
            'Mrs': Math.random() > 0.8,
            'Miss': Math.random() > 0.8,
            'Mx': Math.random() > 0.9
        }),
        
        // Dropdown selects
        'person-gender': () => ['Male', 'Female', 'Other'][Math.floor(Math.random() * 3)],
        'person-country': () => [
            'United States', 'United Kingdom', 'France', 
            'Germany', 'Japan', 'Spain', 'Italy'
        ][Math.floor(Math.random() * 7)],
        'abstract-authors-number': () => Math.floor(1 + Math.random() * 11),
        
        // ===== ABSTRACT INFORMATION =====
        'abstract-title': () => `Genomic study of ${[
            'cardiac', 'vascular', 'metabolic', 
            'electrophysiological', 'structural'
        ][Math.floor(Math.random() * 5)]} ${[
            'variants', 'mutations', 'markers', 
            'pathways', 'networks'
        ][Math.floor(Math.random() * 5)]}`,
        
        'abstract-funding-acknowledgements': () => maybeEmpty(() => 
            `Funded by ${['NIH', 'ERC', 'Wellcome Trust', 'British Heart Foundation', 'DFG'][Math.floor(Math.random() * 5)]} grant ${Math.floor(1000 + Math.random() * 9000)}`
        ),
        
        'abstract-authors-on-behalf-of': () => maybeEmpty(() => {
            const names = ['A. Smith', 'B. Johnson', 'C. Lee'];
            const institutions = ['Harvard', 'Oxford', 'Stanford'];
            return `Prof. ${names[Math.floor(Math.random() * names.length)]}, ${
                institutions[Math.floor(Math.random() * institutions.length)]
            } University`;
        }),
        
        'abstract-body': () => {
            const parts = {
                background: "Cardiovascular genomics has emerged as a critical field for understanding disease mechanisms and developing targeted therapies. Recent advances in sequencing technologies have enabled comprehensive analysis of genetic contributions to cardiac conditions.",
                methods: "We performed whole-exome sequencing on a cohort of 500 patients with familial cardiac conditions, using Illumina NovaSeq 6000 with 150bp paired-end reads. Variant calling was performed using GATK best practices, with annotation via ANNOVAR and variant prioritization based on ACMG guidelines.",
                results: "Our analysis identified 18 novel variants associated with cardiac phenotypes, five of which reached genome-wide significance (p < 5×10⁻⁸). Pathway analysis revealed significant enrichment in genes related to calcium handling (p = 0.002) and cardiac muscle contraction (p = 0.005).",
                conclusions: "These findings significantly expand our understanding of the genetic architecture of cardiac diseases. The identified variants in calcium handling genes suggest potential new therapeutic targets for precision medicine approaches in arrhythmia management."
            };
            return Object.entries(parts).map(([k,v]) => 
                `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`
            ).join('\n\n');
        },

        'abstract-references-citations': () => {
            return [
                "1. Richards S, et al. (2015) Standards and guidelines for the interpretation of sequence variants. Genet Med 17(5):405-423",
                "2. Walsh R, et al. (2017) Reassessment of Mendelian gene pathogenicity using 7,855 cardiomyopathy cases. Am J Hum Genet 100(1):54-69",
                "3. Landrum MJ, et al. (2018) ClinVar: improving access to variant interpretations. Nucleic Acids Res 46(D1):D1062-D1067"
            ].join('\n\n');
        },

        // Checkbox
        'terms': () => true
    };
}

export default testData;