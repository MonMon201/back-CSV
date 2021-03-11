import { BadRequestException, Injectable } from '@nestjs/common';
import { fieldsObject } from './constants';
import { RowNames, Row, Recruit } from './types';
import { validateObligatoryFields } from './validations/validateObligatoryFields';
import { validateFieldUniqueness } from './validations/validateFieldUniqueness';
import { validateInteger } from './validations/validateInteger';
import { validateExpirience } from './validations/validateExpirience';
import { validateAge } from './validations/validateAge';
import { validateHasChildren } from './validations/validateHasChildren';
import { validateLicenseStates } from './validations/validateLicenseStates';
import { validateLicenseNumber } from './validations/validateLicenseNumber';
import { validateExpirationDate } from './validations/validateExpirationDate';
import { validatePhoneNumber } from './validations/validatePhoneNumber';
import csv from 'csvtojson';

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
                    const errors = validateObligatoryFields(rows);
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

    async csvToJson(csvString: string): Promise<any> {
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
        const email = validateFieldUniqueness(
            row.email,
            rows.map((row) => row.email),
            id,
        );
        const phoneNumber = validatePhoneNumber(row.phoneNumber, rows, id);
        const age = validateAge(row.age);
        const expirience = validateExpirience(row.expirience, row.age);
        const yearlyIncome = validateInteger(row.yearlyIncome);
        const hasChildren = validateHasChildren(row.hasChildren);
        const licenseStates = validateLicenseStates(row.licenseStates);
        const licenseNumber = validateLicenseNumber(row.licenseNumber);
        const expirationDate = validateExpirationDate(row.expirationDate);
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
