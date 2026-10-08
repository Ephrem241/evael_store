// Up to two letters from a person's name, for an avatar with no photo:
// "Abebe Kebede" → "AK", "Selam" → "S". Ethiopic names work the same way (the
// first character of the first and last word). A blank name gives "?".
export function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return "?"
  const first = Array.from(words[0])[0]
  const last = words.length > 1 ? Array.from(words[words.length - 1])[0] : ""
  return `${first}${last}`.toLocaleUpperCase()
}
