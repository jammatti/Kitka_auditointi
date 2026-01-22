/* ============================================================================
   Table Component
   Kela Design System - Responsive table with sorting
   ============================================================================ */

import React from 'react';

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
  className?: string;
  /** Responsive - makes table scrollable on small screens */
  responsive?: boolean;
}

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ children, className = '', responsive = true, ...props }, ref) => {
    const classes = ['kela-table', className].filter(Boolean).join(' ');

    const table = (
      <table ref={ref} className={classes} {...props}>
        {children}
      </table>
    );

    if (responsive) {
      return <div className="kela-table-responsive">{table}</div>;
    }

    return table;
  }
);

Table.displayName = 'Table';

/* ============================================================================
   TableHead Component
   ============================================================================ */

export interface TableHeadProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
  className?: string;
}

export const TableHead = React.forwardRef<HTMLTableSectionElement, TableHeadProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <thead ref={ref} className={className} {...props}>
        {children}
      </thead>
    );
  }
);

TableHead.displayName = 'TableHead';

/* ============================================================================
   TableBody Component
   ============================================================================ */

export interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
  className?: string;
}

export const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <tbody ref={ref} className={className} {...props}>
        {children}
      </tbody>
    );
  }
);

TableBody.displayName = 'TableBody';

/* ============================================================================
   TableRow Component
   ============================================================================ */

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
  className?: string;
}

export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <tr ref={ref} className={className} {...props}>
        {children}
      </tr>
    );
  }
);

TableRow.displayName = 'TableRow';

/* ============================================================================
   TableHeader Component
   ============================================================================ */

export type SortDirection = 'asc' | 'desc' | null;

export interface TableHeaderProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
  className?: string;
  /** Make this column sortable */
  sortable?: boolean;
  /** Current sort direction */
  sortDirection?: SortDirection;
  /** Callback when sort is clicked */
  onSort?: () => void;
}

export const TableHeader = React.forwardRef<HTMLTableCellElement, TableHeaderProps>(
  ({ children, className = '', sortable, sortDirection, onSort, ...props }, ref) => {
    const classes = [
      sortable && 'kela-table-sortable',
      sortDirection && `kela-table-sorted-${sortDirection}`,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const handleClick = () => {
      if (sortable && onSort) {
        onSort();
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (sortable && onSort && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        onSort();
      }
    };

    const sortIcon = sortDirection === 'asc' ? '↑' : sortDirection === 'desc' ? '↓' : '⇅';

    return (
      <th
        ref={ref}
        className={classes}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={sortable ? 0 : undefined}
        role={sortable ? 'button' : undefined}
        aria-sort={
          sortDirection === 'asc'
            ? 'ascending'
            : sortDirection === 'desc'
            ? 'descending'
            : undefined
        }
        style={{
          cursor: sortable ? 'pointer' : undefined,
          userSelect: sortable ? 'none' : undefined,
        }}
        {...props}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--kela-space-sm)',
          }}
        >
          <span>{children}</span>
          {sortable && (
            <span
              style={{
                fontSize: '0.875rem',
                opacity: sortDirection ? 1 : 0.5,
              }}
              aria-hidden="true"
            >
              {sortIcon}
            </span>
          )}
        </div>
      </th>
    );
  }
);

TableHeader.displayName = 'TableHeader';

/* ============================================================================
   TableCell Component
   ============================================================================ */

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children?: React.ReactNode;
  className?: string;
  /** Align cell content */
  align?: 'left' | 'center' | 'right';
}

export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ children, className = '', align = 'left', ...props }, ref) => {
    const classes = [className].filter(Boolean).join(' ');

    return (
      <td
        ref={ref}
        className={classes}
        style={{ textAlign: align, ...props.style }}
        {...props}
      >
        {children}
      </td>
    );
  }
);

TableCell.displayName = 'TableCell';

/* ============================================================================
   Helper Hook for Sorting
   ============================================================================ */

export interface UseSortableTableOptions<T> {
  data: T[];
  defaultSortKey?: keyof T;
  defaultSortDirection?: 'asc' | 'desc';
}

export function useSortableTable<T>({
  data,
  defaultSortKey,
  defaultSortDirection = 'asc',
}: UseSortableTableOptions<T>) {
  const [sortKey, setSortKey] = React.useState<keyof T | null>(defaultSortKey || null);
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>(
    defaultSortDirection
  );

  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      // Toggle direction or clear sort
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortKey(null);
        setSortDirection('asc');
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortKey) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal == null) return 1;
      if (bVal == null) return -1;

      let comparison = 0;

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = aVal.localeCompare(bVal);
      } else if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      } else if (aVal instanceof Date && bVal instanceof Date) {
        comparison = aVal.getTime() - bVal.getTime();
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortKey, sortDirection]);

  return {
    sortedData,
    sortKey,
    sortDirection: sortKey ? sortDirection : null,
    handleSort,
  };
}
