extends Control

var Users
var UserIndex:int

signal RefreshLeaderboard

func OpenMainMenu()->void:
	var mainMenu = load("res://screens/MainMenu/main_menu.tscn").instantiate()
	get_tree().root.add_child(mainMenu)
	get_tree().current_scene = mainMenu
	queue_free()
