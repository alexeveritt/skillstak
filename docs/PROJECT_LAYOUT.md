# Project Layout Implementation

## Overview
Created a consistent layout for all project-related pages to provide uniform navigation and header behavior across the application.

## What Was Changed

### 1. New Layout Component
**File**: `app/routes/p.$projectId.tsx`

A new layout component that:
- Loads the project data once for all child routes
- Displays a back button to return to the main project page
- Shows the project name with its custom color
- Adds contextual subtitles based on the current page (e.g., "Cards", "Edit Project", "New Card", "Review Session", "Practice Mode")
- Conditionally hides the header only on the main project page for a cleaner experience
- **Now includes review and practice pages** with appropriate subtitles

### 2. Updated Routes Configuration
**File**: `app/routes.ts`

Restructured the routes to use a nested route pattern:
```typescript
route("p/:projectId", "routes/p.$projectId.tsx", [
  index("routes/p.$projectId._index.tsx"),
  route("edit", "routes/p.$projectId.edit.tsx"),
  route("review", "routes/p.$projectId.review.tsx"),
  route("cards", "routes/p.$projectId.cards._index.tsx"),
  // ... other card routes
])
```

### 3. Simplified Child Pages
**Updated files**:
- `app/routes/p.$projectId._index.tsx` - Kept its own header with menu (main project page)
- `app/routes/p.$projectId.cards._index.tsx` - Removed duplicate header and wrapper
- `app/routes/p.$projectId.review.tsx` - Removed all "Back to Project" links since layout provides navigation

All child pages now render only their specific content, while the layout handles:
- Project data loading
- Back navigation
- Project name display
- Page context/subtitles

## Benefits

1. **Consistent Navigation**: All project pages have a uniform back button and header
2. **DRY Code**: Project data is loaded once in the layout, not repeated in each page
3. **Better UX**: Clear visual hierarchy with contextual page subtitles
4. **Maintainability**: Changes to the header/navigation only need to be made in one place
5. **Performance**: Shared layout component reduces bundle size and improves caching

## Page Behavior

- **Main Project Page** (`/p/:id`): Shows its own header with the project menu
- **Review/Practice Pages** (`/p/:id/review`): Show layout header with "Review Session" or "Practice Mode" subtitle
- **All Other Pages**: Show layout header with back button and page subtitle
