"use client";

import { useEffect, useMemo, useState } from "react";
import type { Announcement } from "@/lib/announcements";

type PopupProps = {
  announcement: Announcement;
};

export function AnnouncementPopup({ announcement }: PopupProps) {
  const storageKey = useMemo(
    () => `alert-dismissed-${announcement.version}`,
    [announcement.version],
  );
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8 backdrop-blur-sm sm:px-6">
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start gap-3">
          <div className="mt-1 h-10 w-10 rounded-full bg-neutral-900/90 text-white">
            <div className="flex h-full w-full items-center justify-center text-sm font-semibold">
              {announcement.version}
            </div>
          </div>
          <div className="flex-1 text-sm text-neutral-700">
            <p className="whitespace-pre-line">{announcement.message}</p>
            <p className="mt-2 text-xs font-medium uppercase tracking-wide text-neutral-400">
              Son güncelleme:{" "}
              {new Date(announcement.created_at).toLocaleDateString("tr-TR")}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="ml-2 text-lg font-semibold text-neutral-400 transition hover:text-neutral-600"
            aria-label="Popup'ı kapat"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
