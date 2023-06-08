export default {
    log: function(msg, type = 'LOG') {
        process.stdout.write(`[${new Date().toISOString()} [${type}] ${msg}\n`)
    }
}