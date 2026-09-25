"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Building2,
  Mail,
  MapPin,
  GraduationCap,
  ShieldCheck,
  Send,
  X,
  FileCheck2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useInviteHeiInstitution } from "@/lib/api/hooks";
import { cn } from "@/lib/utils/cn";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CATEGORIES = [
  "IIT / NIT / INI",
  "State & Central Universities",
  "Autonomous Engineering Colleges",
  "Deemed & Private Universities",
];

const NAAC_GRADES = ["A++", "A+", "A", "B++", "B+"];

export function InviteInstitutionModal({ open, onOpenChange }: Props) {
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [category, setCategory] = useState(CATEGORIES[2]);
  const [naac, setNaac] = useState(NAAC_GRADES[1]);
  const [aisheCode, setAisheCode] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [agreed, setAgreed] = useState(true);

  const inviteMutation = useInviteHeiInstitution();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contactEmail.trim() || !city.trim() || !state.trim()) {
      toast.error("Please fill in all mandatory institution details");
      return;
    }
    if (!agreed) {
      toast.error("Please confirm compliance with NCrF statutory framework");
      return;
    }

    try {
      await inviteMutation.mutateAsync({
        name: name.trim(),
        short_name: shortName.trim() || name.trim().slice(0, 24),
        city: city.trim(),
        state: state.trim(),
        type: category,
        naac,
        aishe_code: aisheCode.trim() || undefined,
        contact_email: contactEmail.trim(),
      });
      toast.success(`Onboarding invite sent to ${contactEmail.trim()}`);
      onOpenChange(false);
      setName("");
      setShortName("");
      setCity("");
      setState("");
      setContactEmail("");
      setAisheCode("");
    } catch {
      toast.error("Failed to send invitation. Please try again.");
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-md transition-opacity" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[92vh] w-[95vw] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xl focus:outline-none md:p-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white shadow-md shadow-emerald-700/20">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Dialog.Title className="font-display text-[20px] font-bold text-[rgb(26_42_82)]">
                    Onboard Partner HEI
                  </Dialog.Title>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800 border border-emerald-300">
                    ABC Node
                  </span>
                </div>
                <Dialog.Description className="mt-0.5 text-[12px] text-text-secondary">
                  Invite an accredited higher education institution into the EduPathAI credit recognition network
                </Dialog.Description>
              </div>
            </div>

            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-full p-2 text-text-muted hover:bg-slate-100 hover:text-text-primary transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-[13px]">
            {/* Institution Full Name */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-text-secondary mb-1">
                Official Institution Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Delhi Technological University"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-text-primary outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Short Name & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-text-secondary mb-1">
                  Acronym / Display Name
                </label>
                <input
                  type="text"
                  value={shortName}
                  onChange={(e) => setShortName(e.target.value)}
                  placeholder="e.g. DTU"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-text-primary outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-text-secondary mb-1">
                  Institutional Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-text-primary outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* City & State */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-text-secondary mb-1">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. New Delhi"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-text-primary outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-text-secondary mb-1">
                  State *
                </label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. Delhi"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-text-primary outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* NAAC Grade & AISHE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-text-secondary mb-1">
                  NAAC Accreditation
                </label>
                <select
                  value={naac}
                  onChange={(e) => setNaac(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-text-primary outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                >
                  {NAAC_GRADES.map((g) => (
                    <option key={g} value={g}>
                      NAAC Grade {g}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-text-secondary mb-1">
                  AISHE Code (Optional)
                </label>
                <input
                  type="text"
                  value={aisheCode}
                  onChange={(e) => setAisheCode(e.target.value)}
                  placeholder="e.g. U-0128"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-text-primary outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Official Academic Email */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-text-secondary mb-1">
                Dean / Registrar Academic Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="dean.academics@dtu.ac.in"
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2.5 text-text-primary outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Statutory Compliance Agreement */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 flex items-start gap-2.5 text-[11.5px] text-emerald-900">
              <input
                type="checkbox"
                id="statutory-agree"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="statutory-agree" className="cursor-pointer leading-relaxed">
                I certify that this institution operates in compliance with UGC (Establishment and Operation of Academic Bank of Credits) Regulations and National Credit Framework (NCrF) credit transfer mandates.
              </label>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-[12.5px] font-semibold text-text-secondary hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={inviteMutation.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-[rgb(26_42_82)] px-5 py-2.5 text-[12.5px] font-semibold text-white shadow-md shadow-navy-950/20 hover:bg-[rgb(34_54_104)] disabled:opacity-50 transition-all"
              >
                <Send className="h-4 w-4" />
                <span>{inviteMutation.isPending ? "Dispatching…" : "Dispatch Invitation"}</span>
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
