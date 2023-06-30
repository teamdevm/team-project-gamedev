extends Node

var DEBUG:bool = OS.is_debug_build()

var url:String = 'ws://localhost:3000'

var socket:WebSocketPeer = WebSocketPeer.new()

var Opened:bool = false
var Connecting:bool = false
var Connected:bool = false
var Registered:bool = false
var _defferedCommands:Array[String] = []

var Username:String = ''
var UUID:String = ''

signal Command(command:String, data, code:int)

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
	if OS.is_debug_build():
		print("Send command:")
		print(jsonCommand)
	socket.send_text(jsonCommand)

func ReleaseDefferedCommands()->void:
	for i in range(_defferedCommands.size()):
		socket.send_text(_defferedCommands[i])

var _wasClosed:bool = true

func _process(_delta):
	if _ConnectionIsClosed():
		_wasClosed = true
		return
	
	socket.poll()
	
	if _ConnectionIsOpened():
		_ConnectionJustOpened()
		_GetPackets()
	
	elif _ConnectionIsClosed():
		_ConnectionJustClosed()


func _ConnectSocket()->void:
	_defferedCommands.clear()
	#_ReadUUID()
	socket.connect_to_url(url)

func _GetPackets():
	while socket.get_available_packet_count():
		var packet = socket.get_packet()
		var packetString:String = packet.get_string_from_utf8()
		var commandObject = JSON.parse_string(packetString)
		if commandObject.has('command'):
			if OS.is_debug_build():
				print("Got packet:")
				print(commandObject)
			var code = 0
			if commandObject.has("code"):
				code = commandObject["code"]
			_EmitCommand(commandObject['command'], commandObject['data'], code)
		elif commandObject.has("uuid"):
			UUID = commandObject["uuid"]
			print("Got UUID:", UUID)
			SendCommand('user-registration', {
				'name':Username,
				'uuid':UUID
			})

func _ConnectionJustOpened():
	if _wasClosed:
		_wasClosed = false
#		SendCommand('user-registration', {
#				'name':Username,
#				'uuid':UUID
#			})
		#ReleaseDefferedCommands()

func _ConnectionJustClosed():
	if Connected:
		Connected = false
		Registered = false
		var code = socket.get_close_code()
		var reason = socket.get_close_reason()
		_EmitCommand('conn-closed', {'code':code, 'reason':reason}, 0)

func _EmitCommand(command:String, data, code:int=0):
	emit_signal('Command', command, data, code)
	if OS.is_debug_build():
		print("Emmit command:")
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

