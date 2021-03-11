import { Cell } from '../types';
import { States } from '../constants';
export const validateLicenseStates = (licenseStates: string): Cell => {
    if (licenseStates) {
        const validationResults = States.map((state) => {
            const stateAbbreviation = licenseStates.toUpperCase().includes(state.name.toUpperCase())
                ? state.abbreviation
                : '';
            if (stateAbbreviation.length) {
                return {
                    isValid: true,
                    stateAbbreviation: stateAbbreviation,
                };
            } else {
                return {
                    isValid: false,
                    stateAbbreviation: 'Unknown',
                };
            }
        });
        const filteredStates = validationResults.filter((validationResult) => validationResult.isValid);
        const value = filteredStates.map((validationResult) => validationResult.stateAbbreviation);
        return {
            value,
            cellState: filteredStates.length > 0,
        };
    } else {
        return {
            value: ['Empty line'],
            cellState: false,
        };
    }
};
