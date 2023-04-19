export function PascalCase(str: string) {
  return (
    str
      // snake_case or kebab-case
      .replace(/[_-]\w/g, (n) => n[1].toUpperCase())
      // camelCase
      .replace(/^\w/g, (n) => n.toUpperCase())
  )
}

export function camelCase(str: string) {
  return (
    str
      // snake_case or kebab-case
      .replace(/[_-]\w/g, (n) => n[1].toUpperCase())
      // PascalCase
      .replace(/^\w/g, (n) => n.toLowerCase())
  )
}

export function snake_case(str: string) {
  return (
    str
      // kebab-case
      .replace(/\-/g, '_')
      // PascalCase or camelCase
      .replace(/(?!^)[A-Z]/g, (n) => '_' + n.toLowerCase())
      // PascalCase
      .replace(/^[A-Z]/g, (n) => n.toLowerCase())
  )
}

export function kebab$case(str: string) {
  return (
    str
      // snake_case
      .replace(/_/g, '-')
      // PascalCase or camelCase
      .replace(/(?!^)[A-Z]/g, (n) => '-' + n.toLowerCase())
      // PascalCase
      .replace(/^[A-Z]/g, (n) => n.toLowerCase())
  )
}
