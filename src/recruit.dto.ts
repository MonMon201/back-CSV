import { Cell, Recruit, UniqueCell } from './types';

export class RecruitDto {
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
    constructor(recruit: Recruit) {
        this.id = recruit.id;
        this.fullName = recruit.fullName;
        this.email = recruit.email;
        this.phoneNumber = recruit.phoneNumber;
        this.age = recruit.age;
        this.expirience = recruit.expirience;
        this.yearlyIncome = recruit.yearlyIncome;
        this.hasChildren = recruit.hasChildren;
        this.licenseStates = recruit.licenseStates;
        this.expirationDate = recruit.expirationDate;
        this.licenseNumber = recruit.licenseNumber;
        this.duplication = recruit.duplication;
    }
}
