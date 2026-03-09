## Template React App – Scalable Setup

This project is a React + Vite template designed to scale into a **large production app** with:

- **Redux Toolkit** for global state
- **React Query** for server state & caching
- **Feature-based structure** under `features/`
- **GSAP** for high‑performance animations

---

## Tech stack

- **Build / Tooling**
  - **Vite** with `@vitejs/plugin-react`
  - **ESLint** with React, hooks, and react-refresh plugins
- **Runtime**
  - **React 18**, **React DOM**
  - **React Router DOM** for routing
- **State & data**
  - **Redux Toolkit** + **React Redux** – app-wide state
  - **@tanstack/react-query** – server state (API calls, caching)
- **Styling / UI**
  - **Sass (SCSS)** for global and modular styles
  - **Bootstrap** as a utility/layout framework
- **Animations**
  - **GSAP** with a centralized helper in `shared/lib/gsap`

---

## Project structure

- `src/main.jsx`
  - Mounts `App` inside `React.StrictMode`.
- `src/App.jsx`
  - Wraps the app with `AppProviders`.
  - Sets up `BrowserRouter` and lazy‑loaded routes.
- `src/index.scss`
  - Global reset, typography, and responsive root font-size.

### App shell and providers

- `src/app/providers.jsx`
  - Combines global providers:
    - `ReduxProvider` using `store` from `shared/lib/store`.
    - `QueryClientProvider` using `queryClient` from `shared/lib/react-query`.

### Shared libraries

- `src/shared/lib/store.js`
  - `configureStore` for Redux Toolkit.
  - Add feature reducers here, for example:
    - `auth: authReducer`
    - `ui: uiReducer`
- `src/shared/lib/react-query.js`
  - Exports a preconfigured `queryClient` with sensible defaults:
    - `staleTime` (how long data is considered fresh)
    - `refetchOnWindowFocus`
    - `retry` count
- `src/shared/lib/gsap.js`
  - Central GSAP export so plugins can be registered in one place later (e.g. ScrollTrigger).

### Features

Feature modules live under `src/features` and group UI + logic by domain.

- `src/features/home/HomePage.jsx`
  - Example page with an entrance animation using GSAP.
- `src/features/auth/LoginPage.jsx`
  - Placeholder for authentication UI.
- `src/features/misc/Page404.jsx`
  - Fallback route for unknown URLs.

---

## Routing

Routing is configured in `App.jsx` using **React Router DOM**:

- `/` → `HomePage`
- `/login` → `LoginPage`
- `*` → `Page404`

Pages are **lazy‑loaded** using `React.lazy` + `Suspense` to improve initial bundle size.

---

## State management guidelines

- **Use Redux Toolkit** for:
  - Auth and session (current user, tokens, roles).
  - Global UI (theme, layout, global modals).
  - Configuration and feature flags.
- **Use React Query** for:
  - All network requests / API data.
  - Server-side lists, detail views, pagination, infinite scroll.

### Adding a new slice (high level)

1. Create a slice, e.g. `src/features/auth/authSlice.js`:
   - Define initial state, reducers, and async thunks if needed.
2. Register the slice in `src/shared/lib/store.js` under `reducer`.
3. Use `useSelector` / `useDispatch` in your feature components.

---

## Data fetching pattern with React Query

- Define hooks per feature, e.g.:
  - `useUser()` for current user.
  - `useUsersList()` for paginated lists.
- Centralize your Axios instance (e.g. `shared/lib/axios.js`) and use it inside these hooks.
- Prefer React Query for all async data instead of manual `useEffect`.

---

## Animations with GSAP (performance‑oriented)

GSAP is used via the helper `shared/lib/gsap` and integrated with React as follows:

- Use `useRef` to reference root elements.
- Use `gsap.context` inside `useEffect` for:
  - Scoped selectors.
  - Automatic cleanup on unmount (`ctx.revert()`).
- Animate **opacity / autoAlpha and transform properties** (x, y, scale, rotate) for best performance.
- Avoid animating layout properties like `width`, `height`, `top`, `left` whenever possible.

Example pattern:

```jsx
import { useEffect, useRef } from 'react';
import { gsap } from '../shared/lib/gsap';

export default function Example() {
  const rootRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.example-element',
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out' },
      );
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef}>
      <div className="example-element">Content</div>
    </section>
  );
}
```

---

## Recommended dependency usage

- **Keep**
  - `react`, `react-dom`, `react-router-dom`
  - `@reduxjs/toolkit`, `react-redux`
  - `@tanstack/react-query`
  - `axios` (via a shared instance)
  - `sass`, `bootstrap`
  - `gsap`
- **Optional to add later**
  - `react-hook-form` + `zod` (forms + validation).
  - Testing libraries (`vitest`, `@testing-library/react`, `@testing-library/jest-dom`).

---

## Scripts

- **Start dev server**
  - `npm run dev`
- **Production build**
  - `npm run build`
- **Preview production build**
  - `npm run preview`
- **Lint**
  - `npm run lint`

