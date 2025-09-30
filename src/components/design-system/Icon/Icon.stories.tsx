import type { Meta, StoryObj } from '@storybook/react';
import { Icon } from './Icon';

const meta: Meta<typeof Icon> = {
  title: 'Design System/Atoms/Icon',
  component: Icon,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Icon component using Lucide React icons with size and color variants.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: 'select',
      options: [
        'check', 'x', 'edit', 'trash', 'plus', 'search', 'user', 'users',
        'mail', 'calendar', 'clock', 'home', 'settings', 'star', 'info',
        'alert-circle', 'alert-triangle', 'check-circle', 'x-circle',
        'eye', 'eye-off', 'chevron-up', 'chevron-down', 'chevron-left', 'chevron-right',
        'menu', 'more-horizontal', 'more-vertical', 'file', 'file-text', 'globe',
      ],
      description: 'Icon name from Lucide React',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'],
      description: 'Icon size',
    },
    color: {
      control: 'select',
      options: ['default', 'primary', 'secondary', 'success', 'warning', 'error', 'muted', 'white', 'black'],
      description: 'Icon color',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: 'star',
    size: 'md',
    color: 'default',
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Icon name="star" size="xs" />
      <Icon name="star" size="sm" />
      <Icon name="star" size="md" />
      <Icon name="star" size="lg" />
      <Icon name="star" size="xl" />
      <Icon name="star" size="2xl" />
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Icon name="star" color="default" />
      <Icon name="star" color="primary" />
      <Icon name="star" color="secondary" />
      <Icon name="star" color="success" />
      <Icon name="star" color="warning" />
      <Icon name="star" color="error" />
      <Icon name="star" color="muted" />
    </div>
  ),
};

export const CommonIcons: Story = {
  render: () => (
    <div className="grid grid-cols-8 gap-4 p-4">
      {[
        'check', 'x', 'edit', 'trash', 'plus', 'search', 'user', 'users',
        'mail', 'calendar', 'clock', 'home', 'settings', 'star', 'info',
        'alert-circle', 'alert-triangle', 'check-circle', 'x-circle',
        'eye', 'eye-off', 'chevron-up', 'chevron-down', 'chevron-left', 'chevron-right',
        'menu', 'more-horizontal', 'more-vertical', 'file', 'file-text', 'globe',
      ].map(iconName => (
        <div key={iconName} className="flex flex-col items-center gap-2 p-2">
          <Icon name={iconName as any} size="lg" />
          <span className="text-xs text-gray-600">{iconName}</span>
        </div>
      ))}
    </div>
  ),
};

export const Interactive: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Icon
        name="star"
        size="lg"
        color="warning"
        onClick={() => alert('Star clicked!')}
        className="cursor-pointer hover:scale-110 transition-transform"
      />
      <Icon
        name="trash"
        size="lg"
        color="error"
        onClick={() => alert('Delete clicked!')}
        className="cursor-pointer hover:scale-110 transition-transform"
      />
      <Icon
        name="edit"
        size="lg"
        color="primary"
        onClick={() => alert('Edit clicked!')}
        className="cursor-pointer hover:scale-110 transition-transform"
      />
    </div>
  ),
};