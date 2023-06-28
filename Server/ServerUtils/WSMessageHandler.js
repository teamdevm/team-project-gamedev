module.exports = (socket, data, isBinary, handlerFunction) => {
    const jsonStr = String.fromCharCode(...data);
    const dataObj = JSON.parse(jsonStr);
    dataObj.socket = socket;

    handlerFunction(dataObj, (response) => {
        socket.send(JSON.stringify(response));
    });
}