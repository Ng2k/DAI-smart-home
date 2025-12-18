INSERT INTO reading_events (
	component_id,
	category,
	type,
	value,
	status,
	uom,
	created_by
) VALUES (
	$1,
	$2,
	'READING_CREATED',
	$3,
	'',
	$4,
	$5
)
