"use client";

import { InlineWidget } from "react-calendly";

type CalendlyWidgetProps = {
  url?: string;
};

const DEFAULT_CALENDLY_URL = "https://calendly.com/yourname/30min";

export function CalendlyWidget({ url }: CalendlyWidgetProps) {
  const calendlyUrl =
    url || process.env.NEXT_PUBLIC_CALENDLY_URL || DEFAULT_CALENDLY_URL;

  return (
    <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-lg">
      <InlineWidget
        url={calendlyUrl}
        styles={{
          height: "700px",
        }}
      />
    </div>
  );
}
