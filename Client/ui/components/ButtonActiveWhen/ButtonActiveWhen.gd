extends Node

@export var MainScript:Control
@export var Notify:String

func _ready():
	if not get_parent() is Button:
		queue_free()
		return
	MainScript.connect(Notify, onChange)

func onChange(visible:bool)->void:
	(get_parent() as Button).disabled = not visible
