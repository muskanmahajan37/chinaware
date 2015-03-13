Chinaware.get = function (url, callback) {
    Chinaware.send(url, 'GET', callback);
};

Chinaware.load = function (url, callback) {
    Chinaware.send(url, 'GET', callback);
};

Chinaware.post = function (url, data, callback) {
    Chinaware.send(url, 'POST', callback, data);
};

Chinaware.send = function (url, method, callback, data) {
    data = data || null;
    var request = new XMLHttpRequest();
    if (callback instanceof Function) {
        request.onreadystatechange = function () {
            if (request.readyState === 4 && (request.status === 200 || request.status === 0)) {
                callback(request.responseText);
            }
        };
    }
    request.open(method, url, true);
    if (data instanceof Object) {
        data = JSON.stringify(data);
        request.setRequestHeader('Content-Type', 'application/json');
    }
    request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    request.send(data);
};
