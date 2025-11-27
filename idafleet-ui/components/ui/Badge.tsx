
import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'neutral' | 'info' | 'transit' | 'pending' | 'delivered' | 'brand' | 'outline';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', className = '' }) => {
  // Styles based on design system widgets
  const styles = {
    // Standard system states
    neutral: 'bg-slate-100 text-slate-700',
    danger: 'bg-red-50 text-red-700 border border-red-100',
    brand: 'bg-primary text-white',
    outline: 'bg-white text-steel border border-steel-lighter',
    
    // Trip Status Mappings
    delivered: 'bg-green-100 text-green-700', // Success/Delivered
    success: 'bg-green-100 text-green-700',
    
    transit: 'bg-blue-50 text-blue-700 border border-blue-100', // In Transit
    info: 'bg-blue-50 text-blue-700 border border-blue-100',
    
    pending: 'bg-orange-50 text-orange-700 border border-orange-100', // Pending/Warning (Using Brand Secondary)
    warning: 'bg-orange-50 text-orange-700 border border-orange-100',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
};
