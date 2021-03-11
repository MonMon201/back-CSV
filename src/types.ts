export interface State {
    name: string;
    abbreviation: string;
}

export interface Cell {
    value: number | string | string[] | boolean;
    cellState: boolean;
}

export interface UniqueCell {
    cell: Cell;
    duplication: number[];
}

export interface ValidationResult {
    isValid: boolean;
    error?: string;
}

export interface ValidationResults {
    isValid: boolean;
    errors?: string[];
}

export interface Field {
    fieldName: string;
    value: string;
}

export interface RowNames {
    fullName: string;
    email: string;
    phoneNumber: string;
    age: string;
    expirience: string;
    yearlyIncome: string;
    hasChildren: string;
    licenseStates: string;
    expirationDate: string;
    licenseNumber: string;
}

export interface Row {
    fullName: string;
    email: string;
    phoneNumber: string;
    age: number;
    expirience: number;
    yearlyIncome: number;
    hasChildren: string;
    licenseStates: string;
    expirationDate: string;
    licenseNumber: string;
}

export interface Recruit {
    id: number;
    fullName: string;
    email: UniqueCell;
    phoneNumber: UniqueCell;
    age: Cell;
    expirience: Cell;
    yearlyIncome: Cell;
    hasChildren: Cell;
    licenseStates: Cell;
    expirationDate: Cell;
    licenseNumber: Cell;
    duplication: number[];
}
