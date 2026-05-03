import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { ShoppingListClient } from '@/components/shopping-list/shopping-list-client'

export default async function ShoppingListPage() {
  const session = await auth()
  if (!session) redirect('/sign-in')

  const items = await prisma.shoppingItem.findMany({
    where: { userId: session.user.id },
    orderBy: [{ recipeName: 'asc' }, { createdAt: 'asc' }],
  })

  return <ShoppingListClient initialItems={items} />
}
