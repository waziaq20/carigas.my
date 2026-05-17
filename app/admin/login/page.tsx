import Link from "next/link"
import { redirect } from "next/navigation"

import { loginAdmin } from "@/app/admin/actions"
import { GasIcon } from "@/components/icons/app-icons"
import { Button } from "@/components/ui/button"
import {
  adminHomePath,
  getAdminConfigIssue,
  getAdminSession,
} from "@/lib/admin-auth"

type LoginPageProps = {
  searchParams: Promise<{
    error?: string
  }>
}

const errorMessages: Record<string, string> = {
  invalid: "Username or password is incorrect.",
  "not-configured": "Admin login is not configured on this deployment.",
  "rate-limited": "Too many failed attempts. Try again later.",
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getAdminSession()

  if (session) {
    redirect(adminHomePath)
  }

  const { error } = await searchParams
  const configIssue = getAdminConfigIssue()
  const errorMessage = error ? errorMessages[error] : null

  return (
    <main className="grid min-h-svh place-items-center bg-background px-4 py-10 text-foreground">
      <div className="w-full max-w-md border border-border bg-card p-5 text-card-foreground shadow-sm sm:p-6">
        <Link href="/" className="inline-flex items-center gap-3">
          <span className="grid size-10 place-items-center bg-primary text-primary-foreground">
            <GasIcon className="size-5" />
          </span>
          <span>
            <span className="block text-lg font-black tracking-tighter">
              carigas.my
            </span>
            <span className="text-[0.65rem] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
              Admin control
            </span>
          </span>
        </Link>

        <div className="mt-8">
          <h1 className="text-2xl font-black tracking-[-0.05em]">
            Sign in to manage shops
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Access is controlled by server environment variables and protected
            with a signed admin session cookie.
          </p>
        </div>

        {configIssue ? (
          <div className="mt-5 border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {configIssue}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="mt-5 border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {errorMessage}
          </div>
        ) : null}

        <form action={loginAdmin} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-2 text-sm font-semibold">
            Username
            <input
              className="h-10 border border-border bg-background px-3 text-sm font-normal outline-none focus:border-ring focus:ring-1 focus:ring-ring/50"
              name="username"
              autoComplete="username"
              disabled={Boolean(configIssue)}
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold">
            Password
            <input
              className="h-10 border border-border bg-background px-3 text-sm font-normal outline-none focus:border-ring focus:ring-1 focus:ring-ring/50"
              name="password"
              type="password"
              autoComplete="current-password"
              disabled={Boolean(configIssue)}
              required
            />
          </label>
          <Button className="mt-2 h-10" disabled={Boolean(configIssue)}>
            Sign in
          </Button>
        </form>
      </div>
    </main>
  )
}
