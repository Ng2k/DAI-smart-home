SELECT *
FROM reading_events
WHERE component_id = $1 AND type = 'READING_CREATED'
ORDER BY created_at DESC
LIMIT 1;
