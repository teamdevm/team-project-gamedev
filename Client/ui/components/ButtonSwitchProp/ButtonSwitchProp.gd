extends Node

@export var MainScript:Control
@export var Prop:String

var _button:Button

func _ready():
	var parent = get_parent()
	if not parent is Button:
		queue_free()
		return
	_button = parent as Button
	_button.connect("pressed",_onPressed)

func _onPressed()->void:
	var val = MainScript.get(Prop)
	if val == null:
		return
	if not val is bool:
		return
	MainScript.set(Prop, not val)
