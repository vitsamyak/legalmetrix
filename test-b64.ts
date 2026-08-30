import { encodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";
const buf = new ArrayBuffer(10);
console.log(encodeBase64(buf));
