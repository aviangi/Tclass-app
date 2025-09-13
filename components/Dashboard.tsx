import React from 'react';
import type { ClassRecord } from '../types';
import { ClassStatus, HomeworkStatus, FeeStatus } from '../types';
import { CalendarIcon, ClipboardCheckIcon, CreditCardIcon } from './icons';
import { formatDate, formatTime } from '../utils/dateUtils';

interface DashboardProps {
    classes: ClassRecord[];
}

const DashboardCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; color: string }> = ({ icon, title, children, color }) => (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 flex flex-col">
        <div className="flex items-center mb-4">
            <div className={`p-2 rounded-full ${color}`}>
                {icon}
            </div>
            <h3 className="ml-4 text-lg font-semibold text-slate-700 dark:text-slate-300">{title}</h3>
        </div>
        <div className="text-slate-900 dark:text-white mt-auto">
            {children}
        </div>
    </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ classes }) => {
    const nextClass = classes
        .filter(c => c.status === ClassStatus.NotCompleted && new Date(c.dateTime) > new Date())
        .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())[0];

    const now = new Date();
    const pendingHomeworkCount = classes.flatMap(c => c.homework).filter(h => h.status === HomeworkStatus.Due).length;
    const feesDueCount = classes.filter(c => c.fee.status === FeeStatus.Due && new Date(c.fee.dueDate) < now).length;

    return (
        <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-200">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DashboardCard icon={<CalendarIcon className="w-6 h-6 text-white"/>} title="Next Class" color="bg-blue-500">
                    {nextClass ? (
                        <div>
                            <p className="font-bold text-xl">{nextClass.subject}</p>
                            <p className="text-slate-600 dark:text-slate-400">{nextClass.studentName}</p>
                            <p className="mt-2 text-lg">{formatDate(nextClass.dateTime)} at {formatTime(nextClass.dateTime)}</p>
                        </div>
                    ) : (
                        <p className="text-lg">No upcoming classes.</p>
                    )}
                </DashboardCard>
                <DashboardCard icon={<ClipboardCheckIcon className="w-6 h-6 text-white"/>} title="Pending Homework" color="bg-amber-500">
                    <p className="text-4xl font-bold">{pendingHomeworkCount}</p>
                    <p className="text-slate-600 dark:text-slate-400">assignments due</p>
                </DashboardCard>
                <DashboardCard icon={<CreditCardIcon className="w-6 h-6 text-white"/>} title="Fees Due" color="bg-red-500">
                    <p className="text-4xl font-bold">{feesDueCount}</p>
                    <p className="text-slate-600 dark:text-slate-400">payments outstanding</p>
                </DashboardCard>
            </div>
        </div>
    );
};