"use client";

import {
  Button,
  Card,
  ColorArea,
  ColorPicker,
  ColorSlider,
  ColorSwatch,
  ColorSwatchPicker,
  Label,
} from "@heroui/react";
import { Download, RotateCcw } from "lucide-react";
import JSZip from "jszip";
import {
  BRAND_SWATCHES,
  DARK_BACKGROUND_SWATCHES,
  FONT_PRESETS,
  LIGHT_BACKGROUND_SWATCHES,
  RADIUS_PRESETS,
  buildThemeZipManifest,
  grayPaletteToDraft,
  matchGrayPalette,
  useCustomThemeStore,
  type CustomThemeDraft,
} from "@/lib/theme/custom-theme-store";
import { cn } from "@/lib/utils";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import { NeutralPalettePicker } from "@/components/theme/neutral-palette-picker";

function BrandColorControl({
  label,
  value,
  onChange,
  swatches = BRAND_SWATCHES,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  swatches?: readonly string[];
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <Label className="shrink-0 text-sm font-medium sm:w-36">{label}</Label>
      <ColorPicker
        value={value}
        onChange={(color) => onChange(color.toString("hex"))}
        className="min-w-0 w-full sm:w-auto"
      >
        <ColorPicker.Trigger className="w-full gap-3 rounded-xl border border-border bg-surface px-3 py-2 sm:w-auto sm:min-w-[9.5rem]">
          <ColorSwatch className="rounded-md" />
          <span className="font-mono text-sm">{value}</span>
        </ColorPicker.Trigger>
        <ColorPicker.Popover className="flex w-64 flex-col gap-3 p-4">
          <ColorArea colorSpace="hsb" xChannel="saturation" yChannel="brightness">
            <ColorArea.Thumb />
          </ColorArea>
          <ColorSlider channel="hue" colorSpace="hsb">
            <ColorSlider.Track>
              <ColorSlider.Thumb />
            </ColorSlider.Track>
          </ColorSlider>
          <ColorSwatchPicker
            className="flex flex-wrap gap-2"
            onChange={(color) => onChange(color.toString("hex"))}
          >
            {swatches.map((swatch) => (
              <ColorSwatchPicker.Item key={swatch} color={swatch}>
                <ColorSwatchPicker.Swatch />
              </ColorSwatchPicker.Item>
            ))}
          </ColorSwatchPicker>
        </ColorPicker.Popover>
      </ColorPicker>
    </div>
  );
}

async function exportThemeZip(draft: Omit<CustomThemeDraft, "enabled">) {
  const manifest = buildThemeZipManifest(draft);
  const zip = new JSZip();
  zip.file("manifest.json", JSON.stringify(manifest, null, 2));
  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${manifest.id}.zip`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function MailPreview() {
  const accent = useCustomThemeStore((s) => s.accent);
  return (
    <Card className="overflow-hidden">
      <Card.Header>
        <Card.Title>Mailbox preview</Card.Title>
        <Card.Description>Live tokens from the brand builder</Card.Description>
      </Card.Header>
      <Card.Content className="space-y-2 p-0">
        {[
          { unread: true, from: "Alice Johnson", subject: "Q1 roadmap" },
          { unread: false, from: "Bob Smith", subject: "Re: Meeting notes" },
          { unread: true, from: "Carol Lee", subject: "Invoice #4092" },
        ].map((row) => (
          <div
            key={row.subject}
            className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: row.unread ? accent : "transparent" }}
            />
            <div className="min-w-0 flex-1">
              <p className={cn("truncate text-sm", row.unread && "font-semibold")}>{row.from}</p>
              <p className="truncate text-xs text-muted-foreground">{row.subject}</p>
            </div>
            <Button size="sm" variant="secondary">
              Open
            </Button>
          </div>
        ))}
      </Card.Content>
    </Card>
  );
}

export function ThemeBuilder({ compact = false }: { compact?: boolean }) {
  const draft = useCustomThemeStore();
  const activeGrayPalette =
    draft.grayPalette ??
    matchGrayPalette(draft.backgroundLight, draft.backgroundDark);

  return (
    <div className={cn("grid gap-6", compact ? "grid-cols-1" : "lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]")}>
      <div className="space-y-5">
        <div>
          <h3 className="text-base font-semibold text-foreground">Custom theme builder</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick a brand color, radius, density, and font. Apply live, or export a Theme API v2 ZIP.
          </p>
        </div>

        <BrandColorControl
          label="Brand / accent"
          value={draft.accent}
          onChange={(accent) => draft.setDraft({ accent })}
        />

        <div className="space-y-2">
          <Label className="text-sm font-medium">Gray base</Label>
          <p className="text-xs text-muted-foreground">
            Tailwind neutral families — sets light/dark backgrounds and gray tokens.
          </p>
          <NeutralPalettePicker
            value={activeGrayPalette}
            onChange={(id) => draft.setDraft(grayPaletteToDraft(id))}
          />
        </div>

        <BrandColorControl
          label="Light background"
          value={draft.backgroundLight}
          onChange={(backgroundLight) =>
            draft.setDraft({
              backgroundLight,
              grayPalette: matchGrayPalette(backgroundLight, draft.backgroundDark) ?? draft.grayPalette,
            })
          }
          swatches={LIGHT_BACKGROUND_SWATCHES}
        />
        <BrandColorControl
          label="Dark background"
          value={draft.backgroundDark}
          onChange={(backgroundDark) =>
            draft.setDraft({
              backgroundDark,
              grayPalette: matchGrayPalette(draft.backgroundLight, backgroundDark) ?? draft.grayPalette,
            })
          }
          swatches={DARK_BACKGROUND_SWATCHES}
        />

        <div className="space-y-2">
          <Label className="text-sm font-medium">Radius</Label>
          <SegmentedTabs
            aria-label="Radius"
            value={RADIUS_PRESETS.find((preset) => preset.value === draft.radius)?.id ?? "rounded"}
            onChange={(id) => {
              const preset = RADIUS_PRESETS.find((item) => item.id === id);
              if (preset) draft.setDraft({ radius: preset.value });
            }}
            options={RADIUS_PRESETS.map((preset) => ({ value: preset.id, label: preset.label }))}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Density</Label>
          <SegmentedTabs
            aria-label="Density"
            value={draft.density}
            onChange={(density) => draft.setDraft({ density: density as CustomThemeDraft["density"] })}
            options={[
              { value: "compact", label: "compact" },
              { value: "normal", label: "normal" },
              { value: "touch", label: "touch" },
            ]}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Font</Label>
          <SegmentedTabs
            aria-label="Font"
            value={FONT_PRESETS.find((preset) => preset.value === draft.fontSans)?.id ?? "geist"}
            onChange={(id) => {
              const preset = FONT_PRESETS.find((item) => item.id === id);
              if (preset) draft.setDraft({ fontSans: preset.value });
            }}
            options={FONT_PRESETS.map((preset) => ({ value: preset.id, label: preset.label }))}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onPress={() => draft.applyDraft()}>Apply live</Button>
          <Button variant="secondary" onPress={() => void exportThemeZip(draft)}>
            <Download className="h-4 w-4" />
            Export ZIP
          </Button>
          <Button variant="ghost" onPress={() => draft.resetDraft()}>
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      <MailPreview />
    </div>
  );
}
