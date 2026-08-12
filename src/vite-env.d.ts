/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SIGNAL_CHAT_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
