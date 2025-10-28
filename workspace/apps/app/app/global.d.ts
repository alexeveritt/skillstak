// app/global.d.ts
declare module "*.css?url" {
  const url: string;
  export default url;
}

declare global {
  interface Window {
    ENV?: {
      SENTRY_DSN?: string;
      SENTRY_ENVIRONMENT?: string;
    };
  }
}

export {};
