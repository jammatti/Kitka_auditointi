# Kela Design System - UI Components

Fully accessible, TypeScript-typed React components following the Kela Design System.

## Installation

All components are already included in the project. Import them from:

```tsx
import { Button, Input, Card, Modal, Alert } from './components/ui';
```

## Components

### Button

Versatile button component with variants, sizes, and loading states.

```tsx
import { Button } from './components/ui';

// Primary button
<Button variant="primary" onClick={handleClick}>
  Save Changes
</Button>

// Secondary button with icon
<Button variant="secondary" icon={<PlusIcon />}>
  Add Item
</Button>

// Loading state
<Button variant="primary" loading disabled>
  Saving...
</Button>

// Danger button (full width)
<Button variant="danger" fullWidth>
  Delete Account
</Button>

// Ghost button
<Button variant="ghost" size="sm">
  Cancel
</Button>
```

**Props:**
- `variant`: `'primary' | 'secondary' | 'danger' | 'ghost'` (default: `'primary'`)
- `size`: `'sm' | 'md' | 'lg'` (default: `'md'`)
- `loading`: `boolean` - Shows spinner and disables button
- `fullWidth`: `boolean` - Makes button full width
- `icon`: `ReactNode` - Icon before text
- `iconAfter`: `ReactNode` - Icon after text
- All native button HTML attributes

---

### Input & Textarea

Text input with label, validation, and error messages.

```tsx
import { Input, Textarea } from './components/ui';

// Basic input
<Input
  label="Email Address"
  type="email"
  placeholder="Enter your email"
  required
/>

// Input with helper text
<Input
  label="Username"
  helperText="Choose a unique username (3-20 characters)"
  minLength={3}
  maxLength={20}
/>

// Input with error
<Input
  label="Password"
  type="password"
  error="Password must be at least 8 characters"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
/>

// Textarea
<Textarea
  label="Description"
  helperText="Describe the issue in detail"
  rows={5}
/>

// Number input
<Input
  label="Annual Customers"
  type="number"
  min={0}
  defaultValue={1000}
/>
```

**Props:**
- `label`: `string` - Input label
- `helperText`: `string` - Helper text below input
- `error`: `string` - Error message (shows error state)
- `required`: `boolean` - Adds asterisk to label
- `type`: `'text' | 'number' | 'email' | 'password' | 'tel' | 'url' | 'search'`
- `fullWidth`: `boolean` (default: `true`)
- All native input/textarea HTML attributes

---

### Select

Dropdown select with option groups support.

```tsx
import { Select } from './components/ui';

// Basic select
<Select
  label="Actor Type"
  placeholder="Select actor type"
  options={[
    { value: 'customer', label: 'Customer' },
    { value: 'caseworker', label: 'Caseworker' },
    { value: 'specialist', label: 'Specialist' },
  ]}
  value={actorType}
  onChange={(e) => setActorType(e.target.value)}
/>

// Select with option groups
<Select
  label="Behavior Type"
  optionGroups={[
    {
      label: 'Reading & Understanding',
      options: [
        { value: 'RU-01', label: 'Reading instructions' },
        { value: 'RU-02', label: 'Understanding eligibility' },
      ],
    },
    {
      label: 'Interacting',
      options: [
        { value: 'IN-01', label: 'Calling or messaging' },
        { value: 'IN-02', label: 'Visiting in person' },
      ],
    },
  ]}
/>

// Select with error
<Select
  label="Status"
  error="Please select a status"
  required
  options={statusOptions}
/>
```

**Props:**
- `label`: `string`
- `placeholder`: `string`
- `options`: `SelectOption[]` - Flat list of options
- `optionGroups`: `SelectOptionGroup[]` - Grouped options
- `helperText`: `string`
- `error`: `string`
- `required`: `boolean`
- `fullWidth`: `boolean` (default: `true`)

---

### Card

Container component with header, body, and footer sections. Supports collapsible mode.

```tsx
import { Card, CardHeader, CardTitle, CardBody, CardFooter } from './components/ui';

// Basic card
<Card>
  <CardHeader>
    <CardTitle>Audit Details</CardTitle>
  </CardHeader>
  <CardBody>
    <p>Card content goes here...</p>
  </CardBody>
  <CardFooter>
    <Button variant="primary">Save</Button>
    <Button variant="ghost">Cancel</Button>
  </CardFooter>
</Card>

// Collapsible card
<Card collapsible defaultCollapsed={false}>
  <CardHeader>
    <CardTitle as="h2">Phase 1: Application</CardTitle>
  </CardHeader>
  <CardBody>
    This content can be collapsed...
  </CardBody>
</Card>

// Controlled collapsible card
<Card
  collapsible
  collapsed={isCollapsed}
  onCollapsedChange={setIsCollapsed}
>
  <CardHeader>
    <CardTitle>Details</CardTitle>
  </CardHeader>
  <CardBody>
    Content here
  </CardBody>
</Card>
```

**Props:**
- `Card`:
  - `collapsible`: `boolean` - Enable collapse functionality
  - `defaultCollapsed`: `boolean` - Default collapsed state
  - `collapsed`: `boolean` - Controlled collapsed state
  - `onCollapsedChange`: `(collapsed: boolean) => void`

- `CardTitle`:
  - `as`: `'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'` (default: `'h3'`)

---

### Table

Responsive table with sortable headers.

```tsx
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
  useSortableTable,
} from './components/ui';

// Basic table
<Table>
  <TableHead>
    <TableRow>
      <TableHeader>Name</TableHeader>
      <TableHeader>Status</TableHeader>
      <TableHeader>Created</TableHeader>
    </TableRow>
  </TableHead>
  <TableBody>
    {audits.map((audit) => (
      <TableRow key={audit.id}>
        <TableCell>{audit.process_name}</TableCell>
        <TableCell>{audit.status}</TableCell>
        <TableCell>{audit.created_at}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>

// Sortable table with hook
function AuditTable({ data }) {
  const { sortedData, sortKey, sortDirection, handleSort } = useSortableTable({
    data,
    defaultSortKey: 'created_at',
    defaultSortDirection: 'desc',
  });

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeader
            sortable
            sortDirection={sortKey === 'process_name' ? sortDirection : null}
            onSort={() => handleSort('process_name')}
          >
            Process Name
          </TableHeader>
          <TableHeader
            sortable
            sortDirection={sortKey === 'status' ? sortDirection : null}
            onSort={() => handleSort('status')}
          >
            Status
          </TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {sortedData.map((row) => (
          <TableRow key={row.id}>
            <TableCell>{row.process_name}</TableCell>
            <TableCell>{row.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

**Props:**
- `Table`:
  - `responsive`: `boolean` (default: `true`) - Makes table scrollable on mobile

- `TableHeader`:
  - `sortable`: `boolean` - Makes header clickable for sorting
  - `sortDirection`: `'asc' | 'desc' | null` - Current sort direction
  - `onSort`: `() => void` - Callback when header is clicked

- `TableCell`:
  - `align`: `'left' | 'center' | 'right'` (default: `'left'`)

**Hook: useSortableTable**
```tsx
const { sortedData, sortKey, sortDirection, handleSort } = useSortableTable({
  data: myData,
  defaultSortKey: 'name',
  defaultSortDirection: 'asc',
});
```

---

### Modal

Accessible dialog with focus trap and escape key support.

```tsx
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from './components/ui';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>

      <Modal open={isOpen} onClose={() => setIsOpen(false)}>
        <ModalHeader onClose={() => setIsOpen(false)}>
          <ModalTitle>Confirm Action</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <p>Are you sure you want to delete this audit?</p>
        </ModalBody>
        <ModalFooter>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
          <Button variant="ghost" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}

// Large modal
<Modal open={open} onClose={onClose} size="lg">
  ...
</Modal>

// Disable backdrop click
<Modal
  open={open}
  onClose={onClose}
  disableBackdropClick
  disableEscapeKey
>
  ...
</Modal>
```

**Props:**
- `Modal`:
  - `open`: `boolean` (required)
  - `onClose`: `() => void` (required)
  - `size`: `'sm' | 'md' | 'lg' | 'xl'` (default: `'md'`)
  - `disableBackdropClick`: `boolean`
  - `disableEscapeKey`: `boolean`

- `ModalHeader`:
  - `showClose`: `boolean` (default: `true`)
  - `onClose`: `() => void`

- `ModalTitle`:
  - `as`: `'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'` (default: `'h2'`)

**Accessibility Features:**
- Focus trap (tab cycles within modal)
- Auto-focus first interactive element
- Escape key to close (unless disabled)
- Backdrop click to close (unless disabled)
- Restores focus to trigger element on close
- Prevents body scroll when open

---

### Alert

Status messages with dismissible option.

```tsx
import { Alert } from './components/ui';

// Info alert
<Alert variant="info">
  Your changes have been saved.
</Alert>

// Success alert with title
<Alert variant="success" title="Success!">
  The audit has been created successfully.
</Alert>

// Warning alert
<Alert variant="warning" title="Warning">
  This action cannot be undone.
</Alert>

// Error alert with dismiss
<Alert
  variant="error"
  title="Error"
  dismissible
  onDismiss={() => console.log('Dismissed')}
>
  Failed to save changes. Please try again.
</Alert>

// Custom icon
<Alert variant="info" icon={<CustomIcon />}>
  Custom icon alert
</Alert>
```

**Props:**
- `variant`: `'info' | 'success' | 'warning' | 'error'` (default: `'info'`)
- `title`: `string` - Optional title
- `dismissible`: `boolean` - Show dismiss button
- `onDismiss`: `() => void` - Callback when dismissed
- `icon`: `ReactNode` - Custom icon (overrides default)

---

## Accessibility

All components follow WCAG 2.1 AA standards:

- ✅ **Keyboard Navigation** - All interactive elements are keyboard accessible
- ✅ **Focus Management** - Visible focus indicators, logical tab order
- ✅ **ARIA Attributes** - Proper roles, labels, and states
- ✅ **Screen Reader Support** - Meaningful labels and announcements
- ✅ **Color Contrast** - Meets minimum contrast ratios
- ✅ **Touch Targets** - Minimum 44×44px touch areas

## Styling

Components use CSS classes from the Kela Design System:

```css
/* Import the design system */
@import './styles/kela-design-system.css';
```

All components accept a `className` prop for custom styling:

```tsx
<Button className="my-custom-class">Click me</Button>
```

## TypeScript

All components are fully typed with TypeScript:

```tsx
import type { ButtonProps, InputProps, ModalProps } from './components/ui';

const MyButton: React.FC<ButtonProps> = (props) => {
  return <Button {...props} />;
};
```

## Examples

See the `src/pages` directory for complete examples of component usage.

## Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)
