# Building a Modern Recipe Finder with Next.js and Tailwind CSS

## Introduction

For my portfolio starter project, I wanted to create something both visually appealing and practical. I decided to build a modern Recipe Finder web app using [Next.js](https://nextjs.org/) and [Tailwind CSS](https://tailwindcss.com/). This project demonstrates my skills in full-stack development, API integration, and modern UI/UX design.

---

## Why a Recipe Finder?

I love cooking and experimenting with new recipes, so a recipe search tool felt like a fun and useful project. It also provided a great opportunity to showcase:
- Dynamic routing in Next.js
- API integration (with [Spoonacular](https://spoonacular.com/food-api))
- Responsive, modern UI with Tailwind CSS
- Clean code and component structure

---

## Key Features

- **Live Recipe Search:** Type in any ingredient or dish and get instant results.
- **Recipe Details:** Click any recipe to view a beautiful, detailed page with ingredients and instructions.
- **API Integration:** All data is fetched live from the Spoonacular API.
- **Modern Design:** Clean, responsive layouts and subtle animations using Tailwind CSS.

---

## How I Built It

### 1. Project Setup
I started with a fresh Next.js app and added Tailwind CSS for styling. I also set up environment variables for the Spoonacular API key.

### 2. Search API Route
I created a custom API route (`/api/search`) that proxies requests to Spoonacular's search endpoint. This keeps my API key secure and allows for custom error handling.

```ts
// app/api/search/route.ts
export async function GET(req: NextRequest) {
  // ...parse query and fetch from Spoonacular...
}
```

### 3. Recipe Details API Route
For detailed recipe info, I added another API route (`/api/recipe/[id]`) that fetches full details for a given recipe ID.

```ts
// app/api/recipe/[id]/route.ts
export async function GET(req, { params }) {
  // ...fetch details for params.id...
}
```

### 4. Search Page UI
The homepage features a search bar and a responsive grid of recipe cards. I used Tailwind's utility classes for a modern look and smooth hover effects. Each card links to a dynamic recipe details page.

```tsx
// app/page.tsx
<input ... />
{recipes.map(recipe => (
  <Link href={`/recipe/${recipe.id}`}>...</Link>
))}
```

### 5. Dynamic Recipe Page
The `[id]` page fetches and displays all the details for a selected recipe, including a hero image, meta info, ingredients, and instructions. I paid special attention to whitespace, typography, and mobile responsiveness.

```tsx
// app/recipe/[id]/page.tsx
<main className="min-h-screen ...">
  {/* Hero, content card, back button */}
</main>
```

---

## What I Learned

- How to use Next.js API routes for secure, server-side API calls
- Dynamic routing and data fetching in Next.js 13+
- Advanced Tailwind CSS techniques for layout and effects
- Handling async data and loading states in React

---

## Next Steps

- Add user authentication and favorites
- Improve error handling and loading skeletons
- Deploy to Vercel for production

---

## Conclusion

This project was a great way to sharpen my React, Next.js, and Tailwind CSS skills. The result is a fast, modern, and visually appealing recipe search app that I'm proud to include in my portfolio.

Feel free to check out the code or try the live demo!
