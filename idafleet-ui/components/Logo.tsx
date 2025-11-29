import React from 'react';

interface LogoProps {
    /** Height of the logo in pixels */
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
    /** Logo variant based on background */
    variant?: 'outline' | 'filled' | 'auto';
    /** Additional CSS classes */
    className?: string;
}

const sizeMap = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16',
    xl: 'h-20',
    '2xl': 'h-24',
    '3xl': 'h-32',
    '4xl': 'h-40'
};

/**
 * Logo component for consistent logo display across the application
 * 
 * @param variant - 'outline' for dark backgrounds, 'filled' for light backgrounds, 'auto' for automatic selection
 * 
 * Uses best practices including proper alt text, responsive sizing, and centralized management
 */
const Logo: React.FC<LogoProps> = ({ size = 'md', variant = 'auto', className = '' }) => {
    // Auto-select variant based on context (default to filled for now)
    const logoSrc = variant === 'outline' ? '/logo.png' : '/logo-filled.png';

    return (
        <img
            src={logoSrc}
            alt="IDA Ltd - Integrated Development and Logistics"
            className={`${sizeMap[size]} w-auto object-contain ${className}`}
            loading="lazy"
        />
    );
};

export default Logo;
