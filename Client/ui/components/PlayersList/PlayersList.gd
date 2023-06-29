extends Node

@export var MainScript:Control
@export var AddPlayerSignal:String
@export var RemovePlayerSignal:String
@export var List:String

var _list:ItemList

func _ready():
	var parent = get_parent()
	if not parent is ItemList:
		queue_free()
		return
	_list = parent as ItemList
	MainScript.connect(AddPlayerSignal, TotalRefresh)
	MainScript.connect(RemovePlayerSignal, TotalRefresh)
	TotalRefresh("")

func _exit_tree():
	_list.disconnect(AddPlayerSignal, TotalRefresh)
	_list.disconnect(RemovePlayerSignal, TotalRefresh)

func TotalRefresh(uuid):
	_list.clear()
	var users = MainScript.get(List) as Array
	for usr in users:
		_list.add_item(usr['name'])



