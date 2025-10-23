import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { adjustUserMeetingCredits } from "@/lib/meeting-credits";

type CalendlyWebhookPayload = {
  event: string;
  payload: {
    uri?: string;
    email?: string;
    rescheduled?: boolean;
    old_invitee?: { uri?: string } | null;
    scheduled_event?: {
      uri?: string;
      name?: string;
    } | null;
    cancel_url?: string | null;
    created_at?: string;
    updated_at?: string;
    status?: string;
    [key: string]: unknown;
  } | null;
};

const SIGNATURE_HEADER = "calendly-webhook-signature";
const DEFAULT_SIGNATURE_TOLERANCE = 300; // 5 minutes

function isCalendlyWebhookPayload(value: unknown): value is CalendlyWebhookPayload {
  return (
    typeof value === "object" &&
    value !== null &&
    "event" in value &&
    typeof (value as { event?: unknown }).event === "string"
  );
}

function parseSignatureHeader(header: string | null) {
  if (!header) {
    return null;
  }

  const parts = header.split(",");
  const timestampPart = parts.find((part) => part.trim().startsWith("t="));
  const signaturePart = parts.find((part) => part.trim().startsWith("v1="));

  if (!timestampPart || !signaturePart) {
    return null;
  }

  const timestamp = Number.parseInt(timestampPart.split("=")[1] ?? "", 10);
  const signature = signaturePart.split("=")[1]?.trim();

  if (!Number.isFinite(timestamp) || !signature) {
    return null;
  }

  return { timestamp, signature } as const;
}

function verifySignature(
  signingKey: string,
  rawBody: string,
  header: string | null,
  tolerance = DEFAULT_SIGNATURE_TOLERANCE,
) {
  const parsed = parseSignatureHeader(header);

  if (!parsed) {
    throw new Error("Webhook imzası doğrulanamadı (eksik başlık).");
  }

  const { timestamp, signature } = parsed;
  const current = Math.floor(Date.now() / 1000);

  if (Math.abs(current - timestamp) > tolerance) {
    throw new Error("Webhook imzası süresi aşıldı.");
  }

  const payloadToSign = `${timestamp}.${rawBody}`;
  const digest = createHmac("sha256", signingKey).update(payloadToSign).digest("hex");

  const provided = Buffer.from(signature, "utf8");
  const expected = Buffer.from(digest, "utf8");

  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    throw new Error("Webhook imzası eşleşmiyor.");
  }
}

async function findUserIdByEmail(
  service = createSupabaseServiceClient(),
  email: string,
): Promise<string | null> {
  const normalized = email.trim().toLowerCase();

  const { data, error } = await service.auth.admin.listUsers({
    perPage: 100,
    email: normalized,
  });

  if (error) {
    console.error("CALENDLY_USER_LOOKUP_ERROR", error);
    return null;
  }

  const user = data?.users?.find((candidate) => candidate.email?.toLowerCase() === normalized);
  return user?.id ?? null;
}

async function upsertInviteeRecord(
  service = createSupabaseServiceClient(),
  options: {
    inviteeUri: string;
    userId: string;
    email: string;
    scheduledEventUri: string | null;
    payload: Record<string, unknown>;
  },
) {
  const { inviteeUri, userId, email, scheduledEventUri, payload } = options;

  const { data, error } = await service
    .from("calendly_invitees")
    .select("status")
    .eq("invitee_uri", inviteeUri)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  return { existingStatus: data?.status ?? null, userId, email, scheduledEventUri, payload } as const;
}

async function handleInviteeCreated(
  service = createSupabaseServiceClient(),
  inviteeUri: string,
  userId: string,
  email: string,
  scheduledEventUri: string | null,
  payload: Record<string, unknown>,
) {
  const lookup = await upsertInviteeRecord(service, {
    inviteeUri,
    userId,
    email,
    scheduledEventUri,
    payload,
  });

  if (lookup.existingStatus === "active") {
    return;
  }

  let shouldAdjust = false;

  if (lookup.existingStatus === "canceled") {
    const { error: updateError } = await service
      .from("calendly_invitees")
      .update({
        status: "active",
        scheduled_event_uri: scheduledEventUri,
        raw_payload: payload,
        updated_at: new Date().toISOString(),
      })
      .eq("invitee_uri", inviteeUri);

    if (updateError) {
      throw updateError;
    }

    shouldAdjust = true;
  } else {
    const { error: insertError } = await service.from("calendly_invitees").insert({
      invitee_uri: inviteeUri,
      user_id: userId,
      invitee_email: email,
      scheduled_event_uri: scheduledEventUri,
      status: "active",
      raw_payload: payload,
    });

    if (insertError) {
      if (insertError.code === "23505") {
        return;
      }
      throw insertError;
    }

    shouldAdjust = true;
  }

  if (shouldAdjust) {
    await adjustUserMeetingCredits(service, userId, -1);
  }
}

async function handleInviteeCanceled(
  service = createSupabaseServiceClient(),
  inviteeUri: string,
  userId: string,
  payload: Record<string, unknown>,
) {
  const { data, error } = await service
    .from("calendly_invitees")
    .select("status")
    .eq("invitee_uri", inviteeUri)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  if (!data) {
    return;
  }

  if (data.status === "canceled") {
    return;
  }

  const { error: updateError } = await service
    .from("calendly_invitees")
    .update({
      status: "canceled",
      raw_payload: payload,
      updated_at: new Date().toISOString(),
    })
    .eq("invitee_uri", inviteeUri);

  if (updateError) {
    throw updateError;
  }

  await adjustUserMeetingCredits(service, userId, 1);
}

export async function POST(request: Request) {
  const rawBody = await request.text();

  const signingKey = process.env.CALENDLY_WEBHOOK_SIGNING_KEY;

  try {
    if (signingKey) {
      const signatureHeader = request.headers.get(SIGNATURE_HEADER);
      verifySignature(signingKey, rawBody, signatureHeader);
    }
  } catch (error) {
    console.error("CALENDLY_SIGNATURE_ERROR", error);
    return NextResponse.json({ message: "Imza doğrulanamadı" }, { status: 401 });
  }

  let payload: unknown;

  try {
    payload = JSON.parse(rawBody);
  } catch (error) {
    console.error("CALENDLY_PARSE_ERROR", error);
    return NextResponse.json({ message: "Geçersiz JSON" }, { status: 400 });
  }

  if (!isCalendlyWebhookPayload(payload)) {
    return NextResponse.json({ message: "Bilinmeyen webhook" }, { status: 400 });
  }

  const { event, payload: inviteePayload } = payload;

  if (!inviteePayload) {
    return NextResponse.json({ message: "Eksik payload" }, { status: 200 });
  }

  if (!event.startsWith("invitee.")) {
    return NextResponse.json({ message: "Desteklenmeyen etkinlik" }, { status: 200 });
  }

  const inviteeUri = inviteePayload.uri;
  const email = inviteePayload.email;

  if (!inviteeUri || !email) {
    return NextResponse.json({ message: "Eksik kullanıcı bilgisi" }, { status: 200 });
  }

  const scheduledEventUri =
    (inviteePayload.scheduled_event &&
      typeof inviteePayload.scheduled_event === "object" &&
      inviteePayload.scheduled_event !== null &&
      "uri" in inviteePayload.scheduled_event
      ? (inviteePayload.scheduled_event.uri as string | undefined)
      : undefined) ?? null;

  const service = createSupabaseServiceClient();
  const userId = await findUserIdByEmail(service, email);

  if (!userId) {
    console.warn("CALENDLY_USER_NOT_FOUND", { email });
    return NextResponse.json({ message: "Kullanıcı bulunamadı" }, { status: 200 });
  }

  try {
    if (event === "invitee.created") {
      await handleInviteeCreated(
        service,
        inviteeUri,
        userId,
        email.toLowerCase(),
        scheduledEventUri,
        inviteePayload as Record<string, unknown>,
      );
    } else if (event === "invitee.canceled") {
      await handleInviteeCanceled(
        service,
        inviteeUri,
        userId,
        inviteePayload as Record<string, unknown>,
      );
    }
  } catch (error) {
    console.error("CALENDLY_PROCESS_ERROR", error);
    return NextResponse.json({ message: "İşleme hatası" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function GET() {
  return NextResponse.json({ status: "ok" });
}
