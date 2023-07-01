extends Node

@export var MainScript:Control
@export var NotifySignal:String

var label:Label

func _ready():
	var parent = get_parent()
	if not parent is Label:
		queue_free()
		return
	label = parent as Label
	MainScript.connect(NotifySignal, _textChanged)

func _textChanged(new_text)->void:
	label.text = str(new_text)
