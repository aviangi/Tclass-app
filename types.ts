export enum ClassStatus {
    Completed = 'Completed',
    NotCompleted = 'Not Completed',
}

export enum FeeStatus {
    Paid = 'Paid',
    // FIX: Changed value from 'Due' to 'Fee Due' to prevent key collision with HomeworkStatus.
    Due = 'Fee Due',
}

export enum HomeworkStatus {
    Completed = 'Completed',
    // FIX: Changed value from 'Due' to 'Homework Due' to prevent key collision with FeeStatus.
    Due = 'Homework Due',
}

export interface Fee {
    status: FeeStatus;
    dueDate: string; // ISO string
    paymentDate?: string; // ISO string, optional
}

export interface Homework {
    id: string;
    status: HomeworkStatus;
    dueDate: string; // ISO string
    details: string;
}

export interface ClassRecord {
    id: string;
    studentName: string;
    subject: string;
    dateTime: string; // ISO string
    status: ClassStatus;
    rescheduled: boolean;
    fee: Fee;
    homework: Homework[];
}