// First, let's create a validation helper function

// Define validation rules for each step
export const validationRules = {
    step0: {
        campaignId: { required: true, errorMessage: "La campaña es obligatoria" },
        fieldId: { required: true, errorMessage: "El campo es obligatorio" },
        lotId: { required: true, errorMessage: "El lote es obligatorio" },
        // cropId: { required: true, errorMessage: "El cultivo es obligatorio" },
        // depositId: { required: true, errorMessage: "El depósito es obligatorio" },
        creationDate: { required: true, errorMessage: "La fecha de operación es obligatoria" }
    },
    step1: {
        // transportId: { required: true, errorMessage: "El transporte es obligatorio" },
        // truckerId: { required: true, errorMessage: "El camionero es obligatorio" },
        // vehicleId: { required: true, errorMessage: "El vehículo es obligatorio" },
        // grossWeight: { required: true, errorMessage: "El peso bruto es obligatorio", min: 0 },
        // tareWeight: { required: true, errorMessage: "El peso tara es obligatorio", min: 0 },
        destination: { required: true, errorMessage: "El destino es obligatorio" }
    }
};

// Validation function
export const validateStep = (formValues, step) => {
    const errors = {};
    const rules = validationRules[`step${step}`];

    if (!rules) return errors;

    Object.keys(rules).forEach(field => {
        const rule = rules[field];
        const value = formValues[field];

        // Check required fields
        if (rule.required && (!value || value === "")) {
            errors[field] = rule.errorMessage;
        }

        // Check minimum values for numbers
        if (rule.min !== undefined && value !== "" && Number(value) < rule.min) {
            errors[field] = `El valor debe ser mayor que ${rule.min}`;
        }
    });

    return errors;
};

// Helper to check if there are validation errors
export const hasErrors = (errors) => {
    return Object.keys(errors).length > 0;
};