type View = 'train' | 'plan' | 'insights' | 'overview'

interface MobileNavProps {
  view: View
  onChange: (view: View) => void
}

export function MobileNav({ view, onChange }: MobileNavProps) {
  return (
    <nav
      className="mobile-nav safe-bottom safe-x fixed inset-x-0 bottom-0 z-30 border-t border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-lg md:hidden"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-4xl gap-1.5 p-2">
        {(['train', 'plan', 'insights', 'overview'] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={`touch-target flex flex-1 items-center justify-center rounded-xl px-1 py-3 text-xs font-semibold capitalize transition active:scale-[0.98] ${
              view === v
                ? 'bg-[var(--color-gold)] text-[#0c0c0e]'
                : 'bg-[var(--color-surface-raised)] text-[var(--color-muted)]'
            }`}
          >
            {v}
          </button>
        ))}
      </div>
    </nav>
  )
}
