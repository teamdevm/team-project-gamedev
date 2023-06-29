extends Control

var hand_literals
var index
var bag_count
var your_turn
var Users
var Piece:int = -1

@onready var board = $Board

signal PieceSelected(index:int)

func _ready()->void:
	SocketWork.connect('Command', _onCommand)
	board.connect("click_coord", OnClick)

func _onCommand(command:String, data)->void:
	if command == "put-piece":
		pass
	elif  command == "take-piece":
		pass
	elif  command == "put-piece-by-plr":
		pass
	elif  command == "take-piece-by-plr":
		pass
	elif  command == "end-turn":
		pass
	elif  command == "pass-turn":
		pass
	elif  command == "next-turn":
		pass
	elif  command == "end-game":
		pass
	elif  command == "swap-pieces":
		pass

func SelectPiece(index:int)->void:
	emit_signal("PieceSelected", index)
	Piece = index

func OnClick(coord)->void:
	if Piece == -1:
		return
	
	var com:String
	if Input.is_action_just_pressed("AddPiece"):
		com = 'put-piece'
	elif Input.is_action_just_pressed("RemovePiece"):
		com = 'take-piece'
	
	SocketWork.SendCommand(com, {
		'user_uuid':SocketWork.UUID,
		'row':coord.x,
		'col':coord.y,
		'hand_pos':Piece
	})

func EndTurn()->void:
	SocketWork.SendCommand("end-turn", {
		'user_uuid':SocketWork.UUID
	})

func PassTurn()->void:
	SocketWork.SendCommand("pass-turn", {
		'user_uuid':SocketWork.UUID
	})


