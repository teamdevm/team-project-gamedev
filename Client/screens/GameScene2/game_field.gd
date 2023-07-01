extends Control

var hand_literals:Array: set = SetLiterals
var UserIndex:int
var bag_count:int : set = SetBagCount
var your_turn:bool : set = SetYourTurn
var Users:Array

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
signal BagCountChanged(count)
signal TotalScoreChanged(new_total_score)
signal TurnScoreChanged(new_turn_score)
signal CanSwap(canswap)
signal Swapping(val)
signal TurnChanged(yourTurn)
signal CanEndTurn(can)
signal CanPassTurn(can)
signal ChangePlayersList
signal ExitDialog(vis)

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

func SetBagCount(val:int)->void:
	bag_count = val
	emit_signal("BagCountChanged", val)

func SetTotalScore(score:int)->void:
	TotalScore = score
	emit_signal("TotalScoreChanged", score)

func SetTurnScore(score:int)->void:
	TurnScore = score
	emit_signal("TurnScoreChanged", "+" + str(score) if score > 0 else "")
	emit_signal("CanEndTurn", score > 0)
	emit_signal("CanPassTurn", score == 0)

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

func ClearChanges()->void:
	for change in LiteralsHistory:
		board.setChips(change.Coord, change.L)
	LiteralsHistory.clear()

func NotifyCanSwap()->void:
	emit_signal("CanSwap", TurnCoords.size() == 0)

func _ready()->void:
	SocketWork.connect('Command', _onCommand)
	board.connect("click_coord", OnClick)
	emit_signal("RefreshLiterals", hand_literals)
	emit_signal("TurnChanged", your_turn)
	emit_signal("CanEndTurn", false)
	emit_signal("CanPassTurn", true)

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
		OnEndTurn(data, code)
	elif  command == "pass-turn":
		OnPassTurn(data, code)
	elif  command == "next-turn":
		OnNextTurn(data)
	elif  command == "end-game":
		OnEndGame(data, code)
	elif command == "plr-disc-from-game":
		OnSomePlayerDisconnected(data)


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

func TryExit()->void:
	emit_signal("ExitDialog", true)

func CancelExit()->void:
	emit_signal("ExitDialog", false)

func ReallyExit()->void:
	OpenMainMenu()

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

func OnPassTurn(data, code:int)->void:
	if code != 0:
		return
	if data.has("hand_literals"):
		hand_literals = data["hand_literals"]

func OnEndTurn(data, code:int)->void:
	if code != 0:
		return
	hand_literals = data["hand_literals"]
	TurnScore = 0

func OnNextTurn(data)->void:
	your_turn = data["your_turn"]
	bag_count = data["bag_count"]
	var players_stats = data["players_stats"]
	for stat in players_stats:
		var score = stat["score"]
		var index = stat["index"]
		for usr in Users:
			if usr["index"] == index:
				usr["score"] = score
				break
		if UserIndex == index:
			TotalScore = score
	emit_signal("ChangePlayersList")

func OnSomePlayerDisconnected(data)->void:
	UserIndex = data["new_index"]
	var disc_index = data["disc_index"]
	var d = -1
	for i in range(Users.size()):
		if Users[i]["index"] == disc_index:
			d = i
		elif Users[i]["index"] > disc_index:
			Users[i]["index"] -= 1
	if d != -d:
		Users.remove_at(d)
	emit_signal("ChangePlayersList")

func OnEndGame(data, code)->void:
	if code != 0:
		return
	var table = data["table"]
	for usr in table:
		var index = usr["index"]
		Users[index]["score"] = usr["score"]
	OpenEndgameTable()

func OpenMainMenu()->void:
	var mainMenu = load("res://screens/MainMenu/main_menu.tscn").instantiate()
	get_tree().root.add_child(mainMenu)
	get_tree().current_scene = mainMenu
	queue_free()

func OpenEndgameTable()->void:
	var endwindow = load("res://screens/EndScene/EndTable.tscn").instantiate()
	endwindow.Users = Users
	endwindow.UserIndex = UserIndex
	get_tree().root.add_child(endwindow)
	get_tree().current_scene = endwindow
	queue_free()
