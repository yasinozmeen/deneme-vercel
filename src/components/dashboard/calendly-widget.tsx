"use client";

import { InlineWidget } from "react-calendly";
import clsx from "clsx";

type CalendlyWidgetProps = {
  url?: string;
  className?: string;
};

const FALLBACK_CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL;
const ENV_HINT = "NEXT_PUBLIC_CALENDLY_URL";
const PLACEHOLDER_SNIPPETS = ["yourname", "example"];

function resolveCalendlyUrl(candidate?: string) {
  return candidate?.trim() || undefined;
}

function isCalendlyUrl(candidate?: string): candidate is string {
  if (!candidate) {
    return false;
  }

  if (PLACEHOLDER_SNIPPETS.some((snippet) => candidate.includes(snippet))) {
    return false;
  }

  try {
    const url = new URL(candidate);
    return url.hostname === "calendly.com" || url.hostname.endsWith(".calendly.com");
  } catch {
    return false;
  }
}

export function CalendlyWidget({ url, className }: CalendlyWidgetProps) {
  const calendlyUrl = resolveCalendlyUrl(url ?? FALLBACK_CALENDLY_URL);

  if (!isCalendlyUrl(calendlyUrl)) {
    return (
      <div
        className={clsx(
          "overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-lg",
          className,
        )}
      >
        <div className="flex h-full flex-col items-center justify-center gap-3 px-6 py-10 text-center text-sm text-neutral-500">
          <span aria-hidden className="text-4xl">⚠️</span>
          <p>Calendly bağlantısı bulunamadı.</p>
          <p className="text-xs text-neutral-400">
            Lütfen {ENV_HINT} ortam değişkeni için geçerli bir Calendly URL&apos;si
            tanımlayın.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-lg",
        className,
      )}
    >
      <InlineWidget
        url={calendlyUrl}
        styles={{
          height: "100%",
          minHeight: "28rem",
        }}
        pageSettings={{
          backgroundColor: "ffffff",
          hideEventTypeDetails: false,
          hideLandingPageDetails: false,
        }}
      />
    </div>
  );
}
