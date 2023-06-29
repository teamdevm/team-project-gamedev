class_name LobbyScreen extends Control

var UUID:String
var Users:Array
var IsHost:bool

signal AddPlayer(uuid)
signal RemovePlayer(uuid)

func _ready()->void:
	SocketWork.connect('Command', _onCommand)

func _onCommand(command:String, data)->void:
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
	var user_uuid = data["uuid"]
	var user_name = data["name"]
	Users.append({"uuid":user_uuid, "name":user_name})
	emit_signal("AddPlayer", user_uuid)

func OnPlayerExited(data)->void:
	var user_uuid = data["uuid"]
	var i = 0
	var d = -1
	for usr in Users:
		if usr["uuid"] == user_uuid:
			d = i
			break
		i += 1
	if d != -1:
		Users.remove_at(d)
	emit_signal("RemovePlayer", user_uuid)

func OnStartGame(data)->void:
	var hand_literals = data["hand_literals"]
	var index = data["index"]
	var bag_count = data["bag_count"]
	var your_turn = data["your_turn"]
	OpenGameField(hand_literals, index, bag_count, your_turn)

func OpenMainMenu()->void:
	var mainMenu = load("res://screens/MainMenu2/main_menu.tscn").instantiate()
	get_tree().root.add_child(mainMenu)
	get_tree().current_scene = mainMenu
	queue_free()

func OpenGameField(hand_literals, index, bag_count, your_turn)->void:
	var gameField = load("res://screens/GameScene2/game_field.tscn").instantiate()
	gameField.hand_literals = hand_literals
	gameField.index = index
	gameField.bag_count = bag_count
	gameField.your_turn = your_turn
	gameField.Users = Users
	get_tree().root.add_child(gameField)
	get_tree().current_scene = gameField
	queue_free()
