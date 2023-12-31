import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
    title: 'Chit-Chat',
    description: 'A web app to chat with your loved ones',
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                {/* Add a favicon */}
                <link rel="icon" href="/images/favicon.ico" />
                {/* Add a title */}
            </head>
            <body className={inter.className}>{children}</body>
        </html>
    )
}
