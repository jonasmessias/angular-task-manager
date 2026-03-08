import { cva, VariantProps } from 'class-variance-authority';

export const dialogVariants = cva(
  [
    'fixed left-[50%] top-[50%] z-50 flex flex-col w-full',
    'translate-x-[-50%] translate-y-[-50%]',
    'border bg-card shadow-xl rounded-lg',
    'max-w-[calc(100%-2rem)] sm:max-w-[425px] overflow-hidden',
    // CSS transition (replaces @angular/animations)
    'transition-[opacity,transform] duration-150 ease-out',
    'data-[state=close]:opacity-0 data-[state=close]:scale-95',
    'data-[state=open]:opacity-100 data-[state=open]:scale-100',
  ].join(' '),
);
export type ZardDialogVariants = VariantProps<typeof dialogVariants>;
