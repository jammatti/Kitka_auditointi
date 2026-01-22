/* ============================================================================
   Card Component
   Kela Design System - Card container with header, body, and footer
   ============================================================================ */

import React, { useState } from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Card children */
  children: React.ReactNode;
  /** Additional classes */
  className?: string;
  /** Collapsible card (requires title in CardHeader) */
  collapsible?: boolean;
  /** Default collapsed state */
  defaultCollapsed?: boolean;
  /** Controlled collapsed state */
  collapsed?: boolean;
  /** Callback when collapse state changes */
  onCollapsedChange?: (collapsed: boolean) => void;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      className = '',
      collapsible = false,
      defaultCollapsed = false,
      collapsed: controlledCollapsed,
      onCollapsedChange,
      ...props
    },
    ref
  ) => {
    const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
    const isControlled = controlledCollapsed !== undefined;
    const isCollapsed = isControlled ? controlledCollapsed : internalCollapsed;

    const handleToggle = () => {
      if (!collapsible) return;

      const newState = !isCollapsed;
      if (!isControlled) {
        setInternalCollapsed(newState);
      }
      onCollapsedChange?.(newState);
    };

    const classes = ['kela-card', className].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={classes} {...props}>
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && child.type === CardHeader) {
            return React.cloneElement(child as React.ReactElement<CardHeaderProps>, {
              collapsible,
              isCollapsed,
              onToggle: handleToggle,
            });
          }

          if (collapsible && isCollapsed) {
            // Hide body and footer when collapsed
            if (
              React.isValidElement(child) &&
              (child.type === CardBody || child.type === CardFooter)
            ) {
              return null;
            }
          }

          return child;
        })}
      </div>
    );
  }
);

Card.displayName = 'Card';

/* ============================================================================
   CardHeader Component
   ============================================================================ */

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  /** Internal prop - managed by Card */
  collapsible?: boolean;
  /** Internal prop - managed by Card */
  isCollapsed?: boolean;
  /** Internal prop - managed by Card */
  onToggle?: () => void;
}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ children, className = '', collapsible, isCollapsed, onToggle, ...props }, ref) => {
    const classes = ['kela-card-header', className].filter(Boolean).join(' ');

    const content = (
      <>
        {children}
        {collapsible && (
          <button
            type="button"
            onClick={onToggle}
            className="kela-card-toggle"
            aria-label={isCollapsed ? 'Expand' : 'Collapse'}
            aria-expanded={!isCollapsed}
            style={{
              marginLeft: 'auto',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              color: 'var(--kela-gray-60)',
              transition: 'transform var(--kela-transition-base)',
              transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
            }}
          >
            ▼
          </button>
        )}
      </>
    );

    if (collapsible) {
      return (
        <div
          ref={ref}
          className={classes}
          style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          {...props}
        >
          {content}
        </div>
      );
    }

    return (
      <div ref={ref} className={classes} {...props}>
        {content}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

/* ============================================================================
   CardTitle Component
   ============================================================================ */

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  className?: string;
  /** Heading level */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ children, className = '', as: Component = 'h3', ...props }, ref) => {
    const classes = ['kela-card-title', className].filter(Boolean).join(' ');

    return (
      <Component ref={ref} className={classes} {...props}>
        {children}
      </Component>
    );
  }
);

CardTitle.displayName = 'CardTitle';

/* ============================================================================
   CardBody Component
   ============================================================================ */

export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const CardBody = React.forwardRef<HTMLDivElement, CardBodyProps>(
  ({ children, className = '', ...props }, ref) => {
    const classes = ['kela-card-body', className].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  }
);

CardBody.displayName = 'CardBody';

/* ============================================================================
   CardFooter Component
   ============================================================================ */

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ children, className = '', ...props }, ref) => {
    const classes = ['kela-card-footer', className].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';
