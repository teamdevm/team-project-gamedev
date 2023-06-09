class_name LobbyScreen extends Control

var UUID:String
var Users:Array


func _ready()->void:
	SocketWork.connect('Command', _onCommand)

func _onCommand(command:String, data)->void:
	pass

func ExitLobby()->void:
	SocketWork.SendCommand('disconnect-from-lobby', {
		'user_uuid':SocketWork.UUID,
		'lobby_uuid':UUID
	})
	OpenMainMenu()

func OpenMainMenu()->void:
	var mainMenu = MainMenuScreen.new()
	get_tree().root.add_child(mainMenu)
	get_tree().current_scene = mainMenu
	queue_free()
