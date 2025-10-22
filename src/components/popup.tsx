"use client";

import { useEffect, useState } from "react";
import type { Announcement } from "@/lib/announcements";

type PopupProps = {
  announcement: Announcement;
};

export function AnnouncementPopup({ announcement }: PopupProps) {
  const dismissalKey = announcement.id ?? announcement.version;
  const storageKey = `alert-dismissed-${dismissalKey}`;
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const dismissed = window.localStorage.getItem(storageKey) === "true";
    const update = () => setIsOpen(!dismissed);
    if (typeof queueMicrotask === "function") {
      queueMicrotask(update);
    } else {
      Promise.resolve().then(update).catch(update);
    }
  }, [storageKey]);

  const handleClose = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, "true");
    }
    setIsOpen(false);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-3 py-6 backdrop-blur-sm sm:px-6 sm:py-8">
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl sm:max-w-lg sm:p-8"
      >
        <div className="absolute right-4 top-4">
          <button
            type="button"
            onClick={handleClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-base font-semibold text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-700"
            aria-label="Popup'ı kapat"
          >
            ×
          </button>
        </div>
        <div className="pr-14">
          <h2 className="text-xl font-semibold text-neutral-900">
            {announcement.title ?? "Duyuru"}
          </h2>
          <p className="mt-4 whitespace-pre-line text-sm text-neutral-700">
            {announcement.message}
          </p>
        </div>
      </div>
    </div>
  );
}
