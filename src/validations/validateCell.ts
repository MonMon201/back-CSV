import { Cell } from '../types';

export const validateCell = (value: string | number | boolean, validators: [(value) => boolean]): Cell => {
    const cellState: boolean[] = validators
        .map((validator) => {
            return validator(value);
        })
        .filter((validationResult) => !validationResult);
    return {
        value,
        cellState: cellState.length === 0,
    };
};
