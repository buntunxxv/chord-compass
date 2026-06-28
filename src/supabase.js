import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://lkkcmiywhwnquqysyghb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxra2NtaXl3aHducXVxeXN5Z2hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5Mjk1MzYsImV4cCI6MjA5MTUwNTUzNn0.LsOWdW6K8_A5x4P2zSH5d4Me8baRbumaPzDg-e4ZJws'
)
