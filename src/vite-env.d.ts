/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Set only by `.env.inspect` for design-inspection builds. */
  readonly VITE_INSPECT_SESSION?: string;
}
