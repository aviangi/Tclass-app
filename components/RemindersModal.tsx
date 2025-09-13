
import React from 'react';
import type { ClassRecord } from '../types';
import { HomeworkStatus } from '../types';
import { formatDate, formatTime } from '../utils/dateUtils';
import { BellIcon, CalendarIcon, CreditCardIcon, ClipboardCheckIcon, XIcon } from './icons';

interface RemindersModalProps {
    isOpen: boolean;
    onClose: () => void;
    upcomingClasses: ClassRecord[];
    dueFees: ClassRecord[];
    dueHomework: ClassRecord[];
}

const ReminderItem: React.FC<{icon: React.ReactNode, children: React.ReactNode}> = ({icon, children}) => (
    <li className="flex items-start py-3">
        <div className="text-indigo-500 dark:text-indigo-400 mr-4 mt-1">{icon}</div>
        <div className="text-sm text-slate-700 dark:text-slate-300">{children}</div>
    </li>
);

export const RemindersModal: React.FC<RemindersModalProps> = ({ isOpen, onClose, upcomingClasses, dueFees, dueHomework }) => {
    if (!isOpen) return null;

    const now = new Date();
    const allDueHomework = dueHomework.flatMap(c => 
        c.homework
            .filter(h => h.status === HomeworkStatus.Due && new Date(h.dueDate) <= now)
            .map(h => ({ ...h, studentName: c.studentName, subject: c.subject, classId: c.id }))
    );

    const hasReminders = upcomingClasses.length > 0 || dueFees.length > 0 || allDueHomework.length > 0;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center">
                            <BellIcon className="w-6 h-6 text-indigo-500 dark:text-indigo-400 mr-3" />
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Reminders</h2>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                             <XIcon className="w-6 h-6" />
                        </button>
                    </div>

                    {!hasReminders ? (
                         <p className="text-center text-slate-500 dark:text-slate-400 py-8">No urgent reminders. You're all caught up!</p>
                    ) : (
                        <ul className="divide-y divide-slate-200 dark:divide-slate-700 max-h-96 overflow-y-auto">
                            {upcomingClasses.map(c => (
                                <ReminderItem key={`class-${c.id}`} icon={<CalendarIcon className="w-5 h-5"/>}>
                                    <strong>Upcoming Class:</strong> {c.subject} with {c.studentName} on {formatDate(c.dateTime)} at {formatTime(c.dateTime)}.
                                </ReminderItem>
                            ))}
                            {dueFees.map(c => (
                                <ReminderItem key={`fee-${c.id}`} icon={<CreditCardIcon className="w-5 h-5"/>}>
                                    <strong>Fee Due:</strong> Fee for {c.subject} class with {c.studentName} was due on {formatDate(c.fee.dueDate)}.
                                </ReminderItem>
                            ))}
                            {allDueHomework.map(hw => (
                                <ReminderItem key={`hw-${hw.id}`} icon={<ClipboardCheckIcon className="w-5 h-5"/>}>
                                    <strong>Homework Due:</strong> Homework "{hw.details}" for {hw.subject} with {hw.studentName} was due on {formatDate(hw.dueDate)}.
                                </ReminderItem>
                            ))}
                        </ul>
                    )}
                    <div className="mt-6 flex justify-end">
                         <button onClick={onClose} className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Dismiss
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
