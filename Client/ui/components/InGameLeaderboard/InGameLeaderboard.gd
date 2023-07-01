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

func TotalRefresh()->void:
	for ch in _list.get_children():
		if ch != self:
			ch.call_deferred("queue_free")
	var users = MainScript.get(List) as Array
	users.sort_custom(sort_descending)
	for usr in users:
		var line = load("res://assets/ui/elements/LeaderboardRow/LeaderboardRow.tscn").instantiate()
		var nameLabel = line.get_node("NameLabel") as RichTextLabel
		var scoreLabel = line.get_node("ScoreLabel") as RichTextLabel
		nameLabel.text = usr["name"]
		scoreLabel.text = "[b]"+str(usr["score"])+"[/b]"
		if usr["index"] == MainScript.get(SelfIndex):
			line.modulate = Color.YELLOW
		_list.call_deferred("add_child", line)
	

func sort_descending(a, b):
	if a["score"] > b["score"]:
		return true
	return false

