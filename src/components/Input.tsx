import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  fullWidth?: boolean
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  fullWidth = true,
  className,
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random()}`

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`
          w-full px-4 py-2 border rounded-lg
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-colors duration-200
          ${error ? 'border-red-500 bg-red-50' : 'border-gray-300'}
          ${className || ''}
        `}
        {...props}
      />
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
      {helperText && !error && <p className="text-gray-500 text-sm mt-1">{helperText}</p>}
    </div>
  )
}
