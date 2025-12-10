import React from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

/**
 * PageTransition - Wraps page content with a smooth fade-in animation
 */
export function PageTransition({ children, className = '' }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{
                duration: 0.3,
                ease: 'easeOut'
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

PageTransition.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
};

export default PageTransition;
