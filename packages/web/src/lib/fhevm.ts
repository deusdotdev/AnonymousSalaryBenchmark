export function toHexHandle(value: string | Uint8Array): `0x${string}` {
  if (typeof value === "string") {
    return value as `0x${string}`;
  }
  const hex = Buffer.from(value).toString("hex");
  return `0x${hex}` as `0x${string}`;
}
