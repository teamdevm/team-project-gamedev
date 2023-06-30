class_name LobbyScreen extends Control

var UUID:String
var Users:Array
var UserIndex:int: set = SetUserIndex

signal ChangePlayersList
signal HostStatusChanged(my_status)

func SetUserIndex(val:int)->void:
	UserIndex = val
	emit_signal("HostStatusChanged", val == 0)

func _ready()->void:
	SocketWork.connect('Command', _onCommand)
	emit_signal("HostStatusChanged", UserIndex == 0)

func _onCommand(command:String, data, _code:int)->void:
	if command == "player-enter-lobby":
		OnPlayerConnected(data)
	elif command == "player-leave-lobby":
		OnPlayerExited(data)
	elif command == "start-game":
		if data.size() == 0:
			return
		OnStartGame(data)

func ExitLobby()->void:
	SocketWork.SendCommand('disconnect-from-lobby', {
		'user_uuid':SocketWork.UUID,
		'lobby_uuid':UUID
	})
	OpenMainMenu()

func StartGame()->void:
	SocketWork.SendCommand('start-game',{
		"user_uuid":SocketWork.UUID
	})

func OnPlayerConnected(data)->void:
	var user_index = data["index"]
	var user_name = data["name"]
	Users.append({"index":user_index, "name":user_name})
	emit_signal("ChangePlayersList")

func OnPlayerExited(data)->void:
	UserIndex = data["new_index"]
	var leaved_index = data["index"]
	Users.remove_at(leaved_index)
	emit_signal("ChangePlayersList")

func OnStartGame(data)->void:
	var hand_literals = data["hand_literals"]
	var index = data["index"]
	var bag_count = data["bag_count"]
	var your_turn = data["your_turn"]
	OpenGameField(hand_literals, index, bag_count, your_turn)

func OpenMainMenu()->void:
	var mainMenu = load("res://screens/MainMenu/main_menu.tscn").instantiate()
	get_tree().root.add_child(mainMenu)
	get_tree().current_scene = mainMenu
	queue_free()

func OpenGameField(hand_literals, index, bag_count, your_turn)->void:
	var gameField = load("res://screens/GameScene2/game_field.tscn").instantiate()
	gameField.hand_literals = hand_literals
	gameField.UserIndex = index
	gameField.bag_count = bag_count
	gameField.your_turn = your_turn
	for usr in Users:
		usr["score"] = 0
	gameField.Users = Users
	get_tree().root.add_child(gameField)
	get_tree().current_scene = gameField
	queue_free()
