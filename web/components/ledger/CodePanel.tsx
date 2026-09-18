"use client";

import { Copy, FileJson } from "lucide-react";
import { useState } from "react";

interface CodePanelProps {
  filename: string;
  code: string;
}

/** Minimal tokenizer for JSON syntax highlighting. */
function tokenize(line: string): React.ReactNode {
  const nodes: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < line.length) {
    const ch = line[i];

    if (ch === '"') {
      // string — find closing quote
      let j = i + 1;
      while (j < line.length && line[j] !== '"') {
        if (line[j] === "\\") j++;
        j++;
      }
      const str = line.slice(i, j + 1);
      // is it a key? next non-space char is ":"
      let k = j + 1;
      while (k < line.length && line[k] === " ") k++;
      const isKey = line[k] === ":";
      nodes.push(
        <span
          key={key++}
          className={isKey ? "text-sky-300" : "text-amber-200"}
        >
          {str}
        </span>
      );
      i = j + 1;
      continue;
    }

    if (/[0-9]/.test(ch) || (ch === "-" && /[0-9]/.test(line[i + 1] || ""))) {
      let j = i + 1;
      while (j < line.length && /[0-9.\-eE]/.test(line[j])) j++;
      nodes.push(
        <span key={key++} className="text-fuchsia-300">
          {line.slice(i, j)}
        </span>
      );
      i = j;
      continue;
    }

    if (line.startsWith("true", i) || line.startsWith("false", i)) {
      const word = line.startsWith("true", i) ? "true" : "false";
      nodes.push(
        <span key={key++} className="text-rose-300">
          {word}
        </span>
      );
      i += word.length;
      continue;
    }

    if (line.startsWith("null", i)) {
      nodes.push(
        <span key={key++} className="text-rose-300">
          null
        </span>
      );
      i += 4;
      continue;
    }

    if ("{}[],:".includes(ch)) {
      nodes.push(
        <span key={key++} className="text-slate-400">
          {ch}
        </span>
      );
      i++;
      continue;
    }

    nodes.push(
      <span key={key++} className="text-slate-300">
        {ch}
      </span>
    );
    i++;
  }

  return <>{nodes}</>;
}

export function CodePanel({ filename, code }: CodePanelProps) {
  const [copied, setCopied] = useState(false);
  const lines = code.split("\n");

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-800 bg-code shadow-xl">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 px-4 py-3">
        <FileJson className="h-4 w-4 text-sky-300" />
        <span className="font-mono text-[13px] font-medium text-slate-100">
          {filename}
        </span>
        <button
          onClick={onCopy}
          className="ml-auto flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-800/60 hover:text-slate-100"
          aria-label="Copy code"
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Body */}
      <div className="max-h-[420px] overflow-auto p-4">
        <pre className="font-mono text-[12.5px] leading-[1.7]">
          {lines.map((line, i) => (
            <div key={i} className="whitespace-pre">
              {tokenize(line)}
            </div>
          ))}
        </pre>
      </div>

      {copied && (
        <div className="border-t border-slate-800/80 px-4 py-2 text-[11px] font-medium text-emerald-300">
          Copied to clipboard
        </div>
      )}
    </div>
  );
}