import type { Meta, StoryObj } from '@storybook/react';
import { Modal } from './Modal';
import { Button } from '../Button';
import { FormField } from '../FormField';
import { useState } from 'react';
import { User, Mail, Lock } from 'lucide-react';

const meta: Meta<typeof Modal> = {
  title: 'Design System/Organisms/Modal',
  component: Modal,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A modal dialog component with overlay, header, content, and footer sections.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Whether the modal is open',
    },
    title: {
      control: 'text',
      description: 'Modal title',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'full'],
      description: 'Modal size',
    },
    animation: {
      control: 'select',
      options: ['fade', 'scale', 'slide'],
      description: 'Animation type',
    },
    showCloseButton: {
      control: 'boolean',
      description: 'Whether to show close button',
    },
    closeOnOverlayClick: {
      control: 'boolean',
      description: 'Whether clicking overlay closes modal',
    },
    closeOnEscape: {
      control: 'boolean',
      description: 'Whether pressing Escape closes modal',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Default Modal"
        >
          <p className="text-neu-600">
            This is a default modal with basic content. You can put any content here.
          </p>
        </Modal>
      </>
    );
  },
};

export const WithFooter: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Modal with Footer</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Confirmation"
          footerContent={
            <>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setIsOpen(false)}>
                Confirm
              </Button>
            </>
          }
        >
          <p className="text-neu-600">
            Are you sure you want to proceed with this action? This cannot be undone.
          </p>
        </Modal>
      </>
    );
  },
};

export const Sizes: Story = {
  render: () => {
    const [openModal, setOpenModal] = useState<string | null>(null);

    const sizes = [
      { size: 'sm', label: 'Small' },
      { size: 'md', label: 'Medium' },
      { size: 'lg', label: 'Large' },
      { size: 'xl', label: 'Extra Large' },
    ];

    return (
      <>
        <div className="flex gap-4">
          {sizes.map(({ size, label }) => (
            <Button
              key={size}
              variant="outline"
              onClick={() => setOpenModal(size)}
            >
              {label} Modal
            </Button>
          ))}
        </div>

        {sizes.map(({ size }) => (
          <Modal
            key={size}
            isOpen={openModal === size}
            onClose={() => setOpenModal(null)}
            title={`${size.charAt(0).toUpperCase() + size.slice(1)} Modal`}
            size={size as any}
          >
            <p className="text-neu-600">
              This is a {size} modal. The content scales with the modal size.
            </p>
          </Modal>
        ))}
      </>
    );
  },
};

export const Animations: Story = {
  render: () => {
    const [openModal, setOpenModal] = useState<string | null>(null);

    const animations = [
      { animation: 'fade', label: 'Fade' },
      { animation: 'scale', label: 'Scale' },
      { animation: 'slide', label: 'Slide' },
    ];

    return (
      <>
        <div className="flex gap-4">
          {animations.map(({ animation, label }) => (
            <Button
              key={animation}
              variant="outline"
              onClick={() => setOpenModal(animation)}
            >
              {label} Animation
            </Button>
          ))}
        </div>

        {animations.map(({ animation }) => (
          <Modal
            key={animation}
            isOpen={openModal === animation}
            onClose={() => setOpenModal(null)}
            title={`${animation.charAt(0).toUpperCase() + animation.slice(1)} Animation`}
            animation={animation as any}
          >
            <p className="text-neu-600">
              This modal uses the {animation} animation.
            </p>
          </Modal>
        ))}
      </>
    );
  },
};

export const FormModal: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      password: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      console.log('Form submitted:', formData);
      setIsOpen(false);
    };

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Create Account</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Create New Account"
          size="md"
          footerContent={
            <>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                type="submit"
                form="account-form"
              >
                Create Account
              </Button>
            </>
          }
        >
          <form id="account-form" onSubmit={handleSubmit} className="space-y-4">
            <FormField
              label="Full Name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              startIcon={<User className="w-5 h-5" />}
              required
            />

            <FormField
              label="Email Address"
              placeholder="Enter your email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              startIcon={<Mail className="w-5 h-5" />}
              required
            />

            <FormField
              label="Password"
              placeholder="Create a password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              startIcon={<Lock className="w-5 h-5" />}
              helperText="Must be at least 8 characters long"
              required
            />
          </form>
        </Modal>
      </>
    );
  },
};

export const CustomHeader: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Custom Header Modal</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          headerContent={
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-neu-800">User Profile</h2>
                <p className="text-sm text-neu-500">Manage your account settings</p>
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            <p className="text-neu-600">
              This modal has a custom header with an icon and description.
            </p>
            <div className="p-4 bg-neu-50 rounded-lg">
              <h4 className="font-medium text-neu-700 mb-2">Profile Information</h4>
              <div className="space-y-2 text-sm text-neu-600">
                <div>Name: John Doe</div>
                <div>Email: john.doe@example.com</div>
                <div>Role: Administrator</div>
              </div>
            </div>
          </div>
        </Modal>
      </>
    );
  },
};

export const NoCloseButton: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>No Close Button</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Important Notice"
          showCloseButton={false}
          closeOnOverlayClick={false}
          closeOnEscape={false}
          footerContent={
            <Button variant="primary" onClick={() => setIsOpen(false)}>
              I Understand
            </Button>
          }
        >
          <div className="space-y-4">
            <p className="text-neu-600">
              This is an important notice that requires your attention. You must click
              the "I Understand" button to close this modal.
            </p>
            <div className="p-4 bg-warning-50 border border-warning-200 rounded-lg">
              <p className="text-warning-800 text-sm">
                ⚠️ This modal cannot be closed by clicking outside or pressing Escape.
              </p>
            </div>
          </div>
        </Modal>
      </>
    );
  },
};