"use client";

import { InlineWidget } from "react-calendly";
import clsx from "clsx";

type CalendlyWidgetProps = {
  url?: string;
  className?: string;
};

const DEFAULT_CALENDLY_URL = "https://calendly.com/yourname/30min";

export function CalendlyWidget({ url, className }: CalendlyWidgetProps) {
  const calendlyUrl =
    url || process.env.NEXT_PUBLIC_CALENDLY_URL || DEFAULT_CALENDLY_URL;

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
