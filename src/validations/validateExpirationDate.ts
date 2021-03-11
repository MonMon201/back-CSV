import { Cell } from '../types';
import moment from 'moment';
export const validateExpirationDate = (value: string): Cell => {
    const cellState = ['YYYY-MM-DD', 'MM/DD/YYYY']
        .map((dateFormat) => {
            return {
                isValid: moment(value, dateFormat).format(dateFormat) === value,
                value,
                formatedValue: moment(value, dateFormat).format(dateFormat),
            };
        })
        .filter((validationResult) => validationResult.isValid);
    return {
        value,
        cellState: cellState.length > 0,
    };
};
