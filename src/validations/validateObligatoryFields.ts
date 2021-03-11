import { Row } from '../types';
import { fieldsObject } from '../constants';
import { validateObligatoryField } from './validateObligatoryField';

export const validateObligatoryFields = (rows: Row[]): string[] => {
    return rows
        .map((row, i) =>
            validateObligatoryField(
                [
                    { fieldName: fieldsObject.fullName, value: row.fullName },
                    { fieldName: fieldsObject.email, value: row.email },
                    { fieldName: fieldsObject.phoneNumber, value: row.phoneNumber },
                ],
                i,
            ),
        )
        .filter((validationResult) => !validationResult.isValid)
        .flatMap((validationResult) => validationResult.errors);
};
