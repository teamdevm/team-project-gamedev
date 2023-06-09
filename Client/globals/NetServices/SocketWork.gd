extends Node

var DEBUG:bool = OS.is_debug_build()

var url:String = 'ws://26.120.131.9:3000'

var socket := WebSocketPeer.new()

var Opened:bool = false
var Connecting:bool = false
var Connected:bool = false
var _defferedCommands:Array[String] = []

var Username:String = ''
var UUID:String = ''

signal Command(command:String, data)


func OpenConnection(username:String)->void:
	Username = username
	_ConnectSocket()

func CloseConnection()->void:
	Opened = false
	socket.close()

func SendCommand(command:String, data) -> void:
	var jsonCommand = JSON.stringify({
		'command': command,
		'data': data
	})
	if not _ConnectionIsOpened():
		_defferedCommands.append(jsonCommand)
		return
	socket.send_text(jsonCommand)

func ReleaseDefferedCommands()->void:
	for i in range(_defferedCommands.size()):
		socket.send_text(_defferedCommands[i])

var _wasClosed:bool = true

func _process(delta):
	if _ConnectionIsClosed():
		_wasClosed = true
		return
	
	socket.poll()
	
	if _ConnectionIsOpened():
		_ConnectionJustOpened()
		_GetPackets()
	
	elif _ConnectionIsClosed():
		_ConnectionJustClosed()
		_ConnectSocket()


func _ConnectSocket()->void:
	_defferedCommands.clear()
	_ReadUUID()
	socket.connect_to_url(url)

func _GetPackets():
	while socket.get_available_packet_count():
		var packet = socket.get_packet()
		var packetString:String = packet.get_string_from_utf8()
		var commandObject = JSON.parse_string(packetString)
		_EmitCommand(commandObject['command'], commandObject['data'])

func _ConnectionJustOpened():
	if _wasClosed:
		_wasClosed = false
		SendCommand('user-registration', {
				'name':Username,
				'uuid':UUID
			})
		ReleaseDefferedCommands()

func _ConnectionJustClosed():
	if Connected:
		Connected = false
		var code = socket.get_close_code()
		var reason = socket.get_close_reason()
		_EmitCommand('conn-closed', {'code':code, 'reason':reason})

func _EmitCommand(command:String, data):
	emit_signal('Command', command, data)
	if OS.is_debug_build():
		print(command)



func _ConnectionIsOpened() -> bool:
	return socket.get_ready_state() == WebSocketPeer.STATE_OPEN

func _ConnectionIsClosed() -> bool:
	return socket.get_ready_state() == WebSocketPeer.STATE_CLOSED

func _ReadUUID() -> void:
	var cookies = JavaScriptBridge.eval('document.cookie;')
	var start = cookies.find('uuid=')
	var end = cookies.find(';', start)
	UUID = cookies.substr(start, end-start).split('=')[1]

