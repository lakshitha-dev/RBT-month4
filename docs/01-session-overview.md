# Session Overview — Month 4

| Attribute | Details |
|-----------|---------|
| Duration | 4 hours |
| Track | Engineer |
| Focus | React, state management, accessibility, performance |
| Prerequisites | Month 3 completed, React fundamentals |
| Video | <https://youtu.be/VrWmI25uzQU?si=SNbgpx2CyUmvvktE> |

## Learning Objectives

By the end of this session, participants will be able to:

- Build complex React applications with state management
- Implement form validation with React Hook Form
- Create protected routes with authentication
- Ensure WCAG 2.1 AA accessibility compliance
- Achieve a Lighthouse performance score of 90+

## Session Agenda (4 Hours)

### Hour 1: Architecture Patterns (60 min)

**State Management Strategies (30 min)**
- Local state vs global state
- Context API patterns
- Zustand/Redux — when and why
- Server state with React Query

**Component Architecture (30 min)**
- Atomic design principles
- Container/Presentational pattern
- Compound components
- Render props and hooks

### Hours 2–3: Hands-on Development (120 min)

**Challenge: Build Dashboard Application**

```
Application: Admin Dashboard
Features:    Auth, Dashboard, CRUD, Search, Notifications
State:       Zustand or Redux
Forms:       React Hook Form
Performance: Lighthouse 90+
```

**Part 1: Application Setup (20 min)**
1. Project structure with Vite
2. State management setup
3. Routing configuration
4. Theme and styling setup

**Part 2: Core Features (60 min)**

5. Authentication flow (login, logout, protected routes)
6. Dashboard with data visualization
7. CRUD operations for resources
8. Search functionality with debouncing
9. Notification system

**Part 3: Forms & Validation (20 min)**

10. Form setup with React Hook Form
11. Validation schemas (Zod/Yup)
12. Error handling and display
13. Multi-step form wizard

**Part 4: Accessibility & Performance (20 min)**

14. ARIA labels and roles
15. Keyboard navigation
16. Focus management
17. Loading states and error boundaries
18. Code splitting and lazy loading

### Hour 4: Review & Optimization (60 min)

**Lighthouse Audit (30 min)**
- Run performance audit
- Identify optimization opportunities
- Implement improvements

**Accessibility Review (15 min)**
- Screen reader testing
- Keyboard navigation check
- Color contrast verification

**Session Retrospective (15 min)**
- Key learnings
- Questions for follow-up
- Preview of offline milestones

## Deliverables Checklist

| # | Deliverable | Format | Required |
|---|-------------|--------|----------|
| 1 | Working SPA | React project | Yes |
| 2 | State management | Zustand/Redux setup | Yes |
| 3 | Storybook library | Component docs | Yes |
| 4 | Lighthouse report (90+) | HTML/PDF | Yes |
| 5 | Accessibility audit | Markdown | Yes |

## Offline Milestones (Before Month 5)

- [ ] Add internationalization (i18n) support
- [ ] Implement real-time features with WebSockets
- [ ] Optimize bundle size (code splitting, lazy loading)
- [ ] Add end-to-end tests with Playwright
- [ ] Contribute to an open-source React project (1 PR merged)
- [ ] Implement dark mode toggle

## Resources

### Required Reading
- React Documentation: <https://react.dev/>
- Zustand: <https://zustand-demo.pmnd.rs/>
- WCAG Guidelines: <https://www.w3.org/WAI/WCAG21/quickref/>

### Tools
- React Developer Tools
- Lighthouse
- axe DevTools (accessibility)
- Storybook

## Assessment Criteria

| Category | Weight | Max Points |
|----------|--------|------------|
| Feature Completeness | 25% | 25 |
| State Management | 20% | 20 |
| Accessibility | 20% | 20 |
| Performance (90+) | 20% | 20 |
| Component Library | 10% | 10 |
| Code Quality | 5% | 5 |
| **Total** | **100%** | **100** |
