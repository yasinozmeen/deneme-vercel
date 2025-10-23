"use client";

import { useEffect, useState } from "react";
import { CalendlyWidget } from "@/components/dashboard/calendly-widget";

type Schedule = {
  id: string;
  title: string;
};

type ScheduleSelectorProps = {
  remainingCredits: number;
};

const SCHEDULES: Schedule[] = [
  { id: "foundation", title: "Temeller Altyapı Oluşturma" },
  { id: "product", title: "Ürün" },
  { id: "listing", title: "Listeleme" },
  { id: "supply", title: "Tedarik" },
  { id: "launch", title: "Lansman" },
  { id: "account", title: "Hesap Yönetimi" },
];

export function ScheduleSelector({ remainingCredits }: ScheduleSelectorProps) {
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null,
  );

  const hasCredits = remainingCredits > 0;

  useEffect(() => {
    if (!selectedSchedule) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedSchedule(null);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedSchedule]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-semibold text-neutral-900">
          Randevu Takvimleri
        </h2>
        <p className="mt-2 text-sm text-neutral-500">
          İhtiyacına en uygun başlığı seçtikten sonra Calendly üzerinden randevu
          oluşturabilirsin.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {SCHEDULES.map((schedule) => {
          const isActive = selectedSchedule?.id === schedule.id;

          return (
            <button
              key={schedule.id}
              type="button"
              onClick={() => {
                if (!hasCredits) {
                  return;
                }
                setSelectedSchedule(schedule);
              }}
              disabled={!hasCredits}
              className={`group flex h-full flex-col overflow-hidden rounded-3xl border bg-white text-left shadow-lg transition ${
                isActive
                  ? "border-rose-500 shadow-rose-200"
                  : hasCredits
                    ? "border-neutral-200 hover:-translate-y-1 hover:shadow-xl"
                    : "border-neutral-200 opacity-60 cursor-not-allowed"
              }`}
            >
              <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-8 text-center sm:px-8 sm:py-10">
                <span aria-hidden className="text-4xl sm:text-5xl">
                  📅
                </span>
                <span className="text-base font-semibold uppercase tracking-wide text-neutral-900 sm:text-lg">
                  {schedule.title}
                </span>
              </div>
              <div className="w-full bg-gradient-to-r from-rose-950 via-rose-700 to-rose-500 px-6 py-3 text-center text-sm font-semibold text-white transition group-hover:brightness-110">
                Randevu Al
              </div>
            </button>
          );
        })}
      </div>

      <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-6 text-center text-sm text-neutral-500 sm:p-8">
        {hasCredits
          ? "Bir başlık seçtiğinde randevu takvimi modal olarak açılacak."
          : "Toplantı hakkınız kalmadı. Lütfen yöneticinizle iletişime geçin."}
      </div>

      <div className="rounded-3xl border border-neutral-200 bg-white p-4 text-sm text-neutral-700 shadow-lg sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              Kalan Toplantı Hakkı
            </p>
            <p className="text-3xl font-semibold text-neutral-900">
              {remainingCredits}
            </p>
          </div>
          {!hasCredits ? (
            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
              Hak Tükenmiş
            </span>
          ) : null}
        </div>
      </div>

      {selectedSchedule ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-3 py-6 backdrop-blur-sm sm:px-6"
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedSchedule(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`schedule-dialog-${selectedSchedule.id}`}
            className="relative flex w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl sm:max-h-[90vh]"
          >
            <div className="absolute right-4 top-4 z-10">
              <button
                type="button"
                onClick={() => setSelectedSchedule(null)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-base font-semibold text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-700"
                aria-label="Modalı kapat"
              >
                ×
              </button>
            </div>
            <div className="relative flex flex-1 flex-col gap-4 p-6 pt-16 sm:p-8">
              <h3
                id={`schedule-dialog-${selectedSchedule.id}`}
                className="text-xl font-semibold text-neutral-900"
              >
                {selectedSchedule.title}
              </h3>
              <div className="flex-1 overflow-hidden rounded-2xl border border-neutral-200">
                <CalendlyWidget className="h-[70vh] min-h-[420px] w-full !border-none !shadow-none" />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
