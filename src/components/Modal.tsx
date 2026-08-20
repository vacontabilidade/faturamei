import React from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer, size = 'md' }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className={`bg-white rounded-lg shadow-xl ${sizeClasses[size]} w-full mx-4`} onClick={(e) => e.stopPropagation()}>
        {title && (
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">
              ×
            </button>
          </div>
        )}
        <div className="px-6 py-4">{children}</div>
        {footer && <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">{footer}</div>}
      </div>
    </div>
  )
}
