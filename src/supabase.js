// src/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bylzecjnakegmwvegpyr.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5bHplY2puYWtlZ213dmVncHlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjYzODYzNiwiZXhwIjoyMDYyMjE0NjM2fQ.avTsu4RuiJNSxvMnZ_9mGr3H555ehJgomTRrbVpGEcw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
