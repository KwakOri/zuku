import type { Meta, StoryObj } from "@storybook/react-webpack5";
import { AlertTriangle, CheckCircle, Eye, Mail, Users, Search, User, Lock, Calendar, Clock } from "lucide-react";
import React from "react";
import "../components/design-system/globals.css";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Chip,
  Input,
  Progress,
  Switch,
  Label,
  Icon,
  Tooltip,
  FormField,
  SearchInput,
  Modal,
  ScheduleCell,
  ScheduleTable,
  type Schedule,
} from "../components/design-system";

const meta: Meta = {
  title: "Design System/Complete Showcase",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A comprehensive showcase of the complete ZUKU design system with all available components organized by Atomic Design principles.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const FullShowcase: Story = {
  render: () => {
    const [notificationCount] = React.useState(3);
    const [emailValue, setEmailValue] = React.useState("");
    const [darkModeEnabled, setDarkModeEnabled] = React.useState(false);
    const [uploadProgress, setUploadProgress] = React.useState(45);
    const [searchValue, setSearchValue] = React.useState("");
    const [modalOpen, setModalOpen] = React.useState(false);

    // Mock schedule data
    const scheduleData: Schedule[] = [
      {
        id: "1",
        dayOfWeek: 1, // Monday
        timeSlot: "09:00-10:00",
        classInfo: {
          id: "math-101",
          title: "Math 101",
          subject: "Mathematics",
          teacherName: "Mr. Smith",
          startTime: "09:00",
          endTime: "10:00",
          room: "Room A",
          color: "#3b82f6",
          maxStudents: 20,
          currentStudents: 15,
        },
      },
      {
        id: "2",
        dayOfWeek: 2, // Tuesday
        timeSlot: "14:00-15:30",
        classInfo: {
          id: "english-201",
          title: "English Literature",
          subject: "English",
          teacherName: "Ms. Johnson",
          startTime: "14:00",
          endTime: "15:30",
          room: "Room B",
          color: "#10b981",
          maxStudents: 15,
          currentStudents: 12,
        },
      },
    ];

    React.useEffect(() => {
      const interval = setInterval(() => {
        setUploadProgress((prev) => (prev >= 100 ? 0 : prev + 1));
      }, 100);
      return () => clearInterval(interval);
    }, []);

    return (
      <div className="min-h-screen bg-neu-100 p-6">
        <div className="container-responsive">
          {/* Header */}
          <header className="mb-12">
            <Card size="lg" className="text-center">
              <div className="flex items-center justify-center gap-4 mb-4">
                <Avatar
                  size="xl"
                  variant="neumorphic"
                  fallback="ZD"
                  className="bg-primary-500 text-white"
                />
                <div>
                  <h1 className="text-4xl font-bold text-primary-600 mb-2">
                    ZUKU Design System
                  </h1>
                  <p className="text-lg text-neu-600">
                    Complete neumorphic design system for modern applications
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <Chip variant="primary" size="sm">React</Chip>
                <Chip variant="primary" size="sm">TypeScript</Chip>
                <Chip variant="primary" size="sm">Tailwind CSS</Chip>
                <Chip variant="primary" size="sm">Neumorphism</Chip>
                <Chip variant="primary" size="sm">Atomic Design</Chip>
              </div>

              <div className="flex flex-wrap justify-center gap-4">
                <Button variant="primary" size="lg">
                  Get Started
                </Button>
                <Button variant="neumorphic" size="lg">
                  Documentation
                </Button>
                <Button variant="outline" size="lg" onClick={() => setModalOpen(true)}>
                  Open Modal
                </Button>
              </div>
            </Card>
          </header>

          {/* Atoms Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-primary-600 mb-6">Atoms</h2>
            <div className="grid-responsive">
              {/* Buttons */}
              <Card>
                <h3 className="text-xl font-semibold text-primary-600 mb-4">Buttons</h3>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Button variant="neumorphic" size="sm">Small</Button>
                    <Button variant="neumorphic" size="md">Medium</Button>
                    <Button variant="neumorphic" size="lg">Large</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="primary">Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                  </div>
                </div>
              </Card>

              {/* Icons & Labels */}
              <Card>
                <h3 className="text-xl font-semibold text-primary-600 mb-4">Icons & Labels</h3>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-3">
                    <Tooltip content="User profile">
                      <Icon name="user" size="lg" color="primary" />
                    </Tooltip>
                    <Tooltip content="Search">
                      <Icon name="search" size="lg" color="secondary" />
                    </Tooltip>
                    <Tooltip content="Calendar">
                      <Icon name="calendar" size="lg" color="success" />
                    </Tooltip>
                    <Tooltip content="Settings">
                      <Icon name="settings" size="lg" color="warning" />
                    </Tooltip>
                  </div>
                  <div className="space-y-2">
                    <Label state="default">Default Label</Label>
                    <Label state="error" required>Required Error Label</Label>
                    <Label state="success">Success Label</Label>
                  </div>
                </div>
              </Card>

              {/* Avatars & Badges */}
              <Card>
                <h3 className="text-xl font-semibold text-primary-600 mb-4">Avatars & Badges</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar size="xs" fallback="XS" />
                    <Avatar size="sm" fallback="SM" />
                    <Avatar size="md" fallback="MD" />
                    <Avatar size="lg" fallback="LG" />
                    <Avatar size="xl" fallback="XL" />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar size="lg" fallback="JD" variant="flat" />
                      <Badge variant="success" position="top-right" dot />
                    </div>
                    <div className="relative">
                      <Avatar size="lg" fallback="AS" variant="outline" />
                      <Badge variant="error" position="top-right" count={notificationCount} />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Progress & Switch */}
              <Card>
                <h3 className="text-xl font-semibold text-primary-600 mb-4">Progress & Controls</h3>
                <div className="space-y-4">
                  <Progress
                    value={uploadProgress}
                    showLabel
                    label="Upload Progress"
                    color="primary"
                    animated={uploadProgress < 100}
                  />
                  <div className="flex items-center justify-between">
                    <Switch
                      label="Dark Mode"
                      description="Enable dark theme"
                      checked={darkModeEnabled}
                      onCheckedChange={setDarkModeEnabled}
                    />
                    <Switch
                      variant="outline"
                      size="lg"
                      label="Notifications"
                      checked={true}
                    />
                  </div>
                </div>
              </Card>
            </div>
          </section>

          {/* Molecules Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-primary-600 mb-6">Molecules</h2>
            <div className="grid-responsive">
              {/* Form Fields */}
              <Card>
                <h3 className="text-xl font-semibold text-primary-600 mb-4">Form Fields</h3>
                <div className="space-y-4">
                  <FormField
                    label="Email Address"
                    placeholder="Enter your email"
                    value={emailValue}
                    onChange={(e) => setEmailValue(e.target.value)}
                    startIcon={<Mail className="w-5 h-5" />}
                    required
                  />
                  <FormField
                    variant="outline"
                    label="Password"
                    type="password"
                    placeholder="Enter password"
                    helperText="Minimum 8 characters required"
                    startIcon={<Lock className="w-5 h-5" />}
                  />
                </div>
              </Card>

              {/* Search Input */}
              <Card>
                <h3 className="text-xl font-semibold text-primary-600 mb-4">Search Input</h3>
                <div className="space-y-4">
                  <SearchInput
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onSearch={(query) => console.log('Search:', query)}
                    placeholder="Search students, classes..."
                  />
                  {searchValue && (
                    <div className="text-sm text-neu-600">
                      Searching for: "{searchValue}"
                    </div>
                  )}
                </div>
              </Card>

              {/* Schedule Cells */}
              <Card>
                <h3 className="text-xl font-semibold text-primary-600 mb-4">Schedule Cells</h3>
                <div className="space-y-4">
                  <ScheduleCell
                    classInfo={{
                      id: "demo-class",
                      title: "Mathematics",
                      subject: "Math",
                      teacherName: "Mr. Smith",
                      startTime: "09:00",
                      endTime: "10:30",
                      room: "Room A",
                      color: "#3b82f6",
                      maxStudents: 20,
                      currentStudents: 15,
                    }}
                    isBooked={true}
                    isSelectable={true}
                  />
                  <ScheduleCell
                    timeSlot={{
                      startTime: "14:00",
                      endTime: "15:30",
                      dayOfWeek: 1,
                    }}
                    isSelectable={true}
                  />
                </div>
              </Card>

              {/* Chips */}
              <Card>
                <h3 className="text-xl font-semibold text-primary-600 mb-4">Tags & Chips</h3>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Chip variant="primary" deletable onDelete={() => {}}>React</Chip>
                    <Chip variant="secondary" deletable onDelete={() => {}}>TypeScript</Chip>
                    <Chip variant="success" deletable onDelete={() => {}}>Design Systems</Chip>
                    <Chip variant="warning" deletable onDelete={() => {}}>UI/UX</Chip>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Chip variant="success" size="sm">Available</Chip>
                    <Chip variant="warning" size="sm">Busy</Chip>
                    <Chip variant="error" size="sm">Offline</Chip>
                    <Chip variant="outline" size="sm">Away</Chip>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          {/* Organisms Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-primary-600 mb-6">Organisms</h2>

            {/* Schedule Table */}
            <Card size="lg" className="mb-8">
              <h3 className="text-xl font-semibold text-primary-600 mb-4">Schedule Table</h3>
              <ScheduleTable
                scheduleData={scheduleData}
                onCellClick={(cellInfo) => console.log('Cell clicked:', cellInfo)}
                isEditable={true}
                showWeekend={false}
                startHour={9}
                endHour={18}
                slotDuration={90}
              />
            </Card>

            {/* Interactive Dashboard Demo */}
            <Card size="lg">
              <h3 className="text-2xl font-bold text-primary-600 mb-6 text-center">
                Interactive Dashboard Demo
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card variant="flat" className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Avatar size="md" variant="flat" className="bg-success-500">
                      <CheckCircle className="w-5 h-5" />
                    </Avatar>
                  </div>
                  <h4 className="font-semibold text-neu-700">Classes</h4>
                  <p className="text-2xl font-bold text-success-600">24</p>
                </Card>

                <Card variant="flat" className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Avatar size="md" variant="flat" className="bg-warning-500">
                      <Eye className="w-5 h-5" />
                    </Avatar>
                  </div>
                  <h4 className="font-semibold text-neu-700">Students</h4>
                  <p className="text-2xl font-bold text-warning-600">156</p>
                </Card>

                <Card variant="flat" className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Avatar size="md" variant="flat" className="bg-primary-500">
                      <Users className="w-5 h-5" />
                    </Avatar>
                  </div>
                  <h4 className="font-semibold text-neu-700">Teachers</h4>
                  <p className="text-2xl font-bold text-primary-600">12</p>
                </Card>

                <Card variant="flat" className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Avatar size="md" variant="flat" className="bg-error-500">
                      <AlertTriangle className="w-5 h-5" />
                    </Avatar>
                  </div>
                  <h4 className="font-semibold text-neu-700">Alerts</h4>
                  <p className="text-2xl font-bold text-error-600">2</p>
                </Card>
              </div>
            </Card>
          </section>

          {/* Modal */}
          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Demo Modal"
            size="md"
            footerContent={
              <>
                <Button variant="outline" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={() => setModalOpen(false)}>
                  Save Changes
                </Button>
              </>
            }
          >
            <div className="space-y-4">
              <p className="text-neu-600">
                This is a demo modal showcasing the complete design system.
              </p>
              <FormField
                label="Name"
                placeholder="Enter your name"
                startIcon={<User className="w-5 h-5" />}
              />
              <FormField
                label="Email"
                placeholder="Enter your email"
                type="email"
                startIcon={<Mail className="w-5 h-5" />}
              />
            </div>
          </Modal>

          {/* Footer */}
          <footer className="text-center">
            <Card>
              <p className="text-neu-600 mb-4">
                Built with ❤️ using React, TypeScript, Tailwind CSS, and Neumorphism design principles
              </p>
              <div className="flex justify-center gap-4">
                <Button variant="ghost" size="sm">Documentation</Button>
                <Button variant="ghost" size="sm">GitHub</Button>
                <Button variant="ghost" size="sm">Storybook</Button>
              </div>
            </Card>
          </footer>
        </div>
      </div>
    );
  },
};