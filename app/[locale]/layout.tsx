import { GoogleAnalytics } from "@next/third-parties/google"

type LocaleLayoutProps = {
  children: React.ReactNode
}

export default function LocaleLayout({ children }: LocaleLayoutProps) {
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

  return (
    <>
      {children}
      {gaMeasurementId ? <GoogleAnalytics gaId={gaMeasurementId} /> : null}
    </>
  )
}
