# Common Components Usage Guide

## BackButton Component

The BackButton is a reusable navigation component that allows users to go back to a previous page or to a specific route.

### Basic Usage

```tsx
import { BackButton } from '../common';

const SomePage = () => {
  return (
    <div>
      <BackButton />
      <h1>Page Content</h1>
    </div>
  );
};
```

This will render a "back" button that goes to the previous page in history.

### With Custom Navigation Target

```tsx
<BackButton to="/home" />
```

This will navigate to the "/home" route when clicked.

### With Custom Label

```tsx
<BackButton label="return to menu" />
```

### With Position Classes

Use the provided position classes to place the button:

```tsx
// Positions button in the top left corner
<BackButton className="back-button-top-left" />

// Makes the button inline with other elements
<BackButton className="back-button-inline" />
```

### Custom Styling

You can add additional classes for custom styling:

```tsx
<BackButton className="my-custom-class" />
```

### Combining Options

You can combine all options:

```tsx
<BackButton 
  to="/dashboard" 
  label="back to dashboard" 
  className="back-button-top-left my-custom-class" 
/>
```

## Implementation Pattern

For consistency, it's recommended to add the BackButton component to every page that needs navigation:

1. Add the button near the top of your component JSX
2. Use the top-left positioning for main pages
3. Use inline positioning for nested sections
4. Navigate to the logical parent route when possible