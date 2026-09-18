"use client";

import { motion } from "framer-motion";
import {
  Building2,
  ClipboardCheck,
  FileSearch,
  ScrollText,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { ROLE_LABELS } from "@edupathai/auth";
import { APPS } from "@edupathai/config";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  PageHeader,
} from "@edupathai/ui";

const plannedModules = [
  { icon: ClipboardCheck, label: "Review Queue" },
  { icon: FileSearch, label: "Evidence Dossier" },
  { icon: SlidersHorizontal, label: "Policy Config" },
  { icon: ScrollText, label: "Human Override decisions" },
];

export default function HeiHomePage() {
  const app = APPS.hei;

  return (
    <div className="min-h-screen">
      <header className="border-b border-subtle bg-surface/70 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
              <Building2 className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-semibold text-primary">
              EduPathAI
            </span>
            <Badge variant="review" className="ml-2">
              HEI Reviewer
            </Badge>
          </div>
          <Badge variant="brand">{ROLE_LABELS[app.role]}</Badge>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <PageHeader
            eyebrow="HEI review portal"
            title="BoS Review Queue"
            description="AI proposes. You decide. Every decision is auditable. This is the foundation placeholder — the full review workflow ships in a later phase."
            actions={
              <Badge variant="review" icon={<ShieldCheck className="h-3 w-3" />}>
                Institutional authority preserved
              </Badge>
            }
          />

          <div className="mt-8">
            <Card
              title={`${app.name} planned modules`}
              description="Institutional reviewers retain 100% final approval authority."
            >
              <ul className="space-y-2.5">
                {plannedModules.map((item) => (
                  <li key={item.label} className="flex items-center gap-2.5">
                    <item.icon className="h-4 w-4 text-muted" />
                    <span className="text-sm text-secondary">{item.label}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <div className="mt-6 pb-4">
            <EmptyState
              icon={<ShieldCheck className="h-6 w-6" />}
              title="No recognition decisions pending"
              description="The review queue will surface DIRECT / BRIDGE / MISSING / REVIEW / POLICY_CONFLICT proposals with full evidence dossiers and audit replay."
              action={
                <Button variant="secondary" disabled>
                  Coming soon
                </Button>
              }
            />
          </div>
        </motion.div>
      </main>
    </div>
  );
}