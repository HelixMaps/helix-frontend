import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp appearance={{
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
      }} />
    </div>
  );
}
