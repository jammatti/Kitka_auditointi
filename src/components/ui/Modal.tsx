/* ============================================================================
   Modal Component
   Kela Design System - Accessible dialog with focus trap
   ============================================================================ */

import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

export interface ModalProps {
  /** Whether modal is open */
  open: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Modal children */
  children: React.ReactNode;
  /** Modal size */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Disable closing on backdrop click */
  disableBackdropClick?: boolean;
  /** Disable closing on escape key */
  disableEscapeKey?: boolean;
  /** Additional className for modal */
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  children,
  size = 'md',
  disableBackdropClick = false,
  disableEscapeKey = false,
  className = '',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Handle escape key
  useEffect(() => {
    if (!open || disableEscapeKey) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose, disableEscapeKey]);

  // Manage focus
  useEffect(() => {
    if (open) {
      // Store currently focused element
      previousActiveElement.current = document.activeElement as HTMLElement;

      // Focus the modal
      const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements && focusableElements.length > 0) {
        focusableElements[0].focus();
      }

      // Prevent body scroll
      document.body.style.overflow = 'hidden';

      return () => {
        // Restore focus
        if (previousActiveElement.current) {
          previousActiveElement.current.focus();
        }
        // Restore body scroll
        document.body.style.overflow = '';
      };
    }
  }, [open]);

  // Focus trap
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (!focusableElements || focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey && document.activeElement === firstElement) {
      // Shift+Tab on first element -> focus last
      e.preventDefault();
      lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      // Tab on last element -> focus first
      e.preventDefault();
      firstElement.focus();
    }
  }, []);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (disableBackdropClick) return;
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!open) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  const modalClasses = ['kela-modal', sizeClasses[size], className]
    .filter(Boolean)
    .join(' ');

  return createPortal(
    <div
      className="kela-modal-backdrop"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        ref={modalRef}
        className={modalClasses}
        role="dialog"
        aria-modal="true"
        onKeyDown={handleKeyDown}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};

/* ============================================================================
   ModalHeader Component
   ============================================================================ */

export interface ModalHeaderProps {
  children: React.ReactNode;
  /** Show close button */
  showClose?: boolean;
  /** Callback when close button is clicked */
  onClose?: () => void;
  className?: string;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  children,
  showClose = true,
  onClose,
  className = '',
}) => {
  const classes = ['kela-modal-header', className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {children}
      {showClose && onClose && (
        <button
          type="button"
          className="kela-modal-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M15 5L5 15M5 5L15 15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

/* ============================================================================
   ModalTitle Component
   ============================================================================ */

export interface ModalTitleProps {
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const ModalTitle: React.FC<ModalTitleProps> = ({
  children,
  className = '',
  as: Component = 'h2',
}) => {
  const classes = ['kela-modal-title', className].filter(Boolean).join(' ');

  return <Component className={classes}>{children}</Component>;
};

/* ============================================================================
   ModalBody Component
   ============================================================================ */

export interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalBody: React.FC<ModalBodyProps> = ({ children, className = '' }) => {
  const classes = ['kela-modal-body', className].filter(Boolean).join(' ');

  return <div className={classes}>{children}</div>;
};

/* ============================================================================
   ModalFooter Component
   ============================================================================ */

export interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalFooter: React.FC<ModalFooterProps> = ({ children, className = '' }) => {
  const classes = ['kela-modal-footer', className].filter(Boolean).join(' ');

  return <div className={classes}>{children}</div>;
};
