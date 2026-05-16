/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { ReactNode } from 'react';

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  span?: 'small' | 'medium' | 'large' | 'tall' | 'wide';
  onClick?: () => void;
}

export function BentoCard({ children, className = '', span = 'small', onClick }: BentoCardProps) {
  const spanClasses = {
    small: 'col-span-1 row-span-1',
    medium: 'col-span-1 md:col-span-2 row-span-1',
    large: 'col-span-1 md:col-span-2 row-span-2',
    tall: 'col-span-1 row-span-2',
    wide: 'col-span-1 md:col-span-3 row-span-1',
  };

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={onClick}
      className={`bg-white rounded-[32px] overflow-hidden border border-black/10 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${spanClasses[span]} ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function BentoGrid({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}>
      {children}
    </div>
  );
}
