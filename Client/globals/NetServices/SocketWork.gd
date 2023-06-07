extends Node

var DEBUG:bool = OS.is_debug_build()

var url:String = 'ws://example.com'

var socket := WebSocketPeer.new()

var Opened:bool = false
var Connected:bool = false

var Username:String = ''
var UUID:String = ''

signal Command(command:String, data)


func OpenConnection(username:String)->void:
	Opened = true
	Username = username
	_ConnectSocket()

func CloseConnection()->void:
	Opened = false
	socket.close()

func SendCommand(command:String, data) -> void:
	var sendingObject = JSON.stringify({
		'command': command,
		'data': data
	})
	socket.send_text(sendingObject)


func _process(_delta):
	if not Opened:
		return
	
	socket.poll()
	
	if _ConnectionIsOpened():
		if not Connected: Connected = true
		_GetPackets()
	
	elif _ConnectionIsClosed():
		_ConnectionJustClosed()
		_ConnectSocket()


func _ConnectSocket()->void:
	socket.connect_to_url(url)
	_ReadUUID()
	SendCommand('user-registration', {
		'name':Username,
		'uuid':UUID
	})

func _GetPackets():
	while socket.get_available_packet_count():
		var packet = socket.get_packet()
		var packetString:String = packet.get_string_from_utf8()
		var commandObject = JSON.parse_string(packetString)
		_EmitCommand(commandObject['command'], commandObject['data'])

func _ConnectionJustClosed():
	if Connected:
		Connected = false
		var code = socket.get_close_code()
		var reason = socket.get_close_reason()
		_EmitCommand('conn-closed', {'code':code, 'reason':reason})

func _EmitCommand(command:String, data):
	emit_signal('Command', command, data)



func _ConnectionIsOpened() -> bool:
	return socket.get_ready_state() == WebSocketPeer.STATE_OPEN

func _ConnectionIsClosed() -> bool:
	return socket.get_ready_state() == WebSocketPeer.STATE_CLOSED

func _ReadUUID() -> void:
	var cookies = JavaScriptBridge.eval('document.cookie;') as String
	var start = cookies.find('uuid=')
	var end = cookies.find(';', start)
	UUID = cookies.substr(start, end-start).split('=')[1]

