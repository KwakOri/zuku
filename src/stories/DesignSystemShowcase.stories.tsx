import type { Meta, StoryObj } from "@storybook/react-webpack5";
import { AlertTriangle, CheckCircle, Eye, Mail, Users } from "lucide-react";
import React from "react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Chip,
  Input,
  Progress,
  Switch,
} from "../design-system";

const meta: Meta = {
  title: "Design System/Showcase",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A comprehensive showcase of the Starbucks-inspired neumorphic design system with all available components.",
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
                    Zuku Design System
                  </h1>
                  <p className="text-lg text-neu-600">
                    Starbucks-inspired neumorphic components for modern
                    applications
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <Chip variant="primary" size="sm">
                  React
                </Chip>
                <Chip variant="primary" size="sm">
                  TypeScript
                </Chip>
                <Chip variant="primary" size="sm">
                  Tailwind CSS
                </Chip>
                <Chip variant="primary" size="sm">
                  Neumorphism
                </Chip>
                <Chip variant="primary" size="sm">
                  Responsive
                </Chip>
              </div>

              <div className="flex flex-wrap justify-center gap-4">
                <Button variant="primary" size="lg">
                  Get Started
                </Button>
                <Button variant="neumorphic" size="lg">
                  Documentation
                </Button>
                <Button variant="outline" size="lg">
                  GitHub
                </Button>
              </div>
            </Card>
          </header>

          {/* Components Grid */}
          <div className="grid-responsive mb-12">
            {/* Buttons Section */}
            <Card>
              <h3 className="text-xl font-semibold text-primary-600 mb-4">
                Buttons
              </h3>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button variant="neumorphic" size="sm">
                    Small
                  </Button>
                  <Button variant="neumorphic" size="md">
                    Medium
                  </Button>
                  <Button variant="neumorphic" size="lg">
                    Large
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button disabled>Disabled</Button>
                  <Button variant="primary" disabled>
                    Primary Disabled
                  </Button>
                </div>
              </div>
            </Card>

            {/* Form Components */}
            <Card>
              <h3 className="text-xl font-semibold text-primary-600 mb-4">
                Form Components
              </h3>
              <div className="space-y-4">
                <Input
                  label="Email Address"
                  placeholder="Enter your email"
                  value={emailValue}
                  onChange={(e) => setEmailValue(e.target.value)}
                  startIcon={<Mail className="w-5 h-5" />}
                />

                <Input
                  variant="outline"
                  label="Password"
                  type="password"
                  placeholder="Enter password"
                  helperText="Minimum 8 characters required"
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

            {/* Avatars & Badges */}
            <Card>
              <h3 className="text-xl font-semibold text-primary-600 mb-4">
                Avatars & Badges
              </h3>
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
                    <Badge
                      variant="error"
                      position="top-right"
                      count={notificationCount}
                    />
                  </div>

                  <div className="relative">
                    <Avatar size="lg" fallback="MK" />
                    <Badge
                      variant="warning"
                      position="bottom-right"
                      count={99}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="neumorphic" count={5} />
                  <Badge variant="success" count={12} />
                  <Badge variant="warning" count={3} />
                  <Badge variant="error" count={1} />
                </div>
              </div>
            </Card>

            {/* Progress & Chips */}
            <Card>
              <h3 className="text-xl font-semibold text-primary-600 mb-4">
                Progress & Tags
              </h3>
              <div className="space-y-4">
                <Progress
                  value={uploadProgress}
                  showLabel
                  label="Upload Progress"
                  color="primary"
                  animated={uploadProgress < 100}
                />

                <Progress
                  value={85}
                  showLabel
                  label="Profile Completion"
                  color="success"
                  size="lg"
                />

                <div className="space-y-2">
                  <p className="text-sm font-medium text-neu-700">Skills:</p>
                  <div className="flex flex-wrap gap-2">
                    <Chip variant="primary" deletable onDelete={() => {}}>
                      React
                    </Chip>
                    <Chip variant="secondary" deletable onDelete={() => {}}>
                      TypeScript
                    </Chip>
                    <Chip variant="neumorphic" deletable onDelete={() => {}}>
                      Design Systems
                    </Chip>
                    <Chip variant="success" deletable onDelete={() => {}}>
                      UI/UX
                    </Chip>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-neu-700">Status:</p>
                  <div className="flex flex-wrap gap-2">
                    <Chip variant="success" size="sm">
                      Available
                    </Chip>
                    <Chip variant="warning" size="sm">
                      Busy
                    </Chip>
                    <Chip variant="error" size="sm">
                      Offline
                    </Chip>
                    <Chip variant="outline" size="sm">
                      Away
                    </Chip>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Interactive Demo Section */}
          <Card size="lg" className="mb-12">
            <h2 className="text-2xl font-bold text-primary-600 mb-6 text-center">
              Interactive Dashboard Demo
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card variant="flat" className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Avatar size="md" variant="flat" className="bg-success-500">
                    <CheckCircle className="w-5 h-5" />
                  </Avatar>
                </div>
                <h4 className="font-semibold text-neu-700">Tasks Completed</h4>
                <p className="text-2xl font-bold text-success-600">127</p>
              </Card>

              <Card variant="flat" className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Avatar size="md" variant="flat" className="bg-warning-500">
                    <Eye className="w-5 h-5" />
                  </Avatar>
                </div>
                <h4 className="font-semibold text-neu-700">Page Views</h4>
                <p className="text-2xl font-bold text-warning-600">1,234</p>
              </Card>

              <Card variant="flat" className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Avatar size="md" variant="flat" className="bg-primary-500">
                    <Users className="w-5 h-5" />
                  </Avatar>
                </div>
                <h4 className="font-semibold text-neu-700">Users Online</h4>
                <p className="text-2xl font-bold text-primary-600">56</p>
              </Card>

              <Card variant="flat" className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Avatar size="md" variant="flat" className="bg-error-500">
                    <AlertTriangle className="w-5 h-5" />
                  </Avatar>
                </div>
                <h4 className="font-semibold text-neu-700">Errors</h4>
                <p className="text-2xl font-bold text-error-600">3</p>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-neu-700 mb-4">
                  Recent Activity
                </h4>
                <div className="space-y-3">
                  {[
                    {
                      user: "John Doe",
                      action: "completed task",
                      time: "2 minutes ago",
                    },
                    {
                      user: "Sarah Wilson",
                      action: "uploaded file",
                      time: "5 minutes ago",
                    },
                    {
                      user: "Mike Chen",
                      action: "left comment",
                      time: "10 minutes ago",
                    },
                  ].map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg neu-raised-sm"
                    >
                      <Avatar
                        size="sm"
                        fallback={activity.user
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      />
                      <div className="flex-1">
                        <p className="text-sm text-neu-700">
                          <span className="font-medium">{activity.user}</span>{" "}
                          {activity.action}
                        </p>
                        <p className="text-xs text-neu-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-neu-700 mb-4">
                  System Status
                </h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-neu-600">CPU Usage</span>
                      <Chip variant="success" size="sm">
                        Normal
                      </Chip>
                    </div>
                    <Progress value={65} color="success" size="sm" />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-neu-600">Memory</span>
                      <Chip variant="warning" size="sm">
                        High
                      </Chip>
                    </div>
                    <Progress value={85} color="warning" size="sm" />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-neu-600">Storage</span>
                      <Chip variant="error" size="sm">
                        Critical
                      </Chip>
                    </div>
                    <Progress value={95} color="error" size="sm" />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Footer */}
          <footer className="text-center">
            <Card>
              <p className="text-neu-600 mb-4">
                Built with ❤️ using React, TypeScript, Tailwind CSS, and
                Neumorphism design principles
              </p>
              <div className="flex justify-center gap-4">
                <Button variant="ghost" size="sm">
                  Documentation
                </Button>
                <Button variant="ghost" size="sm">
                  GitHub
                </Button>
                <Button variant="ghost" size="sm">
                  NPM
                </Button>
              </div>
            </Card>
          </footer>
        </div>
      </div>
    );
  },
};
