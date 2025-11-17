import prisma from "../prisma.ts";


// Redact PAN-like sequences (13–19 digits), mask emails
export function redactPayload(payload: any): any {
  const str = JSON.stringify(payload);
  // Redact PAN-like numbers
  const redacted = str
    .replace(/\b\d{13,19}\b/g, '****REDACTED****')
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, '****REDACTED****');
  return JSON.parse(redacted);
}

// Log audit event to case_events table
export async function logAudit({
  caseId,
  actor,
  action,
  payload
}: {
  caseId: string;
  actor: string;
  action: string;
  payload: any;
}) {
  await prisma.caseEvent.create({
    data: {
      caseId,
      ts: new Date(),
      actor,
      action,
      payload_json: redactPayload(payload)
    }
  });
}
