"use client";

import { Component, Suspense, useState, type ErrorInfo, type ReactNode } from "react";
import {
  Accordion,
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Chip,
  Drawer,
  Dropdown,
  Modal,
  Pagination,
  ProgressBar,
  Slider,
  Switch,
  Tabs,
  Table,
  TextField,
  Input,
  Label,
  Toast,
} from "@heroui/react";
import { Calendar, File, Mail, Star, User } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader } from "@/components/ui/loader";
import { ThemeCustomizer } from "@/components/theme/theme-customizer";
import {
  AppCalendar,
  DatePickerField,
  DateRangePickerField,
  DateTimePickerField,
  TimePickerField,
} from "@/components/ui/date-picker";
import { Button as AppButton } from "@/components/ui/button";
import { Input as AppInput } from "@/components/ui/input";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import { Tooltip, TOOLTIP_DELAY_MS } from "@/components/ui/tooltip";

class SectionErrorBoundary extends Component<{ fallback: string; children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(this.props.fallback, error, info.componentStack);
  }
  render() {
    if (this.state.error) {
      return (
        <p className="text-sm text-danger">
          {this.props.fallback}: {this.state.error.message}
        </p>
      );
    }
    return this.props.children;
  }
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      <div className="flex flex-wrap items-start gap-3">
        <SectionErrorBoundary fallback={title}>{children}</SectionErrorBoundary>
      </div>
    </section>
  );
}

function MailboxRow() {
  return (
    <div className="flex w-full max-w-md items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2">
      <span className="h-2 w-2 rounded-full bg-primary" />
      <Avatar size="sm">
        <Avatar.Fallback>AJ</Avatar.Fallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">Alice Johnson</p>
        <p className="truncate text-xs text-muted-foreground">Q1 roadmap attached</p>
      </div>
      <Chip size="sm">Inbox</Chip>
    </div>
  );
}

function NavRailItem() {
  return (
    <button className="flex w-12 flex-col items-center gap-1 rounded-xl bg-primary/10 py-2 text-primary">
      <Mail className="h-5 w-5" />
      <span className="text-xs font-medium">Mail</span>
    </button>
  );
}

function EventPill() {
  return (
    <div className="inline-flex items-center gap-2 rounded-lg bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
      <Calendar className="h-3.5 w-3.5" />
      Design review · 10:00
    </div>
  );
}

function ContactRow() {
  return (
    <div className="flex w-full max-w-md items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2">
      <Avatar>
        <Avatar.Fallback>
          <User className="h-4 w-4" />
        </Avatar.Fallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">Carol Lee</p>
        <p className="text-xs text-muted-foreground">carol@example.com</p>
      </div>
      <AppButton size="sm" variant="outline">Message</AppButton>
    </div>
  );
}

function FileRow() {
  return (
    <div className="flex w-full max-w-md items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2">
      <File className="h-4 w-4 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">roadmap.pdf</p>
        <p className="text-xs text-muted-foreground">2.4 MB</p>
      </div>
      <Star className="h-4 w-4 text-primary" />
    </div>
  );
}

export function DesignSystemGallery() {
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [checked, setChecked] = useState(true);

  return (
    <SectionErrorBoundary fallback="Design system gallery">
      <div className="min-h-dvh bg-background text-foreground">
        <header className="sticky top-0 z-20 border-b border-border bg-surface/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Design system</p>
              <h1 className="text-xl font-semibold">HeroUI components in use</h1>
            </div>
            <Link href="/settings" className="text-sm text-primary">
              Back to settings
            </Link>
          </div>
        </header>

        <main className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-8 pb-28">
          <Section title="App composites" description="Pieces composed for mail, calendar, contacts, and files.">
            <NavRailItem />
            <MailboxRow />
            <EventPill />
            <ContactRow />
            <FileRow />
          </Section>

          <Section title="Buttons">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <AppButton size="icon" aria-label="Star">
              <Star className="h-4 w-4" />
            </AppButton>
          </Section>

          <Section title="Inputs">
            <TextField name="sample-email" className="w-64">
              <Label>Email</Label>
              <Input placeholder="you@example.com" />
            </TextField>
            <AppInput placeholder="App input wrapper" className="w-64" />
          </Section>

          <Section title="Date and time" description="Custom HeroUI pickers — no native browser date controls.">
            <SectionErrorBoundary fallback="DatePicker">
              <DatePickerField label="Date" className="w-72" />
            </SectionErrorBoundary>
            <SectionErrorBoundary fallback="DateTimePicker">
              <DateTimePickerField label="Date and time" className="w-72" />
            </SectionErrorBoundary>
            <SectionErrorBoundary fallback="TimePicker">
              <TimePickerField label="Time" className="w-48" />
            </SectionErrorBoundary>
            <SectionErrorBoundary fallback="DateRangePicker">
              <DateRangePickerField className="w-80" />
            </SectionErrorBoundary>
            <SectionErrorBoundary fallback="Calendar">
              <AppCalendar />
            </SectionErrorBoundary>
          </Section>

          <Section title="Collections and overlays">
            <Dropdown>
              <Dropdown.Trigger>Actions</Dropdown.Trigger>
              <Dropdown.Popover>
                <Dropdown.Menu>
                  <Dropdown.Item>Reply</Dropdown.Item>
                  <Dropdown.Item>Forward</Dropdown.Item>
                  <Dropdown.Item>Archive</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown>
            <Tooltip content="Tooltip content" delay={TOOLTIP_DELAY_MS}>
              <Button variant="secondary">Hover me</Button>
            </Tooltip>
            <Button variant="secondary" onPress={() => setModalOpen(true)}>
              Open modal
            </Button>
            <Button variant="tertiary" onPress={() => setDrawerOpen(true)}>
              Open drawer
            </Button>
            <Toast.Provider>
              <Button variant="outline" onPress={() => Toast.toast.success("Message archived")}>
                Toast
              </Button>
            </Toast.Provider>
          </Section>

          <Section title="Controls">
            <Checkbox isSelected={checked} onChange={setChecked}>
              Unread only
            </Checkbox>
            <Switch isSelected={checked} onChange={setChecked}>
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
              <Switch.Content>Push notifications</Switch.Content>
            </Switch>
            <Slider defaultValue={40} className="w-48" aria-label="Density">
              <Slider.Track>
                <Slider.Fill />
                <Slider.Thumb />
              </Slider.Track>
            </Slider>
            <Loader size="sm" />
            <ProgressBar value={62} className="w-48" aria-label="Quota" />
          </Section>

          <Section title="Data display">
            <Avatar>
              <Avatar.Fallback>AK</Avatar.Fallback>
            </Avatar>
            <Badge>3</Badge>
            <Chip>Label</Chip>
            <Alert>HeroUI restyle is active.</Alert>
            <Card className="w-64">
              <Card.Header>
                <Card.Title>Card</Card.Title>
                <Card.Description>Surface container</Card.Description>
              </Card.Header>
              <Card.Content>Used for login, settings, and previews.</Card.Content>
            </Card>
          </Section>

          <SectionErrorBoundary fallback="Tabs">
            <div className="flex w-full flex-col gap-4">
              <SegmentedTabs
                aria-label="Mailbox density"
                value="normal"
                onChange={() => {}}
                options={[
                  { value: "compact", label: "compact" },
                  { value: "normal", label: "normal" },
                  { value: "touch", label: "touch" },
                ]}
              />
              <Tabs className="w-full max-w-xl">
                <Tabs.ListContainer>
                  <Tabs.List>
                    <Tabs.Tab id="mail">
                      Mail
                      <Tabs.Indicator />
                    </Tabs.Tab>
                    <Tabs.Tab id="calendar">
                      <Tabs.Separator />
                      Calendar
                      <Tabs.Indicator />
                    </Tabs.Tab>
                    <Tabs.Tab id="files">
                      <Tabs.Separator />
                      Files
                      <Tabs.Indicator />
                    </Tabs.Tab>
                  </Tabs.List>
                </Tabs.ListContainer>
                <Tabs.Panel id="mail">Inbox, threads, and composer chrome.</Tabs.Panel>
                <Tabs.Panel id="calendar">Month, week, day, agenda.</Tabs.Panel>
                <Tabs.Panel id="files">JMAP FileNode browser.</Tabs.Panel>
              </Tabs>
            </div>
          </SectionErrorBoundary>

          <SectionErrorBoundary fallback="Accordion">
            <Accordion className="w-full max-w-xl">
              <Accordion.Item id="theming">
                <Accordion.Heading>
                  <Accordion.Trigger>Theming</Accordion.Trigger>
                </Accordion.Heading>
                <Accordion.Panel>Brand color maps to HeroUI --accent and Bulwark --color-primary.</Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          </SectionErrorBoundary>

          <SectionErrorBoundary fallback="Table">
            <Table>
              <Table.ScrollContainer>
                <Table.Content aria-label="Sample table">
                  <Table.Header>
                    <Table.Column isRowHeader>From</Table.Column>
                    <Table.Column>Subject</Table.Column>
                  </Table.Header>
                  <Table.Body>
                    <Table.Row id="alice">
                      <Table.Cell>Alice</Table.Cell>
                      <Table.Cell>Roadmap</Table.Cell>
                    </Table.Row>
                  </Table.Body>
                </Table.Content>
              </Table.ScrollContainer>
            </Table>
          </SectionErrorBoundary>

          <SectionErrorBoundary fallback="Pagination">
            <Pagination>
              <Pagination.Content>
                <Pagination.Item>1</Pagination.Item>
                <Pagination.Item>2</Pagination.Item>
                <Pagination.Item>3</Pagination.Item>
              </Pagination.Content>
            </Pagination>
          </SectionErrorBoundary>
        </main>

        <Modal.Backdrop isOpen={modalOpen} onOpenChange={setModalOpen}>
          <Modal.Container>
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>Modal</Modal.Heading>
              </Modal.Header>
              <Modal.Body>Used for confirms, prompts, and compose helpers.</Modal.Body>
              <Modal.Footer>
                <Button slot="close" variant="secondary">Close</Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>

        <Drawer.Backdrop isOpen={drawerOpen} onOpenChange={setDrawerOpen}>
          <Drawer.Content>
            <Drawer.Header>
              <Drawer.Heading>Drawer</Drawer.Heading>
            </Drawer.Header>
            <Drawer.Body>Search, filters, and mobile folders can use this overlay.</Drawer.Body>
          </Drawer.Content>
        </Drawer.Backdrop>

        <Suspense fallback={null}>
          <ThemeCustomizer syncUrl className="fixed inset-x-0 bottom-0 z-30" />
        </Suspense>
      </div>
    </SectionErrorBoundary>
  );
}
