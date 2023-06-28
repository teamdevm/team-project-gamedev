extends Node2D

@export var field_size = 15
@export var field_tile = Vector2i (5, 12)

signal click_coord 
# Called when the node enters the scene tree for the first time.
func _ready():
	var tls = get_child(0)
	for i in range(0, field_size):
		for j in range(0, field_size):
				tls.set_cell(0, Vector2i (i, j), 1, field_tile)

# словарь
# тут должны быть координаты тайлов с соответствкующими буквами 
var letterTiles = {
	"A": Vector2i (0, 0),
	"B": Vector2i (1, 1),
	"C": Vector2i (2, 2)
}

func setChips(coord:Vector2i, letter):       #установка фишки по ее координатам 
	var tls = get_child(0)
	var tileCoord = letterTiles[letter]
	tls.set_cell(0, coord, 1, tileCoord)

func _input(event):
	var tls = get_child(0)
	if Input.is_action_just_pressed("Click"):
		var coord = tls.local_to_map(event.position)
		if (coord.x < field_size and coord.y < field_size):
			click_coord.emit(coord)


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	pass

