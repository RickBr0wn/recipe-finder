'use client'

import { useState } from 'react'
import { ShoppingCart, Trash2, Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface ShoppingItem {
  id: string
  name: string
  amount: string | null
  unit: string | null
  checked: boolean
  recipeId: number | null
  recipeName: string | null
}

interface ShoppingListClientProps {
  initialItems: ShoppingItem[]
}

export function ShoppingListClient({ initialItems }: ShoppingListClientProps) {
  const [items, setItems] = useState(initialItems)
  const [newItem, setNewItem] = useState('')
  const [adding, setAdding] = useState(false)

  const grouped = items.reduce<Record<string, ShoppingItem[]>>((acc, item) => {
    const key = item.recipeName ?? 'Other'
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})

  const uncheckedCount = items.filter((i) => !i.checked).length

  async function toggle(id: string, checked: boolean) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, checked } : i)))
    await fetch('/api/shopping-list', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, checked }),
    })
  }

  async function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id))
    await fetch(`/api/shopping-list?id=${id}`, { method: 'DELETE' })
  }

  async function clearChecked() {
    const checked = items.filter((i) => i.checked)
    if (checked.length === 0) return
    setItems((prev) => prev.filter((i) => !i.checked))
    await fetch('/api/shopping-list?clearChecked=true', { method: 'DELETE' })
    toast.success(`Removed ${checked.length} checked item${checked.length > 1 ? 's' : ''}`)
  }

  async function addCustom() {
    if (!newItem.trim()) return
    setAdding(true)
    try {
      const res = await fetch('/api/shopping-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [{ name: newItem.trim() }] }),
      })
      if (res.ok) {
        const freshRes = await fetch('/api/shopping-list')
        const freshItems = await freshRes.json()
        setItems(freshItems)
        setNewItem('')
      }
    } catch {
      toast.error('Failed to add item')
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-serif font-medium text-3xl text-foreground tracking-tight">
            Shopping list
          </h1>
          <p className="text-muted-foreground mt-1">
            {uncheckedCount} item{uncheckedCount !== 1 ? 's' : ''} remaining
          </p>
        </div>
        {items.some((i) => i.checked) && (
          <Button variant="ghost" size="sm" onClick={clearChecked} className="gap-1.5 text-muted-foreground">
            <Trash2 className="h-4 w-4" />
            Clear checked
          </Button>
        )}
      </div>

      {/* Add custom item */}
      <div className="flex gap-2 mb-8">
        <Input
          placeholder="Add an item..."
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addCustom()}
          className="flex-1"
        />
        <Button onClick={addCustom} disabled={adding || !newItem.trim()} size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-xl font-medium text-muted-foreground">Your list is empty</p>
          <p className="text-sm text-muted-foreground mt-1">
            Add ingredients from any recipe, or type above to add custom items.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([group, groupItems]) => (
            <div key={group}>
              {group !== 'Other' && (
                <p className="text-xs font-sans font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-2">
                  {group}
                </p>
              )}
              <div className="rounded-xl border divide-y bg-card">
                {groupItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={(e) => toggle(item.id, e.target.checked)}
                      className="h-4 w-4 rounded border-border cursor-pointer accent-primary"
                    />
                    <span className={cn('flex-1 text-sm', item.checked && 'line-through text-muted-foreground')}>
                      {item.amount && item.unit
                        ? `${item.amount} ${item.unit} ${item.name}`
                        : item.name}
                    </span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="Remove item"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <Separator className="mt-6" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
