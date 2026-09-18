"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  GraduationCap,
  LogIn,
  Milestone,
  Route,
  ScrollText,
  Sparkles,
  TreeDeciduous,
} from "lucide-react";
import type { RecognitionStatus } from "@edupathai/api-types";
import { ROLE_LABELS } from "@edupathai/auth";
import { APPS } from "@edupathai/config";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  LoadingSkeleton,
  PageHeader,
  RecognitionStatusLegend,
  StatusBadge,
} from "@edupathai/ui";
import { useAppStore } from "../stores/app-store";

const exampleStatuses: RecognitionStatus[] = [
  "DIRECT",
  "BRIDGE",
  "MISSING",
  "REVIEW",
  "POLICY_CONFLICT",
];

const foundationFeatures = [
  "npm workspaces monorepo (apps + packages)",
  "Design tokens v1 — Violet brand + semantic recognition colors",
  "Shared UI kit: Button, Card, Badge, StatusBadge, EmptyState, LoadingSkeleton, PageHeader",
  "Frozen API types mirroring services/schemas.py",
  "Shared API client structure (only backend-implemented routes)",
  "Auth foundation with role types",
];

const laterPhases = [
  { icon: LogIn, label: "Login & authentication" },
  { icon: TreeDeciduous, label: "Academic Tree (centerpiece)" },
  { icon: Route, label: "Pathway comparison" },
  { icon: Milestone, label: "BridgePath remediation" },
  { icon: ScrollText, label: "Audit replay" },
];

export default function StudentHomePage() {
  const role = useAppStore((s) => s.role);
  const app = APPS.student;

  return (
    <div className="min-h-screen">
      <header className="border-b border-subtle bg-surface/70 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-semibold text-primary">
              EduPathAI
            </span>
            <Badge variant="brand" className="ml-2">
              Student
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="neutral" icon={<Sparkles className="h-3 w-3" />}>
              Foundation build
            </Badge>
            <Badge variant="brand">{ROLE_LABELS[role]}</Badge>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <PageHeader
            eyebrow="Student portal"
            title="Plan My Pathway"
            description="Explainable, constraint-aware academic pathways from verified learning evidence. This is the foundation placeholder — full pages arrive in later phases."
            actions={
              <Button variant="primary" disabled>
                Plan my pathway
              </Button>
            }
          />

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Card
              title={`${app.name} is scaffolded`}
              description="The monorepo foundation is installed and type-safe."
            >
              <ul className="space-y-2.5">
                {foundationFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-direct" />
                    <span className="text-sm text-secondary">{feature}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card
              title="Recognition status colors"
              description="Semantic tokens drive StatusBadge across all portals."
            >
              <RecognitionStatusLegend />
              <div className="mt-6 space-y-2">
                {exampleStatuses.map((status) => (
                  <div key={status} className="flex items-center gap-3">
                    <StatusBadge status={status} />
                    <span className="font-mono text-xs text-muted">
                      {status}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <Card
              title="Loading states"
              description="Shared LoadingSkeleton (Framer Motion driven)."
            >
              <LoadingSkeleton rows={3} />
            </Card>

            <Card
              title="Later phases"
              description="Locked intentionally for upcoming implementation milestones."
            >
              <ul className="space-y-2.5">
                {laterPhases.map((item) => (
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
              icon={<TreeDeciduous className="h-6 w-6" />}
              title="Your Academic Tree will grow here"
              description="The Tree — the centerpiece visualization of your learned courses, unlocked targets, gaps, and bridges — ships in a later phase."
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