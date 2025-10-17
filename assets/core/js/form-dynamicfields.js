/**
 * Dynamic form fields manager with recycling and count tracking
 * @param {string|HTMLElement} container - Container selector or element
 * @param {Object} options
 * @param {HTMLElement} options.template - Template element
 * @param {number} [options.maxFields=10] - Maximum fields allowed
 * @param {string|HTMLElement} [options.trigger] - Element that controls count
 */
function dynamicFields(container, options = {}) {
    // 1. Setup container and template
    const containerEl = typeof container === 'string' 
        ? document.querySelector(container) 
        : container;
    const template = options.template;
    
    if (!containerEl || !template) {
        console.error('DynamicFields: Container or template not found');
        return null;
    }

    // Add container metadata
    containerEl.classList.add('dynamicfields-container');
    containerEl.dataset.count = '0';
    template.classList.add('dynamicfields-template');
    template.remove();

    // 2. Configuration
    const maxFields = options.maxFields || 10;
    const recycledFields = new Map();
    let fieldCount = 0;

    // 3. Field processing
    const createField = (index) => {
        const field = template.cloneNode(true);
        field.classList.add('dynamicfields-instance');
        field.dataset.fieldIndex = index;
        
        // Replace {n} patterns
        field.querySelectorAll('[name*="{n}"], [placeholder*="{n}"], [id*="{n}"]')
            .forEach(el => {
                if (el.name) el.name = el.name.replace(/{n}/g, index);
                if (el.id) el.id = el.id.replace(/{n}/g, index);
                if (el.placeholder) el.placeholder = el.placeholder.replace(/{n}/g, index);
                el.value = '';
            });
        
        return field;
    };

    // 4. Update container count attribute
    const updateCount = () => {
        containerEl.dataset.count = fieldCount;
    };

    // 5. Field management API
    const api = {
        add(count = 1) {
            const available = maxFields - fieldCount;
            const addCount = Math.min(count, available);
            
            for (let i = 0; i < addCount; i++) {
                const newIndex = fieldCount + 1;
                let field;
                
                if (recycledFields.has(newIndex)) {
                    field = recycledFields.get(newIndex);
                    recycledFields.delete(newIndex);
                } else {
                    field = createField(newIndex);
                }
                
                containerEl.appendChild(field);
                fieldCount++;
                updateCount();
            }
            return this;
        },

        remove(count = 1) {
            const removeCount = Math.min(count, fieldCount);
            
            for (let i = 0; i < removeCount; i++) {
                const field = containerEl.lastElementChild;
                const fieldIndex = parseInt(field.dataset.fieldIndex);
                recycledFields.set(fieldIndex, field);
                field.remove();
                fieldCount--;
                updateCount();
            }
            return this;
        },

        set(count) {
            count = Math.min(Math.max(0, count), maxFields);
            const diff = count - fieldCount;
            if (diff > 0) this.add(diff);
            if (diff < 0) this.remove(-diff);
            return this;
        },

        getValues() {
            return Array.from(containerEl.querySelectorAll('.dynamicfields-instance'))
                .map(field => Object.fromEntries(
                    Array.from(field.querySelectorAll('[name]'))
                        .map(input => [input.name.replace(/-\d+$/, ''), input.value])
                ));
        },

        count() {
            return fieldCount;
        },

        destroy() {
            containerEl.querySelectorAll('.dynamicfields-instance').forEach(el => el.remove());
            containerEl.classList.remove('dynamicfields-container');
            containerEl.removeAttribute('data-count');
            fieldCount = 0;
            recycledFields.clear();
        }
    };

    // 6. Trigger initialization
    if (options.trigger) {
        const triggerEl = typeof options.trigger === 'string'
            ? document.querySelector(options.trigger)
            : options.trigger;
        
        if (triggerEl) {
            const handleChange = () => {
                const value = parseInt(triggerEl.value) || 0;
                api.set(value);
            };
            
            triggerEl.addEventListener('change', handleChange);
            
            // Initial sync
            const initialValue = parseInt(triggerEl.value) || 0;
            api.set(initialValue);
        }
    }

    return api;
}

export default dynamicFields;
