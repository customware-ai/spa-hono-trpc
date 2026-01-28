import { useState, type ReactElement } from "react";
import { Button } from "../ui/Button";
import { Card, CardHeader } from "../ui/Card";
import { Input, Textarea } from "../ui/Input";
import { Badge } from "../ui/Badge";
import { Alert } from "../ui/Alert";

export function ThemeShowcase(): ReactElement {
  const [showAlert, setShowAlert] = useState(true);

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-12">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-surface-900 mb-4">
          Theme Showcase
        </h1>
        <p className="text-lg text-surface-600 max-w-2xl mx-auto">
          A comprehensive preview of UI components and the professional color
          palette.
        </p>
      </div>

      {/* Color Palette */}
      <section>
        <h2 className="text-2xl font-semibold text-surface-800 mb-6">
          Color Palette
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Primary Colors */}
          <Card>
            <CardHeader title="Primary" description="Professional Blue" />
            <div className="space-y-2">
              {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                <div key={shade} className="flex items-center gap-3">
                  <div
                    className={`w-12 h-8 rounded bg-primary-${shade}`}
                    style={{
                      backgroundColor: `var(--color-primary-${shade}, oklch(var(--primary-${shade})))`,
                    }}
                  />
                  <span className="text-sm text-surface-600">{shade}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Accent Colors */}
          <Card>
            <CardHeader title="Accent" description="Teal" />
            <div className="space-y-2">
              {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                <div key={shade} className="flex items-center gap-3">
                  <div
                    className={`w-12 h-8 rounded bg-accent-${shade}`}
                    style={{
                      backgroundColor: `var(--color-accent-${shade}, oklch(var(--accent-${shade})))`,
                    }}
                  />
                  <span className="text-sm text-surface-600">{shade}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Surface Colors */}
          <Card>
            <CardHeader title="Surface" description="Neutral" />
            <div className="space-y-2">
              {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                <div key={shade} className="flex items-center gap-3">
                  <div
                    className={`w-12 h-8 rounded border border-surface-200 bg-surface-${shade}`}
                    style={{
                      backgroundColor: `var(--color-surface-${shade}, oklch(var(--surface-${shade})))`,
                    }}
                  />
                  <span className="text-sm text-surface-600">{shade}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Semantic Colors */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <Card className="text-center">
            <div className="w-full h-16 rounded bg-success mb-2" />
            <span className="text-sm font-medium">Success</span>
          </Card>
          <Card className="text-center">
            <div className="w-full h-16 rounded bg-warning mb-2" />
            <span className="text-sm font-medium">Warning</span>
          </Card>
          <Card className="text-center">
            <div className="w-full h-16 rounded bg-danger mb-2" />
            <span className="text-sm font-medium">Danger</span>
          </Card>
          <Card className="text-center">
            <div className="w-full h-16 rounded bg-info mb-2" />
            <span className="text-sm font-medium">Info</span>
          </Card>
        </div>
      </section>

      {/* Buttons */}
      <section>
        <h2 className="text-2xl font-semibold text-surface-800 mb-6">Buttons</h2>
        <Card>
          <CardHeader title="Button Variants" description="Different styles for different contexts" />
          <div className="space-y-6">
            {/* Variants */}
            <div>
              <h4 className="text-sm font-medium text-surface-600 mb-3">Variants</h4>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
              </div>
            </div>

            {/* Sizes */}
            <div>
              <h4 className="text-sm font-medium text-surface-600 mb-3">Sizes</h4>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>

            {/* States */}
            <div>
              <h4 className="text-sm font-medium text-surface-600 mb-3">States</h4>
              <div className="flex flex-wrap gap-3">
                <Button disabled>Disabled</Button>
                <Button loading>Loading</Button>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Cards */}
      <section>
        <h2 className="text-2xl font-semibold text-surface-800 mb-6">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="default">
            <CardHeader title="Default Card" description="Standard card with border" />
            <p className="text-surface-600">
              This is the default card variant with a subtle border.
            </p>
          </Card>
          <Card variant="elevated">
            <CardHeader title="Elevated Card" description="Card with shadow" />
            <p className="text-surface-600">
              This card has an elevated appearance with a soft shadow.
            </p>
          </Card>
          <Card variant="outlined">
            <CardHeader title="Outlined Card" description="Transparent background" />
            <p className="text-surface-600">
              This card has only an outline with a transparent background.
            </p>
          </Card>
        </div>
      </section>

      {/* Inputs */}
      <section>
        <h2 className="text-2xl font-semibold text-surface-800 mb-6">Form Inputs</h2>
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Input label="Email" type="email" placeholder="Enter your email" />
              <Input
                label="Password"
                type="password"
                placeholder="Enter password"
                helperText="Must be at least 8 characters"
              />
              <Input
                label="With Error"
                type="text"
                placeholder="Invalid input"
                error="This field has an error"
              />
            </div>
            <div className="space-y-4">
              <Textarea
                label="Description"
                placeholder="Enter a description..."
              />
              <Input
                label="Disabled"
                type="text"
                placeholder="Disabled input"
                disabled
              />
            </div>
          </div>
        </Card>
      </section>

      {/* Badges */}
      <section>
        <h2 className="text-2xl font-semibold text-surface-800 mb-6">Badges</h2>
        <Card>
          <CardHeader title="Badge Variants" description="Labels and status indicators" />
          <div className="flex flex-wrap gap-3">
            <Badge variant="default">Default</Badge>
            <Badge variant="primary">Primary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="danger">Danger</Badge>
            <Badge variant="info">Info</Badge>
          </div>
        </Card>
      </section>

      {/* Alerts */}
      <section>
        <h2 className="text-2xl font-semibold text-surface-800 mb-6">Alerts</h2>
        <div className="space-y-4">
          <Alert variant="info" title="Information">
            This is an informational alert message.
          </Alert>
          <Alert variant="success" title="Success">
            Your changes have been saved successfully.
          </Alert>
          <Alert variant="warning" title="Warning">
            Please review your input before continuing.
          </Alert>
          {showAlert && (
            <Alert
              variant="danger"
              title="Error"
              dismissible
              onDismiss={(): void => setShowAlert(false)}
            >
              Something went wrong. Click the X to dismiss this alert.
            </Alert>
          )}
          {!showAlert && (
            <Button
              variant="outline"
              size="sm"
              onClick={(): void => setShowAlert(true)}
            >
              Show Dismissible Alert
            </Button>
          )}
        </div>
      </section>

      {/* Typography */}
      <section>
        <h2 className="text-2xl font-semibold text-surface-800 mb-6">
          Typography
        </h2>
        <Card>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-surface-900">Heading 1</h1>
            <h2 className="text-3xl font-semibold text-surface-800">Heading 2</h2>
            <h3 className="text-2xl font-semibold text-surface-700">Heading 3</h3>
            <h4 className="text-xl font-medium text-surface-700">Heading 4</h4>
            <p className="text-base text-surface-600">
              Body text - Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
            <p className="text-sm text-surface-500">
              Small text - Used for captions, helper text, and secondary
              information.
            </p>
            <p className="text-xs text-surface-400">
              Extra small text - Used for fine print and metadata.
            </p>
          </div>
        </Card>
      </section>

      {/* Shadows */}
      <section>
        <h2 className="text-2xl font-semibold text-surface-800 mb-6">Shadows</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-xl shadow-soft text-center">
            <span className="text-surface-700 font-medium">Soft Shadow</span>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-medium text-center">
            <span className="text-surface-700 font-medium">Medium Shadow</span>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-strong text-center">
            <span className="text-surface-700 font-medium">Strong Shadow</span>
          </div>
        </div>
      </section>

      {/* Animations */}
      <section>
        <h2 className="text-2xl font-semibold text-surface-800 mb-6">
          Animations
        </h2>
        <Card>
          <CardHeader title="Animation Previews" description="Hover to trigger animations" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-surface-100 rounded-lg text-center animate-fade-in">
              <span className="text-surface-700">Fade In</span>
            </div>
            <div className="p-6 bg-surface-100 rounded-lg text-center animate-slide-up">
              <span className="text-surface-700">Slide Up</span>
            </div>
            <div className="p-6 bg-surface-100 rounded-lg text-center animate-scale-in">
              <span className="text-surface-700">Scale In</span>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
