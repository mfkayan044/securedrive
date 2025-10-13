/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly MODE: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_QNB_TEST_MERCHANT_ID: string
  readonly VITE_QNB_TEST_MERCHANT_PASS: string
  readonly VITE_QNB_TEST_USER_CODE: string
  readonly VITE_QNB_TEST_USER_PASS: string
  readonly VITE_QNB_TEST_TERMINAL_ID: string
  readonly VITE_QNB_MERCHANT_ID: string
  readonly VITE_QNB_MERCHANT_PASS: string
  readonly VITE_QNB_USER_CODE: string
  readonly VITE_QNB_USER_PASS: string
  readonly VITE_QNB_TERMINAL_ID: string
  readonly VITE_QNB_ENVIRONMENT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
