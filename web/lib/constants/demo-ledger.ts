export interface LedgerEvent {
  id: string;
  kind: "identity" | "ai" | "gate" | "human";
  title: string;
  subtitle: string;
  badge?: { label: string; tone: "neutral" | "amber" | "green" };
  rightLabel?: string;
  highlight?: boolean;
  overlay?: string;
  icon: "check" | "sparkle" | "warn" | "user";
}

export const DEMO_LEDGER_EVENTS: LedgerEvent[] = [
  {
    id: "evt-01",
    kind: "identity",
    title: "Identity Tokenized & Enrolled",
    subtitle: "DigiLocker APAAR handshake",
    badge: { label: "7f83b1657...", tone: "neutral" },
    icon: "check",
  },
  {
    id: "evt-02",
    kind: "ai",
    title: "Multi-Model AI Extraction & Consensus",
    subtitle:
      "Consensus Score: 0.94 · v4.2 Prompt Engine",
    badge: { label: "Consensus Score: 0.94", tone: "neutral" },
    rightLabel: "Tue-04|31 17:35 AM",
    icon: "sparkle",
  },
  {
    id: "evt-03",
    kind: "gate",
    title: "Deterministic Recognition Gate",
    subtitle:
      "Zero hallucination rule applied. Rule #7 matched: Missing Network Flow Algorithms",
    badge: { label: "Status: BRIDGE_REQUIRED", tone: "amber" },
    highlight: true,
    overlay: "Review Bridge Requirements",
    icon: "warn",
  },
  {
    id: "evt-04",
    kind: "human",
    title: "Human Board Approval",
    subtitle:
      "Signed by BoS Convener Prof. S. Sen via Aadhaar e-Sign",
    icon: "user",
  },
];

export const DEMO_BUNDLE_JSON = `{
  "name": "metadata",
  "version": "0.0.0",
  "sha256": "4a7b9c2d57a9e3e9a268e9532a22beb0c",
  "ledgers": [
    {
      "sha256": "4a7b9c2d57a3d47ab964b77b2277e",
      "solver_parameters": {
        "presentation": "5",
        "times": 10,
        "masking": true,
        "parameter": false
      }
    }
  ],
  "immutable_s3_object_lock_pointers": {
    "sha256": "1aa775e2e7a2c969d3737b1500507d3"
  }
}`;