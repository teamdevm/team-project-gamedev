extends Node

signal click_coord 
# Called when the node enters the scene tree for the first time.
func _ready():
	pass # Replace with function body.

func _input(event):
	var tls = get_parent()
	if Input.is_action_pressed("Click"):
		var coord = tls.local_to_map(event.position)
		click_coord.emit(coord)
#	if event is InputEventMouseMotion:
#		var coord_tile2 = tls.local_to_map(event.position)
#		var cid = tls.get_cellv(coord_tile2)
		#print(coord_tile2)
		#print(tls.set_source_id(0, coord_tile2))
		#tls.set_cell(0, coord_tile2, 10, Vector2i(1, 0), 10)
		
# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	pass
	


