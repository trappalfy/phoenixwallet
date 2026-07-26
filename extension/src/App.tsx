import { WalletProvider, useWallet } from './state/WalletProvider'
import { hasHeader, isFullBleed } from './router/routes'
import Router from './router/Router'
import Header from './components/shell/Header'
import TabBar from './components/shell/TabBar'
import GrainOverlay from './components/brand/GrainOverlay'
import Toast from './components/primitives/Toast'

/**
 * The fixed 360 × 600 frame (§8): header / route outlet / tab bar. Onboarding,
 * unlock and the value-moving flows render full-bleed without the tab bar. The
 * shell never scrolls — the outlet is the only region that can (§2.5).
 */
function Shell() {
  const { route, state } = useWallet()

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-ink">
      {hasHeader(route) && <Header />}
      <main className="relative min-h-0 flex-1">
        <Router />
      </main>
      {!isFullBleed(route) && <TabBar />}
      <Toast state={state.toast} />
      <GrainOverlay />
    </div>
  )
}

export default function App() {
  return (
    <WalletProvider>
      <Shell />
    </WalletProvider>
  )
}
