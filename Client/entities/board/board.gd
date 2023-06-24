extends Node2D

signal click_coord 
# Called when the node enters the scene tree for the first time.
func _ready():
	pass # Replace with function body.

# словарь
# тут должны быть координаты тайлов с соответствкующими буквами 
var letterTiles = {
	"A": Vector2i (0, 0),
	"C": Vector2i (2, 2)
}

func setChips(coord:Vector2i, letter):       #установка фишки по ее координатам 
	var tls = get_child(0)
	var tileCoord = letterTiles[letter]
	tls.set_cell(0, coord, 0, tileCoord)
	pass

func _input(event):
	var tls = get_child(0)
	if Input.is_action_pressed("Click"):
		var coord = tls.local_to_map(event.position)
		click_coord.emit(coord)
		setChips(coord, "C")


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	pass

