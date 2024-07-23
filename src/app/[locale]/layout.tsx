import "../globals.css"
import type { Metadata } from "next"
import { ReactNode } from 'react'
import { Roboto } from "next/font/google"
import { Layout } from "@/components"
import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'

type RootProps = {
  children: ReactNode
  params: { locale: string }
}

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sckathach",
  description: "Thomas Winninger's personal website."
};

async function getMessages(locale: string) {
  try {
    return (await import(`../../messages/${locale}.json`)).default
  } catch (error) {
    notFound()
  }
}

export async function generateStaticParams() {
  return ['en', 'fr'].map((locale) => ({ locale }))
}

export default async function RootLayout({ children, params: { locale } }: RootProps) {
  const messages = await getMessages(locale)
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.1/css/all.min.css"
          integrity="sha512-MV7K8+y+gLIBoVD59lQIYicR65iaqukzvf/nwasF0nqhPay5w/9lJmVM2hMDcnK1OnMGCdVK+iQrJ7lzPJQd1w=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        <link rel="shortcut icon" href="/favicon.png" type="image/png" />
      </head>
      <body className={roboto.className}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Layout>
            {children}
          </Layout>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
