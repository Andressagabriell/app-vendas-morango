import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ehzjetufkyevrpgentyr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVoempldHVma3lldnJwZ2VudHlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4NTc5NDIsImV4cCI6MjA4NDQzMzk0Mn0.Bd9NDZZclYJhxqlXWW0wPHIUzBb5on_ZVktuym9s058'

export const supabase = createClient(supabaseUrl, supabaseKey)