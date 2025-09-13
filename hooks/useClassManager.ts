import { useState, useMemo, useCallback } from 'react';
import type { ClassRecord } from '../types';
import { ClassStatus, FeeStatus, HomeworkStatus } from '../types';

const getInitialClasses = (): ClassRecord[] => {
    return [];
};


export const useClassManager = () => {
    const [classes, setClasses] = useState<ClassRecord[]>(getInitialClasses());
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        classStatus: 'all',
        paymentStatus: 'all',
        homeworkStatus: 'all',
    });

    const addClass = useCallback((newClass: Omit<ClassRecord, 'id'>) => {
        const classWithId: ClassRecord = { ...newClass, id: crypto.randomUUID() };
        setClasses(prev => [...prev, classWithId].sort((a,b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()));
    }, []);

    const updateClass = useCallback((id: string, updatedClass: Partial<ClassRecord>) => {
        setClasses(prev => prev.map(c => c.id === id ? { ...c, ...updatedClass } : c).sort((a,b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()));
    }, []);

    const deleteClass = useCallback((id: string) => {
        setClasses(prev => prev.filter(c => c.id !== id));
    }, []);

    const filteredClasses = useMemo(() => {
        return classes.filter(c => {
            const searchMatch = c.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                c.subject.toLowerCase().includes(searchQuery.toLowerCase());
            const classStatusMatch = filters.classStatus === 'all' || c.status === filters.classStatus;
            const paymentStatusMatch = filters.paymentStatus === 'all' || c.fee.status === filters.paymentStatus;
            const homeworkStatusMatch = filters.homeworkStatus === 'all' || c.homework.some(h => h.status === filters.homeworkStatus);

            return searchMatch && classStatusMatch && paymentStatusMatch && homeworkStatusMatch;
        });
    }, [classes, searchQuery, filters]);

    const getUpcomingClasses = useCallback((days: number) => {
        const now = new Date();
        const futureDate = new Date();
        futureDate.setDate(now.getDate() + days);
        return classes
            .filter(c => {
                const classDate = new Date(c.dateTime);
                return classDate >= now && classDate <= futureDate && c.status === ClassStatus.NotCompleted;
            })
            .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
    }, [classes]);

    const getDueFees = useCallback((days: number) => {
        const now = new Date();
        const pastDate = new Date();
        pastDate.setDate(now.getDate() - days);
        pastDate.setHours(0,0,0,0); // Start of the day
        
        return classes.filter(c => {
            const dueDate = new Date(c.fee.dueDate);
            return c.fee.status === FeeStatus.Due && dueDate < now && dueDate >= pastDate;
        });
    }, [classes]);

    const getDueHomework = useCallback((days: number) => {
        const now = new Date();
        return classes.filter(c => {
            return c.homework.some(h => {
                const dueDate = new Date(h.dueDate);
                return h.status === HomeworkStatus.Due && dueDate <= now;
            });
        });
    }, [classes]);


    return {
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
    };
};