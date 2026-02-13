import { forwardRef } from 'react'

const variants = {
  primary: 'bg-accent hover:bg-accent-dim text-white',
  secondary: 'bg-bg-card hover:bg-bg-card-hover text-text-primary border border-border',
  ghost: 'hover:bg-bg-card text-text-secondary hover:text-text-primary',
  danger: 'bg-danger/10 hover:bg-danger/20 text-danger',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

const Button = forwardRef(({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => (
  <button
    ref={ref}
    className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    {...props}
  >
    {children}
  </button>
))

Button.displayName = 'Button'
export default Button
