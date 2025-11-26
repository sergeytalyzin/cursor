import React from 'react';
import { Card as AntCard, type CardProps as AntCardProps } from 'antd';
import './Card.css';

interface CardProps extends AntCardProps {
	glass?: boolean;
	hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
	glass = false, 
	hover = true, 
	className = '', 
	children,
	...props 
}) => {

	const cardClasses = [
		'modern-card',
		glass ? 'glass-card' : '',
		hover ? 'card-hover' : '',
		className,
	]
		.filter(Boolean)
		.join(' ');

	return (
		<AntCard 
			className={cardClasses} 
			bordered={false}
			{...props}
		>
			{children}
		</AntCard>
	);
};
