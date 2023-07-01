extends Node

@export var MainScript:Control
@export var RefreshSignal:String
@export var SelectFunction:String
@export var SelectedSignal:String

var _container:BoxContainer

func _ready():
	var parent = get_parent()
	if not parent is BoxContainer:
		queue_free()
		return
	_container = parent
	MainScript.connect(RefreshSignal, RefreshPieces)

func RefreshPieces(hand_literals)->void:
	for ch in _container.get_children():
		if ch == self:
			continue
		ch.queue_free()
		
	var index = 0
	for literal in hand_literals:
		if literal == null:
			index += 1
			continue
		var piece = load("res://assets/ui/elements/Piece/Piece.tscn").instantiate() as Button
		piece.text = literal
		piece.get_node("ScoreLabel").text = str(ChipsScores.Scores[literal])
		var piece_component = load("res://ui/components/SelectablePiece/SelectablePiece.tscn").instantiate() as SelectablePiece_Component
		piece_component.MainScript = MainScript
		piece_component.Index = index
		piece_component.SelectFunction = SelectFunction
		piece_component.SelectedSignal = SelectedSignal
		index += 1
		_container.add_child(piece)
		piece.add_child(piece_component)

