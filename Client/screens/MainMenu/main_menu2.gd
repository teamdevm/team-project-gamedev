class_name MainMenuScreen extends Control

var Username:String
var LobbyCode:String
var Action = 0

func _ready()->void:
	SocketWork.CloseConnection()
	SocketWork.connect('Command', _onCommand)

func _onCommand(command:String, data, _code:int)->void:
	if command == 'create-lobby':
		OnLobbyCreated(data)
	elif command == 'connect-to-lobby':
		OnLobbyJoined(data)
	elif command == 'user-registration':
		OnUserRegistered(data)

func CreateLobby()->void:
	var username = GetUsername()
	SocketWork.OpenConnection(username)
	Action = 1

func JoinLobby() -> void:
	var username = GetUsername()
	SocketWork.OpenConnection(username)
	Action = 2

func OnUserRegistered(_data)->void:
	if Action == 1:
		SocketWork.SendCommand('create-lobby', {
			'uuid':SocketWork.UUID
		})
	elif Action == 2:
		var lobby = GetLobbyCode()
		SocketWork.SendCommand('connect-to-lobby',{
			'user_uuid':SocketWork.UUID,
			'lobby_uuid':lobby
		})

func OnLobbyCreated(data)->void:
	var lobby = data['lobby']
	var lobby_uuid = lobby['uuid']
	var users = lobby['users']
	var userIndex = lobby['user_index']
	OpenLobbyScreen(lobby_uuid, users, userIndex)

func OnLobbyJoined(data)->void:
	var lobby = data['lobby']
	var lobby_uuid = lobby['uuid']
	var users = lobby['users']
	var userIndex = lobby['user_index']
	OpenLobbyScreen(lobby_uuid, users, userIndex)


func OpenLobbyScreen(lobby_uuid:String, users:Array, userIndex:int)->void:
	var lobbyScene = load("res://screens/Lobby2/lobby.tscn").instantiate()
	lobbyScene.UUID = lobby_uuid
	lobbyScene.Users = users
	lobbyScene.UserIndex = userIndex
	get_tree().root.add_child(lobbyScene)
	get_tree().current_scene = lobbyScene
	queue_free()

func GetUsername()->String:
	return Username

func GetLobbyCode()->String:
	return LobbyCode
