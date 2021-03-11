import { Field, ValidationResults, ValidationResult } from '../types';

export const validateObligatoryField = (obligatoryFields: Field[], index): ValidationResults => {
    const errors: string[] = obligatoryFields
        .map((field) => {
            if (field.value) {
                const validationResult: ValidationResult = {
                    isValid: true,
                };
                return validationResult;
            } else {
                const validationResult: ValidationResult = {
                    isValid: false,
                    error: `obligatory field ${field.fieldName} is absent in row #${index + 1}`,
                };
                return validationResult;
            }
        })
        .filter((validationResult) => !validationResult.isValid)
        .flatMap((validationResult) => validationResult.error);
    return {
        isValid: errors.length === 0,
        errors,
    };
};
