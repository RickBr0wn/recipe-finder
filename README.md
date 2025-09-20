
# Recipe Finder

A modern, visually appealing recipe search app built with Next.js 15+ and Tailwind CSS. Instantly search for recipes, view beautiful details, and explore new dishes—all powered by the Spoonacular API.

---

## ✨ Features

- **Live Recipe Search:** Type any ingredient or dish and get instant results.
- **Recipe Details:** Click a recipe to view a detailed page with ingredients and instructions.
- **API Integration:** All data is fetched live from the Spoonacular API via secure Next.js API routes.
- **Modern UI:** Clean, responsive layouts and subtle animations using Tailwind CSS.

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/recipe-finder.git
cd recipe-finder
```

### 2. Install Dependencies

```bash
pnpm install
# or
npm install
# or
yarn install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory and add your Spoonacular API key:

```
SPOONACULAR_KEY=your_spoonacular_api_key_here
```

You can get a free API key from [spoonacular.com/food-api](https://spoonacular.com/food-api).

### 4. Run the Development Server

```bash
pnpm dev
# or
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

---

## 🗂️ Project Structure

```
app/
	api/
		recipe/[id]/route.ts      # API route for recipe details
		search/route.ts           # API route for recipe search
	recipe/[id]/page.tsx        # Dynamic recipe details page
	page.tsx                    # Home/search page
	layout.tsx                  # App layout
	globals.css                 # Global styles (Tailwind)
```

---

## 🛠️ Tech Stack

- [Next.js 15.5](https://nextjs.org/)
- [React 19](https://react.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Spoonacular API](https://spoonacular.com/food-api)

---

## 📦 Deployment

This app is ready to deploy on [Vercel](https://vercel.com/) or any Node.js hosting platform. Make sure to set your `SPOONACULAR_KEY` environment variable in your deployment settings.

---

## 🙋‍♂️ Author

Built by Richard Brown as a portfolio starter project. Feel free to fork, adapt, or reach out for collaboration!

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
