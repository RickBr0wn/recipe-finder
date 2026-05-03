import Header from '@/components/nav/header'
import BottomNav from '@/components/nav/bottom-nav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-16 sm:pb-0">{children}</main>
      <BottomNav />
    </div>
  )
}
