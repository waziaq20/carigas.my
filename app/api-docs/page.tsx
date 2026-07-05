import type { Metadata } from "next"

import { GasIcon } from "@/components/icons/app-icons"

export const metadata: Metadata = {
  title: "API Documentation | carigas.my",
  description:
    "Public API reference for carigas.my shop listing and submission endpoints.",
  robots: { index: false, follow: true },
}

type Endpoint = {
  method: "GET" | "POST" | "PATCH" | "DELETE"
  path: string
  description: string
  auth?: string
  rateLimit?: string
  request?: string
  response?: string
}

const endpoints: Endpoint[] = [
  {
    method: "GET",
    path: "/api/shops",
    description:
      "Fetch all approved shops, optionally sorted by distance from a location.",
    request: "?lat=3.0738&lng=101.5183&locale=en",
    response: `{ "shops": [{ "id": "...", "name": "...", "price": "RM 26.60", ... }] }`,
  },
  {
    method: "GET",
    path: "/api/shops/:id",
    description: "Fetch a single approved shop by ID.",
    response: `{ "shop": { "id": "...", "name": "...", ... } }`,
  },
  {
    method: "GET",
    path: "/api/shops/:id/price-history",
    description: "Fetch price change history for a shop.",
    response: `{ "history": [{ "price": 2660, "createdAt": "2026-01-01T..." }] }`,
  },
  {
    method: "POST",
    path: "/api/shops/submit",
    description:
      "Submit a new shop for review. Submissions are created with approved=false and do not appear publicly until an admin approves them.",
    auth: "Optional: x-api-key header for agent mode (100/hour). Without key: browser mode (1/hour per IP).",
    rateLimit: "1/hour (browser) or 100/hour (agent with API key)",
    request: `{
  "name": "Kedai Gas Example",
  "address": "123 Jalan Example, Selangor",
  "lat": 3.0738,
  "lng": 101.5183,
  "phone": "+60123456789",
  "price": 2660,
  "exchange": true,
  "sellNew": false
}`,
    response: `{ "shop": { "id": "...", "name": "...", "approved": false } }`,
  },
  {
    method: "GET",
    path: "/api/shops/submit",
    description: "Check for duplicate shops before submitting.",
    auth: "Required: x-api-key header",
    request: "?name=Kedai%20Gas&lat=3.0738&lng=101.5183",
    response: `{ "exists": false, "matches": [] }`,
  },
]

const methodColors: Record<string, string> = {
  GET: "bg-green-500/10 text-green-700 border-green-500/30",
  POST: "bg-blue-500/10 text-blue-700 border-blue-500/30",
  PATCH: "bg-amber-500/10 text-amber-700 border-amber-500/30",
  DELETE: "bg-red-500/10 text-red-700 border-red-500/30",
}

export default function ApiDocsPage() {
  return (
    <main className="min-h-svh bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <div className="flex items-center gap-3 border-b border-border pb-5">
          <span className="grid size-11 place-items-center bg-primary text-primary-foreground">
            <GasIcon className="size-5" />
          </span>
          <div>
            <h1 className="text-2xl font-black tracking-[-0.05em]">
              API Documentation
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Public API endpoints for carigas.my shop data and submissions.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {endpoints.map((endpoint) => (
            <section
              key={`${endpoint.method} ${endpoint.path}`}
              className="border border-border bg-card p-4 text-card-foreground shadow-sm sm:p-6"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex border px-2.5 py-1 text-xs font-black ${methodColors[endpoint.method]}`}
                >
                  {endpoint.method}
                </span>
                <code className="text-sm font-bold text-foreground">
                  {endpoint.path}
                </code>
              </div>

              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {endpoint.description}
              </p>

              {endpoint.auth ? (
                <div className="mt-3">
                  <p className="text-[0.65rem] font-bold tracking-[0.16em] text-muted-foreground uppercase">
                    Authentication
                  </p>
                  <p className="mt-1 text-xs text-foreground">
                    {endpoint.auth}
                  </p>
                </div>
              ) : null}

              {endpoint.rateLimit ? (
                <div className="mt-3">
                  <p className="text-[0.65rem] font-bold tracking-[0.16em] text-muted-foreground uppercase">
                    Rate Limit
                  </p>
                  <p className="mt-1 text-xs text-foreground">
                    {endpoint.rateLimit}
                  </p>
                </div>
              ) : null}

              {endpoint.request ? (
                <div className="mt-3">
                  <p className="text-[0.65rem] font-bold tracking-[0.16em] text-muted-foreground uppercase">
                    Request
                  </p>
                  <pre className="mt-1 overflow-x-auto border border-border bg-background p-3 text-xs">
                    <code>{endpoint.request}</code>
                  </pre>
                </div>
              ) : null}

              {endpoint.response ? (
                <div className="mt-3">
                  <p className="text-[0.65rem] font-bold tracking-[0.16em] text-muted-foreground uppercase">
                    Response
                  </p>
                  <pre className="mt-1 overflow-x-auto border border-border bg-background p-3 text-xs">
                    <code>{endpoint.response}</code>
                  </pre>
                </div>
              ) : null}
            </section>
          ))}
        </div>

        <section className="border border-border bg-card p-4 text-card-foreground shadow-sm sm:p-6">
          <h2 className="text-lg font-black tracking-[-0.04em]">
            Error Responses
          </h2>
          <div className="mt-3 flex flex-col gap-2">
            <div className="flex gap-3 text-xs">
              <span className="font-bold text-red-600">400</span>
              <span className="text-muted-foreground">
                Invalid request body or missing required fields
              </span>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="font-bold text-red-600">401</span>
              <span className="text-muted-foreground">
                Missing or invalid API key (agent endpoints only)
              </span>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="font-bold text-red-600">404</span>
              <span className="text-muted-foreground">Shop not found</span>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="font-bold text-red-600">409</span>
              <span className="text-muted-foreground">
                A shop with this name already exists within 500m
              </span>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="font-bold text-red-600">429</span>
              <span className="text-muted-foreground">Rate limit exceeded</span>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="font-bold text-red-600">500</span>
              <span className="text-muted-foreground">
                Internal server error
              </span>
            </div>
          </div>
        </section>

        <section className="border border-border bg-card p-4 text-card-foreground shadow-sm sm:p-6">
          <h2 className="text-lg font-black tracking-[-0.04em]">
            Field Reference
          </h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-muted/50 tracking-[0.16em] text-muted-foreground uppercase">
                <tr>
                  <th className="px-3 py-2 font-bold">Field</th>
                  <th className="px-3 py-2 font-bold">Type</th>
                  <th className="px-3 py-2 font-bold">Required</th>
                  <th className="px-3 py-2 font-bold">Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-bold">name</td>
                  <td className="px-3 py-2 text-muted-foreground">string</td>
                  <td className="px-3 py-2 text-muted-foreground">Yes</td>
                  <td className="px-3 py-2 text-muted-foreground">Shop name</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-bold">address</td>
                  <td className="px-3 py-2 text-muted-foreground">string</td>
                  <td className="px-3 py-2 text-muted-foreground">Yes</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Full address
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-bold">lat</td>
                  <td className="px-3 py-2 text-muted-foreground">number</td>
                  <td className="px-3 py-2 text-muted-foreground">Yes</td>
                  <td className="px-3 py-2 text-muted-foreground">Latitude</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-bold">lng</td>
                  <td className="px-3 py-2 text-muted-foreground">number</td>
                  <td className="px-3 py-2 text-muted-foreground">Yes</td>
                  <td className="px-3 py-2 text-muted-foreground">Longitude</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-bold">price</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    integer (sen)
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">No</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    14kg price in sen (RM 26.60 = 2660)
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-bold">phone</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    string | null
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">No</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    E.164 format (+60XXXXXXXXX)
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-bold">exchange</td>
                  <td className="px-3 py-2 text-muted-foreground">boolean</td>
                  <td className="px-3 py-2 text-muted-foreground">No</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Gas exchange available (default: true)
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-bold">sellNew</td>
                  <td className="px-3 py-2 text-muted-foreground">boolean</td>
                  <td className="px-3 py-2 text-muted-foreground">No</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    New cylinders sold (default: false)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}
