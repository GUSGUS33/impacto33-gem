import { describe, it, expect } from "vitest";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config();

describe("Supabase Connection", () => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  it("should have VITE_SUPABASE_URL configured", () => {
    expect(supabaseUrl).toBeDefined();
    expect(supabaseUrl).not.toBe("");
    expect(supabaseUrl).toContain("supabase.co");
  });

  it("should have VITE_SUPABASE_ANON_KEY configured", () => {
    expect(supabaseAnonKey).toBeDefined();
    expect(supabaseAnonKey).not.toBe("");
    expect(supabaseAnonKey!.startsWith("eyJ")).toBe(true);
  });

  it("should connect to Supabase and get a valid response", async () => {
    expect(supabaseUrl).toBeDefined();
    expect(supabaseAnonKey).toBeDefined();

    const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

    // Test lightweight: verificar que el cliente se inicializa y puede hacer una petición básica
    const { error } = await supabase.auth.getSession();

    // getSession() no debería lanzar error de conexión si las credenciales son válidas
    // Un error de "no session" es aceptable (usuario no logueado), pero no un error de red/auth
    if (error) {
      // Solo falla si es un error de credenciales inválidas, no de sesión vacía
      expect(error.message).not.toContain("Invalid API key");
      expect(error.message).not.toContain("invalid_token");
    } else {
      expect(error).toBeNull();
    }
  }, 10000);
});
