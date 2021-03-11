import { Cell } from '../types';
import { UniqueCell, Row } from '../types';
import { validateFieldUniqueness } from './validateFieldUniqueness';
import phone from 'phone';

export const validatePhoneNumber = (value: string, rows: Row[], index: number): UniqueCell => {
    const uniqueCell = validateFieldUniqueness(
        value,
        rows.map((row) => row.phoneNumber),
        index,
    );
    const cell = validatePhoneString(value);
    const cellState = [uniqueCell.cell.cellState, cell.cellState].reduce(
        (acc = true, currentValue) => (acc = acc ? currentValue : acc),
    );
    const cellValue = cell.value !== undefined ? cell.value : value;
    return {
        cell: {
            value: cellValue,
            cellState,
        },
        duplication: uniqueCell.duplication,
    };
};

const validatePhoneString = (value: string): Cell => {
    if (value.length >= 10) {
        const phoneNumber = phone(value);
        if (!(phoneNumber.length === 0)) {
            return {
                value: phone(value)[0],
                cellState: true,
            };
        } else {
            return {
                value: 'invalid',
                cellState: false,
            };
        }
    } else {
        return {
            value,
            cellState: false,
        };
    }
};
