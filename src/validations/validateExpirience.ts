import { Cell } from '../types';
import { validateInteger } from './validateInteger';

export const validateExpirience = (expirience: number, age: number): Cell => {
    const validationResult = validateInteger(expirience);
    return {
        value: expirience,
        cellState: age - expirience >= 0 && validationResult.cellState,
    };
};
