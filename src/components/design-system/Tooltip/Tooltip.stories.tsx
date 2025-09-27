import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip } from './Tooltip';
import { Button } from '../Button';
import { Icon } from '../Icon';

const meta: Meta<typeof Tooltip> = {
  title: 'Design System/Atoms/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Tooltip component that displays helpful information when hovering over elements.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    content: {
      control: 'text',
      description: 'Content to display in tooltip',
    },
    position: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
      description: 'Tooltip position',
    },
    variant: {
      control: 'select',
      options: ['default', 'dark', 'light'],
      description: 'Tooltip style variant',
    },
    delay: {
      control: 'number',
      description: 'Delay in milliseconds before showing tooltip',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether tooltip is disabled',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    content: 'This is a helpful tooltip',
    position: 'top',
    children: <Button>Hover me</Button>,
  },
};

export const Positions: Story = {
  render: () => (
    <div className="flex items-center justify-center gap-8 p-16">
      <div className="grid grid-cols-3 gap-8">
        <div></div>
        <Tooltip content="Top tooltip" position="top">
          <Button variant="outline">Top</Button>
        </Tooltip>
        <div></div>

        <Tooltip content="Left tooltip" position="left">
          <Button variant="outline">Left</Button>
        </Tooltip>

        <div className="flex items-center justify-center">
          <span className="text-neu-600">Hover buttons</span>
        </div>

        <Tooltip content="Right tooltip" position="right">
          <Button variant="outline">Right</Button>
        </Tooltip>

        <div></div>
        <Tooltip content="Bottom tooltip" position="bottom">
          <Button variant="outline">Bottom</Button>
        </Tooltip>
        <div></div>
      </div>
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Tooltip content="Default variant" variant="default">
        <Button variant="outline">Default</Button>
      </Tooltip>

      <Tooltip content="Dark variant" variant="dark">
        <Button variant="outline">Dark</Button>
      </Tooltip>

      <Tooltip content="Light variant" variant="light">
        <Button variant="outline">Light</Button>
      </Tooltip>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Tooltip content="This action will delete the item permanently">
        <Icon name="trash" size="lg" color="error" className="cursor-help" />
      </Tooltip>

      <Tooltip content="Edit this item">
        <Icon name="edit" size="lg" color="primary" className="cursor-help" />
      </Tooltip>

      <Tooltip content="View more information">
        <Icon name="info" size="lg" color="secondary" className="cursor-help" />
      </Tooltip>

      <Tooltip content="Mark as favorite">
        <Icon name="star" size="lg" color="warning" className="cursor-help" />
      </Tooltip>
    </div>
  ),
};

export const LongContent: Story = {
  args: {
    content: 'This is a very long tooltip content that wraps to multiple lines to demonstrate how the tooltip handles longer text content gracefully.',
    position: 'top',
    children: <Button>Long tooltip</Button>,
  },
};

export const CustomDelay: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Tooltip content="No delay (0ms)" delay={0}>
        <Button variant="outline">No delay</Button>
      </Tooltip>

      <Tooltip content="Fast (200ms)" delay={200}>
        <Button variant="outline">Fast</Button>
      </Tooltip>

      <Tooltip content="Default (500ms)" delay={500}>
        <Button variant="outline">Default</Button>
      </Tooltip>

      <Tooltip content="Slow (1000ms)" delay={1000}>
        <Button variant="outline">Slow</Button>
      </Tooltip>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Tooltip content="This tooltip is enabled">
        <Button variant="outline">Enabled</Button>
      </Tooltip>

      <Tooltip content="This tooltip is disabled" disabled>
        <Button variant="outline">Disabled</Button>
      </Tooltip>
    </div>
  ),
};