import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { fields, fieldsObject, States } from './constants';
import { ValidationResult, ValidationResults, Field, RowNames, Row, Cell, UniqueCell, Recruit } from './types';
import csv from 'csvtojson';
import moment from 'moment';
import phone from 'phone';

@Injectable()
export class AppService {
    getHello(): string {
        return 'Hello World!';
    }

    async fileService(file: Express.Multer.File): Promise<Recruit[]> {
        if (file.originalname.match(/.(csv)$/i)) {
            const csvString = file.buffer.toString('ascii');
            const data = await this.csvToJson(csvString);
            if (data) {
                const fieldNames = this.getFieldsNames(Object.keys(data[0]));
                const rows = data.map((item) => this.getRow(item, fieldNames));
                if (rows.length) {
                    const errors = this.validateObligatoryFields(rows);
                    if (!errors.length) {
                        return rows.map((row, i) => this.validateField(row, rows, i));
                    } else {
                        throw new BadRequestException(`errors: ${errors}`);
                    }
                } else {
                    throw new BadRequestException(`Empty file`);
                }
            } else {
                throw new BadRequestException(`Incorrect data`);
            }
        } else {
            throw new BadRequestException(`Incorrect extention`);
        }
    }

    async csvToJson(csvString: string): Promise<Object[]> {
        return new Promise((resolve, reject) => {
            csv({ flatKeys: true })
                .fromString(csvString)
                .then(
                    (data) => {
                        resolve(data);
                    },
                    (err) => reject(err),
                );
        });
    }

    findIndex(fields: string[], fieldName: string): string {
        return fields.filter((field) => fieldName.toUpperCase().includes(field.toUpperCase()))[0];
    }

    validateField(row: Row, rows: Row[], id: number): Recruit {
        const fullName = row.fullName;
        const email = this.validateFieldUniqueness(
            row.email,
            rows.map((row) => row.email),
            id,
        );
        const phoneNumber = this.validatePhone(row.phoneNumber, rows, id);
        const age = this.validateAge(row.age);
        const expirience = this.validateExpirience(row.expirience, row.age);
        const yearlyIncome = this.validateInteger(row.yearlyIncome);
        const hasChildren = this.validateHasChildren(row.hasChildren);
        const licenseStates = this.validateLicenseStates(row.licenseStates);
        const licenseNumber = this.validateLicenseNumber(row.licenseNumber);
        const expirationDate = this.validateExpirationDate(row.expirationDate);
        const duplication = [phoneNumber, email]
            .filter((uniqueCell) => !uniqueCell.cell.cellState)
            .flatMap((validationResult) => validationResult.duplication);
        return {
            id,
            fullName,
            email,
            phoneNumber,
            age,
            expirience,
            yearlyIncome,
            hasChildren,
            licenseStates,
            licenseNumber,
            expirationDate,
            duplication,
        };
    }

    validatePhone(value: string, rows: Row[], index: number): UniqueCell {
        const uniqueCell = this.validateFieldUniqueness(
            value,
            rows.map((row) => row.phoneNumber),
            index,
        );
        const cell = this.validatePhoneString(value);
        const cellState = [uniqueCell.cell.cellState, cell.cellState].reduce(
            (acc = true, currentValue) => (acc = acc ? currentValue : acc),
        );
        const cellValue = cell.value !== undefined ? cell.value : value
        return {
            cell: {
                value: cellValue,
                cellState,
            },
            duplication: uniqueCell.duplication,
        };
    }

    validatePhoneString(value: string): Cell {
        if (value.length >= 10) {
            const phoneNumber = phone(value)
            if(!(phoneNumber.length === 0)){
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
    }

    validateExpirationDate(value: string): Cell {
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
    }

    validateLicenseStates(licenseStates: string): Cell {
        if(licenseStates) {
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
            }
        }
    }

    validateLicenseNumber(value: string): Cell {
        if(value.length >= 6 && !(/\W/i.test(value))){
            return {
                value,
                cellState: true,
            };
        } else if(value.length < 6 && !(/\W/i.test(value))) {
            return {
                value: 'Too short number',
                cellState: false,
            };
        } else if(value.length >= 6 && (/\W/i.test(value))) {
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
    }

    validateHasChildren(hasChildren: string): Cell {
        const value = hasChildren === 'TRUE' ? 'TRUE' : 'FALSE';
        return {
            value,
            cellState: true,
        };
    }

    validateCell(value: string | number | boolean, validators: [(value) => boolean]): Cell {
        const cellState: boolean[] = validators
            .map((validator) => {
                return validator(value);
            })
            .filter((validationResult) => !validationResult);
        return {
            value,
            cellState: cellState.length === 0,
        };
    }

    validateInteger(field: number): Cell {
        if(field){
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
    }

    validateAge(age: number): Cell {
        return {
            value: age,
            cellState: age >= 21,
        };
    }

    validateExpirience(expirience: number, age: number): Cell {
        const validationResult = this.validateInteger(expirience);
        return {
            value: expirience,
            cellState: age - expirience >= 0 && validationResult.cellState,
        };
    }

    validateFieldUniqueness(field: string, rows: string[], index): UniqueCell {
        const duplication = rows
            .map((row, i) => {
                if (row === field && i !== index) {
                    return {
                        isValid: false,
                        index: i,
                    };
                } else {
                    return {
                        isValid: true,
                    };
                }
            })
            .filter((validationResult) => !validationResult.isValid)
            .map((validationResult) => validationResult.index);
        return {
            cell: {
                value: field,
                cellState: duplication.length === 0,
            },
            duplication,
        };
    }

    validateObligatoryFields(rows: Row[]): string[] {
        return rows
            .map((row, i) =>
                this.validateObligatoryField(
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
    }

    validateObligatoryField(obligatoryFields: Field[], index): ValidationResults {
        const errors: string[] = obligatoryFields
            .map((field) => {
                if (field.value) {
                    const validationResult: ValidationResult = {
                        isValid: true,
                    };
                    return validationResult;
                } else {
                    const validationResult: ValidationResult = {
                        isValid: false,
                        error: `obligatory field ${field.fieldName} is absent in row #${index + 1}`,
                    };
                    return validationResult;
                }
            })
            .filter((validationResult) => !validationResult.isValid)
            .flatMap((validationResult) => validationResult.error);
        return {
            isValid: errors.length === 0,
            errors,
        };
    }

    getFieldsNames(keys: string[]): RowNames {
        const rowNames: RowNames = {
            fullName: this.findIndex(keys, fieldsObject.fullName),
            email: this.findIndex(keys, fieldsObject.email),
            phoneNumber: this.findIndex(keys, fieldsObject.phoneNumber),
            age: this.findIndex(keys, fieldsObject.age),
            expirience: this.findIndex(keys, fieldsObject.expirience),
            yearlyIncome: this.findIndex(keys, fieldsObject.yearlyIncome),
            hasChildren: this.findIndex(keys, fieldsObject.hasChildren),
            licenseStates: this.findIndex(keys, fieldsObject.licenseStates),
            expirationDate: this.findIndex(keys, fieldsObject.expirationDate),
            licenseNumber: this.findIndex(keys, fieldsObject.licenseNumber),
        };
        return rowNames;
    }

    getRow(item, fieldNames: RowNames): Row {
        return {
            fullName: item[fieldNames.fullName],
            email: item[fieldNames.email],
            phoneNumber: item[fieldNames.phoneNumber],
            age: item[fieldNames.age],
            expirience: item[fieldNames.expirience],
            yearlyIncome: item[fieldNames.yearlyIncome],
            hasChildren: item[fieldNames.hasChildren],
            licenseStates: item[fieldNames.licenseStates],
            expirationDate: item[fieldNames.expirationDate],
            licenseNumber: item[fieldNames.licenseNumber],
        };
    }
}
