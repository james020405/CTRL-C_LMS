import React from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../lib/utils';

export function Card({ className, children, ...props }) {
    return (
        <div
            className={cn(
                "bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

Card.propTypes = {
    /** Additional CSS classes */
    className: PropTypes.string,
    /** Card content */
    children: PropTypes.node,
    /** Click handler */
    onClick: PropTypes.func,
};

