/**
 * Retrieve transaction logs.
 * 
 * @param {Array} logs Array of decoded events that were triggered within this transaction.
 * @param {String} name The name of the event;
 */
exports.retrieveEventLog = function (logs, name) {
    for (var i = 0; i < logs.length; i++) {
        var log = logs[i];
        if (log.event == name) {
            return log;
        }
    }
    return null;
}

