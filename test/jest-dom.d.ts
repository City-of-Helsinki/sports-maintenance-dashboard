/// <reference types="@testing-library/jest-dom" />

// Extend Jest matchers with jest-dom
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveClass(...classes: string[]): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveStyle(css: string | Record<string, any>): R;
      toHaveTextContent(text: string | RegExp): R;
      toBeVisible(): R;
      toBeEmptyDOMElement(): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toBeRequired(): R;
      toBeValid(): R;
      toBeInvalid(): R;
      toHaveValue(value?: string | string[] | number): R;
      toHaveDisplayValue(value: string | RegExp | Array<string | RegExp>): R;
      toBeChecked(): R;
      toBePartiallyChecked(): R;
      toHaveFocus(): R;
      toHaveFormValues(values: Record<string, any>): R;
      toHaveErrorMessage(message?: string | RegExp): R;
      toHaveDescription(description?: string | RegExp): R;
      toHaveAccessibleName(name?: string | RegExp): R;
      toHaveAccessibleDescription(description?: string | RegExp): R;
    }
  }
}