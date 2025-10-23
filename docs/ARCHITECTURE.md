# Architecture Documentation

## Overview

This application now follows a clean, layered architecture with clear separation of concerns:

```
Routes (UI Layer)
    ↓
Services (Business Logic Layer)
    ↓
Repositories (Data Access Layer)
    ↓
Database
```

## Layer Descriptions

### 1. Routes Layer (`app/routes/`)

**Responsibility**: Handle HTTP requests, render UI, coordinate user interactions

**What it does**:
- Parse request parameters and form data
- Call service functions to execute business logic
- Return responses, redirects, or render React components
- Handle validation errors and display them to users

**What it does NOT do**:
- Direct database queries
- Business logic calculations
- Complex data transformations

**Example**:
```typescript
// ❌ Before (mixed concerns)
export async function action({ request, context }: ActionFunctionArgs) {
  const userId = await requireUserId({ request, cloudflare: context.cloudflare });
  const form = await request.formData();
  const name = String(form.get("name") || "");
  const id = newId();
  await run(context.cloudflare?.env, "INSERT INTO project (id, user_id, name) VALUES (?, ?, ?)", [id, userId, name]);
  return null;
}

// ✅ After (separated concerns)
export async function action({ request, context }: ActionFunctionArgs) {
  const userId = await requireUserId({ request, cloudflare: context.cloudflare });
  const form = await request.formData();
  const name = String(form.get("name") || "");
  await projectService.createProject(context.cloudflare.env, userId, name);
  return null;
}
```

### 2. Services Layer (`app/services/`)

**Responsibility**: Implement business logic and orchestrate data operations

**What it does**:
- Coordinate multiple repository calls
- Implement business rules and calculations
- Handle complex workflows (e.g., spaced repetition algorithm)
- Transform data between layers
- Generate IDs and timestamps

**What it does NOT do**:
- Direct SQL queries
- Render UI components
- Handle HTTP-specific logic

**Files**:
- `auth.service.ts` - Authentication, signup, login, password reset
- `project.service.ts` - Project CRUD operations
- `card.service.ts` - Card CRUD operations
- `review.service.ts` - Spaced repetition review logic

**Example**:
```typescript
// Business logic for creating a card with its schedule
export async function createCard(
  env: Env,
  projectId: string,
  front: string,
  back: string,
  color?: string
): Promise<string> {
  const id = newId();
  await cardRepo.createCard(env, id, projectId, front, back, color || null);
  
  // Initialize schedule (business logic)
  await scheduleRepo.createCardSchedule(env, id, nowIso());
  
  return id;
}
```

### 3. Repositories Layer (`app/repositories/`)

**Responsibility**: Data access and database operations

**What it does**:
- Execute SQL queries
- Map database results to TypeScript types
- Provide CRUD operations for entities
- Handle database-specific logic

**What it does NOT do**:
- Business logic or calculations
- ID generation or timestamp creation
- Multi-step workflows

**Files**:
- `user.repository.ts` - User and auth_key table operations
- `project.repository.ts` - Project table operations
- `card.repository.ts` - Card table operations and queries
- `card-schedule.repository.ts` - Card schedule table operations

**Example**:
```typescript
// Pure data access - no business logic
export async function createProject(env: Env, id: string, userId: string, name: string): Promise<void> {
  await run(env, "INSERT INTO project (id, user_id, name) VALUES (?, ?, ?)", [id, userId, name]);
}

export async function findProjectsByUserId(env: Env, userId: string): Promise<ProjectWithStats[]> {
  return await q<ProjectWithStats>(
    env,
    `SELECT p.id, p.name,
            (SELECT COUNT(*) FROM card c WHERE c.project_id = p.id) AS total,
            (SELECT COUNT(*) FROM card c JOIN card_schedule s ON s.card_id=c.id 
             WHERE c.project_id = p.id AND s.due_at <= datetime('now')) AS due
     FROM project p WHERE p.user_id = ? ORDER BY p.created_at DESC`,
    [userId]
  );
}
```

## Benefits of This Architecture

### 1. **Testability**
- Services can be tested independently with mocked repositories
- Business logic is isolated and easy to unit test
- No need to mock HTTP requests or UI components to test logic

### 2. **Maintainability**
- Clear responsibility for each layer
- Easy to locate where changes should be made
- Reduced code duplication

### 3. **Reusability**
- Services can be called from multiple routes
- Repository functions can be reused across services
- Business logic is centralized

### 4. **Type Safety**
- Clear TypeScript interfaces for each layer
- Type definitions for entities in repository files
- Compile-time checks for data flow

### 5. **Scalability**
- Easy to add new features following the same pattern
- Can swap database implementation by changing repositories
- Can add caching, logging, or monitoring at specific layers

## Data Flow Examples

### Creating a Project

```
1. Route (p.$projectId.cards.new.tsx)
   ↓ Validates form data
   ↓ Calls service with validated data
   
2. Service (card.service.ts)
   ↓ Generates new ID
   ↓ Calls repository to create card
   ��� Calls repository to create schedule
   
3. Repository (card.repository.ts, card-schedule.repository.ts)
   ↓ Executes INSERT queries
   
4. Database
   ✓ Data persisted
```

### Reviewing a Card

```
1. Route (p.$projectId.review.tsx)
   ↓ Gets next due card
   ↓ On user action, calls review service
   
2. Service (review.service.ts)
   ↓ Fetches card schedule from repository
   ↓ Calculates new interval/ease (spaced repetition algorithm)
   ↓ Updates schedule via repository
   
3. Repository (card.repository.ts, card-schedule.repository.ts)
   ↓ Executes SELECT and UPDATE queries
   
4. Database
   ✓ Schedule updated with new due date
```

## Migration Guide

### Adding a New Feature

1. **Define repository functions** for any new database operations
2. **Implement service functions** that orchestrate the repository calls
3. **Update routes** to call service functions instead of direct DB access
4. **Add types** for any new entities or DTOs

### Converting Existing Code

Replace this pattern:
```typescript
// ❌ Old: Route doing everything
const rows = await q(env, "SELECT * FROM table WHERE id = ?", [id]);
const data = rows[0];
// ... business logic ...
await run(env, "UPDATE table SET ...", [...]);
```

With this pattern:
```typescript
// ✅ New: Separated layers
const data = await myService.getData(env, id);
```

## Testing Strategy

### Unit Tests (Services)
```typescript
// Mock repositories
const mockCardRepo = {
  findCardSchedule: vi.fn().mockResolvedValue({ 
    interval_days: 1, 
    ease: 2.5, 
    streak: 0,
    lapses: 0,
    back: "answer"
  })
};

// Test service logic
test('reviewCardGood increases streak and interval', async () => {
  await reviewService.reviewCardGood(mockEnv, 'card-id');
  expect(mockScheduleRepo.updateCardSchedule).toHaveBeenCalledWith(
    mockEnv, 
    'card-id', 
    expect.any(String), // due_at
    3, // new interval (1 * 2.5 rounded)
    2.55, // new ease (2.5 + 0.05)
    1, // new streak
    0 // lapses unchanged
  );
});
```

### Integration Tests (Repositories)
Test with a real test database to verify SQL queries work correctly.

### E2E Tests (Routes)
Test the full flow through the UI to ensure everything works together.

## File Structure

```
app/
├── routes/                    # UI Layer - React Router routes
│   ├── _index.tsx            # Home page with project list
│   ├── login.tsx             # Login form
│   ├── signup.tsx            # Signup form
│   ├── p.$projectId._index.tsx      # Project detail
│   ├── p.$projectId.edit.tsx        # Edit project
│   ├── p.$projectId.cards.new.tsx   # Create card
│   ├── p.$projectId.cards.$cardId.edit.tsx  # Edit card
│   └── p.$projectId.review.tsx      # Review cards
│
├── services/                  # Business Logic Layer
│   ├── auth.service.ts       # Authentication logic
│   ├── project.service.ts    # Project business logic
│   ├── card.service.ts       # Card business logic
│   └── review.service.ts     # Spaced repetition algorithm
│
├── repositories/              # Data Access Layer
│   ├── user.repository.ts    # User & auth_key queries
│   ├── project.repository.ts # Project queries
│   ├── card.repository.ts    # Card queries
│   └── card-schedule.repository.ts  # Schedule queries
│
└── server/                    # Infrastructure
    ├── db.ts                 # Database connection helpers
    ├── auth.ts               # Auth compatibility layer
    ├── session.ts            # Session management
    └── types.ts              # Shared types
```

## Best Practices

1. **Keep routes thin** - Only handle HTTP concerns
2. **Services own business logic** - All calculations, validations, workflows
3. **Repositories are pure data access** - Just SQL, no logic
4. **Use TypeScript types** - Define types for all entities and DTOs
5. **Error handling** - Let errors bubble up from repositories through services to routes
6. **Transaction handling** - Can be added at the service layer when needed
7. **Naming conventions**:
   - Repositories: `findX`, `createX`, `updateX`, `deleteX`
   - Services: `getX`, `createX`, `updateX`, `deleteX`, domain-specific names
   - Routes: `loader`, `action`, component function

## Next Steps

- Add unit tests for services
- Add integration tests for repositories
- Consider adding a caching layer
- Add logging/monitoring at service layer
- Consider adding validation layer between routes and services

