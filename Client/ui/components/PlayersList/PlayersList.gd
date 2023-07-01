extends Node

@export var MainScript:Control
@export var ListChangedSignal:String
@export var List:String

var _list:ItemList

func _ready():
	var parent = get_parent()
	if not parent is ItemList:
		queue_free()
		return
	_list = parent as ItemList
	TotalRefresh()
	MainScript.connect(ListChangedSignal, TotalRefresh)

func TotalRefresh():
	_list.clear()
	var users = MainScript.get(List) as Array
	for usr in users:
		_list.add_item(usr['name'])



