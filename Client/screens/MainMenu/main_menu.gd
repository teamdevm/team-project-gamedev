extends Control

func _ready()->void:
	SocketWork.connect('Command', _onCommand)

func _onCommand(command:String, data)->void:
	if command == 'create-lobby':
		OnLobbyCreated(data)
	elif command == 'connect-to-lobby':
		OnLobbyJoined(data)

func CreateLobby()->void:
	var username = GetUsername()
	SocketWork.OpenConnection(username)
	SocketWork.SendCommand('create-lobby', {
		'uuid':SocketWork.UUID
	})

func JoinLobby() -> void:
	var username = GetUsername()
	SocketWork.OpenConnection(username)
	var lobby = GetLobbyCode()
	SocketWork.SendCommand('connect-to-lobby',{
		'user_uuid':SocketWork.UUID,
		'lobby_uuid':lobby
	})

func OnLobbyCreated(data)->void:
	var lobby_uuid = data['lobby']
	var users = data['users']
	OpenLobbyScreen(lobby_uuid, users)

func OnLobbyJoined(data)->void:
	var lobby_uuid = data['lobby']
	var users = data['users']
	OpenLobbyScreen(lobby_uuid, users)


func OpenLobbyScreen(lobby_uuid:String, users:Array)->void:
	var lobbyScene = preload("res://screens/Lobby/lobby.tscn").instantiate()
	lobbyScene.UUID = lobby_uuid
	lobbyScene.Users = users
	get_tree().root.add_child(lobbyScene)
	get_tree().current_scene = lobbyScene
	queue_free()

func GetUsername()->String:
	return get_node("LineEdit").Text

func GetLobbyCode()->String:
	return get_node("LineEdit2").Text
