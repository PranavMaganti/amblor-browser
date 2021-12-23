import { createClient } from "@supabase/supabase-js";

const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYyODQzMzg0MywiZXhwIjoxOTQ0MDA5ODQzfQ.iNIHM2rexIuFA31iuCqR9GcbIkRACudL5VWGBJQrMKk";
const supabaseUrl = "https://rbtjlwyltzlpkrjzhqgs.supabase.co";
export const supabase = createClient(supabaseUrl, supabaseKey);

export function getAuthUrl(provider: string, redirectUrl: string) {
  return `${supabaseUrl}/auth/v1/authorize?provider=${provider}&redirect_to=${redirectUrl}`;
}
