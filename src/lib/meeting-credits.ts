import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";

export const DEFAULT_MEETING_CREDIT = 100;

export type MeetingCreditRow = {
  user_id: string;
  remaining: number;
  updated_at: string;
};

type GenericClient = SupabaseClient<unknown, string, unknown>;

function handleSelectError(error: PostgrestError | null) {
  if (error && error.code !== "PGRST116") {
    throw error;
  }
}

export async function getUserMeetingCredits(
  client: GenericClient,
  userId: string,
): Promise<number> {
  const { data, error } = await client
    .from("meeting_credits")
    .select("remaining")
    .eq("user_id", userId)
    .maybeSingle();

  handleSelectError(error);

  if (data?.remaining != null) {
    return data.remaining;
  }

  return DEFAULT_MEETING_CREDIT;
}

export async function setUserMeetingCredits(
  client: GenericClient,
  userId: string,
  remaining: number,
): Promise<number> {
  const value = Math.max(remaining, 0);

  const { data, error } = await client
    .from("meeting_credits")
    .upsert({
      user_id: userId,
      remaining: value,
      updated_at: new Date().toISOString(),
    })
    .select("remaining")
    .single();

  if (error) {
    throw error;
  }

  return data.remaining;
}

export async function adjustUserMeetingCredits(
  client: GenericClient,
  userId: string,
  delta: number,
): Promise<number> {
  const { data, error } = await client
    .from("meeting_credits")
    .select("remaining")
    .eq("user_id", userId)
    .maybeSingle();

  handleSelectError(error);

  const current = data?.remaining ?? DEFAULT_MEETING_CREDIT;
  const next = Math.max(current + delta, 0);

  const mutation = data
    ? client
        .from("meeting_credits")
        .update({
          remaining: next,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .select("remaining")
        .single()
    : client
        .from("meeting_credits")
        .insert({
          user_id: userId,
          remaining: next,
          updated_at: new Date().toISOString(),
        })
        .select("remaining")
        .single();

  const { data: updated, error: mutationError } = await mutation;

  if (mutationError) {
    throw mutationError;
  }

  return updated.remaining;
}

export async function listMeetingCredits(
  client: GenericClient,
): Promise<MeetingCreditRow[]> {
  const { data, error } = await client
    .from("meeting_credits")
    .select("user_id, remaining, updated_at");

  if (error) {
    throw error;
  }

  return data ?? [];
}
