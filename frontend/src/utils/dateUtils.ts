/**
 * Format a timestamp to show relative time for last seen indicators
 * @param timestamp - ISO timestamp string
 * @returns Formatted string like "2 minutes ago", "1 hour ago", etc.
 */
export const formatLastSeen = (timestamp: string): string => {
    const now = new Date();
    const lastSeen = new Date(timestamp);
    const diffInMs = now.getTime() - lastSeen.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
        return 'Just now';
    } else if (diffInMinutes < 60) {
        return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    } else if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    } else if (diffInDays < 7) {
        return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    } else {
        // For older timestamps, show the actual date
        return lastSeen.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: lastSeen.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    }
};

/**
 * Format message timestamp for display
 * @param timestamp - ISO timestamp string
 * @returns Formatted time string
 */
export const formatMessageTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
    });
};

/**
 * Format date for message grouping
 * @param timestamp - ISO timestamp string
 * @returns Formatted date string
 */
export const formatMessageDate = (timestamp: string): string => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    } else {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
        });
    }
};