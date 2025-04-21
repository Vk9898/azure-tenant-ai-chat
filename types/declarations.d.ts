// Fix @hookform/resolvers/zod import issue
declare module '@hookform/resolvers/zod' {
  import { ZodSchema } from 'zod';
  import { Resolver } from 'react-hook-form';
  
  export function zodResolver<T>(schema: ZodSchema<T>): Resolver<T>;
}

// Add missing zod types
declare module 'zod' {
  export type ZodSchema<T = any> = {
    _output: T;
  };
  
  export const z: {
    object: <T extends Record<string, any>>(shape: T) => ZodSchema<{ [K in keyof T]: T[K]['_output'] }>;
    string: () => StringSchema;
    number: () => NumberSchema;
    infer: <T>(schema: ZodSchema<T>) => T;
  };
  
  export interface StringSchema extends ZodSchema<string> {
    min: (min: number, message?: string) => StringSchema;
    optional: () => ZodSchema<string | undefined>;
  }
  
  export interface NumberSchema extends ZodSchema<number> {
    optional: () => ZodSchema<number | undefined>;
  }
}

// Add missing react-hook-form types if needed
declare module 'react-hook-form' {
  export function useForm<TFieldValues extends FieldValues = FieldValues, TContext = any>(
    props?: UseFormProps<TFieldValues, TContext>
  ): UseFormReturn<TFieldValues, TContext>;
  
  export type FieldValues = Record<string, any>;
  
  export interface UseFormProps<TFieldValues extends FieldValues = FieldValues, TContext = any> {
    mode?: 'onSubmit' | 'onChange' | 'onBlur' | 'onTouched' | 'all';
    reValidateMode?: 'onSubmit' | 'onChange' | 'onBlur';
    defaultValues?: DeepPartial<TFieldValues>;
    resolver?: Resolver<TFieldValues, TContext>;
    context?: TContext;
    shouldFocusError?: boolean;
    shouldUnregister?: boolean;
    shouldUseNativeValidation?: boolean;
    criteriaMode?: 'firstError' | 'all';
    delayError?: number;
  }
  
  export type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T;
  
  export type UseFormReturn<TFieldValues extends FieldValues = FieldValues, TContext = any> = {
    watch: any;
    getValues: any;
    getFieldState: any;
    setError: any;
    clearErrors: any;
    setValue: any;
    trigger: any;
    formState: any;
    resetField: any;
    reset: any;
    handleSubmit: any;
    unregister: any;
    control: any;
    register: any;
    setFocus: any;
  };
  
  export type Resolver<TFieldValues extends FieldValues = FieldValues, TContext = any> = (
    values: TFieldValues,
    context: TContext | undefined,
    options: {
      criteriaMode?: 'firstError' | 'all';
      fields: { [K in keyof TFieldValues]?: true };
      names?: { [K in keyof TFieldValues]?: K };
      shouldUseNativeValidation?: boolean;
    }
  ) => Promise<{
    values: TFieldValues | {};
    errors: Record<string, { type: string; message: string }>;
  }>;
} 