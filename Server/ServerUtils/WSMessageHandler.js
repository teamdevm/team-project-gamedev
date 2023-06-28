module.exports = (socket, data, context) => {
    const dataObj = JSON.parse(data);
    dataObj.socket = socket;

    context.HandleMessage(dataObj, (response) => {
        socket.send(JSON.stringify(response));
    });
}