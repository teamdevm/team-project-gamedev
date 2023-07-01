extends Node

@export var MainScript:Control
@export var Function:String

var _button:Button

func _ready():
	var parent = get_parent()
	if not parent is Button:
		queue_free()
		return
	_button = parent as Button
	_button.connect("pressed",_onPressed)

func _onPressed()->void:
	MainScript.call_deferred(Function)
