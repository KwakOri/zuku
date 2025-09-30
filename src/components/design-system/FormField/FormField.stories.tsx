import type { Meta, StoryObj } from '@storybook/react';
import { FormField } from './FormField';
import { Mail, Lock, User } from 'lucide-react';

const meta: Meta<typeof FormField> = {
  title: 'Design System/Molecules/FormField',
  component: FormField,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A complete form field component combining Label and Input with validation states.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Label text for the field',
    },
    placeholder: {
      control: 'text',
      description: 'Input placeholder text',
    },
    helperText: {
      control: 'text',
      description: 'Helper text displayed when no validation state',
    },
    errorMessage: {
      control: 'text',
      description: 'Error message to display',
    },
    successMessage: {
      control: 'text',
      description: 'Success message to display',
    },
    warningMessage: {
      control: 'text',
      description: 'Warning message to display',
    },
    required: {
      control: 'boolean',
      description: 'Whether the field is required',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the field is disabled',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Field size',
    },
    variant: {
      control: 'select',
      options: ['default', 'outline', 'filled'],
      description: 'Input variant',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'Enter your email',
    name: 'email',
    type: 'email',
  },
};

export const Required: Story = {
  args: {
    label: 'Password',
    placeholder: 'Enter your password',
    name: 'password',
    type: 'password',
    required: true,
    helperText: 'Password must be at least 8 characters long',
  },
};

export const WithIcons: Story = {
  render: () => (
    <div className="space-y-6 max-w-md">
      <FormField
        label="Email"
        placeholder="Enter your email"
        startIcon={<Mail className="w-5 h-5" />}
        type="email"
      />

      <FormField
        label="Password"
        placeholder="Enter your password"
        startIcon={<Lock className="w-5 h-5" />}
        type="password"
        required
      />

      <FormField
        label="Full Name"
        placeholder="Enter your name"
        startIcon={<User className="w-5 h-5" />}
        type="text"
      />
    </div>
  ),
};

export const ValidationStates: Story = {
  render: () => (
    <div className="space-y-6 max-w-md">
      <FormField
        label="Default State"
        placeholder="Enter text"
        helperText="This is a helper text"
      />

      <FormField
        label="Success State"
        placeholder="Enter text"
        value="Valid input"
        successMessage="Great! This looks good."
      />

      <FormField
        label="Warning State"
        placeholder="Enter text"
        value="Some input"
        warningMessage="This might need attention"
      />

      <FormField
        label="Error State"
        placeholder="Enter text"
        value="Invalid input"
        errorMessage="This field is required"
        required
      />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-6 max-w-md">
      <FormField
        label="Small Size"
        placeholder="Small input"
        size="sm"
      />

      <FormField
        label="Medium Size (Default)"
        placeholder="Medium input"
        size="md"
      />

      <FormField
        label="Large Size"
        placeholder="Large input"
        size="lg"
      />
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="space-y-6 max-w-md">
      <FormField
        label="Default Variant"
        placeholder="Default input"
        variant="default"
      />

      <FormField
        label="Outline Variant"
        placeholder="Outline input"
        variant="outline"
      />

      <FormField
        label="Filled Variant"
        placeholder="Filled input"
        variant="filled"
      />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Field',
    placeholder: 'This field is disabled',
    value: 'Cannot edit this',
    disabled: true,
    helperText: 'This field is read-only',
  },
};

export const LoginForm: Story = {
  render: () => (
    <div className="space-y-6 max-w-md p-6 flat-card rounded-xl">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Login</h2>

      <FormField
        label="Email"
        placeholder="Enter your email"
        name="email"
        type="email"
        required
        startIcon={<Mail className="w-5 h-5" />}
      />

      <FormField
        label="Password"
        placeholder="Enter your password"
        name="password"
        type="password"
        required
        startIcon={<Lock className="w-5 h-5" />}
        helperText="Must be at least 8 characters"
      />
    </div>
  ),
};