import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { SimulationProvider } from "@/components/SimulationProvider";
import AppWrapper from "@/components/AppWrapper";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

const outfit = Outfit({
    subsets: ["latin"],
    variable: "--font-outfit",
});

export const metadata: Metadata = {
    title: "Delta360 - Certificadora ICP",
    description: "Plataforma de Gestão de Certificados Digitais",
};

import { ThemeProvider } from "@/components/ThemeProvider";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-br" suppressHydrationWarning>
            <body className={`${inter.variable} ${outfit.variable} antialiased`}>
                <SimulationProvider>
                    <ThemeProvider>
                        <AppWrapper>
                            {children}
                        </AppWrapper>
                    </ThemeProvider>
                </SimulationProvider>
            </body>
        </html>
    );
}
