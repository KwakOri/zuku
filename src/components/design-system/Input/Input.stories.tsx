import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { Search, Mail, Lock, Eye } from 'lucide-react';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A neumorphic input component with various styling options and states.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'outline', 'filled'],
      description: 'Visual style variant of the input'
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Size of the input'
    },
    state: {
      control: { type: 'select' },
      options: ['default', 'error', 'success', 'warning'],
      description: 'State of the input'
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the input is disabled'
    }
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'Enter your email',
    type: 'email',
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Password',
    placeholder: 'Enter your password',
    type: 'password',
    helperText: 'Password must be at least 8 characters long',
  },
};

export const Variants: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <Input
        variant="default"
        label="Default (Neumorphic)"
        placeholder="Neumorphic inset style"
      />
      <Input
        variant="outline"
        label="Outline"
        placeholder="Outlined border style"
      />
      <Input
        variant="filled"
        label="Filled"
        placeholder="Filled background style"
      />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <Input
        size="sm"
        label="Small"
        placeholder="Small input"
      />
      <Input
        size="md"
        label="Medium"
        placeholder="Medium input"
      />
      <Input
        size="lg"
        label="Large"
        placeholder="Large input"
      />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <Input
        label="Default State"
        placeholder="Normal input"
        helperText="This is a normal input field"
      />
      <Input
        label="Success State"
        placeholder="Valid input"
        success="Email format is valid"
        defaultValue="user@example.com"
      />
      <Input
        label="Warning State"
        placeholder="Warning input"
        warning="This email is already registered"
        defaultValue="existing@example.com"
      />
      <Input
        label="Error State"
        placeholder="Invalid input"
        error="Email format is invalid"
        defaultValue="invalid-email"
      />
      <Input
        label="Disabled State"
        placeholder="Disabled input"
        disabled
        helperText="This input is disabled"
      />
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => {
    return (
      <div className="space-y-4 w-80">
        <Input
          label="Search"
          placeholder="Search..."
          startIcon={<Search className="w-5 h-5" />}
        />
        <Input
          label="Email"
          placeholder="Enter your email"
          type="email"
          startIcon={<Mail className="w-5 h-5" />}
        />
        <Input
          label="Password"
          placeholder="Enter your password"
          type="password"
          startIcon={<Lock className="w-5 h-5" />}
          endIcon={<Eye className="w-5 h-5" />}
        />
      </div>
    );
  },
};

export const LoginForm: Story = {
  render: () => {
    return (
      <div className="w-80 p-6 neu-raised rounded-2xl">
        <h2 className="text-2xl font-bold text-primary-600 mb-6 text-center">Login</h2>
        <div className="space-y-4">
          <Input
            label="Email Address"
            placeholder="Enter your email"
            type="email"
            startIcon={<Mail className="w-5 h-5" />}
            helperText="We'll never share your email"
          />
          <Input
            label="Password"
            placeholder="Enter your password"
            type="password"
            startIcon={<Lock className="w-5 h-5" />}
            helperText="Minimum 8 characters"
          />
          <button className="w-full mt-6 px-4 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors">
            Sign In
          </button>
        </div>
      </div>
    );
  },
};