
export const formatDate = (isoString: string): string => {
    return new Date(isoString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

export const formatTime = (isoString: string): string => {
    return new Date(isoString).toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
};
