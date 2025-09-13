import React, { useState, useEffect } from 'react';
import type { ClassRecord, Homework } from '../types';
import { ClassStatus, FeeStatus, HomeworkStatus } from '../types';
import { XIcon } from './icons';

interface AddClassModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (classRecord: ClassRecord) => void;
    classRecord: ClassRecord | null;
}

const getInitialFormData = (classRecord: ClassRecord | null): ClassRecord => {
    if (classRecord) {
        return JSON.parse(JSON.stringify(classRecord)); // Deep copy
    }
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);

    return {
        id: `temp-${crypto.randomUUID()}`,
        studentName: '',
        subject: '',
        dateTime: now.toISOString(),
        status: ClassStatus.NotCompleted,
        rescheduled: false,
        fee: { status: FeeStatus.Due, dueDate: tomorrow.toISOString() },
        homework: [],
    };
};

const InputField: React.FC<{ label: string; id: string; children: React.ReactNode }> = ({ label, id, children }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
        {children}
    </div>
);

export const AddClassModal: React.FC<AddClassModalProps> = ({ isOpen, onClose, onSave, classRecord }) => {
    const [formData, setFormData] = useState<ClassRecord>(getInitialFormData(classRecord));

    useEffect(() => {
        setFormData(getInitialFormData(classRecord));
    }, [classRecord, isOpen]);

    if (!isOpen) return null;
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const currentDateTime = new Date(formData.dateTime);
        if (name === 'date') {
            const [year, month, day] = value.split('-').map(Number);
            currentDateTime.setFullYear(year, month - 1, day);
        } else if (name === 'time') {
            const [hours, minutes] = value.split(':').map(Number);
            currentDateTime.setHours(hours, minutes);
        }
        setFormData(prev => ({ ...prev, dateTime: currentDateTime.toISOString() }));
    };

    const handleFeeDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = new Date(e.target.value);
        // setHours(12) to avoid timezone issues where the date might shift to the previous day
        const isoString = new Date(newDate.setHours(12,0,0,0)).toISOString();
        setFormData(prev => ({
            ...prev,
            fee: { ...prev.fee, dueDate: isoString }
        }));
    };

    const handlePaymentDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = new Date(e.target.value);
        const isoString = new Date(newDate.setHours(12, 0, 0, 0)).toISOString();
        setFormData(prev => ({
            ...prev,
            fee: { ...prev.fee, paymentDate: isoString }
        }));
    };


    const handleFeeStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value as FeeStatus;
        setFormData(prev => {
            const newFee = { ...prev.fee, status: newStatus };
            if (newStatus === FeeStatus.Paid) {
                 newFee.paymentDate = prev.fee.paymentDate || new Date().toISOString();
            } else {
                delete newFee.paymentDate;
            }
            return { ...prev, fee: newFee };
        });
    };

    const handleHomeworkChange = (index: number, field: keyof Omit<Homework, 'id'>, value: string) => {
        const newHomework = [...formData.homework];
        (newHomework[index] as any)[field] = value;

        if (field === 'dueDate') {
            const newDate = new Date(value);
            // setHours(12) to avoid timezone issues where the date might shift to the previous day
            newHomework[index].dueDate = new Date(newDate.setHours(12,0,0,0)).toISOString();
        }

        setFormData(prev => ({ ...prev, homework: newHomework }));
    };

    const addHomework = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setFormData(prev => ({
            ...prev,
            homework: [
                ...prev.homework,
                { id: crypto.randomUUID(), details: '', status: HomeworkStatus.Due, dueDate: tomorrow.toISOString() }
            ]
        }));
    };

    const removeHomework = (index: number) => {
        setFormData(prev => ({
            ...prev,
            homework: prev.homework.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (classRecord) {
            onSave({ ...formData, rescheduled: classRecord.dateTime !== formData.dateTime });
        } else {
            onSave(formData);
        }
    };
    
    const dateValue = formData.dateTime.split('T')[0];
    const timeValue = new Date(formData.dateTime).toTimeString().substring(0,5);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">{classRecord ? 'Edit Class' : 'Add New Class'}</h2>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                            <XIcon className="w-6 h-6" />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                         <InputField label="Student Name" id="studentName">
                            <input type="text" id="studentName" name="studentName" value={formData.studentName} onChange={handleInputChange} required className="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700"/>
                        </InputField>
                        <InputField label="Subject" id="subject">
                             <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleInputChange} required className="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700"/>
                        </InputField>
                         <div className="grid grid-cols-2 gap-4">
                            <InputField label="Date" id="date">
                                <input type="date" id="date" name="date" value={dateValue} onChange={handleDateTimeChange} required className="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700"/>
                            </InputField>
                            <InputField label="Time" id="time">
                                <input type="time" id="time" name="time" value={timeValue} onChange={handleDateTimeChange} required className="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700"/>
                            </InputField>
                        </div>
                        
                        <fieldset className="border-t border-slate-200 dark:border-slate-700 pt-6">
                            <legend className="text-base font-medium text-slate-800 dark:text-slate-200 -mt-9 px-2 bg-white dark:bg-slate-800 w-auto">Fee Details</legend>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <InputField label="Fee Status" id="feeStatus">
                                        <select
                                            id="feeStatus"
                                            value={formData.fee.status}
                                            onChange={handleFeeStatusChange}
                                            className="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700"
                                        >
                                            <option value={FeeStatus.Due}>Due</option>
                                            <option value={FeeStatus.Paid}>Paid</option>
                                        </select>
                                    </InputField>
                                    <InputField label="Fee Due Date" id="feeDueDate">
                                        <input
                                            type="date"
                                            id="feeDueDate"
                                            value={formData.fee.dueDate.split('T')[0]}
                                            onChange={handleFeeDueDateChange}
                                            required
                                            className="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700"
                                        />
                                    </InputField>
                                </div>
                                {formData.fee.status === FeeStatus.Paid && (
                                    <InputField label="Payment Date" id="paymentDate">
                                        <input
                                            type="date"
                                            id="paymentDate"
                                            value={(formData.fee.paymentDate || '').split('T')[0]}
                                            onChange={handlePaymentDateChange}
                                            required
                                            className="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700"
                                        />
                                    </InputField>
                                )}
                            </div>
                        </fieldset>

                        <fieldset>
                            <legend className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">Homework</legend>
                            <div className="space-y-4">
                                {formData.homework.map((hw, index) => (
                                    <div key={hw.id} className="p-3 border border-slate-200 dark:border-slate-600 rounded-md relative bg-slate-50 dark:bg-slate-700/50">
                                        <button type="button" onClick={() => removeHomework(index)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500" aria-label={`Remove homework #${index + 1}`}>
                                            <XIcon className="w-4 h-4" />
                                        </button>
                                        <InputField label={`Homework #${index + 1} Details`} id={`homework-details-${index}`}>
                                            <textarea value={hw.details} onChange={(e) => handleHomeworkChange(index, 'details', e.target.value)} rows={2} className="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700"></textarea>
                                        </InputField>
                                        <div className="grid grid-cols-2 gap-4 mt-2">
                                            <InputField label="Due Date" id={`homework-due-${index}`}>
                                                <input type="date" value={hw.dueDate.split('T')[0]} onChange={(e) => handleHomeworkChange(index, 'dueDate', e.target.value)} required className="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700"/>
                                            </InputField>
                                            <InputField label="Status" id={`homework-status-${index}`}>
                                                <select value={hw.status} onChange={(e) => handleHomeworkChange(index, 'status', e.target.value as HomeworkStatus)} className="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700">
                                                    <option value={HomeworkStatus.Due}>Due</option>
                                                    <option value={HomeworkStatus.Completed}>Completed</option>
                                                </select>
                                            </InputField>
                                        </div>
                                    </div>
                                ))}
                            </div>
                             <button type="button" onClick={addHomework} className="mt-3 text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                                + Add Homework
                            </button>
                        </fieldset>

                        <div className="flex justify-end gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <button type="button" onClick={onClose} className="py-2 px-4 border border-slate-300 dark:border-slate-600 rounded-md text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                Cancel
                            </button>
                            <button type="submit" className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                Save Class
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};