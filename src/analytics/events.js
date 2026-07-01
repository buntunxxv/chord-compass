import { supabase } from '../supabase'

// Fire-and-forget event log — never blocks or throws into the UI
export function logEvent(eventType, meta = {}) {
  supabase.from('chord_compass_events').insert({ event_type: eventType, meta }).then(
    () => {},
    () => {}
  )
}
