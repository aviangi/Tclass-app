
import React from 'react';
import type { ClassRecord } from '../types';
import { ClassCard } from './ClassCard';
import { SearchIcon } from './icons';
// FIX: Import enums to use for filter option values, ensuring they stay in sync with the type definitions.
import { FeeStatus, HomeworkStatus } from '../types';

interface ClassListProps {
    classes: ClassRecord[];
    onEdit: (classRecord: ClassRecord) => void;
    onDelete: (id: string) => void;
    onUpdate: (id: string, updatedData: Partial<ClassRecord>) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    filters: { classStatus: string; paymentStatus: string; homeworkStatus: string; };
    setFilters: (filters: { classStatus: string; paymentStatus: string; homeworkStatus: string; }) => void;
}

const FilterDropdown: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: { value: string; label: string }[] }> = ({ label, value, onChange, options }) => (
    <div>
        <label htmlFor={label} className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
        <select
            id={label}
            value={value}
            onChange={onChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200"
        >
            {options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
    </div>
);

export const ClassList: React.FC<ClassListProps> = ({ classes, onEdit, onDelete, onUpdate, searchQuery, setSearchQuery, filters, setFilters }) => {
    
    const handleFilterChange = (filterName: string) => (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters({ ...filters, [filterName]: e.target.value });
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-200">Class Records</h2>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-4 relative">
                        <input
                            type="text"
                            placeholder="Search by student or subject..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="w-5 h-5 text-slate-400" />
                        </div>
                    </div>
                    <FilterDropdown 
                        label="Class Status"
                        value={filters.classStatus}
                        onChange={handleFilterChange('classStatus')}
                        options={[{value: 'all', label: 'All'}, {value: 'Completed', label: 'Completed'}, {value: 'Not Completed', label: 'Not Completed'}]}
                    />
                    <FilterDropdown 
                        label="Payment Status"
                        value={filters.paymentStatus}
                        onChange={handleFilterChange('paymentStatus')}
                        // FIX: Use enums for option values to align with the updated, unique types.
                        options={[{value: 'all', label: 'All'}, {value: FeeStatus.Paid, label: 'Paid'}, {value: FeeStatus.Due, label: 'Due'}]}
                    />
                    <FilterDropdown 
                        label="Homework Status"
                        value={filters.homeworkStatus}
                        onChange={handleFilterChange('homeworkStatus')}
                        // FIX: Use enums for option values to align with the updated, unique types.
                        options={[{value: 'all', label: 'All'}, {value: HomeworkStatus.Completed, label: 'Completed'}, {value: HomeworkStatus.Due, label: 'Due'}]}
                    />
                </div>
            </div>

            {classes.length > 0 ? (
                <div className="space-y-4">
                    {classes.map(c => (
                        <ClassCard key={c.id} classRecord={c} onEdit={onEdit} onDelete={onDelete} onUpdate={onUpdate} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg shadow-md">
                    <p className="text-slate-500 dark:text-slate-400">No classes found matching your criteria.</p>
                </div>
            )}
        </div>
    );
};