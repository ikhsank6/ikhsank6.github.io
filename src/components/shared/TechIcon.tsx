import React from 'react';
import { getTechIconUrl } from '../../utils/techIcons';

interface TechIconProps {
    tech: string;
    size?: 'sm' | 'md' | 'lg';
    showTooltip?: boolean;
    className?: string;
}

/**
 * Reusable Tech Icon Component
 * Displays technology icons from SimpleIcons CDN
 */
export const TechIcon: React.FC<TechIconProps> = ({
    tech,
    size = 'md',
    showTooltip = true,
    className = ''
}) => {
    const iconUrl = getTechIconUrl(tech);

    const sizeClasses = {
        sm: 'tech-icon-sm',
        md: 'tech-icon',
        lg: 'tech-icon-lg',
    };

    if (iconUrl) {
        return (
            <div
                className={`${sizeClasses[size]} ${className}`.trim()}
                title={showTooltip ? tech : undefined}
            >
                <img src={iconUrl} alt={tech} loading="lazy" />
            </div>
        );
    }

    // Fallback to text badge for unknown techs
    return <span className="tech-badge-small">{tech}</span>;
};

export default TechIcon;
