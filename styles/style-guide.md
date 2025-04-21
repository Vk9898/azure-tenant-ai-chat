# Complete Design System Guidelines: Core & Mobile Experience (v2.0)

## 1. Core Design Principles (Mandatory Adherence)

1. **Minimalism**: Prioritize clarity. Avoid superfluous elements. Use whitespace effectively via the spacing scale.
2. **Distinctive**: Consistently apply the unique visual elements: `rounded-xs`, `border-2` emphasis, bold/uppercase typography, Vercel Blue accent.
3. **Consistent**: Apply tokens, components, patterns, and layouts uniformly across all generated UI. No one-off styles.
4. **Accessible**: Implement WCAG AA standards. Ensure keyboard navigation, semantic HTML, sufficient contrast, ARIA attributes where necessary, and proper focus management.
5. **Purposeful**: Every UI element and style must serve a clear function.
6. **Adaptable**: Ensure components and layouts are responsive using the defined breakpoints and Tailwind prefixes.
7. **Mobile-First**: Design and develop for mobile first, then enhance for larger screens.

## 2. Visual Identity Mandates (Strict Application)

1. **Border Radius**:
   * **Rule:** Apply `rounded-xs` (0.125rem/2px) to **ALL** interactive elements (Buttons, Inputs, Cards, Checkboxes, etc.) and containers unless explicitly specified otherwise.
   * **Implementation:** Use the Tailwind class `rounded-xs`. Do *not* use `rounded-sm`, `rounded-md`, `rounded-lg`, etc., unless part of a *different*, documented component style.

2. **Borders**:
   * **Rule:** Use borders for emphasis, particularly `border-2`. Default border color is `border` (`var(--color-border)`).
   * **Implementation:** Apply `border-2` class for emphasis on elements like Cards (`ds-card`), specific Button variants (`ds-button-outline`), and highlighted containers. Use `border` (1px) for standard boundaries like inputs. Apply specific border colors like `border-primary` or `border-destructive` where semantically appropriate.

3. **Typography**:
   * **Fonts**: Use `Inter` (default) and `JetBrains Mono` (code/monospace) via the `font-mono` class.
   * **Weights**: Apply `font-bold` extensively for interactive elements (Buttons), titles (CardTitle), and navigation. Use `font-black` for main headings (`ds-section-title`, Hero titles).
   * **Case**: Apply `uppercase` to **ALL** Button text by default. Use `uppercase` for section titles (`ds-section-title`) and specific labels as shown in examples. Apply sparingly elsewhere.
   * **Scale**: Strictly adhere to the type scale implemented via Tailwind classes (e.g., `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, `text-3xl`, `text-4xl`, `text-5xl`).
   * **Mobile Adjustment**: Use smaller text sizes on mobile (e.g., `text-2xl sm:text-3xl md:text-4xl` for headings).

4. **Color**:
   * **Primary Accent**: Use `bg-primary` (Vercel Blue, `var(--color-primary)`) for primary actions (Buttons), active navigation states, and key accents. Use `text-primary` for outline/ghost button text and links.
   * **Foreground/Background**: Use `text-foreground` and `bg-background` or `bg-card` for base text and surfaces. Use `text-muted-foreground` for secondary/description text.
   * **Semantic Colors**: Apply `success`, `warning`, `destructive` colors strictly according to their semantic purpose. Always include `-foreground` suffix for text on these backgrounds.
   * **Implementation**: Always use Tailwind utility classes (e.g., `bg-primary`, `text-destructive`, `border-border`). Do **not** use hardcoded hex codes.

5. **Shadows**:
   * **Rule:** Use `shadow-xs` for subtle elevation on Cards (`ds-card`) and similar containers. Avoid heavy shadows.
   * **Implementation:** Apply the `shadow-xs` Tailwind class.

6. **Accent Bars**:
   * **Rule:** Apply the `ds-accent-bar` class (`h-1 w-16 bg-primary mb-4`) below section titles (`ds-section-title`).
   * **Implementation:** `<div className="ds-accent-bar"></div>`.

7. **Focus States**:
   * **Rule:** Apply the consistent ring-based focus style.
   * **Implementation:** Use the custom utility `ds-focus-ring` (defined as `focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`) in your components.

8. **Touch Targets**:
   * **Rule:** Ensure interactive elements have sufficient touch target size (minimum 44×44px) on mobile.
   * **Implementation:** Apply `min-h-11 min-w-11` to interactive elements or appropriate padding.

## 3. Design Token Usage Rules (Mandatory)

1. **CSS Variables**: **ALL** colors, spacing, radii, fonts, etc., MUST be applied using Tailwind utilities that access CSS variables.
   * **Example (Color):** `className="bg-primary text-primary-foreground"`
   * **Example (Spacing):** `className="p-6"` (maps to 24px via spacing scale)
   * **Example (Radius):** `className="rounded-xs"`

2. **Spacing Scale**: Adhere strictly to the 4px-based spacing scale for **ALL** padding, margins, and gaps. Use Tailwind classes (`p-1`, `m-2`, `gap-4`, etc.) corresponding to the scale (4px, 8px, 16px, etc.).
   * **Mobile Adjustment:** Use smaller spacing values on mobile: `p-4 sm:p-6 md:p-8`

3. **Semantic Naming**: Use tokens based on their semantic meaning (e.g., `bg-destructive` for errors, `p-6` for standard card padding).

4. **Safe Area Insets**: Respect device safe areas on mobile using CSS environment variables.
   * **Implementation:** `pt-[env(safe-area-inset-top)]`, `pb-[env(safe-area-inset-bottom)]`, etc.

## 4. Component Styling Rules (Shadcn UI Integration)

1. **Base Components**: Use Shadcn UI components as the base (e.g., `Button`, `Card`, `Input` from `@/components/ui/...`).

2. **Custom Styling**: Apply the design system's visual identity by:
   * Using the `className` prop with `cn()` utility (from `lib/utils.ts`) for merging classes.
   * Applying required classes: `rounded-xs` to most components.
   * Using custom utility classes (`ds-button-primary`, `ds-card`, etc.) defined in `globals.css`.
   * Following the implementation seen in examples:
     ```tsx
     <Button className="ds-button-primary">Primary Button</Button>
     <Card className="ds-card shadow-xs">...</Card>
     ```

3. **`cva` (Class Variance Authority)**:
   * **Rule:** When defining components with variants, use `cva` to manage variants and default styles.
   * **Structure:** Follow the pattern shown in the examples. Ensure `base` styles include common characteristics (focus rings, transitions) and `variants` apply specific styles (colors, sizes). Always include `defaultVariants`.
   * **Example structure**:
     ```tsx
     const buttonVariants = cva(
       "inline-flex items-center justify-center rounded-xs font-bold transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
       {
         variants: {
           variant: {
             default: "bg-primary text-primary-foreground hover:bg-primary/90",
             secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
             // other variants...
           },
           size: {
             sm: "h-8 px-3 text-xs",
             default: "h-10 px-4 text-sm",
             lg: "h-12 px-6 text-base",
           },
           uppercase: {
             true: "uppercase",
             false: "",
           }
         },
         defaultVariants: {
           variant: "default",
           size: "default",
           uppercase: true,
         },
       }
     );
     ```

4. **Button Styling Requirements**:
   * **IMPORTANT**: All buttons MUST use `rounded-xs` (NOT rounded-md or other variations) to ensure consistent corner styling across the UI.
   * Always apply `font-bold` and `uppercase` styling to all button text.
   * Use `shadow-xs` (NOT shadow-2xs) for consistent shadow elevation.
   * Apply `min-h-10` for default buttons and `min-h-11` for larger buttons to ensure proper touch targets.
   * Apply `ds-focus-ring` to all buttons for accessibility.
   * Example of correct button styling:
     ```tsx
     // Base button.tsx file should use
     const buttonVariants = cva(
       "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xs text-sm font-bold uppercase transition-all disabled:pointer-events-none disabled:opacity-50 outline-hidden ds-focus-ring",
       {
         variants: {
           variant: {
             default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
             // other variants with shadow-xs...
           },
           size: {
             default: "h-10 px-4 py-2 min-h-10",
             sm: "h-9 px-3 gap-1.5",
             lg: "h-12 px-6 min-h-11",
             // all sizes use rounded-xs by default
           },
         }
       }
     );
     ```

5. **Compound Components**:
   * **Rule:** Utilize the compound component pattern for complex elements like `Card`.
   * **Implementation:** Ensure correct nesting and apply specific padding/margin tokens as defined:
     ```tsx
     <Card className="ds-card shadow-xs" data-slot="card">
       <CardHeader>
         <CardTitle>Title</CardTitle>
         <CardDescription>Description</CardDescription>
       </CardHeader>
       <CardContent>Content</CardContent>
       <CardFooter>Footer</CardFooter>
     </Card>
     ```

6. **State Styling**: Implement states consistently:
   * **Hover**: Use `hover:` prefixes (e.g., `hover:bg-primary/90`, `hover:bg-muted`).
   * **Focus**: Use `ds-focus-ring` custom utility.
   * **Disabled**: Use `disabled:opacity-50 disabled:pointer-events-none`.
   * **Active**: For active states, particularly in navigation, use `data-[state=active]:bg-primary data-[state=active]:text-primary-foreground` for components that support state attributes.
   * **Touch Feedback**: Add `active:` variants for mobile touch states (e.g., `active:bg-primary/80`).

7. **Data Slots**: Always add `data-slot` attributes to your components for easier styling.
  
8. **Mobile Component Adjustments**:
   * **Input Sizing**: Use taller inputs on mobile: `h-12 md:h-10`
   * **Button Sizing**: Adjust padding for better touch targets: `px-4 py-3 md:py-2`
   * **Mobile Menus**: Use `Sheet` component for slide-out navigation on mobile.

## 5. Layout Rules (Mandatory)

1. **Grid System**:
   * **Rule:** Use the 12-column grid (`grid grid-cols-12`) for primary page layouts.
   * **Implementation:** Use Tailwind grid utilities (`grid-cols-*`, `col-span-*`, `gap-*`). Ensure consistent gutters using the spacing scale.
   * **Mobile Adjustment:** Default to single column on mobile: `grid-cols-1 md:grid-cols-12`

2. **Responsive Breakpoints**:
   * **Rule:** Implement responsiveness using the defined breakpoints via Tailwind prefixes:
     - Mobile: Default (up to 639px)
     - Tablet: `sm:` (640px and above)
     - Desktop: `md:` (768px), `lg:` (1024px)
     - Large Desktop: `xl:` (1280px)
   * **Approach:** Design mobile-first. Apply overrides for larger screens.
   * **Example:** `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

3. **Containers**: Use `container mx-auto px-4 sm:px-6 lg:px-8` for centering content with consistent, responsive padding.

4. **Common Layout Patterns**: Implement standard layouts as shown in examples:
   * **Card Grid**: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6`
   * **Split Content**: `grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center`
   * **Content with Sidebar**: `grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8` with appropriate column spans
   * **Stack to Row**: `flex flex-col md:flex-row gap-4 md:gap-6`

5. **Mobile Layout Patterns**:
   * **App Shell**: Implement app shell layout for mobile:
     ```tsx
     <div className="flex flex-col min-h-screen">
       <header className="sticky top-0 z-10 bg-background border-b-2 border-border pt-safe">
         {/* Header content */}
       </header>
       <main className="flex-1 overflow-auto pb-16">
         {/* Main content */}
       </main>
       <footer className="fixed bottom-0 left-0 right-0 h-16 bg-background border-t-2 border-border pb-safe">
         {/* Navigation */}
       </footer>
     </div>
     ```
   * **Bottom Navigation**: Use fixed bottom navigation on mobile:
     ```tsx
     <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border flex justify-around items-center h-16 z-50 pb-safe">
       {/* Navigation items */}
     </nav>
     ```

## 6. Pattern Implementation Rules (Strict Application)

1. **State Patterns**:
   * **Empty States**: 
     ```tsx
     <div className="border border-dashed border-border p-6 sm:p-8 flex flex-col items-center justify-center text-center rounded-xs" data-slot="empty-state">
       <Box className="size-10 sm:size-12 text-muted-foreground mb-3 sm:mb-4" />
       <h3 className="text-base sm:text-lg font-bold mb-1 sm:mb-2">No Items Found</h3>
       <p className="text-muted-foreground mb-3 sm:mb-4">Description text</p>
       <Button className="ds-button-primary min-h-11">Action</Button>
     </div>
     ```
   * **Loading States**: Use spinner animation with `border-t-2 border-r-2 border-primary rounded-full animate-spin`
   * **Error States**: Use `border-destructive` and destructive variant buttons
   * **Success States**: Use `border-success` and success variant buttons

2. **Form Pattern**:
   * **Rule:** Group related fields logically using grid layouts as shown in examples.
   * **Styling:** Use `text-sm font-medium` for labels, `text-xs text-muted-foreground` for descriptions.
   * **Mobile Form Adjustments**: Stack fields vertically on mobile:
     ```tsx
     <Card className="ds-card shadow-xs" data-slot="form-card">
       <CardHeader>
         <CardTitle>Form Title</CardTitle>
         <CardDescription>Form description</CardDescription>
       </CardHeader>
       <CardContent>
         <form className="space-y-4 sm:space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
             <div className="space-y-2">
               <Label htmlFor="name" className="text-sm font-medium">Name</Label>
               <Input id="name" className="h-12 md:h-10 rounded-xs" data-slot="input" />
             </div>
             {/* More form fields */}
           </div>
         </form>
       </CardContent>
       <CardFooter className="flex flex-col sm:flex-row sm:justify-end gap-3">
         <Button variant="outline" className="w-full sm:w-auto rounded-xs font-medium">Cancel</Button>
         <Button className="w-full sm:w-auto ds-button-primary">Submit</Button>
       </CardFooter>
     </Card>
     ```

3. **Mobile Interaction Patterns**:
   * **Bottom Sheets**: Use for actions on mobile:
     ```tsx
     <Sheet>
       <SheetTrigger className="ds-button-primary md:hidden">Actions</SheetTrigger>
       <SheetContent side="bottom" className="rounded-t-lg border-t-2 pb-safe" data-slot="sheet-content">
         <div className="space-y-4 p-4">
           <ActionButton icon={<Edit />} label="Edit" data-slot="action-button" />
           <ActionButton icon={<Trash />} label="Delete" variant="destructive" />
           <ActionButton icon={<X />} label="Cancel" variant="outline" />
         </div>
       </SheetContent>
     </Sheet>
     ```
   * **Hamburger Menu**: Use for navigation on mobile:
     ```tsx
     <Sheet>
       <SheetTrigger className="md:hidden">
         <Menu className="size-6" />
       </SheetTrigger>
       <SheetContent side="left" className="w-[280px] sm:w-[320px] border-r-2 p-0" data-slot="nav-menu">
         <nav className="flex flex-col h-full">
           <div className="p-4 border-b-2 border-border">
             <h2 className="font-bold text-lg">Menu</h2>
           </div>
           <div className="flex-1 overflow-auto p-4">
             {/* Navigation items */}
           </div>
         </nav>
       </SheetContent>
     </Sheet>
     ```

## 7. Utility Class Usage Rules

1. **Prioritize Tailwind**: Use standard Tailwind utilities whenever possible.

2. **Custom Utilities (`ds-*`)**: Use the defined utility classes as shortcuts for applying consistent styles:
   ```css
   @utility ds-section-title {
     @apply text-2xl sm:text-3xl font-black uppercase tracking-tight mb-2;
   }
   
   @utility ds-accent-bar {
     @apply h-1 w-16 bg-primary mb-4;
   }
   
   @utility ds-card {
     @apply bg-card border-2 border-border text-card-foreground rounded-xs transition-all duration-200;
   }
   
   @utility ds-button-primary {
     @apply bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 font-bold uppercase rounded-xs transition-all duration-200 min-h-11 md:min-h-10;
   }
   
   @utility ds-focus-ring {
     @apply focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2;
   }
   
   @utility ds-touch-target {
     @apply min-h-11 min-w-11;
   }
   
   @utility pb-safe {
     @apply pb-[env(safe-area-inset-bottom)];
   }
   
   @utility pt-safe {
     @apply pt-[env(safe-area-inset-top)];
   }
   ```

3. **`cn()` Utility**: **ALWAYS** use the `cn()` utility function when merging classes in component definitions.

## 8. Accessibility Requirements (Mandatory)

1. **Semantic HTML**: Use appropriate HTML5 elements.
2. **ARIA Attributes**: Apply where semantic HTML is insufficient.
3. **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible.
4. **Focus Management**: Implement logical focus order and use `ds-focus-ring`.
5. **Color Contrast**: Ensure text meets WCAG AA contrast ratios.
6. **Labels**: Ensure all form inputs have associated, visible labels.
7. **Touch Target Size**: Ensure touch targets are at least 44×44px on mobile.
8. **Gesture Alternatives**: Provide alternatives for swipe/gesture actions.

## 9. Theming Rules (Light/Dark Mode)

1. **CSS Variables**: All theme-dependent styles MUST use the defined CSS variables.
2. **Implementation**: Use Tailwind utilities that automatically handle these variables.
3. **Testing**: Ensure generated UI works in both light and dark modes.
4. **Mobile Dark Mode**: Test dark mode on mobile (especially OLED screens) for proper contrast and battery optimization.

## 10. Mobile-Specific Guidelines

1. **Touch-First Interaction**:
   * **Rule**: Design for touch as the primary interaction method.
   * **Implementation**: Apply appropriate sizing, spacing, and feedback for touch interactions.
   * **Example**: Ensure buttons have sufficient padding (`p-4`) and touch targets (`min-h-11`).

2. **Performance Optimization**:
   * **Image Handling**: Optimize images for mobile:
     ```tsx
     <Image
       src="/image.jpg"
       alt="Description"
       width={1200}
       height={800}
       className="w-full h-auto rounded-xs"
       sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
       priority={isHero}
       data-slot="image"
     />
     ```
   * **Lazy Loading**: Implement lazy loading for off-screen content:
     ```tsx
     <Suspense fallback={<Skeleton className="h-[300px] w-full rounded-xs" />}>
       <ProductList />
     </Suspense>
     ```

3. **Mobile Navigation Patterns**:
   * **Bottom Navigation**: Use for primary actions on mobile.
   * **Tab Bars**: Use for switching between main sections.
   * **Back Button**: Ensure clear back navigation.
   * **Hamburger Menu**: Use for secondary navigation.

4. **Responsive Text Handling**:
   * **Line Length**: Control with `max-w-prose` or similar constraints.
   * **Font Sizing**: Use responsive text sizing: `text-base sm:text-lg lg:text-xl`
   * **Truncation**: Use `truncate` for long text in constrained spaces.

5. **Mobile Form Optimization**:
   * **Input Types**: Use appropriate HTML5 input types: `type="tel"`, `type="email"`, etc.
   * **Autocomplete**: Add `autocomplete` attributes where appropriate.
   * **Stacked Layout**: Stack fields vertically on mobile.
   * **Full-Width Buttons**: Use `w-full sm:w-auto` for mobile-friendly buttons.

6. **Device Safe Areas**:
   * **Rule**: Respect device notches and home indicators.
   * **Implementation**: Use safe area inset utilities.
   * **Example**: `pb-safe`, `pt-safe` custom utilities.

7. **Mobile Testing Requirements**:
   * **Device Testing**: Test on actual mobile devices or accurate emulators.
   * **Responsive Validation**: Test at 320px, 375px, 414px (common mobile widths).
   * **Orientation Testing**: Test in both portrait and landscape modes.
   * **Touch Testing**: Verify touch interactions work correctly.
   * **Gesture Testing**: Test swipe and other gesture interactions.

## 11. Code Generation Guidelines for AI

1. **Imports**: Import components from `@/components/ui/...` and utilities like `cn` from `@/lib/utils`.
2. **Class Application**: Use `className` prop wrapped in `cn()` for consistent class merging.
3. **Component Usage**: Apply necessary classes to match the design system style.
4. **No Hardcoding**: Do **NOT** hardcode colors, spacing values, font sizes, or radii. **ALWAYS** use Tailwind utilities.
5. **Completeness**: Provide complete, runnable code snippets.
6. **Mobile-First**: Always write code in a mobile-first approach.
7. **Examples**: Refer to the provided code examples for correct implementation patterns.
8. **Data Slots**: Add `data-slot` attributes to components for better styling control.

## 12. Mobile Component Examples

### Mobile Navigation Bar
```tsx
// Bottom Navigation
const MobileNavigation = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border flex justify-around items-center h-16 z-50 pb-safe" data-slot="bottom-nav">
      <NavItem icon={<Home className="size-6" />} label="Home" active />
      <NavItem icon={<Search className="size-6" />} label="Search" />
      <NavItem icon={<Bell className="size-6" />} label="Notifications" />
      <NavItem icon={<User className="size-6" />} label="Profile" />
    </nav>
  );
};

// Navigation Item Component
const NavItem = ({ icon, label, active }) => {
  return (
    <Button
      variant="ghost"
      className={cn(
        "flex flex-col items-center justify-center rounded-xs min-h-11 py-1 px-2",
        active ? "text-primary" : "text-muted-foreground"
      )}
      data-slot="nav-item"
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </Button>
  );
};
```

### Mobile App Shell
```tsx
const MobileAppShell = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen" data-slot="app-shell">
      <header className="sticky top-0 z-10 bg-background border-b border-border pt-safe" data-slot="header">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="font-bold text-lg">App Name</h1>
          <Sheet>
            <SheetTrigger className="md:hidden">
              <Menu className="size-6" />
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[320px] border-r-2 p-0" data-slot="nav-menu">
              <nav className="flex flex-col h-full">
                <div className="p-4 border-b border-border">
                  <h2 className="font-bold text-lg">Menu</h2>
                </div>
                <div className="flex-1 overflow-auto p-4">
                  {/* Navigation items */}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>
      
      <main className="flex-1 overflow-auto pb-16" data-slot="main-content">
        {children}
      </main>
      
      <MobileNavigation />
    </div>
  );
};
```

### Mobile Optimized Card
```tsx
const MobileCard = () => {
  return (
    <Card className="ds-card shadow-xs" data-slot="mobile-card">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-lg sm:text-xl">Card Title</CardTitle>
        <CardDescription className="text-sm">Card description text</CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
        <p className="text-sm sm:text-base">Card content goes here with appropriate text size and spacing for mobile devices.</p>
      </CardContent>
      <CardFooter className="p-4 sm:p-6 flex flex-col sm:flex-row gap-3">
        <Button className="w-full sm:w-auto ds-button-primary">Primary Action</Button>
        <Button variant="outline" className="w-full sm:w-auto">Secondary</Button>
      </CardFooter>
    </Card>
  );
};
```

### Mobile Action Sheet
```tsx
const MobileActionSheet = () => {
  return (
    <Sheet>
      <SheetTrigger className="ds-button-primary md:hidden">Actions</SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-lg border-t-2 pb-safe" data-slot="action-sheet">
        <div className="w-12 h-1.5 bg-muted-foreground/20 rounded-full mx-auto mb-5" />
        <SheetTitle className="text-center mb-4">Available Actions</SheetTitle>
        <div className="space-y-4 p-2">
          <Button className="w-full justify-start font-bold rounded-xs h-12 text-base" data-slot="action-button">
            <Edit className="mr-2 size-5" /> Edit Item
          </Button>
          <Button className="w-full justify-start font-bold rounded-xs h-12 text-base" variant="secondary">
            <Share className="mr-2 size-5" /> Share Item
          </Button>
          <Button className="w-full justify-start font-bold rounded-xs h-12 text-base" variant="destructive">
            <Trash className="mr-2 size-5" /> Delete Item
          </Button>
          <SheetClose asChild>
            <Button className="w-full justify-center font-bold rounded-xs h-12 text-base mt-2" variant="outline">
              Cancel
            </Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
};
```

### Mobile Form
```tsx
const MobileForm = () => {
  return (
    <Card className="ds-card shadow-xs" data-slot="mobile-form">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-xl">Contact Form</CardTitle>
        <CardDescription>Please fill out the details below</CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
            <Input 
              id="name" 
              placeholder="Enter your name" 
              className="h-12 md:h-10 rounded-xs"
              autoComplete="name" 
              data-slot="input"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="Enter your email"
              className="h-12 md:h-10 rounded-xs"
              autoComplete="email" 
              data-slot="input"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
            <Input 
              id="phone" 
              type="tel" 
              placeholder="Enter your phone number"
              className="h-12 md:h-10 rounded-xs"
              autoComplete="tel" 
              data-slot="input"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium">Message</Label>
            <Textarea 
              id="message" 
              placeholder="Enter your message"
              className="min-h-[120px] rounded-xs" 
              data-slot="textarea"
            />
          </div>
        </form>
      </CardContent>
      <CardFooter className="p-4 sm:p-6 flex flex-col sm:flex-row sm:justify-end gap-3">
        <Button variant="outline" className="w-full sm:w-auto rounded-xs font-medium">Cancel</Button>
        <Button className="w-full sm:w-auto ds-button-primary">Submit</Button>
      </CardFooter>
    </Card>
  );
};
```

## 13. Pattern Composition Guidelines (Mandatory)

1. **Component Hierarchy**: Maintain a consistent component hierarchy that follows these principles:
   * **Containment Flow**: Outer containers → Layout components → UI components → Typography elements
   * **Consistent Nesting**: Use standard container patterns (Card → CardHeader/Content/Footer) without skipping levels
   * **Composition Over Configuration**: Prefer composing multiple simple components rather than creating complex configurable ones

2. **Page Structure Composition**:
   * **App Shell First**: Always start with the app shell layout which defines global navigation and content areas
   * **Section Organization**: Divide page content into logical sections with clear visual separation
   * **Content Hierarchy**: Maintain F-pattern or Z-pattern reading flow on desktop, and vertical stacking on mobile
   * **Implementation Example**:
     ```tsx
     // Proper page structure composition
     <AppShell data-slot="app-shell">
       <Header className="sticky top-0 z-10 bg-background border-b-2 border-border pt-safe" data-slot="header">
         {/* Header content */}
       </Header>
       <MainContent className="flex-1 container mx-auto px-4 sm:px-6 py-8" data-slot="main-content">
         <PageSection data-slot="page-section">
           <SectionTitle>Primary Content</SectionTitle>
           <SectionAccentBar />
           {/* Primary content components */}
         </PageSection>
         <PageSection>
           <SectionTitle>Secondary Content</SectionTitle>
           <SectionAccentBar />
           {/* Secondary content components */}
         </PageSection>
       </MainContent>
       <Footer className="border-t-2 border-border pb-safe" data-slot="footer">
         {/* Footer content */}
       </Footer>
     </AppShell>
     ```

3. **Component Relationships**:
   * **Parent-Child**: Container components (Card, Sheet) must manage spacing for their children
   * **Siblings**: Sibling components must be spaced consistently within the same container
   * **Contextual**: Related components should maintain semantic relationships
   * **Implementation**:
     ```tsx
     // Good - proper component relationship
     <Card className="ds-card shadow-xs" data-slot="card">
       <CardHeader className="p-4 sm:p-6">
         <CardTitle>Card Title</CardTitle>
         <CardDescription>Card description</CardDescription>
       </CardHeader>
       <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
         {/* Content */}
       </CardContent>
       <CardFooter className="p-4 sm:p-6 flex justify-end gap-3">
         <Button variant="outline" className="ds-button-outline">Cancel</Button>
         <Button className="ds-button-primary">Submit</Button>
       </CardFooter>
     </Card>

     // Bad - inconsistent component relationship
     <Card className="ds-card shadow-xs">
       <div className="p-4">
         <h3>Card Title</h3>
         <p>Card description</p>
       </div>
       <CardContent className="px-4 pb-4">
         {/* Content */}
       </CardContent>
       <div className="flex justify-end p-4 pt-0">
         <Button variant="outline" className="mr-3">Cancel</Button>
         <Button>Submit</Button>
       </div>
     </Card>
     ```

4. **Page-Level Composition Patterns**:
   * **Dashboard Pattern**: Grid of equal-sized cards with consistent padding and spacing
   * **Form Pattern**: Stacked sections with consistent label-input relationships
   * **Landing Pattern**: Hero section followed by feature sections, testimonials, and CTA
   * **Detail Pattern**: Header with breadcrumbs, main content area, related items sidebar

5. **Complete Page Examples**:

### Dashboard Page Example
```tsx
function DashboardPage() {
  return (
    <AppShell data-slot="app-shell">
      <Header className="sticky top-0 z-10 bg-background border-b-2 border-border pt-safe" data-slot="header">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <h1 className="font-bold text-xl">Dashboard</h1>
          <UserMenu />
        </div>
      </Header>
      
      <MainContent className="flex-1 container mx-auto px-4 sm:px-6 py-6 sm:py-8" data-slot="main-content">
        <PageSection className="mb-8" data-slot="page-section">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h2 className="ds-section-title">Overview</h2>
              <div className="ds-accent-bar"></div>
            </div>
            <div className="mt-4 sm:mt-0">
              <DateRangePicker />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatsCard title="Total Users" value="12,345" trend="+12%" icon={<Users />} />
            <StatsCard title="Revenue" value="$34,567" trend="+8%" icon={<DollarSign />} />
            <StatsCard title="Active Projects" value="25" trend="-3%" icon={<Briefcase />} />
            <StatsCard title="Completion Rate" value="87%" trend="+5%" icon={<PieChart />} />
          </div>
        </PageSection>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          <div className="lg:col-span-8">
            <PageSection className="mb-8" data-slot="page-section">
              <h2 className="ds-section-title">Activity</h2>
              <div className="ds-accent-bar"></div>
              <Card className="ds-card shadow-xs" data-slot="card">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle>Monthly Trends</CardTitle>
                  <CardDescription>Performance metrics over time</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                  <ActivityChart />
                </CardContent>
              </Card>
            </PageSection>
            
            <PageSection data-slot="page-section">
              <h2 className="ds-section-title">Recent Transactions</h2>
              <div className="ds-accent-bar"></div>
              <Card className="ds-card shadow-xs" data-slot="card">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle>Latest Activity</CardTitle>
                  <CardDescription>Your recent transactions</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                  <TransactionList />
                </CardContent>
                <CardFooter className="p-4 sm:p-6 flex justify-center">
                  <Button variant="outline" className="ds-button-outline">View All</Button>
                </CardFooter>
              </Card>
            </PageSection>
          </div>
          
          <div className="lg:col-span-4">
            <PageSection className="mb-8" data-slot="page-section">
              <h2 className="ds-section-title">Tasks</h2>
              <div className="ds-accent-bar"></div>
              <Card className="ds-card shadow-xs" data-slot="card">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle>Upcoming Tasks</CardTitle>
                  <CardDescription>Things to do</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                  <TaskList />
                </CardContent>
                <CardFooter className="p-4 sm:p-6 flex justify-end">
                  <Button className="ds-button-primary">Add Task</Button>
                </CardFooter>
              </Card>
            </PageSection>
            
            <PageSection data-slot="page-section">
              <h2 className="ds-section-title">Team</h2>
              <div className="ds-accent-bar"></div>
              <Card className="ds-card shadow-xs" data-slot="card">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>Active collaborators</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                  <TeamList />
                </CardContent>
              </Card>
            </PageSection>
          </div>
        </div>
      </MainContent>
      
      <MobileNavigation className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border flex justify-around items-center h-16 z-50 pb-safe" data-slot="mobile-nav" />
    </AppShell>
  );
}
```

### Product Detail Page Example
```tsx
function ProductDetailPage() {
  return (
    <AppShell data-slot="app-shell">
      <Header className="sticky top-0 z-10 bg-background border-b-2 border-border pt-safe" data-slot="header">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <h1 className="font-bold text-xl">Store</h1>
          <div className="flex items-center gap-4">
            <SearchButton />
            <CartButton />
          </div>
        </div>
      </Header>
      
      <MainContent className="flex-1 container mx-auto px-4 sm:px-6 py-6 sm:py-8" data-slot="main-content">
        <Breadcrumbs className="mb-6" data-slot="breadcrumbs">
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbItem href="/products">Products</BreadcrumbItem>
          <BreadcrumbItem>Product Name</BreadcrumbItem>
        </Breadcrumbs>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <ProductGallery data-slot="product-gallery" />
          
          <div className="space-y-6" data-slot="product-info">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Product Name</h1>
              <div className="flex items-center gap-2 mt-2">
                <ProductRating data-slot="product-rating" />
                <span className="text-muted-foreground">(24 reviews)</span>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-bold">$99.99</span>
                <span className="text-muted-foreground line-through ml-2">$129.99</span>
              </div>
            </div>
            
            <Separator className="border-border" />
            
            <div className="space-y-4">
              <h2 className="font-bold text-lg">Description</h2>
              <p className="text-muted-foreground">
                Detailed product description goes here. This would include information
                about features, benefits, and use cases for the product.
              </p>
            </div>
            
            <Separator className="border-border" />
            
            <div className="space-y-4" data-slot="product-options">
              <h2 className="font-bold text-lg">Options</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="color" className="font-medium">Color</Label>
                  <Select id="color">
                    <SelectTrigger className="w-full h-12 md:h-10 rounded-xs" data-slot="select">
                      <SelectValue placeholder="Select a color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="black">Black</SelectItem>
                      <SelectItem value="white">White</SelectItem>
                      <SelectItem value="blue">Blue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="size" className="font-medium">Size</Label>
                  <Select id="size">
                    <SelectTrigger className="w-full h-12 md:h-10 rounded-xs" data-slot="select">
                      <SelectValue placeholder="Select a size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="s">Small</SelectItem>
                      <SelectItem value="m">Medium</SelectItem>
                      <SelectItem value="l">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <Separator className="border-border" />
            
            <div className="flex flex-col sm:flex-row gap-4" data-slot="product-actions">
              <Button className="w-full h-12 ds-button-primary">Add to Cart</Button>
              <Button variant="outline" className="w-full h-12 ds-button-outline">Save for Later</Button>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="details" className="mb-12" data-slot="product-tabs">
          <TabsList className="bg-muted border border-border rounded-xs h-12 mb-6">
            <TabsTrigger
              value="details"
              className="rounded-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold"
              data-slot="tab"
            >
              Details
            </TabsTrigger>
            <TabsTrigger
              value="specs"
              className="rounded-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold"
              data-slot="tab"
            >
              Specifications
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="rounded-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold"
              data-slot="tab"
            >
              Reviews
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4" data-slot="tab-content">
            <h2 className="ds-section-subtitle">Product Details</h2>
            <div className="ds-accent-bar"></div>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Detailed information about the product features and benefits.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="text-success mt-1 size-5 flex-shrink-0" />
                  <span>Feature one description</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="text-success mt-1 size-5 flex-shrink-0" />
                  <span>Feature two description</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="text-success mt-1 size-5 flex-shrink-0" />
                  <span>Feature three description</span>
                </li>
              </ul>
            </div>
          </TabsContent>
          
          <TabsContent value="specs" data-slot="tab-content">
            <h2 className="ds-section-subtitle">Specifications</h2>
            <div className="ds-accent-bar"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SpecificationItem label="Material" value="Premium quality" />
              <SpecificationItem label="Dimensions" value="10 x 15 x 2 cm" />
              <SpecificationItem label="Weight" value="250g" />
              <SpecificationItem label="Warranty" value="2 years" />
            </div>
          </TabsContent>
          
          <TabsContent value="reviews" data-slot="tab-content">
            <h2 className="ds-section-subtitle">Customer Reviews</h2>
            <div className="ds-accent-bar"></div>
            <div className="space-y-6">
              <ReviewItem
                author="John Doe"
                date="March 15, 2025"
                rating={5}
                content="This product exceeded my expectations. Highly recommended!"
              />
              <ReviewItem
                author="Jane Smith"
                date="March 10, 2025"
                rating={4}
                content="Great product overall, but could be improved in a few areas."
              />
            </div>
          </TabsContent>
        </Tabs>
        
        <PageSection data-slot="page-section">
          <h2 className="ds-section-title">Related Products</h2>
          <div className="ds-accent-bar"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <RelatedProductCard data-slot="product-card" />
            <RelatedProductCard data-slot="product-card" />
            <RelatedProductCard data-slot="product-card" />
            <RelatedProductCard data-slot="product-card" />
          </div>
        </PageSection>
      </MainContent>
      
      <Footer className="bg-muted border-t-2 border-border py-12 pb-safe" data-slot="footer">
        <div className="container mx-auto px-4 sm:px-6">
          <FooterContent />
        </div>
      </Footer>
      
      <MobileNavigation className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border flex justify-around items-center h-16 z-50 pb-safe" data-slot="mobile-nav" />
    </AppShell>
  );
}
```

## 14. Token Selection Guidance (Decision Tree)

1. **Spacing Token Selection**:
   * Start with these base rules:
     * **Component Internal Padding**: Use `p-4 sm:p-6` for standard components (Cards, Sections)
     * **Margins Between Components**: Use `mb-6 sm:mb-8` for vertical spacing between major sections
     * **Gap Between Related Items**: Use `gap-4 sm:gap-6` for grid and flex layouts
   * Decision Tree for Spacing:
     ```
     Is this spacing for...
     ├── Container padding?
     │   ├── Small container → p-3 (12px)
     │   ├── Standard container → p-4 sm:p-6 (16px/24px)
     │   └── Large/feature container → p-6 sm:p-8 (24px/32px)
     ├── Margins between components?
     │   ├── Tight relationship → mb-3 sm:mb-4 (12px/16px)
     │   ├── Standard separation → mb-6 sm:mb-8 (24px/32px)
     │   └── Major section break → mb-10 sm:mb-12 (40px/48px)
     ├── Grid/Flex gaps?
     │   ├── Compact layout → gap-2 sm:gap-3 (8px/12px)
     │   ├── Standard layout → gap-4 sm:gap-6 (16px/24px)
     │   └── Open layout → gap-6 sm:gap-8 (24px/32px)
     └── Touch targets?
         ├── Icon buttons → min-h-10 min-w-10 (40px)
         ├── Interactive elements → min-h-11 min-w-11 (44px) 
         └── Primary actions → h-12 (48px)
     ```

2. **Typography Token Selection**:
   * Start with these base rules:
     * **Main Headings**: `text-3xl sm:text-4xl font-black uppercase tracking-tight`
     * **Section Headings**: `text-xl sm:text-2xl font-bold tracking-tight`
     * **Card Titles**: `text-lg font-bold`
     * **Body Text**: `text-base text-foreground` or `text-sm text-muted-foreground` for secondary text
   * Decision Tree for Typography:
     ```
     Is this text a...
     ├── Page title/hero heading?
     │   └── text-4xl sm:text-5xl font-black uppercase tracking-tight
     ├── Section heading?
     │   └── text-2xl sm:text-3xl font-black uppercase tracking-tight
     ├── Subsection heading?
     │   └── text-xl sm:text-2xl font-bold tracking-tight
     ├── Card or component title?
     │   └── text-lg font-bold
     ├── Primary body text?
     │   └── text-base text-foreground
     ├── Secondary/supporting text?
     │   └── text-sm text-muted-foreground
     ├── Meta information?
     │   └── text-xs text-muted-foreground
     ├── Label?
     │   └── text-sm font-medium
     └── Button text?
         └── text-sm font-bold uppercase
     ```

3. **Color Token Selection**:
   * Start with these base rules:
     * **Primary Actions**: `bg-primary text-primary-foreground`
     * **Secondary Actions**: `bg-secondary text-secondary-foreground`
     * **Destructive Actions**: `bg-destructive text-destructive-foreground`
     * **Backgrounds**: `bg-background` (main), `bg-card` (cards/elevated surfaces), `bg-muted` (subtle highlights)
     * **Text**: `text-foreground` (main), `text-muted-foreground` (secondary)
   * Decision Tree for Colors:
     ```
     What element are you styling?
     ├── Interactive element (button, link)?
     │   ├── Primary action → bg-primary text-primary-foreground
     │   ├── Secondary/alternative action → bg-secondary text-secondary-foreground
     │   ├── Destructive action → bg-destructive text-destructive-foreground
     │   ├── Outline/ghost variant → bg-transparent border-2 border-{semantic} text-{semantic}
     │   └── Text-only link → text-primary hover:underline
     ├── Container/surface?
     │   ├── Main page background → bg-background
     │   ├── Elevated component → bg-card text-card-foreground
     │   ├── Subtle distinction → bg-muted
     │   └── Status-based → bg-{semantic} text-{semantic}-foreground
     ├── Text content?
     │   ├── Primary text → text-foreground
     │   ├── Secondary text → text-muted-foreground
     │   ├── On colored background → text-{background}-foreground
     │   └── Status indication → text-{semantic}
     └── Borders and dividers?
         ├── Default border → border border-border
         ├── Emphasis border → border-2 border-{semantic}
         └── Subtle divider → border-muted
     ```

4. **Component Variant Selection**:
   * Start with these base rules:
     * **Primary Action Buttons**: `ds-button-primary` (bg-primary text-primary-foreground)
     * **Secondary Buttons**: `variant="secondary"` (bg-secondary text-secondary-foreground)
     * **Outline Buttons**: `ds-button-outline` or `variant="outline"` (transparent with border)
   * Decision Tree for Component Variants:
     ```
     What is the component's role?
     ├── Button
     │   ├── Primary action → ds-button-primary
     │   ├── Secondary action → variant="secondary" 
     │   ├── Tertiary action → variant="outline" or ds-button-outline
     │   ├── Destructive action → variant="destructive"
     │   ├── Navigation → variant="ghost"
     │   └── Size consideration:
     │       ├── Mobile → size="lg" or className="h-12"
     │       ├── Desktop standard → size="default"
     │       └── Compact UI → size="sm"
     ├── Card
     │   ├── Standard content → ds-card
     │   ├── Featured content → ds-card border-primary
     │   ├── Success state → ds-card border-success
     │   ├── Warning state → ds-card border-warning
     │   └── Error state → ds-card border-destructive
     ├── Input
     │   ├── Standard → default with h-12 md:h-10
     │   ├── With validation → border-{semantic}
     │   └── Disabled → opacity-50
     └── Navigation
         ├── Primary nav → bg-primary text-primary-foreground
         ├── Secondary nav → bg-muted
         └── Active state → data-[state=active]:bg-primary data-[state=active]:text-primary-foreground
     ```

5. **Layout Selection Guidelines**:
   * Start with these base rules:
     * **Container**: `container mx-auto px-4 sm:px-6 lg:px-8`
     * **Grid Layout**: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6`
     * **Flex Layout**: `flex flex-col sm:flex-row gap-4 sm:gap-6 items-center`
   * Decision Tree for Layouts:
     ```
     What layout pattern are you implementing?
     ├── Page layout
     │   ├── Standard page → container mx-auto px-4 sm:px-6 lg:px-8
     │   ├── Full-width → w-full
     │   └── App shell → flex flex-col min-h-screen
     ├── Section layout
     │   ├── One column → single column
     │   ├── Equal columns → grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-{2-4}
     │   ├── Main + sidebar → grid grid-cols-1 lg:grid-cols-12 with col-span
     │   └── Card grid → grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
     ├── Component layout
     │   ├── Horizontal alignment → flex justify-{start|center|end|between}
     │   ├── Vertical alignment → flex items-{start|center|end|stretch}
     │   ├── Direction → flex flex-col sm:flex-row (mobile-first)
     │   └── Wrapping → flex flex-wrap
     └── Item positioning
         ├── Center item → mx-auto (horizontal) or my-auto (vertical)
         ├── Responsive visibility → hidden md:block or block md:hidden
         ├── Fixed positioning → fixed {top|bottom|left|right}-0
         └── Z-index layers → z-{10|20|30|40|50} (navigation, modals, etc.)
     ```

6. **Mobile-First Decision Making**:
   * Start with smaller viewport sizes
   * Define the base styles for mobile, then use responsive prefixes for larger screens
   * Example Decision Process:
     ```
     1. Define base (mobile) style: `grid grid-cols-1 gap-4 p-4`
     2. Add tablet styles: `sm:grid-cols-2 sm:gap-6 sm:p-6`
     3. Add desktop styles: `lg:grid-cols-4 lg:gap-8`
     4. Consider touch targets: `h-12 md:h-10` (larger on mobile)
     5. Consider text sizes: `text-lg sm:text-xl lg:text-2xl`
     ```
   * When applying responsive utilities, always follow the mobile-first methodology with consistent breakpoint usage.

7. **Application Example with Decision Tree**:
   ```tsx
   // Decision process for a featured card component:
   // 1. Base component: Card
   // 2. Styling: Featured content → ds-card border-primary
   // 3. Spacing: Standard component → p-4 sm:p-6
   // 4. Layout: Vertical content → flex flex-col
   // 5. Typography: Card title → text-lg font-bold
   // 6. Action: Primary action → ds-button-primary

   function FeaturedCard() {
     return (
       <Card className="ds-card border-primary shadow-xs" data-slot="featured-card">
         <CardHeader className="p-4 sm:p-6">
           <CardTitle className="text-lg font-bold">Featured Content</CardTitle>
           <CardDescription className="text-sm text-muted-foreground">
             Important highlighted information
           </CardDescription>
         </CardHeader>
         <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
           <p className="text-base text-foreground mb-4">
             Main content of the featured card.
           </p>
           <div className="bg-muted p-3 rounded-xs">
             <p className="text-sm text-muted-foreground">
               Additional supporting information.
             </p>
           </div>
         </CardContent>
         <CardFooter className="p-4 sm:p-6 flex justify-end">
           <Button className="ds-button-primary">
             Take Action
           </Button>
         </CardFooter>
       </Card>
     );
   }
   ```