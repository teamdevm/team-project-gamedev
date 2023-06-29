extends Node

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

func OnPieceSelected(index:int)->void:
	_pieace.flat = index == Index
	

func SelectThisPiece()->void:
	MainScript.call(SelectFunction, Index)
