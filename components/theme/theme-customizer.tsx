"use client";

import { useCallback, useEffect, useMemo, useRef, type ReactNode } from "react";
import { Button, Label, Slider } from "@heroui/react";
import { Download, Moon, RotateCcw, Sun } from "lucide-react";
import JSZip from "jszip";
import { useRouter, useSearchParams } from "next/navigation";
import { AppSelect } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { BUILTIN_THEMES } from "@/lib/builtin-themes";
import {
  FIELD_RADIUS_PRESETS,
  FONT_PRESETS,
  RADIUS_PRESETS,
  buildThemeZipManifest,
  useCustomThemeStore,
  type CustomThemeDraft,
} from "@/lib/theme/custom-theme-store";
import {
  accentHueTrackGradient,
  baseChromaTrackGradient,
} from "@/lib/theme/generate-customizer-theme";
import { useThemeStore } from "@/stores/theme-store";

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

function CustomizerField({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex min-w-[148px] flex-col gap-1.5", className)}>
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function HueSlider({
  value,
  onChange,
  "aria-label": ariaLabel,
}: {
  value: number;
  onChange: (value: number) => void;
  "aria-label": string;
}) {
  return (
    <Slider
      aria-label={ariaLabel}
      minValue={0}
      maxValue={360}
      step={1}
      value={value}
      onChange={(v) => onChange(Array.isArray(v) ? v[0] : v)}
      className="w-full min-w-[148px]"
    >
      <Slider.Track
        className="h-2 rounded-full"
        style={{ background: accentHueTrackGradient() }}
      >
        <Slider.Fill className="bg-transparent" />
        <Slider.Thumb className="size-4 border-2 border-background bg-foreground shadow-md" />
      </Slider.Track>
    </Slider>
  );
}

function BaseSlider({
  hue,
  value,
  onChange,
}: {
  hue: number;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <Slider
      aria-label="Amount of color in gray"
      minValue={0}
      maxValue={0.04}
      step={0.0001}
      value={value}
      onChange={(v) => onChange(Array.isArray(v) ? v[0] : v)}
      className="w-full min-w-[148px]"
    >
      <Slider.Track
        className="h-2 rounded-full"
        style={{ background: baseChromaTrackGradient(hue) }}
      >
        <Slider.Fill className="bg-transparent" />
        <Slider.Thumb className="size-4 border-2 border-background bg-foreground shadow-md" />
      </Slider.Track>
    </Slider>
  );
}

function readCustomizerFromSearchParams(params: URLSearchParams): Partial<CustomThemeDraft> {
  const patch: Partial<CustomThemeDraft> = {};
  const accentHue = params.get("accentHue");
  const base = params.get("base");
  const radius = params.get("radius");
  const fieldRadius = params.get("fieldRadius");
  const font = params.get("font");
  const preset = params.get("preset");

  if (accentHue != null && accentHue !== "") patch.accentHue = Number(accentHue);
  if (base != null && base !== "") patch.baseChroma = Number(base);
  if (radius) {
    const presetRadius = RADIUS_PRESETS.find((item) => item.id === radius);
    if (presetRadius) patch.radius = presetRadius.value;
  }
  if (fieldRadius) {
    const fieldPreset = FIELD_RADIUS_PRESETS.find((item) => item.id === fieldRadius);
    if (fieldPreset) patch.fieldRadiusScale = fieldPreset.scale;
  }
  if (font) {
    const fontPreset = FONT_PRESETS.find((item) => item.id === font);
    if (fontPreset) patch.fontSans = fontPreset.value;
  }
  if (preset) patch.presetId = preset;

  return patch;
}

function writeCustomizerToSearchParams(draft: CustomThemeDraft, params: URLSearchParams) {
  params.set("accentHue", String(Math.round(draft.accentHue)));
  params.set("base", String(Number(draft.baseChroma.toFixed(4))));
  params.set(
    "radius",
    RADIUS_PRESETS.find((item) => item.value === draft.radius)?.id ?? "rounded",
  );
  params.set(
    "fieldRadius",
    FIELD_RADIUS_PRESETS.find((item) => item.scale === draft.fieldRadiusScale)?.id ?? "lg",
  );
  params.set(
    "font",
    FONT_PRESETS.find((item) => item.value === draft.fontSans)?.id ?? "geist",
  );
  params.set("preset", draft.presetId);
}

export function ThemeCustomizer({
  syncUrl = false,
  className,
}: {
  /** Mirror HeroUI demo URL params (`?accentHue=&base=…`). */
  syncUrl?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const draft = useCustomThemeStore();
  const previewLive = useCustomThemeStore((s) => s.previewLive);
  const resetDraft = useCustomThemeStore((s) => s.resetDraft);
  const { resolvedTheme, setTheme, activateTheme, activeThemeId } = useThemeStore();
  const urlHydratedRef = useRef(false);

  const themeOptions = useMemo(
    () => [
      { value: "custom", label: "Custom" },
      ...BUILTIN_THEMES.map((theme) => ({ value: theme.id, label: theme.name })),
    ],
    [],
  );

  const radiusId =
    RADIUS_PRESETS.find((item) => item.value === draft.radius)?.id ?? "rounded";
  const fieldRadiusId =
    FIELD_RADIUS_PRESETS.find((item) => item.scale === draft.fieldRadiusScale)?.id ?? "lg";
  const fontId =
    FONT_PRESETS.find((item) => item.value === draft.fontSans)?.id ?? "geist";

  const applyPreset = useCallback(
    (presetId: string) => {
      if (presetId === "custom") {
        activateTheme(null);
        previewLive({ presetId: "custom", enabled: true });
        return;
      }
      activateTheme(presetId);
      useCustomThemeStore.setState({ presetId, enabled: false });
      useCustomThemeStore.getState().initialize();
    },
    [activateTheme, previewLive],
  );

  const patchLive = useCallback(
    (patch: Partial<CustomThemeDraft>) => {
      if (draft.presetId !== "custom") {
        activateTheme(null);
      }
      previewLive({ ...patch, presetId: "custom" });
    },
    [activateTheme, draft.presetId, previewLive],
  );

  // Boot live preview once; URL params win over persisted draft on the design-system page.
  useEffect(() => {
    if (urlHydratedRef.current) return;

    if (syncUrl) {
      const fromUrl = readCustomizerFromSearchParams(searchParams);
      const hasUrl = Object.keys(fromUrl).length > 0;

      if (fromUrl.presetId && fromUrl.presetId !== "custom") {
        applyPreset(fromUrl.presetId);
        if (hasUrl) previewLive(fromUrl);
      } else {
        activateTheme(null);
        previewLive(hasUrl ? fromUrl : undefined);
      }
    } else if (draft.presetId === "custom") {
      previewLive();
    }

    urlHydratedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional one-time boot
  }, []);

  useEffect(() => {
    if (!syncUrl || !urlHydratedRef.current) return;
    const params = new URLSearchParams(searchParams.toString());
    writeCustomizerToSearchParams({ ...draft, presetId: draft.presetId }, params);
    const next = params.toString();
    const current = searchParams.toString();
    if (next !== current) {
      router.replace(`?${next}`, { scroll: false });
    }
  }, [
    syncUrl,
    draft.accentHue,
    draft.baseChroma,
    draft.radius,
    draft.fieldRadiusScale,
    draft.fontSans,
    draft.presetId,
    router,
    searchParams,
  ]);

  const effectivePreset =
    draft.presetId === "custom" && draft.enabled ? "custom" : (activeThemeId ?? draft.presetId);

  return (
    <footer
      className={cn(
        "border-t border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80",
        className,
      )}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-end gap-x-5 gap-y-3 px-4 py-3 sm:px-6">
        <CustomizerField label="Accent" className="flex-[1.1_1_160px]">
          <HueSlider
            aria-label="Accent hue"
            value={draft.accentHue}
            onChange={(accentHue) => patchLive({ accentHue })}
          />
        </CustomizerField>

        <CustomizerField label="Base" className="flex-[1.1_1_160px]">
          <BaseSlider
            hue={draft.accentHue}
            value={draft.baseChroma}
            onChange={(baseChroma) => patchLive({ baseChroma })}
          />
        </CustomizerField>

        <CustomizerField label="Font family" className="w-[132px]">
          <AppSelect
            aria-label="Font family"
            value={fontId}
            onChange={(id) => {
              const preset = FONT_PRESETS.find((item) => item.id === id);
              if (preset) patchLive({ fontSans: preset.value });
            }}
            options={FONT_PRESETS.map((preset) => ({
              value: preset.id,
              label: preset.label,
            }))}
          />
        </CustomizerField>

        <CustomizerField label="Radius" className="w-[120px]">
          <AppSelect
            aria-label="Radius"
            value={radiusId}
            onChange={(id) => {
              const preset = RADIUS_PRESETS.find((item) => item.id === id);
              if (preset) patchLive({ radius: preset.value });
            }}
            options={RADIUS_PRESETS.map((preset) => ({
              value: preset.id,
              label: preset.label,
            }))}
          />
        </CustomizerField>

        <CustomizerField label="Radius form" className="w-[120px]">
          <AppSelect
            aria-label="Radius form"
            value={fieldRadiusId}
            onChange={(id) => {
              const preset = FIELD_RADIUS_PRESETS.find((item) => item.id === id);
              if (preset) patchLive({ fieldRadiusScale: preset.scale });
            }}
            options={FIELD_RADIUS_PRESETS.map((preset) => ({
              value: preset.id,
              label: preset.label,
            }))}
          />
        </CustomizerField>

        <CustomizerField label="Theme" className="w-[132px]">
          <AppSelect
            aria-label="Theme preset"
            value={effectivePreset === null ? "custom" : String(effectivePreset)}
            onChange={(id) => applyPreset(id)}
            options={themeOptions}
          />
        </CustomizerField>

        <div className="ms-auto flex items-center gap-1 pb-0.5">
          <Button
            variant="ghost"
            size="sm"
            isIconOnly
            aria-label={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            onPress={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          >
            {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            isIconOnly
            aria-label="Reset custom theme"
            onPress={() => {
              resetDraft();
              activateTheme(null);
            }}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onPress={() => void exportThemeZip(draft)}
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
    </footer>
  );
}
