class_name SelectablePiece_Component extends Node

@export var MainScript:Control
@export var Index:int
@export var SelectFunction:String
@export var SelectedSignal:String

var _pieace:Button

func _ready():
	var parent = get_parent()
	if not parent is Button:
		queue_free()
		return
	_pieace = parent as Button
	MainScript.connect("PieceSelected", OnPieceSelected)
	_pieace.connect("pressed", SelectThisPiece)

func OnPieceSelected(indexes)->void:
	_pieace.flat = indexes.has(Index)

func SelectThisPiece()->void:
	MainScript.call(SelectFunction, Index, _pieace.text)
