// Deno type declarations for TypeScript in IDE
declare global {
  const Deno: {
    env: {
      get(key: string): string | undefined;
    };
    serve(handler: (req: Request) => Promise<Response>): void;
  };
}

// External module declarations for Deno environment
declare module "https://esm.sh/@supabase/supabase-js@2" {
  export function createClient(url: string, key: string, options?: any): any;
}

declare module "npm:nodemailer@6" {
  export function createTransport(config: any): {
    sendMail(options: any): Promise<{ messageId: string }>;
  };
}

declare module "https://esm.sh/*" {
  const content: any;
  export default content;
}

declare module "npm:*" {
  const content: any;
  export default content;
}

// Web API declarations
declare const fetch: (input: string | Request, init?: RequestInit) => Promise<Response>;
declare const Response: typeof globalThis.Response;
declare const Request: typeof globalThis.Request;
declare const Headers: typeof globalThis.Headers;
declare const console: typeof globalThis.console;
declare const JSON: typeof globalThis.JSON;
declare const TextEncoder: typeof globalThis.TextEncoder;
declare const TextDecoder: typeof globalThis.TextDecoder;
declare const URL: typeof globalThis.URL;
declare const URLSearchParams: typeof globalThis.URLSearchParams;
declare const setTimeout: (callback: () => void, delay: number) => number;
declare const clearTimeout: (id: number) => void;
declare const setInterval: (callback: () => void, delay: number) => number;
declare const clearInterval: (id: number) => void;

export {};
