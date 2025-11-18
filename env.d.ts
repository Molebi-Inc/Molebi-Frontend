/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
  glob: <T = unknown>(
    pattern: string,
    options?: {
      eager?: boolean
      import?: string
    },
  ) => Record<string, T>
}

declare module 'virtual:svg-icons-register' {
  const register: () => void
  export default register
}
