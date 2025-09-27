import type { Meta, StoryObj } from '@storybook/react';
import { Label } from './Label';

const meta: Meta<typeof Label> = {
  title: 'Design System/Atoms/Label',
  component: Label,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A label component for form fields with required indicator and state support.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: 'text',
      description: 'Label text content',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Label size',
    },
    state: {
      control: 'select',
      options: ['default', 'error', 'success', 'warning'],
      description: 'Label state for styling',
    },
    required: {
      control: 'boolean',
      description: 'Whether to show required indicator (*)',
    },
    htmlFor: {
      control: 'text',
      description: 'ID of associated form element',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Email Address',
    htmlFor: 'email',
  },
};

export const Required: Story = {
  args: {
    children: 'Password',
    required: true,
    htmlFor: 'password',
  },
};

export const States: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <Label state="default">Default State</Label>
      </div>
      <div>
        <Label state="error">Error State</Label>
      </div>
      <div>
        <Label state="success">Success State</Label>
      </div>
      <div>
        <Label state="warning">Warning State</Label>
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <Label size="sm">Small Label</Label>
      </div>
      <div>
        <Label size="md">Medium Label (Default)</Label>
      </div>
      <div>
        <Label size="lg">Large Label</Label>
      </div>
    </div>
  ),
};

export const RequiredStates: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <Label required state="default">Required Default</Label>
      </div>
      <div>
        <Label required state="error">Required Error</Label>
      </div>
      <div>
        <Label required state="success">Required Success</Label>
      </div>
      <div>
        <Label required state="warning">Required Warning</Label>
      </div>
    </div>
  ),
};