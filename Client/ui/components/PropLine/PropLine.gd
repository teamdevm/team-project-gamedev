extends Node

@export var MainScript:Control
@export var Prop:String

var Line:LineEdit

func _ready()->void:
	var parent = get_parent()
	if not parent is LineEdit:
		queue_free()
		return
	Line = parent as LineEdit
	Line.connect("text_changed", _textChanged)

func _exit_tree()->void:
	Line.disconnect("text_changed", _textChanged)

func _textChanged(new_text:String)->void:
	MainScript.set(Prop, new_text)
