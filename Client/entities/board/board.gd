extends Node2D

@export var field_size = 15
@export var field_tile = Vector2i (5, 12)

signal click_coord 
# Called when the node enters the scene tree for the first time.
func _ready():
	var tls = get_child(1)
	for i in range(0, field_size):
		for j in range(0, field_size):
				tls.set_cell(0, Vector2i (i, j), 1, field_tile)
	get_tree().get_root().connect("size_changed", _resize)
	_resize()

# словарь
# тут должны быть координаты тайлов с соответствкующими буквами 
var letterTiles = {
	"А": Vector2i (0, 0),
	"Б": Vector2i (1, 0),
	"В": Vector2i (2, 0),
	"Г": Vector2i (3, 0),
	"Д": Vector2i (4, 0),
	"Е": Vector2i (0, 1),
	"Ж": Vector2i (1, 1),
	"З": Vector2i (2, 1),
	"И": Vector2i (3, 1),
	"Й": Vector2i (4, 1),
	"К": Vector2i (0, 2),
	"Л": Vector2i (1, 2),
	"М": Vector2i (2, 2),
	"Н": Vector2i (3, 2),
	"О": Vector2i (4, 2),
	"П": Vector2i (0, 3),
	"Р": Vector2i (1, 3),
	"С": Vector2i (2, 3),
	"Т": Vector2i (3, 3),
	"У": Vector2i (4, 3),
	"Ф": Vector2i (0, 4),
	"Х": Vector2i (1, 4),
	"Ц": Vector2i (2, 4),
	"Ч": Vector2i (3, 4),
	"Ш": Vector2i (4, 4),
	"Щ": Vector2i (0, 5),
	"Ь": Vector2i (3, 5),
	"Ы": Vector2i (2, 5),
	"Ъ": Vector2i (1, 5),
	"Э": Vector2i (4, 5),
	"Ю": Vector2i (0, 6),
	"Я": Vector2i (1, 6),
	"*": Vector2i (2, 6),
	" ": Vector2i (-1,-1)
}

func setChips(coord:Vector2i, letter) -> String:
	var tls = get_child(1) as TileMap
	var tileCoord = letterTiles[letter]
	var prevCellAtlas = tls.get_cell_atlas_coords(0, coord)
	tls.set_cell(0, coord, 0, tileCoord)
	var prevLetter = letterTiles.find_key(prevCellAtlas)
	if prevLetter == null:
		prevLetter = " "
	return prevLetter

func _input(_event):
	var tls = get_child(1)
	if Input.is_action_just_pressed("Click"):
		var global_pos = get_global_mouse_position()-self.position
		var coord = tls.local_to_map(global_pos/self.scale)
		if (coord.x < field_size and coord.y < field_size):
			click_coord.emit(coord)

func _resize():
	var new_scale = 0.240 * get_viewport_rect().size.y / 666
	self.scale.x = new_scale
	self.scale.y = new_scale
	self.position = get_viewport_rect().size / 2 - Vector2(750, 880) * self.scale
