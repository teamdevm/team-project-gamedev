extends Node

@export var MainScript:Control
@export var ListChangedSignal:String
@export var List:String
@export var SelfIndex:String

var _list:BoxContainer

func _ready():
	var parent = get_parent()
	if not parent is BoxContainer:
		queue_free()
		return
	_list = parent as BoxContainer
	TotalRefresh()
	MainScript.connect(ListChangedSignal, TotalRefresh)

func TotalRefresh():
	for ch in _list.get_children():
		if ch != self:
			ch.call_deferred("queue_free")
	var users = MainScript.get(List) as Array
	for usr in users:
		var line = Label.new()
		line.text = usr["name"]
		if usr["index"] == MainScript.get(SelfIndex):
			line.modulate = Color.YELLOW
		_list.call_deferred("add_child", line)

