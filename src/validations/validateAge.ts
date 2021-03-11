import { Cell } from '../types';

export const validateAge = (age: number): Cell => {
    return {
        value: age,
        cellState: age >= 21,
    };
};
