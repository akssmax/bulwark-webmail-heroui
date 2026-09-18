"use client";

import {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useState,
  type ErrorInfo,
  type ReactNode,
} from "react";
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
import { SearchField } from "@/components/ui/search-field";
import { ThemeCustomizer } from "@/components/theme/theme-customizer";
import { GrayPaletteScale } from "@/components/theme/neutral-palette-picker";
import { GRAY_PALETTES } from "@/lib/theme/gray-palettes";
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
import { cn } from "@/lib/utils";
import { FONT_PRESETS, RADIUS_PRESETS } from "@/lib/theme/custom-theme-store";

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

type NavItem = { id: string; label: string };

const NAV: { label: string; items: NavItem[] }[] = [
  {
    label: "Foundations",
    items: [
      { id: "introduction", label: "Introduction" },
      { id: "colors", label: "Colors" },
      { id: "typography", label: "Typography" },
      { id: "palettes", label: "Neutral palettes" },
      { id: "materials", label: "Materials" },
    ],
  },
  {
    label: "App",
    items: [{ id: "composites", label: "Composites" }],
  },
  {
    label: "Components",
    items: [
      { id: "buttons", label: "Buttons" },
      { id: "inputs", label: "Inputs" },
      { id: "date-time", label: "Date and time" },
      { id: "overlays", label: "Overlays" },
      { id: "controls", label: "Controls" },
      { id: "data-display", label: "Data display" },
      { id: "tabs", label: "Tabs" },
      { id: "accordion", label: "Accordion" },
      { id: "table", label: "Table" },
      { id: "pagination", label: "Pagination" },
    ],
  },
];

const COLOR_TOKENS = [
  { name: "Background", token: "--color-background" },
  { name: "Foreground", token: "--color-foreground" },
  { name: "Primary", token: "--color-primary" },
  { name: "Secondary", token: "--color-secondary" },
  { name: "Muted", token: "--color-muted" },
  { name: "Muted text", token: "--color-muted-foreground" },
  { name: "Accent", token: "--color-accent" },
  { name: "Destructive", token: "--color-destructive" },
  { name: "Card", token: "--color-card" },
  { name: "Popover", token: "--color-popover" },
  { name: "Border", token: "--color-border" },
  { name: "Sidebar", token: "--color-sidebar" },
  { name: "Success", token: "--color-success" },
  { name: "Warning", token: "--color-warning" },
  { name: "Info", token: "--color-info" },
  { name: "Unread", token: "--color-unread" },
] as const;

const TYPESCALE = [
  {
    name: "Display",
    className: "text-4xl font-semibold tracking-tight text-foreground",
    size: "2.25rem / 36px",
    weight: "600",
    leading: "1.25",
    token: "text-4xl font-semibold",
    sample: "Inbox at a glance",
  },
  {
    name: "Heading 1",
    className: "text-3xl font-semibold tracking-tight text-foreground",
    size: "1.875rem / 30px",
    weight: "600",
    leading: "1.25",
    token: "text-3xl font-semibold",
    sample: "Design system",
  },
  {
    name: "Heading 2",
    className: "text-xl font-semibold text-foreground",
    size: "1.25rem / 20px",
    weight: "600",
    leading: "1.4",
    token: "text-xl font-semibold",
    sample: "HeroUI components in use",
  },
  {
    name: "Heading 3",
    className: "text-lg font-semibold text-foreground",
    size: "1.125rem / 18px",
    weight: "600",
    leading: "1.4",
    token: "text-lg font-semibold",
    sample: "Section title",
  },
  {
    name: "Body",
    className: "text-base text-foreground",
    size: "1rem / 16px",
    weight: "400",
    leading: "1.5",
    token: "text-base · --font-size-base",
    sample: "Mail, calendar, contacts, and files in one window.",
  },
  {
    name: "Body small",
    className: "text-sm text-foreground",
    size: "0.875rem / 14px",
    weight: "400",
    leading: "1.5",
    token: "text-sm",
    sample: "Most UI copy, lists, and form labels.",
  },
  {
    name: "Caption",
    className: "text-xs text-muted-foreground",
    size: "0.75rem / 12px",
    weight: "400",
    leading: "1.4",
    token: "text-xs text-muted-foreground",
    sample: "Helper text, timestamps, and nav groups.",
  },
  {
    name: "Mono",
    className: "font-mono text-sm text-foreground",
    size: "0.875rem / 14px",
    weight: "400",
    leading: "1.5",
    token: "font-mono text-sm · --font-mono",
    sample: "oklch(0.6231 0.188 259.81)",
  },
] as const;

function DocSection({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 space-y-6">
      <div className="max-w-2xl">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h2>
        {description ? <p className="mt-2 text-base text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

function PreviewCard({
  title,
  description,
  href,
  children,
  className,
}: {
  title: string;
  description?: string;
  href?: string;
  children: ReactNode;
  className?: string;
}) {
  const heading = href ? (
    <a href={href} className="text-sm font-semibold text-foreground hover:text-primary">
      {title}
    </a>
  ) : (
    <p className="text-sm font-semibold text-foreground">{title}</p>
  );

  return (
    <div className={cn("flex flex-col rounded-xl border border-border bg-surface p-5", className)}>
      <div className="min-h-28 flex-1">{children}</div>
      <div className="mt-4 space-y-1">
        {heading}
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
    </div>
  );
}

function DemoCard({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-border bg-surface p-5", className)}>
      <p className="mb-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
      <SectionErrorBoundary fallback={title}>{children}</SectionErrorBoundary>
    </div>
  );
}

function MailboxRow() {
  return (
    <div className="flex w-full items-center gap-3 rounded-xl border border-border bg-background px-3 py-2">
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
    <div className="flex w-full items-center gap-3 rounded-xl border border-border bg-background px-3 py-2">
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
    <div className="flex w-full items-center gap-3 rounded-xl border border-border bg-background px-3 py-2">
      <File className="h-4 w-4 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">roadmap.pdf</p>
        <p className="text-xs text-muted-foreground">2.4 MB</p>
      </div>
      <Star className="h-4 w-4 text-primary" />
    </div>
  );
}

function SidebarNav({
  activeId,
  query,
}: {
  activeId: string;
  query: string;
}) {
  const q = query.trim().toLowerCase();
  const groups = NAV.map((group) => ({
    ...group,
    items: group.items.filter((item) => !q || item.label.toLowerCase().includes(q)),
  })).filter((group) => group.items.length > 0);

  return (
    <nav aria-label="Design system" className="space-y-6">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {group.label}
          </p>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active = item.id === activeId;
              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className={cn(
                      "block rounded-lg px-2 py-1.5 text-sm transition-colors",
                      active
                        ? "bg-muted font-medium text-foreground"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                    )}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      {groups.length === 0 ? (
        <p className="px-2 text-sm text-muted-foreground">No matching sections.</p>
      ) : null}
    </nav>
  );
}

export function DesignSystemGallery() {
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [checked, setChecked] = useState(true);
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState("introduction");

  const sectionIds = useMemo(() => NAV.flatMap((group) => group.items.map((item) => item.id)), []);

  useEffect(() => {
    const nodes = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el != null);
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const next = visible[0]?.target.id;
        if (next) setActiveId(next);
      },
      { rootMargin: "-18% 0px -68% 0px", threshold: [0, 0.2, 0.5, 1] },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [sectionIds]);

  return (
    <SectionErrorBoundary fallback="Design system gallery">
      <div className="min-h-dvh bg-background text-foreground">
        <header className="sticky top-0 z-20 border-b border-border bg-surface/90 backdrop-blur">
          <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-4 py-3 sm:px-6">
            <div className="min-w-0 shrink-0">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Design system</p>
              <p className="truncate text-sm font-semibold">Bulwark</p>
            </div>
            <SearchField
              value={query}
              onChange={setQuery}
              placeholder="Search sections"
              aria-label="Search sections"
              className="mx-auto hidden min-w-0 max-w-md flex-1 md:flex"
              inputClassName="text-sm"
            />
            <Link href="/settings" className="ms-auto shrink-0 text-sm text-primary">
              Back to settings
            </Link>
          </div>
        </header>

        <div className="mx-auto flex max-w-[1400px]">
          <aside className="sticky top-[57px] hidden h-[calc(100dvh-57px-5.5rem)] w-56 shrink-0 overflow-y-auto border-e border-border px-3 py-8 lg:block">
            <SidebarNav activeId={activeId} query={query} />
          </aside>

          <main className="min-w-0 flex-1 px-4 py-10 pb-28 sm:px-8">
            <div className="mb-6 lg:hidden">
              <SearchField
                value={query}
                onChange={setQuery}
                placeholder="Search sections"
                aria-label="Search sections"
                className="mb-4"
                inputClassName="text-sm"
              />
              <div className="flex gap-2 overflow-x-auto pb-1">
                {NAV.flatMap((group) => group.items).map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="shrink-0 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-16">
              <DocSection
                id="introduction"
                title="Design system"
                description="Tokens, typography, and HeroUI building blocks used across mail, calendar, contacts, and files."
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <PreviewCard
                    title="Colors"
                    description="Semantic tokens for surfaces, accent, and status."
                    href="#colors"
                  >
                    <div className="flex h-full items-end gap-2">
                      {["--color-primary", "--color-success", "--color-warning", "--color-destructive", "--color-info", "--color-muted-foreground"].map(
                        (token) => (
                          <span
                            key={token}
                            className="h-16 flex-1 rounded-full border border-border"
                            style={{ background: `var(${token})` }}
                          />
                        ),
                      )}
                    </div>
                  </PreviewCard>
                  <PreviewCard
                    title="Typography"
                    description="Geist Sans and Geist Mono, mapped to a product typescale."
                    href="#typography"
                  >
                    <div className="flex h-full items-end justify-between gap-4 px-2">
                      <span className="text-3xl font-semibold tracking-tight text-muted-foreground/70">Sans</span>
                      <span className="font-mono text-3xl font-medium text-muted-foreground/70">Mono</span>
                    </div>
                  </PreviewCard>
                  <PreviewCard
                    title="Components"
                    description="Buttons, fields, overlays, and calendar pickers."
                    href="#buttons"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Button size="sm">Primary</Button>
                      <Button size="sm" variant="secondary">Secondary</Button>
                      <Chip size="sm">Label</Chip>
                    </div>
                  </PreviewCard>
                  <PreviewCard
                    title="App composites"
                    description="Pieces composed for mailbox, calendar, contacts, and files."
                    href="#composites"
                  >
                    <MailboxRow />
                  </PreviewCard>
                </div>
              </DocSection>

              <DocSection
                id="colors"
                title="Colors"
                description="Semantic tokens from :root. The theme dock at the bottom remaps accent and gray base live."
              >
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {COLOR_TOKENS.map((item) => (
                    <div
                      key={item.token}
                      className="overflow-hidden rounded-xl border border-border bg-surface"
                    >
                      <div
                        className="h-16 border-b border-border"
                        style={{ background: `var(${item.token})` }}
                      />
                      <div className="px-3 py-2.5">
                        <p className="text-sm font-medium text-foreground">{item.name}</p>
                        <p className="truncate font-mono text-xs text-muted-foreground">{item.token}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </DocSection>

              <DocSection
                id="typography"
                title="Typography"
                description="Product type is Geist Sans (`--font-sans`) with Geist Mono (`--font-mono`) for tokens and code. Base size is `--font-size-base` (16px)."
              >
                <div className="overflow-hidden rounded-xl border border-border">
                  {TYPESCALE.map((row, index) => (
                    <div
                      key={row.name}
                      className={cn(
                        "grid gap-3 px-5 py-5 sm:grid-cols-[9rem_minmax(0,1fr)_11rem]",
                        index > 0 && "border-t border-border",
                      )}
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">{row.name}</p>
                        <p className="mt-1 font-mono text-xs text-muted-foreground">{row.size}</p>
                        <p className="font-mono text-xs text-muted-foreground">
                          {row.weight} / {row.leading}
                        </p>
                      </div>
                      <p className={row.className}>{row.sample}</p>
                      <p className="self-center font-mono text-xs text-muted-foreground sm:text-end">
                        {row.token}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-border bg-surface p-6">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Geist Sans</p>
                    <p className="mt-4 text-4xl font-semibold tracking-tight">Ag</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      UI copy, headings, and body. Driven by `--font-sans`.
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-surface p-6">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Geist Mono</p>
                    <p className="mt-4 font-mono text-4xl font-medium">Ag</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Hex values, JMAP ids, and code. Driven by `--font-mono`.
                    </p>
                  </div>
                </div>
              </DocSection>

              <DocSection
                id="palettes"
                title="Neutral palettes"
                description="Tailwind gray families used for theme backgrounds and the customizer Base control."
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  {GRAY_PALETTES.map((palette) => (
                    <div key={palette.id} className="rounded-xl border border-border bg-surface p-4">
                      <GrayPaletteScale paletteId={palette.id} />
                    </div>
                  ))}
                </div>
              </DocSection>

              <DocSection
                id="materials"
                title="Materials"
                description="Radius, density, and font presets from the theme builder. Apply them from the dock below."
              >
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-border bg-surface p-5">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Radius</p>
                    <div className="mt-4 flex flex-wrap items-end gap-3">
                      {RADIUS_PRESETS.map((preset) => (
                        <div key={preset.id} className="text-center">
                          <div
                            className="h-12 w-12 border border-border bg-muted"
                            style={{ borderRadius: preset.value }}
                          />
                          <p className="mt-1.5 text-xs text-muted-foreground">{preset.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border bg-surface p-5">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Density</p>
                    <ul className="mt-4 space-y-2 text-sm">
                      <li className="flex justify-between gap-3">
                        <span>compact</span>
                        <span className="font-mono text-xs text-muted-foreground">tighter rows</span>
                      </li>
                      <li className="flex justify-between gap-3">
                        <span>normal</span>
                        <span className="font-mono text-xs text-muted-foreground">36px sidebar</span>
                      </li>
                      <li className="flex justify-between gap-3">
                        <span>touch</span>
                        <span className="font-mono text-xs text-muted-foreground">44px floor</span>
                      </li>
                    </ul>
                  </div>
                  <div className="rounded-xl border border-border bg-surface p-5">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Fonts</p>
                    <ul className="mt-4 space-y-2 text-sm">
                      {FONT_PRESETS.map((preset) => (
                        <li key={preset.id} style={{ fontFamily: preset.value }}>
                          {preset.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </DocSection>

              <DocSection
                id="composites"
                title="App composites"
                description="Pieces composed for mail, calendar, contacts, and files."
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <PreviewCard title="Nav rail" description="App switcher item.">
                    <NavRailItem />
                  </PreviewCard>
                  <PreviewCard title="Mailbox row" description="Unread thread with folder chip.">
                    <MailboxRow />
                  </PreviewCard>
                  <PreviewCard title="Event pill" description="Calendar event chrome.">
                    <EventPill />
                  </PreviewCard>
                  <PreviewCard title="Contact row" description="Address book list item.">
                    <ContactRow />
                  </PreviewCard>
                  <PreviewCard title="File row" description="JMAP FileNode preview." className="sm:col-span-2">
                    <FileRow />
                  </PreviewCard>
                </div>
              </DocSection>

              <DocSection id="buttons" title="Buttons" description="HeroUI Button plus the app icon wrapper.">
                <DemoCard title="Variants">
                  <div className="flex flex-wrap items-center gap-3">
                    <Button>Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="danger">Danger</Button>
                    <AppButton size="icon" aria-label="Star">
                      <Star className="h-4 w-4" />
                    </AppButton>
                  </div>
                </DemoCard>
              </DocSection>

              <DocSection id="inputs" title="Inputs" description="HeroUI TextField and the app input wrapper.">
                <DemoCard title="Fields">
                  <div className="flex flex-wrap items-start gap-4">
                    <TextField name="sample-email" className="w-64">
                      <Label>Email</Label>
                      <Input placeholder="you@example.com" />
                    </TextField>
                    <AppInput placeholder="App input wrapper" className="w-64" />
                  </div>
                </DemoCard>
              </DocSection>

              <DocSection
                id="date-time"
                title="Date and time"
                description="Custom HeroUI pickers — no native browser date controls."
              >
                <div className="grid gap-4 xl:grid-cols-2">
                  <DemoCard title="Pickers">
                    <div className="flex flex-col gap-4">
                      <SectionErrorBoundary fallback="DatePicker">
                        <DatePickerField label="Date" className="w-full max-w-72" />
                      </SectionErrorBoundary>
                      <SectionErrorBoundary fallback="DateTimePicker">
                        <DateTimePickerField label="Date and time" className="w-full max-w-72" />
                      </SectionErrorBoundary>
                      <SectionErrorBoundary fallback="TimePicker">
                        <TimePickerField label="Time" className="w-full max-w-48" />
                      </SectionErrorBoundary>
                      <SectionErrorBoundary fallback="DateRangePicker">
                        <DateRangePickerField className="w-full max-w-80" />
                      </SectionErrorBoundary>
                    </div>
                  </DemoCard>
                  <DemoCard title="Calendar">
                    <SectionErrorBoundary fallback="Calendar">
                      <AppCalendar />
                    </SectionErrorBoundary>
                  </DemoCard>
                </div>
              </DocSection>

              <DocSection id="overlays" title="Overlays" description="Menus, tooltips, modal, drawer, and toast.">
                <DemoCard title="Collections">
                  <div className="flex flex-wrap items-center gap-3">
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
                  </div>
                </DemoCard>
              </DocSection>

              <DocSection id="controls" title="Controls" description="Selection, switches, sliders, and progress.">
                <DemoCard title="Interactive">
                  <div className="flex flex-wrap items-center gap-6">
                    <Checkbox isSelected={checked} onChange={setChecked}>
                      Unread only
                    </Checkbox>
                    <Switch isSelected={checked} onChange={setChecked}>
                      <Switch.Content>
                        <Switch.Control>
                          <Switch.Thumb />
                        </Switch.Control>
                        Push notifications
                      </Switch.Content>
                    </Switch>
                    <Slider defaultValue={40} className="w-48" aria-label="Density">
                      <Slider.Track>
                        <Slider.Fill />
                        <Slider.Thumb />
                      </Slider.Track>
                    </Slider>
                    <Loader size="sm" />
                    <ProgressBar value={62} className="w-48" aria-label="Quota" />
                  </div>
                </DemoCard>
              </DocSection>

              <DocSection id="data-display" title="Data display" description="Avatar, badge, chip, alert, and card.">
                <DemoCard title="Surfaces">
                  <div className="flex flex-wrap items-start gap-4">
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
                  </div>
                </DemoCard>
              </DocSection>

              <DocSection id="tabs" title="Tabs" description="Segmented density tabs and HeroUI tab list.">
                <DemoCard title="Navigation">
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
                </DemoCard>
              </DocSection>

              <DocSection id="accordion" title="Accordion">
                <DemoCard title="Disclosure">
                  <Accordion className="w-full max-w-xl">
                    <Accordion.Item id="theming">
                      <Accordion.Heading>
                        <Accordion.Trigger>Theming</Accordion.Trigger>
                      </Accordion.Heading>
                      <Accordion.Panel>
                        Brand color maps to HeroUI --accent and Bulwark --color-primary.
                      </Accordion.Panel>
                    </Accordion.Item>
                  </Accordion>
                </DemoCard>
              </DocSection>

              <DocSection id="table" title="Table">
                <DemoCard title="Rows">
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
                </DemoCard>
              </DocSection>

              <DocSection id="pagination" title="Pagination">
                <DemoCard title="Pages">
                  <Pagination>
                    <Pagination.Content>
                      <Pagination.Item>1</Pagination.Item>
                      <Pagination.Item>2</Pagination.Item>
                      <Pagination.Item>3</Pagination.Item>
                    </Pagination.Content>
                  </Pagination>
                </DemoCard>
              </DocSection>
            </div>
          </main>
        </div>

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
