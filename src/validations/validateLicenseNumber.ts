import { Cell } from '../types';

export const validateLicenseNumber = (value: string): Cell => {
    if (value.length >= 6 && !/\W/i.test(value)) {
        return {
            value,
            cellState: true,
        };
    } else if (value.length < 6 && !/\W/i.test(value)) {
        return {
            value: 'Too short number',
            cellState: false,
        };
    } else if (value.length >= 6 && /\W/i.test(value)) {
        return {
            value: 'Invalid Symbols',
            cellState: false,
        };
    } else {
        return {
            value: 'Invalid line',
            cellState: false,
        };
    }
};
