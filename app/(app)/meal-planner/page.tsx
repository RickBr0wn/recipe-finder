import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { MealPlannerClient } from '@/components/meal-planner/meal-planner-client'

function getWeekStart(date: Date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().slice(0, 10)
}

export default async function MealPlannerPage() {
  const session = await auth()
  if (!session) redirect('/sign-in')

  const weekStart = getWeekStart(new Date())

  const items = await prisma.mealPlanItem.findMany({
    where: { userId: session.user.id },
    orderBy: [{ date: 'asc' }],
  })

  return <MealPlannerClient initialItems={items} initialWeekStart={weekStart} />
}
