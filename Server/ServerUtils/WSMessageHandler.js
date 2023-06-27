module.exports = (socket, data, isBinary, handlerFunction) => {
    const jsonStr = String.fromCharCode(...data);
    const dataObj = JSON.parse(jsonStr);
    dataObj.socket = socket;

    let response = handlerFunction(dataObj);
    socket.send(JSON.stringify(response));
}