import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  title?: string
  footer?: React.ReactNode
  onClick?: () => void
}

export const Card: React.FC<CardProps> = ({ children, className, title, footer, onClick }) => {
  return (
    <div
      className={`
        bg-white rounded-lg shadow border border-gray-100
        overflow-hidden transition-shadow duration-200 hover:shadow-lg
        ${onClick ? 'cursor-pointer' : ''}
        ${className || ''}
      `}
      onClick={onClick}
    >
      {title && (
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      <div className="px-6 py-4">{children}</div>
      {footer && <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">{footer}</div>}
    </div>
  )
}
