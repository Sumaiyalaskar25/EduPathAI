"use client";

import { useState, useMemo } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  GraduationCap,
  Target,
  Sparkles,
  Search,
  CheckCircle2,
  ArrowRight,
  X,
  MapPin,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import { useHeiInstitutions } from "@/lib/api/hooks";
import { useSessionStore } from "@/lib/store/session";
import type { HeiInstitution } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTargetInstitution?: string;
  currentTargetProgramme?: string;
  onDestinationChange: (targetInstitution: string, targetProgramme: string) => Promise<void> | void;
}

const POPULAR_PROGRAMMES = [
  "B.Tech Computer Science & Engineering",
  "B.Tech Artificial Intelligence & Machine Learning",
  "B.Tech Data Science & Engineering",
  "B.Tech Electronics & Communication Engineering",
  "B.Tech Electrical & Electronics Engineering",
  "B.Tech Information Technology",
  "B.Tech Robotics & Autonomous Systems",
  "B.Sc Computer Science (Honours)",
  "Bachelor of Computer Applications (BCA)",
];

export function DestinationModal({
  open,
  onOpenChange,
  currentTargetInstitution = "IIT Kanpur",
  currentTargetProgramme = "B.Tech Computer Science & Engineering",
  onDestinationChange,
}: Props) {
  const { data: heisData, isLoading } = useHeiInstitutions();
  const institutions: HeiInstitution[] = heisData?.items ?? [];

  const [selectedInst, setSelectedInst] = useState(currentTargetInstitution);
  const [selectedProg, setSelectedProg] = useState(currentTargetProgramme);
  const [customProg, setCustomProg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const institutionTypes = useMemo(() => {
    const set = new Set<string>();
    institutions.forEach((h: HeiInstitution) => {
      if (h.type) set.add(h.type);
    });
    return ["ALL", ...Array.from(set)];
  }, [institutions]);

  const filteredInstitutions = useMemo(() => {
    return institutions.filter((h: HeiInstitution) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        searchQuery === "" ||
        h.name.toLowerCase().includes(q) ||
        h.city.toLowerCase().includes(q) ||
        h.state.toLowerCase().includes(q) ||
        (h.short_name && h.short_name.toLowerCase().includes(q));

      const matchesType = typeFilter === "ALL" || h.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [institutions, searchQuery, typeFilter]);

  const finalProgramme = customProg.trim() ? customProg.trim() : selectedProg;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInst) {
      toast.error("Please select a target institution");
      return;
    }
    if (!finalProgramme) {
      toast.error("Please select or enter a target programme");
      return;
    }

    try {
      setIsSubmitting(true);
      await onDestinationChange(selectedInst, finalProgramme);
      toast.success(`Target updated: ${selectedInst} · ${finalProgramme}`);
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update target destination");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm"
              />
            </Dialog.Overlay>

            <Dialog.Content asChild>
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 16 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-white/70 bg-white/95 p-6 shadow-2xl backdrop-blur-xl sm:p-8"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Close button */}
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                      aria-label="Close"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </Dialog.Close>

                  {/* Header */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20">
                      <Target className="h-6 w-6" />
                    </div>
                    <div>
                      <Dialog.Title className="font-display text-xl font-bold text-slate-900 sm:text-2xl">
                        Select Destination College &amp; Course
                      </Dialog.Title>
                      <Dialog.Description className="text-xs text-slate-500 sm:text-sm">
                        Choose your target institution to recalculate credit match, competency gaps, and bridge pathways.
                      </Dialog.Description>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                    {/* Institution Search & Selection */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                          1. Choose Target College / University ({institutions.length} Accredited HEIs)
                        </label>
                        {selectedInst && (
                          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            Selected: {selectedInst}
                          </span>
                        )}
                      </div>

                      {/* Filter Badges & Search */}
                      <div className="flex flex-col sm:flex-row gap-2.5">
                        <div className="relative flex-1">
                          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by college name, city (e.g. Kanpur, Mumbai, Delhi)..."
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-9 pr-4 py-2.5 text-xs sm:text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10"
                          />
                        </div>

                        {institutionTypes.length > 2 && (
                          <div className="flex flex-wrap gap-1.5 sm:max-w-xs items-center">
                            {institutionTypes.slice(0, 4).map((type) => (
                              <button
                                key={type}
                                type="button"
                                onClick={() => setTypeFilter(type)}
                                className={cn(
                                  "rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition",
                                  typeFilter === type
                                    ? "bg-slate-900 text-white"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                )}
                              >
                                {type}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Scrollable Institution Cards */}
                      <div className="mt-2.5 max-h-52 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50/50 p-2 space-y-1.5 divide-y divide-slate-100">
                        {isLoading ? (
                          <div className="py-8 text-center text-xs text-slate-400">Loading partner HEIs...</div>
                        ) : filteredInstitutions.length === 0 ? (
                          <div className="py-8 text-center text-xs text-slate-400">
                            No institutions match your search query.
                          </div>
                        ) : (
                          filteredInstitutions.map((h: HeiInstitution) => {
                            const isSelected = selectedInst === h.name;
                            return (
                              <div
                                key={h.id || h.name}
                                onClick={() => setSelectedInst(h.name)}
                                className={cn(
                                  "flex cursor-pointer items-center justify-between rounded-xl p-2.5 transition-all pt-2",
                                  isSelected
                                    ? "bg-indigo-50 border border-indigo-200 shadow-sm"
                                    : "hover:bg-white"
                                )}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div
                                    className={cn(
                                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                                      isSelected
                                        ? "bg-indigo-600 text-white"
                                        : "bg-slate-200 text-slate-700"
                                    )}
                                  >
                                    <Building2 className="h-4 w-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                      {h.name}
                                    </p>
                                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                      <span className="flex items-center gap-0.5">
                                        <MapPin className="h-3 w-3 text-slate-400" />
                                        {h.city}, {h.state}
                                      </span>
                                      <span>•</span>
                                      <span className="font-medium text-slate-600">{h.type}</span>
                                      {(h.nirfTier || h.naac) && (
                                        <>
                                          <span>•</span>
                                          <span className="font-semibold text-amber-700">
                                            {h.nirfTier ? `NIRF ${h.nirfTier}` : `NAAC ${h.naac}`}
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                {isSelected && (
                                  <CheckCircle2 className="h-5 w-5 shrink-0 text-indigo-600" />
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Target Programme Selector */}
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2">
                        2. Select Target Degree Course / Programme
                      </label>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1">
                        {POPULAR_PROGRAMMES.map((prog) => {
                          const isSelected = selectedProg === prog && !customProg.trim();
                          return (
                            <button
                              key={prog}
                              type="button"
                              onClick={() => {
                                setSelectedProg(prog);
                                setCustomProg("");
                              }}
                              className={cn(
                                "flex items-center gap-2 rounded-xl border p-2.5 text-left text-xs transition",
                                isSelected
                                  ? "border-indigo-500 bg-indigo-50/80 font-bold text-indigo-900 shadow-sm"
                                  : "border-slate-200 bg-white font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                              )}
                            >
                              <GraduationCap className={cn("h-4 w-4 shrink-0", isSelected ? "text-indigo-600" : "text-slate-400")} />
                              <span className="truncate">{prog}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Custom Programme Input */}
                      <div className="mt-2.5">
                        <input
                          type="text"
                          value={customProg}
                          onChange={(e) => setCustomProg(e.target.value)}
                          placeholder="Or type custom course name (e.g. B.Tech in Cyber Security)"
                          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                        />
                      </div>
                    </div>

                    {/* Preview Corridor Strip */}
                    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-3.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-indigo-600 shrink-0" />
                        <span className="text-slate-600">
                          Transfer Target: <strong className="text-slate-900">{selectedInst}</strong> ·{" "}
                          <span className="text-indigo-800 font-semibold">{finalProgramme}</span>
                        </span>
                      </div>
                      <span className="hidden sm:inline-flex rounded-md bg-white px-2 py-0.5 text-[10px] font-bold text-indigo-700 border border-indigo-200">
                        Sovereign Gap Solver
                      </span>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={isSubmitting || !selectedInst || !finalProgramme}
                        className={cn(
                          "flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-bold text-white shadow-md transition-all",
                          isSubmitting || !selectedInst || !finalProgramme
                            ? "bg-slate-300 cursor-not-allowed text-slate-500"
                            : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/25"
                        )}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                            <span>Recalculating Equivalence…</span>
                          </>
                        ) : (
                          <>
                            <span>Run Pathway &amp; Gap Match</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
