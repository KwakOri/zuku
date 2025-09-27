import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { Card } from './Card';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A neumorphic card component for displaying content with various styling options.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['raised', 'flat', 'outlined'],
      description: 'Visual style variant of the card'
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Size of the card padding'
    },
    interactive: {
      control: { type: 'boolean' },
      description: 'Whether the card should have interactive states'
    }
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div>
        <h3 className="text-lg font-semibold text-neu-800 mb-2">Card Title</h3>
        <p className="text-neu-600">This is a neumorphic card component with default styling.</p>
      </div>
    ),
  },
};

export const Interactive: Story = {
  args: {
    interactive: true,
    children: (
      <div>
        <h3 className="text-lg font-semibold text-primary-600 mb-2">Interactive Card</h3>
        <p className="text-neu-600">Click me! This card has hover and active states.</p>
      </div>
    ),
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card size="sm">
        <h4 className="font-medium text-neu-800">Small Card</h4>
        <p className="text-sm text-neu-600">Compact padding</p>
      </Card>
      <Card size="md">
        <h4 className="font-medium text-neu-800">Medium Card</h4>
        <p className="text-sm text-neu-600">Default padding</p>
      </Card>
      <Card size="lg">
        <h4 className="font-medium text-neu-800">Large Card</h4>
        <p className="text-sm text-neu-600">Spacious padding</p>
      </Card>
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card variant="raised">
        <h4 className="font-medium text-neu-800 mb-2">Raised</h4>
        <p className="text-sm text-neu-600">Neumorphic raised effect</p>
      </Card>
      <Card variant="flat">
        <h4 className="font-medium text-neu-800 mb-2">Flat</h4>
        <p className="text-sm text-neu-600">Flat with subtle border</p>
      </Card>
      <Card variant="outlined">
        <h4 className="font-medium text-neu-800 mb-2">Outlined</h4>
        <p className="text-sm text-neu-600">Transparent with border</p>
      </Card>
    </div>
  ),
};

export const ComplexContent: Story = {
  args: {
    variant: "raised",
    size: "lg",
    interactive: true,
    children: (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-primary-600">Product Card</h3>
          <span className="text-sm text-success-600 font-medium">In Stock</span>
        </div>
        <div className="w-full h-32 bg-neu-200 rounded-lg mb-4 flex items-center justify-center">
          <span className="text-neu-500">Image Placeholder</span>
        </div>
        <p className="text-neu-600 mb-4">
          This is a more complex card example with multiple elements and interactive states.
        </p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary-600">$99.99</span>
          <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
            Add to Cart
          </button>
        </div>
      </div>
    ),
  },
};