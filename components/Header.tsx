
import React from 'react';
import { BookOpenIcon } from './icons';

export const Header: React.FC = () => {
    return (
        <header className="bg-white dark:bg-slate-800 shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <BookOpenIcon className="h-8 w-8 text-indigo-500"/>
                        <h1 className="ml-3 text-2xl font-bold text-slate-900 dark:text-white">
                            Teacher's Class Manager
                        </h1>
                    </div>
                </div>
            </div>
        </header>
    );
};
