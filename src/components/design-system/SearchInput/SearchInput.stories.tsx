import type { Meta, StoryObj } from '@storybook/react';
import { SearchInput } from './SearchInput';
import { useState } from 'react';

const meta: Meta<typeof SearchInput> = {
  title: 'Design System/Molecules/SearchInput',
  component: SearchInput,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A search input component with search icon, clear functionality, and debounced search.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Search placeholder text',
    },
    onSearch: {
      action: 'search',
      description: 'Function called when search is triggered',
    },
    onClear: {
      action: 'clear',
      description: 'Function called when clear button is clicked',
    },
    showClearButton: {
      control: 'boolean',
      description: 'Whether to show clear button when there is text',
    },
    searchDelay: {
      control: 'number',
      description: 'Delay in milliseconds before triggering search',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Input size',
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
    placeholder: 'Search...',
    onSearch: (query: string) => console.log('Search:', query),
    onClear: () => console.log('Cleared'),
  },
};

export const CustomPlaceholder: Story = {
  args: {
    placeholder: 'Search students, classes, or teachers...',
    onSearch: (query: string) => console.log('Search:', query),
  },
};

export const Controlled: Story = {
  render: () => {
    const [searchValue, setSearchValue] = useState('');
    const [results, setResults] = useState<string[]>([]);

    const handleSearch = (query: string) => {
      console.log('Searching for:', query);
      // Simulate search results
      const mockResults = query
        ? [`${query} result 1`, `${query} result 2`, `${query} result 3`]
        : [];
      setResults(mockResults);
    };

    const handleClear = () => {
      setSearchValue('');
      setResults([]);
    };

    return (
      <div className="space-y-4 max-w-md">
        <SearchInput
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onSearch={handleSearch}
          onClear={handleClear}
          placeholder="Type to search..."
          searchDelay={300}
        />

        {results.length > 0 && (
          <div className="p-4 bg-gray-50 rounded-xl">
            <h4 className="font-medium text-gray-700 mb-2">Results:</h4>
            <ul className="space-y-1">
              {results.map((result, index) => (
                <li key={index} className="text-gray-600">
                  {result}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4 max-w-md">
      <SearchInput size="sm" placeholder="Small search input" />
      <SearchInput size="md" placeholder="Medium search input (default)" />
      <SearchInput size="lg" placeholder="Large search input" />
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="space-y-4 max-w-md">
      <SearchInput variant="default" placeholder="Default variant" />
      <SearchInput variant="outline" placeholder="Outline variant" />
      <SearchInput variant="filled" placeholder="Filled variant" />
    </div>
  ),
};

export const WithoutClearButton: Story = {
  args: {
    placeholder: 'Search without clear button',
    showClearButton: false,
    onSearch: (query: string) => console.log('Search:', query),
  },
};

export const CustomDelay: Story = {
  render: () => (
    <div className="space-y-4 max-w-md">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          No delay (0ms)
        </label>
        <SearchInput
          placeholder="Immediate search"
          searchDelay={0}
          onSearch={(query) => console.log('Immediate:', query)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Fast delay (200ms)
        </label>
        <SearchInput
          placeholder="Fast search"
          searchDelay={200}
          onSearch={(query) => console.log('Fast:', query)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Slow delay (1000ms)
        </label>
        <SearchInput
          placeholder="Slow search"
          searchDelay={1000}
          onSearch={(query) => console.log('Slow:', query)}
        />
      </div>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    placeholder: 'This search is disabled',
    disabled: true,
    value: 'Cannot edit this',
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="max-w-md">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Search Users
      </label>
      <SearchInput
        placeholder="Enter name, email, or ID..."
        onSearch={(query) => console.log('User search:', query)}
      />
      <p className="text-xs text-gray-500 mt-1">
        Search across all user profiles and accounts
      </p>
    </div>
  ),
};