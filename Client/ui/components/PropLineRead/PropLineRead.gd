extends Node

@export var MainScript:Control
@export var Field:String

var _line:LineEdit

func _ready():
	if not get_parent() is LineEdit:
		queue_free()
		return
	_line = get_parent() as LineEdit
	_line.text = MainScript.get(Field)


