"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Search, Building2, MapPin, CheckCircle2, X } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SAMPLE_INSTITUTIONS = [
  { name: "Assam Science and Technology University (ASTU)", city: "Guwahati", state: "Assam", status: "Official Syllabus Reference", verified: true },
  { name: "Jawaharlal Nehru Technological University (JNTUH)", city: "Hyderabad", state: "Telangana", status: "Official Multi-Branch Syllabus", verified: true },
  { name: "National Institute of Technology (NIT) Hamirpur", city: "Hamirpur", state: "Himachal Pradesh", status: "Official Syllabus Reference", verified: true },
  { name: "Indian Institute of Information Technology (IIIT) Sri City", city: "Sri City", state: "Andhra Pradesh", status: "Official Curriculum Reference", verified: true },
  { name: "Indian Institute of Technology (IIT) Bombay", city: "Mumbai", state: "Maharashtra", status: "NIRF Top Ranked · BoS Empanelled", verified: true },
  { name: "Indian Institute of Technology (IIT) Delhi", city: "New Delhi", state: "Delhi", status: "NIRF Top Ranked · BoS Empanelled", verified: true },
  { name: "Anna University", city: "Chennai", state: "Tamil Nadu", status: "State Affiliating Body · NCrF Aligned", verified: true },
  { name: "University of Calcutta", city: "Kolkata", state: "West Bengal", status: "NIRF Ranked · Accredited HEI", verified: true },
  { name: "Madhav Institute of Technology & Science (MITS)", city: "Gwalior", state: "Madhya Pradesh", status: "Autonomous Institution · AICTE Approved", verified: true },
  { name: "Chitkara University", city: "Solan", state: "Himachal Pradesh", status: "State Private University · Accredited", verified: true },
];

export function NetworkModal({ open, onOpenChange }: Props) {
  const [query, setQuery] = useState("");

  const filtered = SAMPLE_INSTITUTIONS.filter(
    (i) =>
      i.name.toLowerCase().includes(query.toLowerCase()) ||
      i.city.toLowerCase().includes(query.toLowerCase()) ||
      i.state.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm transition-opacity" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl focus:outline-none md:p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <Dialog.Title className="font-display text-[20px] font-bold text-text-primary">
                  National Institutional Network
                </Dialog.Title>
                <Dialog.Description className="text-[12px] text-text-secondary">
                  129 NIRF-Anchored HEIs · 520 Curricula Versions Indexed
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          {/* Search Input */}
          <div className="mt-5 flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search university, state, or city..."
              className="flex-1 bg-transparent text-[13.5px] outline-none placeholder:text-slate-400"
            />
          </div>

          {/* Institutions List */}
          <div className="mt-4 max-h-[380px] overflow-y-auto space-y-2 pr-1">
            {filtered.map((inst, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-3.5 transition-colors hover:border-slate-200 hover:bg-slate-50"
              >
                <div>
                  <p className="text-[13.5px] font-bold text-text-primary">
                    {inst.name}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-text-muted">
                    <MapPin className="h-3 w-3 text-slate-400" />
                    <span>{inst.city}, {inst.state}</span>
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10.5px] font-semibold text-emerald-700">
                  <CheckCircle2 className="h-3 w-3" />
                  {inst.status}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 text-[11.5px] text-text-muted">
            <span>Showing verified active institutional nodes</span>
            <span className="font-semibold text-slate-700">129 Universities Total</span>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
