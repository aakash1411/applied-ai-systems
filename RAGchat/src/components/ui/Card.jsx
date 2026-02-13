export default function Card({ className = '', children, ...props }) {
  return (
    <div
      className={`bg-bg-card rounded-xl border border-border ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
