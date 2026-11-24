import { ClerkProvider } from "@clerk/nextjs";
import { shadesOfPurple } from "@clerk/themes";
import { MapConfigProvider } from "@/context/MapConfigContext";
import "./globals.css";

const geistSans = { variable: "font-sans" };
const geistMono = { variable: "font-mono" };

export const metadata = {
  title: "Helix Maps",
  description: "Frictionless, infinite workspace to visually architect ideas, systems, and workflows.",
  icons: {
    icon: "/helix-logo.svg",
    shortcut: "/helix-logo.svg",
    apple: "/helix-logo.svg",
  },
  verification: {
    google: "gEv3j3rsGDcSrdrVga-miMdr1ShWliGxOKsq7f81SP4",
  },
};

import { ToastProvider } from "@/context/ToastContext";

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider appearance={{
          baseTheme: shadesOfPurple,
          variables: {
            colorPrimary: "#ffffff",
            colorBackground: "#09090b",
            colorText: "#f4f4f5",
            colorForeground: "#f4f4f5",
            colorNeutral: "#f4f4f5",
            colorTextSecondary: "#a1a1aa",
            colorInputBackground: "#18181b",
            colorInputText: "#f4f4f5",
            colorInputForeground: "#f4f4f5",
            colorBorder: "#27272a",
            colorTextOnPrimaryBackground: "#09090b",
          }
        }}>
          <MapConfigProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </MapConfigProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}