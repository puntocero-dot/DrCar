// Auth guard for paint visualizer configure routes will be implemented in Phase 4
// with the token/magic-link system. For now the route is functional without a guard.
export default function ConfigureLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
