
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { ClassList } from './components/ClassList';
import { AddClassModal } from './components/AddClassModal';
import { RemindersModal } from './components/RemindersModal';
import { PlusIcon } from './components/icons';
import { useClassManager } from './hooks/useClassManager';
import type { ClassRecord } from './types';

export default function App(): React.ReactElement {
    const {
        classes,
        addClass,
        updateClass,
        deleteClass,
        filteredClasses,
        searchQuery,
        setSearchQuery,
        filters,
        setFilters,
        getUpcomingClasses,
        getDueFees,
        getDueHomework,
    } = useClassManager();

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isRemindersModalOpen, setIsRemindersModalOpen] = useState(false);
    const [editingClass, setEditingClass] = useState<ClassRecord | null>(null);

    useEffect(() => {
        // Show reminders on first load if there are any
        const upcomingClasses = getUpcomingClasses(3);
        const dueFees = getDueFees(3);
        const dueHomework = getDueHomework(3);

        if (upcomingClasses.length > 0 || dueFees.length > 0 || dueHomework.length > 0) {
            setIsRemindersModalOpen(true);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleOpenAddModal = () => {
        setEditingClass(null);
        setIsAddModalOpen(true);
    };
    
    const handleOpenEditModal = (classRecord: ClassRecord) => {
        setEditingClass(classRecord);
        setIsAddModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsAddModalOpen(false);
        setEditingClass(null);
    };

    const handleSaveClass = (classRecord: ClassRecord) => {
        if (editingClass) {
            updateClass(classRecord.id, classRecord);
        } else {
            const { id, ...newClass } = classRecord; // Remove temporary ID
            addClass(newClass);
        }
        handleCloseModal();
    };

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans">
            <Header />
            <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                <Dashboard classes={classes} />
                <ClassList
                    classes={filteredClasses}
                    onEdit={handleOpenEditModal}
                    onDelete={deleteClass}
                    onUpdate={updateClass}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    filters={filters}
                    setFilters={setFilters}
                />
            </main>

            <button
                onClick={handleOpenAddModal}
                className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-900 transition-transform duration-200 ease-in-out hover:scale-110"
                aria-label="Add new class"
            >
                <PlusIcon className="w-6 h-6" />
            </button>
            
            {isAddModalOpen && (
                <AddClassModal
                    isOpen={isAddModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSaveClass}
                    classRecord={editingClass}
                />
            )}

            {isRemindersModalOpen && (
                 <RemindersModal
                    isOpen={isRemindersModalOpen}
                    onClose={() => setIsRemindersModalOpen(false)}
                    upcomingClasses={getUpcomingClasses(3)}
                    dueFees={getDueFees(3)}
                    dueHomework={getDueHomework(3)}
                />
            )}
        </div>
    );
}
