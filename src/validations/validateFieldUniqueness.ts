import { UniqueCell } from '../types';

export const validateFieldUniqueness = (field: string, rows: string[], index): UniqueCell => {
    const duplication = rows
        .map((row, i) => {
            if (row === field && i !== index) {
                return {
                    isValid: false,
                    index: i,
                };
            } else {
                return {
                    isValid: true,
                };
            }
        })
        .filter((validationResult) => !validationResult.isValid)
        .map((validationResult) => validationResult.index);
    return {
        cell: {
            value: field,
            cellState: duplication.length === 0,
        },
        duplication,
    };
};
