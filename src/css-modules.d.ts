/**
 * @fileoverview
 * CSS module type declarations
 *
 * Allows importing CSS files in TypeScript.
 *
 * @packageDocumentation
 */

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.scss' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.sass' {
  const content: { [className: string]: string };
  export default content;
}
