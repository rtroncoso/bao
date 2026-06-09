import * as React from 'react';

import { cn } from '../lib/utils';
import { Input, type InputProps } from './ui/input';
import { Label } from './ui/label';

export interface FormFieldProps extends InputProps {
  label?: string;
  error?: string;
  touched?: boolean;
}

const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ className, label, error, touched, id, name, ...props }, ref) => {
    const fieldId = id ?? name;
    const showError = Boolean(error && touched);

    return (
      <div className={cn('space-y-2', className)}>
        {label && <Label htmlFor={fieldId}>{label}</Label>}
        <Input
          ref={ref}
          id={fieldId}
          name={name}
          aria-invalid={showError}
          aria-describedby={showError ? `${fieldId}-error` : undefined}
          {...props}
        />
        {showError && (
          <p
            id={`${fieldId}-error`}
            className="text-sm font-medium text-destructive"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);
FormField.displayName = 'FormField';

export { FormField };
