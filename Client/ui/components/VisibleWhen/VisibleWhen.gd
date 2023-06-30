extends Node

@export var MainScript:Control
@export var Notify:String
@export var Invert:bool = false

func _ready():
	if not get_parent() is Control:
		queue_free()
		return
	MainScript.connect(Notify, onChange)

func onChange(visible)->void:
	(get_parent() as Control).visible = not visible if Invert else visible
