export const EncodingType = { Base64: "base64", UTF8: "utf8" } as const;
export const documentDirectory = "/mock/doc/";
export async function readAsStringAsync(uri: string, opts?: any) {
  // return a predictable base64 string for testing
  return "YmFzZTY0aW5wdXQ="; // 'base64input' in base64
}
export async function writeAsStringAsync(
  path: string,
  content: string,
  opts?: any
) {
  // noop in mock
  return;
}
