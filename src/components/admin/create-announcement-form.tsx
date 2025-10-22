"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import {
  createAnnouncementAction,
  type AnnouncementFormState,
} from "@/app/admin/actions";

const initialState: AnnouncementFormState = {
  error: null,
  success: false,
};

export function CreateAnnouncementForm() {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [state, formAction] = useActionState(createAnnouncementAction, initialState);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex w-full flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-lg"
    >
      <div>
        <h2 className="text-xl font-semibold text-neutral-900">
          Yeni Duyuru Oluştur
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          Başlık ve içerik girerek kullanıcılara gösterilecek popup duyurusunu
          ekleyin.
        </p>
      </div>

      <label className="flex flex-col gap-2 text-sm font-medium text-neutral-700">
        Başlık
        <input
          type="text"
          name="title"
          placeholder="Örn. Bakım Çalışması"
          className="rounded-xl border border-neutral-300 px-4 py-2 text-base text-neutral-900 focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-200"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm font-medium text-neutral-700">
        Mesaj
        <textarea
          name="message"
          required
          minLength={5}
          rows={4}
          placeholder="Duyuru metnini buraya yazın"
          className="rounded-xl border border-neutral-300 px-4 py-2 text-base text-neutral-900 focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-200"
        />
      </label>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
          <input
            type="checkbox"
            name="enabled"
            defaultChecked
            className="h-4 w-4 rounded border border-neutral-300 text-neutral-900 focus:ring-neutral-500"
          />
          Duyuru aktif olsun
        </label>
        <p className="text-xs text-neutral-400">
          Versiyon bilgisi otomatik oluşturulur.
        </p>
      </div>

      {state.error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.error}
        </p>
      ) : null}

      {state.success ? (
        <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-600">
          Duyuru kaydedildi.
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 inline-flex items-center justify-center rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Kaydediliyor…" : "Duyuruyu Kaydet"}
    </button>
  );
}
