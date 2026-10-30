import { Children, cloneElement, Fragment, isValidElement, type ReactNode } from 'react';

/**
 * A section's rows, with fragments opened up: rows passed as `<>…</>` (a list mapped
 * inside a condition) still get their own divider and spacing.
 */
export function flattenRows(children: ReactNode): ReactNode[] {
  return Children.toArray(children).flatMap((child) =>
    isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment
      ? flattenRows(child.props.children).map((inner) =>
          // Prefix keys so rows from different fragments can't collide.
          isValidElement(inner) ? cloneElement(inner, { key: `${child.key}${inner.key}` }) : inner,
        )
      : [child],
  );
}
