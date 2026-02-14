import { Navigation } from "@/components/Navigation";
import { ThreeViewer } from "@/components/ThreeViewer";
import { useDesign, useUpdateDesignParams } from "@/hooks/use-designs";
import { useRoute, Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Share2, Info, RotateCcw, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useMemo, useState } from "react";
import {
  defaultDesignParams,
  designParamsPatchSchema,
  ringEngravingValues,
  ringFinishValues,
  ringProfileValues,
  gemShapeValues,
  type DesignParams,
} from "@shared/schema";

function normalizeParams(input: unknown): DesignParams {
  const partial = designParamsPatchSchema.safeParse(input);
  if (!partial.success) return { ...defaultDesignParams };
  return { ...defaultDesignParams, ...partial.data };
}

function optionLabel(value: string): string {
  return value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

const SELECT_TRIGGER_CLASS =
  "bg-black/70 border-white/20 text-foreground focus:ring-primary/40 focus:border-primary/40";
const SELECT_CONTENT_CLASS =
  "z-[120] bg-[#0b0c12] border border-white/20 text-foreground shadow-2xl backdrop-blur";
const SELECT_ITEM_CLASS = "text-foreground focus:bg-white/10 focus:text-white";

export default function DesignResult() {
  const [, params] = useRoute("/design/:id");
  const id = params ? parseInt(params.id) : 0;
  const { data: design, isLoading, error } = useDesign(id);
  const updateParamsMutation = useUpdateDesignParams(id);
  const [designParams, setDesignParams] = useState<DesignParams>({ ...defaultDesignParams });
  const [savedParams, setSavedParams] = useState<DesignParams>({ ...defaultDesignParams });
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const hasChanges = useMemo(
    () => JSON.stringify(designParams) !== JSON.stringify(savedParams),
    [designParams, savedParams],
  );

  useEffect(() => {
    if (!design) return;
    const normalized = normalizeParams(design.designParams);
    setDesignParams(normalized);
    setSavedParams(normalized);
    setSaveMessage(null);
  }, [design?.designParams, design?.id]);

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center">Loading design...</div>;
  if (error || !design) return <div className="min-h-screen bg-background flex items-center justify-center">Design not found</div>;

  const symbols = (design.symbols as string[]) || [];

  function setParam<K extends keyof DesignParams>(key: K, value: DesignParams[K]) {
    setSaveMessage(null);
    setDesignParams((prev) => ({ ...prev, [key]: value }));
  }

  function saveDesignParams() {
    updateParamsMutation.mutate(designParams, {
      onSuccess: (updated) => {
        const normalized = normalizeParams(updated.designParams);
        setDesignParams(normalized);
        setSavedParams(normalized);
        setSaveMessage("3D settings saved.");
      },
      onError: (mutationError) => {
        setSaveMessage(
          mutationError instanceof Error
            ? mutationError.message
            : "Failed to save 3D settings.",
        );
      },
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
        <Link href="/gallery" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 text-sm uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4" /> Back to Gallery
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl"
        >
          <div className="mb-8">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-4 leading-tight">
              The <span className="text-gradient-gold">Essence</span> of Your Story
            </h1>
            <div className="h-1 w-24 bg-primary/30 rounded-full" />
          </div>

          <div className="bg-white/5 rounded-2xl p-8 border border-white/5 mb-8">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
              <Info className="w-4 h-4" /> Story Input
            </h3>
            <p className="text-lg font-light leading-relaxed italic text-gray-300">
              "{design.prompt}"
            </p>
          </div>

          {symbols.length > 0 && (
            <div className="mb-10">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4">Extracted Symbols</h3>
              <div className="flex flex-wrap gap-3">
                {symbols.map((symbol, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="px-4 py-2 rounded-full border-primary/30 text-primary bg-primary/5 text-sm font-normal"
                  >
                    {symbol}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="mb-10 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4">3D Preview</h3>
              <div className="h-[420px]">
                <ThreeViewer modelUrl={design.modelUrl} params={designParams} />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/30 p-5 md:p-6">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-5">
                Edit Ring
              </h3>

              <div className="space-y-5 max-h-[420px] overflow-y-auto pr-2">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground">
                    <Label>Band Radius</Label>
                    <span>{designParams.bandRadius.toFixed(2)}</span>
                  </div>
                  <Slider value={[designParams.bandRadius]} min={0.7} max={1.6} step={0.01} onValueChange={([value]) => setParam("bandRadius", Number(value.toFixed(2)))} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground">
                    <Label>Band Thickness</Label>
                    <span>{designParams.bandThickness.toFixed(2)}</span>
                  </div>
                  <Slider value={[designParams.bandThickness]} min={0.05} max={0.22} step={0.005} onValueChange={([value]) => setParam("bandThickness", Number(value.toFixed(3)))} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground">
                    <Label>Band Width</Label>
                    <span>{designParams.bandWidth.toFixed(2)}</span>
                  </div>
                  <Slider value={[designParams.bandWidth]} min={0.08} max={0.45} step={0.01} onValueChange={([value]) => setParam("bandWidth", Number(value.toFixed(2)))} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground">
                    <Label>Gem Count</Label>
                    <span>{designParams.gemCount}</span>
                  </div>
                  <Slider value={[designParams.gemCount]} min={0} max={7} step={1} onValueChange={([value]) => setParam("gemCount", Math.round(value))} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground">
                    <Label>Gem Size</Label>
                    <span>{designParams.gemSize.toFixed(2)}</span>
                  </div>
                  <Slider value={[designParams.gemSize]} min={0.05} max={0.25} step={0.01} onValueChange={([value]) => setParam("gemSize", Number(value.toFixed(2)))} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground">
                    <Label>Gem Height</Label>
                    <span>{designParams.gemHeight.toFixed(2)}</span>
                  </div>
                  <Slider value={[designParams.gemHeight]} min={0} max={0.22} step={0.01} onValueChange={([value]) => setParam("gemHeight", Number(value.toFixed(2)))} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground">
                    <Label>Twist</Label>
                    <span>{designParams.twist.toFixed(2)}</span>
                  </div>
                  <Slider value={[designParams.twist]} min={0} max={1} step={0.01} onValueChange={([value]) => setParam("twist", Number(value.toFixed(2)))} />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Finish</Label>
                  <Select value={designParams.finish} onValueChange={(value) => setParam("finish", value as DesignParams["finish"])}>
                    <SelectTrigger className={SELECT_TRIGGER_CLASS}>
                      <SelectValue placeholder="Select finish" />
                    </SelectTrigger>
                    <SelectContent className={SELECT_CONTENT_CLASS} position="popper">
                      {ringFinishValues.map((value) => (
                        <SelectItem key={value} value={value} className={SELECT_ITEM_CLASS}>
                          {optionLabel(value)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Profile</Label>
                  <Select value={designParams.profile} onValueChange={(value) => setParam("profile", value as DesignParams["profile"])}>
                    <SelectTrigger className={SELECT_TRIGGER_CLASS}>
                      <SelectValue placeholder="Select profile" />
                    </SelectTrigger>
                    <SelectContent className={SELECT_CONTENT_CLASS} position="popper">
                      {ringProfileValues.map((value) => (
                        <SelectItem key={value} value={value} className={SELECT_ITEM_CLASS}>
                          {optionLabel(value)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Engraving</Label>
                  <Select value={designParams.engraving} onValueChange={(value) => setParam("engraving", value as DesignParams["engraving"])}>
                    <SelectTrigger className={SELECT_TRIGGER_CLASS}>
                      <SelectValue placeholder="Select engraving" />
                    </SelectTrigger>
                    <SelectContent className={SELECT_CONTENT_CLASS} position="popper">
                      {ringEngravingValues.map((value) => (
                        <SelectItem key={value} value={value} className={SELECT_ITEM_CLASS}>
                          {optionLabel(value)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Gem Shape</Label>
                  <Select value={designParams.gemShape} onValueChange={(value) => setParam("gemShape", value as DesignParams["gemShape"])}>
                    <SelectTrigger className={SELECT_TRIGGER_CLASS}>
                      <SelectValue placeholder="Select gem shape" />
                    </SelectTrigger>
                    <SelectContent className={SELECT_CONTENT_CLASS} position="popper">
                      {gemShapeValues.map((value) => (
                        <SelectItem key={value} value={value} className={SELECT_ITEM_CLASS}>
                          {optionLabel(value)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mt-6">
                <Button
                  onClick={saveDesignParams}
                  disabled={!hasChanges || updateParamsMutation.isPending}
                  className="rounded-full px-5"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateParamsMutation.isPending ? "Saving..." : "Save 3D Settings"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSaveMessage(null);
                    setDesignParams(savedParams);
                  }}
                  disabled={!hasChanges || updateParamsMutation.isPending}
                  className="rounded-full"
                >
                  <RotateCcw className="w-4 h-4 mr-2" /> Reset
                </Button>
              </div>

              {saveMessage && (
                <p className="mt-4 text-sm text-muted-foreground">{saveMessage}</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8">
              Request Quote
            </Button>
            <Button size="lg" variant="ghost" className="rounded-full hover:bg-white/5 gap-2">
              <Share2 className="w-4 h-4" /> Share
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
