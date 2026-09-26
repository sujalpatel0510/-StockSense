import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

export interface Column<T> {
  key: string;
  header: string;
  accessor: (row: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyAccessor: (row: T) => string;
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
  loading?: boolean;
  rowCount?: number;
  onRowClick?: (row: T) => void;
  selectedKeys?: Set<string>;
  onSelectionChange?: (keys: Set<string>) => void;
  className?: string;
}

function TableHeader<T>({ columns, className }: { columns: Column<T>[]; className?: string }) {
  return (
    <thead className={clsx('bg-bg-elevated border-b border-border-subtle', className)}>
      <tr>
        {columns.map((column) => (
          <th
            key={column.key}
            scope="col"
            className={clsx(
              'px-4 py-3 text-left text-caption font-semibold text-text-secondary uppercase tracking-wider',
              column.align === 'center' && 'text-center',
              column.align === 'right' && 'text-right',
              column.headerClassName
            )}
            style={{ width: column.width }}
          >
            {column.header}
          </th>
        ))}
      </tr>
    </thead>
  );
}

function TableBody<T>({
  columns,
  data,
  keyAccessor,
  onRowClick,
  selectedKeys,
  className,
}: {
  columns: Column<T>[];
  data: T[];
  keyAccessor: (row: T) => string;
  onRowClick?: (row: T) => void;
  selectedKeys?: Set<string>;
  className?: string;
}) {
  if (data.length === 0) {
    return null;
  }

  return (
    <tbody className={clsx('divide-y divide-border-subtle', className)}>
      {data.map((row, rowIndex) => {
        const key = keyAccessor(row);
        const isSelected = selectedKeys?.has(key);
        const isClickable = !!onRowClick;

        return (
          <motion.tr
            key={key}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: rowIndex * 0.03, duration: 0.2 }}
            className={clsx(
              'transition-colors duration-fast',
              isClickable && 'cursor-pointer hover:bg-bg-elevated/50',
              isSelected && 'bg-brand-primary/5',
              'odd:bg-bg-elevated/30'
            )}
            onClick={() => onRowClick?.(row)}
            tabIndex={isClickable ? 0 : undefined}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && isClickable) {
                e.preventDefault();
                onRowClick(row);
              }
            }}
            aria-selected={isSelected}
          >
            {columns.map((column) => (
              <td
                key={column.key}
                className={clsx(
                  'px-4 py-3 text-body text-text-primary',
                  column.align === 'center' && 'text-center',
                  column.align === 'right' && 'text-right',
                  column.className
                )}
              >
                {column.accessor(row)}
              </td>
            ))}
          </motion.tr>
        );
      })}
    </tbody>
  );
}

function TableSkeleton({ columns, rows = 5 }: { columns: Column<any>[]; rows?: number }) {
  return (
    <tbody>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="animate-pulse">
          {columns.map((column) => (
            <td key={column.key} className="px-4 py-3">
              <div className="h-4 bg-border-subtle rounded w-3/4" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

function EmptyState({ message, action }: { message: string; action?: React.ReactNode }) {
  return (
    <tbody>
      <tr>
        <td colSpan={99} className="py-12 text-center">
          <div className="flex flex-col items-center gap-3 text-text-muted">
            <div className="w-12 h-12 rounded-xl bg-bg-elevated flex items-center justify-center border border-border-subtle">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-body text-text-secondary">{message}</p>
            {action && <div className="mt-2">{action}</div>}
          </div>
        </td>
      </tr>
    </tbody>
  );
}

export const Table = forwardRef<HTMLTableElement, TableProps<any>>(
  (
    {
      columns,
      data,
      keyAccessor,
      emptyMessage = 'No data available',
      emptyAction,
      loading = false,
      onRowClick,
      selectedKeys,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div className={clsx('overflow-x-auto rounded-xl border border-border-subtle bg-bg-surface', className)} {...props}>
        <table ref={ref} className="w-full text-left" role="grid">
          <TableHeader columns={columns} />
          {loading ? (
            <TableSkeleton columns={columns} rows={5} />
          ) : data.length === 0 ? (
            <EmptyState message={emptyMessage} action={emptyAction} />
          ) : (
            <TableBody
              columns={columns}
              data={data}
              keyAccessor={keyAccessor}
              onRowClick={onRowClick}
              selectedKeys={selectedKeys}
            />
          )}
        </table>
      </div>
    );
  }
);

Table.displayName = 'Table';