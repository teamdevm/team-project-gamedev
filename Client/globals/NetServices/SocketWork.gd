extends Node

var DEBUG:bool = OS.is_debug_build()

var url:String = 'ws://example.com'

var socket := WebSocketPeer.new()

var Connected:bool = false

signal Command(command:String, data:Dictionary)



func _ready():
	OpenConnection()

func _process(_delta):
	socket.poll()
	
	if ConnectionIsOpened():
		if not Connected: Connected = true
		GetPackets()
	
	elif ConnectionIsClosed():
		ConnectionJustClosed()
		OpenConnection()


func EmitCommand(command:String, data:Dictionary = {}):
	emit_signal('Command', command, data)
	if DEBUG:
		print("Command: ", command)

func OpenConnection():
	socket.connect_to_url(url)

func GetPackets():
	while socket.get_available_packet_count():
		var packet = socket.get_packet()
		var command:String = packet.get_string_from_utf8()
		EmitCommand(command)

func ConnectionJustClosed():
	if Connected:
		Connected = false
		var code = socket.get_close_code()
		var reason = socket.get_close_reason()
		EmitCommand('ConnectionClosed', {'code':code, 'reason':reason})

func ConnectionIsOpened() -> bool:
	return socket.get_ready_state() == WebSocketPeer.STATE_OPEN

func ConnectionIsClosed() -> bool:
	return socket.get_ready_state() == WebSocketPeer.STATE_CLOSED
