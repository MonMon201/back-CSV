import { Cell } from '../types';

export const validateInteger = (field: number): Cell => {
    if (field) {
        return {
            value: field,
            cellState: field >= 0,
        };
    } else {
        return {
            value: ['Empty line'],
            cellState: false,
        };
    }
};
