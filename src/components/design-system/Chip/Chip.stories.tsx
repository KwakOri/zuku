import type { Meta, StoryObj } from '@storybook/react-webpack5';
import React from 'react';
import { Star } from 'lucide-react';
import { Chip } from './Chip';

const meta: Meta<typeof Chip> = {
  title: 'Components/Chip',
  component: Chip,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A neumorphic chip component for displaying tags, filters, and selectable options.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'primary', 'secondary', 'success', 'warning', 'error', 'outline', 'neumorphic'],
      description: 'Visual style variant of the chip'
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Size of the chip'
    },
    interactive: {
      control: { type: 'boolean' },
      description: 'Whether the chip should have interactive states'
    },
    deletable: {
      control: { type: 'boolean' },
      description: 'Whether the chip should show a delete button'
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the chip is disabled'
    }
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Default Chip',
  },
};

export const Interactive: Story = {
  args: {
    children: 'Interactive Chip',
    interactive: true,
    onClick: () => alert('Chip clicked!'),
  },
};

export const Deletable: Story = {
  args: {
    children: 'Deletable Chip',
    deletable: true,
    onDelete: () => alert('Chip deleted!'),
  },
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Chip variant="default">Default</Chip>
      <Chip variant="primary">Primary</Chip>
      <Chip variant="secondary">Secondary</Chip>
      <Chip variant="success">Success</Chip>
      <Chip variant="warning">Warning</Chip>
      <Chip variant="error">Error</Chip>
      <Chip variant="outline">Outline</Chip>
      <Chip variant="neumorphic">Neumorphic</Chip>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Chip size="sm">Small</Chip>
      <Chip size="md">Medium</Chip>
      <Chip size="lg">Large</Chip>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => {
    return (
      <div className="flex flex-wrap gap-3">
        <Chip variant="primary" startIcon={<Star className="w-4 h-4" />}>
          With Start Icon
        </Chip>
        <Chip variant="success" startIcon={<Star className="w-4 h-4" />} deletable onDelete={() => {}}>
          Icon + Delete
        </Chip>
      </div>
    );
  },
};

export const FilterExample: Story = {
  render: () => {
    const [selectedFilters, setSelectedFilters] = React.useState(['React', 'TypeScript']);

    const allFilters = ['React', 'TypeScript', 'JavaScript', 'CSS', 'HTML', 'Node.js', 'Python'];

    const toggleFilter = (filter: string) => {
      setSelectedFilters(prev =>
        prev.includes(filter)
          ? prev.filter(f => f !== filter)
          : [...prev, filter]
      );
    };

    const removeFilter = (filter: string) => {
      setSelectedFilters(prev => prev.filter(f => f !== filter));
    };

    return (
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-neu-700 mb-2">Available Filters:</h4>
          <div className="flex flex-wrap gap-2">
            {allFilters.map(filter => (
              <Chip
                key={filter}
                variant={selectedFilters.includes(filter) ? "primary" : "outline"}
                interactive
                onClick={() => toggleFilter(filter)}
              >
                {filter}
              </Chip>
            ))}
          </div>
        </div>

        {selectedFilters.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-neu-700 mb-2">Selected Filters:</h4>
            <div className="flex flex-wrap gap-2">
              {selectedFilters.map(filter => (
                <Chip
                  key={filter}
                  variant="primary"
                  deletable
                  onDelete={() => removeFilter(filter)}
                >
                  {filter}
                </Chip>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  },
};

export const States: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium text-neu-700 mb-2">Normal States:</h4>
        <div className="flex flex-wrap gap-2">
          <Chip>Normal</Chip>
          <Chip interactive>Interactive</Chip>
          <Chip deletable onDelete={() => {}}>Deletable</Chip>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-neu-700 mb-2">Disabled States:</h4>
        <div className="flex flex-wrap gap-2">
          <Chip disabled>Disabled</Chip>
          <Chip disabled interactive>Disabled Interactive</Chip>
          <Chip disabled deletable onDelete={() => {}}>Disabled Deletable</Chip>
        </div>
      </div>
    </div>
  ),
};