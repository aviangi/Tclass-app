import React, { useState, useRef, useEffect } from 'react';
import type { ClassRecord } from '../types';
import { ClassStatus, FeeStatus, HomeworkStatus } from '../types';
import { CalendarIcon, ClockIcon, PencilIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon, CreditCardIcon, ClipboardCheckIcon } from './icons';
import { formatDate, formatTime } from '../utils/dateUtils';

interface ClassCardProps {
    classRecord: ClassRecord;
    onEdit: (classRecord: ClassRecord) => void;
    onDelete: (id: string) => void;
    onUpdate: (id: string, updatedData: Partial<ClassRecord>) => void;
}

const StatusBadge: React.FC<{ status: ClassStatus | FeeStatus | HomeworkStatus }> = ({ status }) => {
    // FIX: Removed duplicate object keys. After changes in `types.ts`, `FeeStatus.Due` and `HomeworkStatus.Due` have unique values.
    // The redundant `HomeworkStatus.Completed` key was removed as its value ('Completed') is already handled by `ClassStatus.Completed`.
    const colorMap = {
        [ClassStatus.Completed]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        [ClassStatus.NotCompleted]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        [FeeStatus.Paid]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        [FeeStatus.Due]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        [HomeworkStatus.Due]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorMap[status]}`}>{status}</span>;
};

export const ClassCard: React.FC<ClassCardProps> = ({ classRecord, onEdit, onDelete, onUpdate }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState(classRecord.studentName);
    const [isExtendingFee, setIsExtendingFee] = useState(false);
    const [newFeeDueDate, setNewFeeDueDate] = useState(classRecord.fee.dueDate);
    const [isPayingFee, setIsPayingFee] = useState(false);
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString());
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditingName && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditingName]);

    useEffect(() => {
        setNewFeeDueDate(classRecord.fee.dueDate);
    }, [classRecord.fee.dueDate]);

    const handleNameClick = () => {
        setEditedName(classRecord.studentName);
        setIsEditingName(true);
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditedName(e.target.value);
    };

    const handleNameSave = () => {
        if (editedName.trim() && editedName !== classRecord.studentName) {
            onUpdate(classRecord.id, { studentName: editedName.trim() });
        }
        setIsEditingName(false);
    };
    
    const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleNameSave();
        } else if (e.key === 'Escape') {
            setEditedName(classRecord.studentName); // Revert changes
            setIsEditingName(false);
        }
    };

    const handleMarkClassComplete = () => {
        onUpdate(classRecord.id, { status: ClassStatus.Completed });
    };

    const handleMarkFeePaidClick = () => {
        setPaymentDate(new Date().toISOString());
        setIsPayingFee(true);
    };

    const handleSavePaidFee = () => {
        onUpdate(classRecord.id, { 
            fee: { 
                ...classRecord.fee, 
                status: FeeStatus.Paid,
                paymentDate: paymentDate 
            } 
        });
        setIsPayingFee(false);
    };

    const handleCancelPayFee = () => {
        setIsPayingFee(false);
    };

    const handleMarkHomeworkComplete = (homeworkId: string) => {
        const updatedHomework = classRecord.homework.map(h => 
            h.id === homeworkId ? { ...h, status: HomeworkStatus.Completed } : h
        );
        onUpdate(classRecord.id, { homework: updatedHomework });
    };

    const handleReschedule = () => {
        onEdit({ ...classRecord });
    }
    
    const handleSaveExtendedFeeDate = () => {
        onUpdate(classRecord.id, { fee: { ...classRecord.fee, dueDate: newFeeDueDate } });
        setIsExtendingFee(false);
    };

    const handleCancelExtendFee = () => {
        setNewFeeDueDate(classRecord.fee.dueDate); // Reset on cancel
        setIsExtendingFee(false);
    };
    
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const isFeeOverdue = classRecord.fee.status === FeeStatus.Due && new Date(classRecord.fee.dueDate) < todayStart;


    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md transition-shadow duration-300 hover:shadow-xl">
            <div className="p-4">
                 <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{classRecord.subject}</p>
                        {isEditingName ? (
                            <input
                                ref={inputRef}
                                type="text"
                                value={editedName}
                                onChange={handleNameChange}
                                onBlur={handleNameSave}
                                onKeyDown={handleNameKeyDown}
                                className="text-md bg-transparent border-b border-indigo-500 focus:outline-none text-slate-800 dark:text-slate-200"
                                aria-label="Edit student name"
                            />
                        ) : (
                            <div className="flex items-center group cursor-pointer" onClick={handleNameClick}>
                                <p className="text-md text-slate-600 dark:text-slate-300 group-hover:text-indigo-500 dark:group-hover:text-indigo-400">{classRecord.studentName}</p>
                                <PencilIcon className="w-3 h-3 ml-2 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <StatusBadge status={classRecord.status} />
                        <button onClick={() => setIsExpanded(!isExpanded)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300" aria-label={isExpanded ? 'Collapse section' : 'Expand section'}>
                            {isExpanded ? <ChevronUpIcon className="w-5 h-5"/> : <ChevronDownIcon className="w-5 h-5"/>}
                        </button>
                    </div>
                </div>
                <div className="flex items-center mt-3 text-sm text-slate-500 dark:text-slate-400 px-4 pb-4 sm:px-4 sm:pb-4 border-b border-transparent">
                    <CalendarIcon className="w-4 h-4 mr-2"/>
                    <span>{formatDate(classRecord.dateTime)}</span>
                    <ClockIcon className="w-4 h-4 ml-4 mr-2"/>
                    <span>{formatTime(classRecord.dateTime)}</span>
                </div>
            </div>

            {isExpanded && (
                <div className="border-t border-slate-200 dark:border-slate-700 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-3">
                            <h4 className="font-semibold text-slate-600 dark:text-slate-300 flex items-center"><CreditCardIcon className="w-5 h-5 mr-2"/>Fee Details</h4>
                            <div className="flex justify-between items-center">
                                <div>
                                    {classRecord.fee.status === FeeStatus.Paid && <StatusBadge status={FeeStatus.Paid} />}
                                    {isFeeOverdue && <StatusBadge status={FeeStatus.Due} />}
                                </div>
                                {classRecord.fee.status === FeeStatus.Paid && classRecord.fee.paymentDate
                                    ? <span className="text-slate-500 dark:text-slate-400">Paid: {formatDate(classRecord.fee.paymentDate)}</span>
                                    : <span className="text-slate-500 dark:text-slate-400">Due: {formatDate(classRecord.fee.dueDate)}</span>
                                }
                            </div>
                             {classRecord.fee.status === FeeStatus.Due && (
                                isPayingFee ? (
                                    <div className="flex flex-col gap-2 mt-2">
                                        <label htmlFor={`payment-date-${classRecord.id}`} className="text-xs font-medium text-slate-600 dark:text-slate-400">Payment Date</label>
                                        <input
                                            id={`payment-date-${classRecord.id}`}
                                            type="date"
                                            value={paymentDate.split('T')[0]}
                                            onChange={(e) => {
                                                const newDate = new Date(e.target.value);
                                                setPaymentDate(new Date(newDate.setHours(12, 0, 0, 0)).toISOString());
                                            }}
                                            className="block w-full border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700"
                                        />
                                        <div className="flex gap-2">
                                            <button onClick={handleSavePaidFee} className="flex-1 text-xs bg-indigo-500 hover:bg-indigo-600 text-white py-1 px-2 rounded">Save Payment</button>
                                            <button onClick={handleCancelPayFee} className="flex-1 text-xs bg-slate-500 hover:bg-slate-600 text-white py-1 px-2 rounded">Cancel</button>
                                        </div>
                                    </div>
                                ) : isExtendingFee ? (
                                    <div className="flex flex-col gap-2 mt-2">
                                        <input
                                            type="date"
                                            value={newFeeDueDate.split('T')[0]}
                                            onChange={(e) => {
                                                const newDate = new Date(e.target.value);
                                                setNewFeeDueDate(new Date(newDate.setHours(12, 0, 0, 0)).toISOString());
                                            }}
                                            className="block w-full border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700"
                                        />
                                        <div className="flex gap-2">
                                            <button onClick={handleSaveExtendedFeeDate} className="flex-1 text-xs bg-indigo-500 hover:bg-indigo-600 text-white py-1 px-2 rounded">Save Date</button>
                                            <button onClick={handleCancelExtendFee} className="flex-1 text-xs bg-slate-500 hover:bg-slate-600 text-white py-1 px-2 rounded">Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex gap-2 mt-2">
                                        <button onClick={handleMarkFeePaidClick} className="flex-1 text-xs bg-green-500 hover:bg-green-600 text-white py-1 px-2 rounded">Mark as Paid</button>
                                        <button onClick={() => setIsExtendingFee(true)} className="flex-1 text-xs bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded">Extend Due Date</button>
                                    </div>
                                )
                            )}
                        </div>
                        <div className="space-y-3">
                             <h4 className="font-semibold text-slate-600 dark:text-slate-300 flex items-center"><ClipboardCheckIcon className="w-5 h-5 mr-2"/>Homework Details</h4>
                            {classRecord.homework.length > 0 ? (
                                <div className="space-y-3">
                                    {classRecord.homework.map(hw => (
                                        <div key={hw.id} className="p-2 rounded bg-slate-50 dark:bg-slate-700">
                                            <div className="flex justify-between items-center">
                                                <StatusBadge status={hw.status} />
                                                <span className="text-xs text-slate-500 dark:text-slate-400">Due: {formatDate(hw.dueDate)}</span>
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{hw.details}</p>
                                            {hw.status === HomeworkStatus.Due && (
                                                <button 
                                                    onClick={() => handleMarkHomeworkComplete(hw.id)} 
                                                    className="w-full text-xs bg-green-500 hover:bg-green-600 text-white py-1 px-2 rounded mt-2">
                                                    Mark as Completed
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-500 dark:text-slate-400">No homework assigned.</p>
                            )}
                        </div>
                    </div>
                     <div className="border-t border-slate-200 dark:border-slate-700 mt-4 pt-4 flex justify-between items-center">
                        <div className="flex gap-2">
                            {classRecord.status === ClassStatus.NotCompleted && <button onClick={handleMarkClassComplete} className="text-sm bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-md">Mark Class Completed</button>}
                            <button onClick={handleReschedule} disabled={classRecord.rescheduled} className="text-sm bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-md disabled:bg-slate-400 disabled:cursor-not-allowed">
                                {classRecord.rescheduled ? 'Rescheduled' : 'Reschedule'}
                            </button>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => onEdit(classRecord)} className="p-2 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400"><PencilIcon className="w-5 h-5"/></button>
                            <button onClick={() => onDelete(classRecord.id)} className="p-2 text-slate-500 hover:text-red-600 dark:hover:text-red-400"><TrashIcon className="w-5 h-5"/></button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};