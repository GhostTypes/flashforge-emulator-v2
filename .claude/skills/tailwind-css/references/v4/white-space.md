---
title: white-space
description: Utilities for controlling an element's white-space property.
---

## Examples

### Normal

Use the `whitespace-normal` utility to cause text to wrap normally within an element. Newlines and spaces will be collapsed:

  />

  }

```html
<!-- [!code classes:whitespace-normal] -->
<!-- prettier-ignore -->
<p class="whitespace-normal">Hey everyone!

It's almost 2022  and we still don't know if there  are aliens living among us, or do we? Maybe the person writing this is an alien.

You will never know.</p>
```

### No Wrap

Use the `whitespace-nowrap` utility to prevent text from wrapping within an element. Newlines and spaces will be collapsed:

  />

  }

```html
<!-- [!code classes:whitespace-nowrap] -->
<!-- prettier-ignore -->
<p class="overflow-auto whitespace-nowrap">Hey everyone!

It's almost 2022  and we still don't know if there  are aliens living among us, or do we? Maybe the person writing this is an alien.

You will never know.</p>
```

### Pre

Use the `whitespace-pre` utility to preserve newlines and spaces within an element. Text will not be wrapped:

  />

  }

```html
<!-- [!code classes:whitespace-pre] -->
<!-- prettier-ignore -->
<p class="overflow-auto whitespace-pre">Hey everyone!

It's almost 2022  and we still don't know if there  are aliens living among us, or do we? Maybe the person writing this is an alien.

You will never know.</p>
```

### Pre Line

Use the `whitespace-pre-line` utility to preserve newlines but not spaces within an element. Text will be wrapped normally:

  />

  }

```html
<!-- [!code classes:whitespace-pre-line] -->
<!-- prettier-ignore -->
<p class="whitespace-pre-line">Hey everyone!

It's almost 2022  and we still don't know if there  are aliens living among us, or do we? Maybe the person writing this is an alien.

You will never know.</p>
```

### Pre Wrap

Use the `whitespace-pre-wrap` utility to preserve newlines and spaces within an element. Text will be wrapped normally:

  />

  }

```html
<!-- [!code classes:whitespace-pre-wrap] -->
<!-- prettier-ignore -->
<p class="whitespace-pre-wrap">Hey everyone!

It's almost 2022  and we still don't know if there  are aliens living among us, or do we? Maybe the person writing this is an alien.

You will never know.</p>
```

### Break Spaces

Use the `whitespace-break-spaces` utility to preserve newlines and spaces within an element. White space at the end of lines will not hang, but will wrap to the next line:

  />

  }

```html
<!-- [!code classes:whitespace-break-spaces] -->
<!-- prettier-ignore -->
<p class="whitespace-break-spaces">Hey everyone!

It's almost 2022  and we still don't know if there  are aliens living among us, or do we? Maybe the person writing this is an alien.

You will never know.</p>
```

### Responsive design