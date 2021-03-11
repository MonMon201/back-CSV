import { Cell } from '../types';
export const validateHasChildren = (hasChildren: string): Cell => {
    const value = hasChildren === 'TRUE' ? 'TRUE' : 'FALSE';
    return {
        value,
        cellState: true,
    };
};
