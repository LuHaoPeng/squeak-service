const constants = require(('../common/constant'))
const mariadb = require('mariadb')
const dbPool = mariadb.createPool({
    host: constants.DB_URL,
    port: constants.DB_PORT,
    user: constants.DB_USERNAME,
    password: constants.DB_PASSWORD,
    database: constants.DB_DATABASE,
    connectionLimit: 5
})

module.exports.connect = function connect(success, error) {
    dbPool.getConnection().then((conn) => {
        success(conn)
    }).catch((err) => {
        error(err)
    })
}