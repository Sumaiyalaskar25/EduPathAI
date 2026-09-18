"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  GitMerge,
  Landmark,
  Lock,
  Map,
  Network,
  Scale,
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
  { icon: BarChart3, label: "Friction Analytics" },
  { icon: Map, label: "Bottleneck Map" },
  { icon: GitMerge, label: "Bridge Demand" },
  { icon: Scale, label: "State Comparison" },
  { icon: Network, label: "Mobility Network Intelligence" },
];

export default function GovernmentHomePage() {
  const app = APPS.government;

  return (
    <div className="min-h-screen">
      <header className="border-b border-subtle bg-surface/70 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
              <Landmark className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-semibold text-primary">
              EduPathAI
            </span>
            <Badge variant="conflict" className="ml-2">
              Government
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
            eyebrow="Government analyst dashboard"
            title="Mobility Intelligence"
            description="Aggregate friction patterns across institutions. Privacy-preserving. This is the foundation placeholder — analytics dashboards ship in a later phase."
            actions={
              <Badge variant="conflict" icon={<Lock className="h-3 w-3" />}>
                Aggregated, privacy-preserving
              </Badge>
            }
          />

          <div className="mt-8">
            <Card
              title={`${app.name} planned modules`}
              description="Designed for UGC / MoE analysts reviewing state-level mobility."
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
              icon={<BarChart3 className="h-6 w-6" />}
              title="No aggregate insights yet"
              description="Friction analytics, bottleneck maps, and bridge demand forecasting will render here with Recharts in a later phase."
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