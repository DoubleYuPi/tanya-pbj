import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
    {
        variants: {
            variant: {
                default: 'bg-[var(--color-muted)] text-[var(--color-navy-700)]',
                secondary: 'bg-[var(--color-emerald-50)] text-[var(--color-emerald-600)]',
                outline: 'border border-[var(--color-border)] text-[var(--color-muted-foreground)]',
                destructive: 'bg-red-50 text-red-600',
            },
        },
        defaultVariants: { variant: 'default' },
    }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
    return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
