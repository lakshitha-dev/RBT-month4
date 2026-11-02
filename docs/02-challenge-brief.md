# Challenge Brief — AdminFlow Dashboard

**Role:** You are building an admin dashboard for a SaaS platform
**Time:** 4 hours (in-session) + ongoing offline work
**Deliverables:** 5 artifacts

## Context

### Project Profile

```
Project:   AdminFlow Dashboard
Type:      Single Page Application
Framework: React 18 with TypeScript
State:     Zustand or Redux Toolkit
Styling:   Tailwind CSS or CSS-in-JS
```

### Feature Requirements

1. Authentication (login, logout, protected routes)
2. Dashboard with metrics and charts
3. User management (CRUD)
4. Search with debouncing
5. Notifications system

### Non-Functional Requirements

- WCAG 2.1 AA compliance
- Lighthouse Performance 90+
- Responsive design (mobile-first)
- Loading and error states
- Dark mode support (bonus)

## Challenge Tasks

### Part 1: Application Setup (20 min)

**Project Structure**

```
src/
├── components/
│   ├── common/       # Reusable components
│   ├── layout/       # Layout components
│   └── features/     # Feature-specific
├── hooks/            # Custom hooks
├── stores/           # State management
├── pages/            # Route pages
├── utils/            # Utilities
├── types/            # TypeScript types
└── App.tsx
```

**Setup Checklist**
- [ ] Vite + React + TypeScript
- [ ] Zustand or Redux Toolkit
- [ ] React Router v6
- [ ] React Query for server state
- [ ] React Hook Form + Zod
- [ ] Tailwind CSS or styled-components

### Part 2: Core Features (60 min)

**Authentication Flow**

```tsx
// stores/authStore.ts
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => void;
}

// ProtectedRoute component
const ProtectedRoute = ({ children }) => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" />;
  return children;
};
```

**Dashboard Features**
- Metrics cards (users, revenue, orders)
- Line chart (trend data)
- Recent activity list
- Quick actions

**CRUD Operations (Users)**

| Feature | Requirements |
|---------|--------------|
| List | Pagination, sorting, filtering |
| Create | Form validation, success feedback |
| Update | Pre-filled form, optimistic updates |
| Delete | Confirmation dialog, soft delete |

**Search Implementation**

```tsx
// useDebounce hook
const useDebouncedSearch = (query: string, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(query);
    }, delay);
    return () => clearTimeout(timer);
  }, [query, delay]);

  return debouncedValue;
};
```

### Part 3: Forms & Validation (20 min)

**React Hook Form Setup**

```tsx
// schemas/userSchema.ts
const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'user', 'editor']),
  isActive: z.boolean()
});

// components/UserForm.tsx
const UserForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(userSchema)
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input {...register('name')} error={errors.name?.message} />
      {/* More fields */}
    </form>
  );
};
```

### Part 4: Accessibility & Performance (20 min)

**Accessibility Checklist**

```tsx
// Accessible button
<button
  aria-label="Delete user John Doe"
  aria-describedby="delete-help"
  onClick={handleDelete}
>
  <TrashIcon aria-hidden="true" />
</button>

// Focus trap in modal
<Modal
  onClose={onClose}
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <h2 id="modal-title">Confirm Delete</h2>
  <p id="modal-description">Are you sure?</p>
</Modal>
```

**Performance Optimization**

```tsx
// Code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Users = lazy(() => import('./pages/Users'));

// Memoization
const UserCard = memo(({ user }) => (
  <Card>{user.name}</Card>
));

// Virtual list for large datasets
<VirtualList
  items={users}
  height={600}
  itemHeight={80}
  renderItem={(user) => <UserRow user={user} />}
/>
```

## Storybook Component Library

**Required Components**

```
Button  (primary, secondary, danger variants)
Input   (text, email, password, with error)
Select  (single, multi-select)
Modal   (with focus trap)
Card    (with header, body, footer)
Table   (sortable, with pagination)
Alert   (info, success, warning, error)
Tabs    (controlled)
```

**Storybook Story Example**

```tsx
// Button.stories.tsx
export default {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'danger'] }
  }
};

export const Primary = {
  args: {
    variant: 'primary',
    children: 'Click me'
  }
};
```

## Submission Requirements

### Required Files

- `[name]-month4-app.zip` — React project
- `[name]-month4-storybook.zip` — Storybook build
- `[name]-month4-lighthouse.pdf` — Lighthouse report
- `[name]-month4-accessibility.md` — A11y audit
- `[name]-month4-architecture.md` — Architecture decisions

## Evaluation Preview

| Criteria | Points | What Evaluators Look For |
|----------|--------|--------------------------|
| Feature Completeness | 25 | All 5 features working |
| State Management | 20 | Clean store design, proper patterns |
| Accessibility | 20 | WCAG 2.1 AA compliance |
| Performance | 20 | Lighthouse 90+ |
| Component Library | 10 | 8+ components in Storybook |
| Code Quality | 5 | TypeScript, clean architecture |

## Tips for Success

1. **Plan state carefully** — decide local vs global early
2. **Accessibility first** — don't retrofit a11y later
3. **Lazy load routes** — improve initial load time
4. **Use React Query** — for server state management
5. **Test with keyboard** — not just mouse
6. **Memoize wisely** — profile before optimizing
