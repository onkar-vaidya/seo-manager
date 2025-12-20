import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600'],
    variable: '--font-inter',
})

export const metadata: Metadata = {
    title: 'SEO Manager X SooperBlooper',
    description: 'Manage and optimize YouTube video SEO',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className={inter.variable}>
            <body className="min-h-screen">
                {children}
            </body>
        </html>
    )
}
