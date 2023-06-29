extends Node

@export var MainScript:Control
@export var Function:String

var _button:Button

func _ready()->void:
	var parent = get_parent()
	if not parent is Button:
		queue_free()
		return
	_button = parent as Button
	_button.connect("pressed", _pressed)

func  _exit_tree()->void:
	_button.disconnect("pressed", _pressed)

func _pressed()->void:
	MainScript.call(Function)
