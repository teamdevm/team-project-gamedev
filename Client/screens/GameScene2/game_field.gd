extends Control

var hand_literals:Array: set = SetLiterals
var UserIndex:int
var bag_count
var your_turn:bool : set = SetYourTurn
var Users

class LiteralHistoryUnit:
	var Coord:Vector2i
	var L:String
	func _init(coord:Vector2i, l:String):
		Coord = coord
		L = l

var MultiSelect:bool = false: set = SetMultiSelect
var SelectedPieces:Array = []
var Piece:int : get = GetPiece, set = SetPiece
var Letter:String = ""
var TotalScore:int = 0: set = SetTotalScore
var TurnScore:int = 0: set = SetTurnScore
var TurnCoords:Array[Vector2i] = []
var LastSetLiteral = null
var LastDeletedLiteral = null
var LiteralsHistory:Array = []

@onready var board = $Board

signal RefreshLiterals(new_literals)
signal PieceSelected(indexes)
signal TotalScoreChanged(new_total_score)
signal TurnScoreChanged(new_turn_score)
signal CanSwap(canswap)
signal Swapping(val)
signal TurnChanged(yourTurn)
signal CanEndTurn(can)
signal ChangePlayersList

func SetLiterals(new_hand_literals:Array)->void:
	hand_literals = new_hand_literals
	emit_signal("RefreshLiterals", new_hand_literals)
	NotifyCanSwap()

func GetPiece()->int:
	if SelectedPieces.size() == 0:
		return -1
	return SelectedPieces[0]

func SetPiece(val)->void:
	SelectedPieces.clear()
	SelectedPieces.append(val)

func SetTotalScore(score:int)->void:
	TotalScore = score
	emit_signal("TotalScoreChanged", score)

func SetTurnScore(score:int)->void:
	TurnScore = score
	emit_signal("TurnChange", score)
	emit_signal("CanEndTurn", score > 0)

func SetYourTurn(val:bool)->void:
	your_turn = val
	LiteralsHistory.clear()
	TurnCoords.clear()
	emit_signal("TurnChanged", val)

func SetMultiSelect(val:bool)->void:
	MultiSelect = val
	SelectedPieces.clear()
	emit_signal("PieceSelected", SelectedPieces)
	emit_signal("Swapping", val)

func AddLiteralToHistory(coord:Vector2i, l:String)->void:
	LiteralsHistory.append(LiteralHistoryUnit.new(coord, l))

func RevertChange()->void:
	var change = LiteralsHistory.pop_back() as LiteralHistoryUnit
	board.setChips(change.Coord, change.L)

func NotifyCanSwap()->void:
	emit_signal("CanSwap", TurnCoords.size() == 0)



func _ready()->void:
	SocketWork.connect('Command', _onCommand)
	board.connect("click_coord", OnClick)
	emit_signal("RefreshLiterals", hand_literals)
	emit_signal("TurnChanged", your_turn)

func _onCommand(command:String, data, code:int)->void:
	if command == "put-piece":
		OnPutPiece(data, code)
	elif  command == "take-piece":
		OnTakePiece(data, code)
	elif  command == "put-piece-by-plr":
		OnPutPieceByPlr(data)
	elif  command == "take-piece-by-plr":
		OnTakePieceByPlr(data)
	elif  command == "swap-pieces":
		OnSwap(data, code)
	elif  command == "end-turn":
		pass
	elif  command == "pass-turn":
		pass
	elif  command == "next-turn":
		OnNextTurn(data)
	elif  command == "end-game":
		pass


func SelectPiece(index:int, letter:String)->void:
	if MultiSelect:
		if SelectedPieces.has(index):
			SelectedPieces.erase(index)
		else:
			SelectedPieces.append(index)
	else:
		Piece = index
		Letter = letter
	emit_signal("PieceSelected", SelectedPieces)


func OnClick(coord)->void:
	if MultiSelect or not your_turn:
		return
	
	var adding:bool
	if Input.is_action_just_pressed("AddPiece"):
		if Piece == -1:
			return
		adding = true
	elif Input.is_action_just_pressed("RemovePiece"):
		adding = false
	
	if adding:
		var prevLetter = board.setChips(coord, Letter)
		AddLiteralToHistory(coord, prevLetter)
		TurnCoords.append(coord)
	else:
		if not coord in TurnCoords:
			return
		var prevLetter = board.setChips(coord, " ")
		AddLiteralToHistory(coord, prevLetter)
		TurnCoords.erase(coord)
	
	SocketWork.SendCommand(
		'put-piece' if adding else 'take-piece', 
		{
		'user_uuid':SocketWork.UUID,
		'row':coord.y,
		'col':coord.x,
		'hand_pos':Piece
	})
	
	if adding:
		Piece = -1

func Swap()->void:
	SocketWork.SendCommand("swap-pieces", {
		'user_uuid':SocketWork.UUID,
		'hand_pos': SelectedPieces
	})
	SelectedPieces.clear()
	MultiSelect = false

func EndTurn()->void:
	SocketWork.SendCommand("end-turn", {
		'user_uuid':SocketWork.UUID
	})

func PassTurn()->void:
	SocketWork.SendCommand("pass-turn", {
		'user_uuid':SocketWork.UUID
	})

func OnPutPiece(data, code)->void:
	if code != 0:
		RevertChange()
		return
	var new_literals = data["hand_literals"]
	var words_value = data['words_value']
	hand_literals = new_literals
	TurnScore = words_value

func OnTakePiece(data, code)->void:
	if code != 0:
		RevertChange()
		return
	var new_literals = data["hand_literals"]
	var words_value = data['words_value']
	hand_literals = new_literals
	TurnScore = words_value

func OnPutPieceByPlr(data)->void:
	var x = data['col']
	var y = data['row']
	var literal = data['literal']
	board.setChips(Vector2i(x, y), literal)

func OnTakePieceByPlr(data)->void:
	var x = data['col']
	var y = data['row']
	board.setChips(Vector2i(x, y), " ")

func OnSwap(data, code)->void:
	if code != 0:
		return
	var new_literals = data["hand_literals"]
	hand_literals = new_literals

func OnNextTurn(data)->void:
	your_turn = data["your_turn"]
	#var players_stats = data["players_stats"]
	#TotalScore = players_stats["score"]
