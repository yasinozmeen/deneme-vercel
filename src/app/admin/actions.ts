"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { isAdminUser } from "@/lib/auth";

export type AnnouncementFormState = {
  error: string | null;
  success: boolean;
};

export async function createAnnouncementAction(
  prevState: AnnouncementFormState,
  formData: FormData,
): Promise<AnnouncementFormState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session || !isAdminUser(session.user)) {
    return {
      error: "Bu işlemi gerçekleştirmek için yetkiniz yok.",
      success: false,
    };
  }

  const title = formData.get("title");
  const message = formData.get("message");
  const enabledRaw = formData.get("enabled");

  if (typeof message !== "string" || message.trim().length < 5) {
    return {
      error: "Mesaj en az 5 karakter olmalıdır.",
      success: false,
    };
  }

  const service = createSupabaseServiceClient();
  const generatedVersion = randomUUID();
  const { error } = await service.from("announcements").insert({
    title: typeof title === "string" && title.trim().length > 0 ? title.trim() : null,
    message: message.trim(),
    version: generatedVersion,
    enabled: enabledRaw === "on",
  });

  if (error) {
    console.error("ANNOUNCEMENT_CREATE_ERROR", error);
    return {
      error: "Duyuru kaydedilirken bir hata oluştu.",
      success: false,
    };
  }

  revalidatePath("/admin");
  revalidatePath("/dashboard");

  return {
    error: null,
    success: true,
  };
}

export async function toggleAnnouncementAction(
  formData: FormData,
): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session || !isAdminUser(session.user)) {
    throw new Error("Bu işlemi gerçekleştirmek için yetkiniz yok.");
  }

  const id = formData.get("id");
  const enabledValue = formData.get("enabled");

  if (typeof id !== "string" || id.length === 0) {
    throw new Error("Geçersiz duyuru kimliği.");
  }

  const nextEnabled = enabledValue === "true";

  const service = createSupabaseServiceClient();
  const { error } = await service
    .from("announcements")
    .update({ enabled: nextEnabled })
    .eq("id", id);

  if (error) {
    console.error("ANNOUNCEMENT_TOGGLE_ERROR", error);
    throw new Error("Duyuru güncellenirken bir hata oluştu.");
  }

  revalidatePath("/admin");
  revalidatePath("/dashboard");
}
