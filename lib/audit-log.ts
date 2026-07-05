import "server-only"

import { prisma } from "@/lib/prisma"

type AuditEntry = {
  actor: string
  action: string
  shopId?: string
  details?: string
}

export async function recordAudit(entry: AuditEntry) {
  await prisma.auditLog.create({
    data: {
      actor: entry.actor,
      action: entry.action,
      shopId: entry.shopId ?? null,
      details: entry.details ?? null,
    },
  })
}
