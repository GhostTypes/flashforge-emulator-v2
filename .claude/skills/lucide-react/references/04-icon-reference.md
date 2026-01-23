# Lucide Icon Reference

## Finding Icons

Browse the full icon library at: https://lucide.dev/icons/

## Icon Categories

### Arrows
- `arrow-up`, `arrow-down`, `arrow-left`, `arrow-right`
- `chevron-up`, `chevron-down`, `chevron-left`, `chevron-right`
- `chevrons-up`, `chevrons-down`, `chevrons-left`, `chevrons-right`
- `arrow-up-down`, `arrow-left-right`

### Media
- `play`, `pause`, `stop`, `forward`, `rewind`
- `volume`, `volume-1`, `volume-2`, `volume-x`
- `mic`, `mic-off`, `video`, `video-off`
- `image`, `film`, `camera`, `camera-off`

### UI Elements
- `menu`, `x`, `check`, `circle-check`, `circle-x`
- `search`, `settings`, `more-horizontal`, `more-vertical`
- `bell`, `bell-ring`, `alert-circle`, `alert-triangle`
- `info`, `help-circle`, `question-mark`

### Files & Documents
- `file`, `file-text`, `file-image`, `file-video`
- `folder`, `folder-open`, `folder-plus`, `folder-minus`
- `copy`, `cut`, `clipboard`, `clipboard-check`

### Communication
- `mail`, `send`, `message-square`, `message-circle`
- `phone`, `phone-call`, `phone-incoming`, `phone-outgoing`
- `at-sign`, `share`, `share-2`

### User & People
- `user`, `user-plus`, `user-minus`, `user-check`
- `users`, `users-round`
- `heart`, `hand`, `handshake`

### Navigation
- `home`, `map`, `map-pin`, `compass`
- `navigation`, `navigation-2`
- `locate`, `locate-fixed`

### Devices & Tech
- `laptop`, `monitor`, `smartphone`, `tablet`
- `mouse`, `keyboard`, `hard-drive`
- `wifi`, `bluetooth`, `usb`

### Editing
- `edit`, `edit-2`, `edit-3`
- `type`, `highlighter`, `eraser`
- `scissors`, `copy`, `paste`

### Shopping & Commerce
- `shopping-cart`, `shopping-bag`, `shopping-basket`
- `credit-card`, `banknote`, `wallet`
- `tag`, `tags`, `percent`

### Time & Calendar
- `calendar`, `clock`, `timer`, `hourglass`
- `alarm-clock`, `watch`, `sunset`, `sunrise`

### Weather
- `sun`, `moon`, `cloud`, `cloud-rain`
- `snowflake`, `wind`, `umbrella`

### Shapes
- `circle`, `square`, `triangle`
- `star`, `heart`, `diamond`

## Common Icon Patterns

### State Icons
```jsx
// Loading states
<Loader2 className="animate-spin" />
<RefreshCw className="animate-spin" />

// Success/Error/Warning
<CheckCircle className="text-green-500" />
<XCircle className="text-red-500" />
<AlertTriangle className="text-yellow-500" />
```

### Navigation Icons
```jsx
// Back/Forward
<ChevronLeft />
<ChevronRight />

// Home/External
<Home />
<ExternalLink />
```

### Action Icons
```jsx
// CRUD operations
<Plus />    // Create
<Pencil />  // Update
<Trash2 />  // Delete
<Eye />     // Read/View
```

## Icon Naming Convention

Icons use **kebab-case** naming:
- Multi-word concepts: `arrow-up-circle`, `check-square`
- Alternates use suffixes: `alert-circle`, `alert-triangle`
- Variations: `chevron-down`, `chevrons-down` (plural = double)

## Import Examples

```jsx
// Single icon
import { Camera } from 'lucide-react';

// Multiple icons
import { Camera, Heart, Star, User } from 'lucide-react';

// From subpath (rarely needed)
import Camera from 'lucide-react/dist/esm/icons/camera';
```
