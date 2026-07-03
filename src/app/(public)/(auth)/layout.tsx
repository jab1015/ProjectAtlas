/**
 * Auth layout — pass-through with no store header/footer.
 * Sign-in and sign-up pages manage their own full-screen layout.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
