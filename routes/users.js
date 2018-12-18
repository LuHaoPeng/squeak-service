let express = require('express')
let ResultJson = require('../common/result')
const connector = require('../common/dbConnector')
let router = express.Router()

router.post('/login', (req, res) => {
    console.log(req.body)
    connector.connect((conn) => {
        conn.query(`SELECT password, type FROM account WHERE username = '${req.body.username}'`).then((rows) => {
            conn.end()
            if (rows.length <= 0) {
                return res.json(ResultJson().setCode(1).setMsg('用户名不存在'))
            }
            if (rows[0].password !== req.body.password) {
                return res.json(ResultJson().setCode(2).setMsg('密码错误'))
            }
            return res.json(ResultJson().setData({type: rows[0].type}))
        }).catch((err) => {
            conn.end()
            return res.json(ResultJson().setCode(-1).setMsg('database query error: ' + err.message))
        })
    }, (err) => {
        return res.json(ResultJson().setCode(-1).setMsg('database connection error: ' + err.message))
    })
})

router.post('/create', (req, res) => {
    console.log(req.body)
    connector.connect((conn) => {
        conn.query(`INSERT INTO account (username, password, type, description) VALUES ('${req.body.username}', 
                '123456', ${req.body.type}, '${req.body.description}')`).then(() => {
            conn.end()
            return res.json(ResultJson())
        }).catch((err) => {
            conn.end()
            return res.json(ResultJson().setCode(-1).setMsg('database query error: ' + err.message))
        })
    }, (err) => {
        return res.json(ResultJson().setCode(-1).setMsg('database connection error: ' + err.message))
    })
})

router.post('/reset', (req, res) => {
    console.log(req.body)
    connector.connect((conn) => {
        conn.query(`UPDATE account SET password = '123456' WHERE username = '${req.body.username}'`).then((rows) => {
            conn.end()
            return res.json(ResultJson())
        }).catch((err) => {
            conn.end()
            return res.json(ResultJson().setCode(-1).setMsg('database query error: ' + err.message))
        })
    }, (err) => {
        return res.json(ResultJson().setCode(-1).setMsg('database connection error: ' + err.message))
    })
})

router.post('/delete', (req, res) => {
    console.log(req.body)
    connector.connect((conn) => {
        conn.query(`DELETE FROM account WHERE username = '${req.body.username}'`).then((rows) => {
            conn.end()
            return res.json(ResultJson())
        }).catch((err) => {
            conn.end()
            return res.json(ResultJson().setCode(-1).setMsg('database query error: ' + err.message))
        })
    }, (err) => {
        return res.json(ResultJson().setCode(-1).setMsg('database connection error: ' + err.message))
    })
})

router.post('/password', (req, res) => {
    console.log(req.body)
    connector.connect((conn) => {
        let successFlag = true
        conn.query(`SELECT password FROM account WHERE username = '${req.body.username}'`).then((rows) => {
            if (rows[0].password === req.body.oldPassword) {
                return conn.query(`UPDATE account SET password = ${req.body.newPassword} WHERE username = '${req.body.username}'`)
            } else {
                successFlag = false
                return res.json(ResultJson().setCode(2).setMsg('密码错误'))
            }
        }).then(() => {
            conn.end()
            if (successFlag) {
                return res.json(ResultJson())
            }
        }).catch((err) => {
            conn.end()
            return res.json(ResultJson().setCode(-1).setMsg('database query error: ' + err.message))
        })
    }, (err) => {
        return res.json(ResultJson().setCode(-1).setMsg('database connection error: ' + err.message))
    })
})

router.get('/list', (req, res) => {
    console.log(req.body)
    connector.connect((conn) => {
        conn.query(`SELECT username, description, DATE_FORMAT(update_time, '%Y-%m-%d %H:%i:%s') update_time FROM account 
                WHERE type > -1 ORDER BY update_time DESC`).then((rows) => {
            conn.end()
            return res.json(ResultJson().setData({list: rows}))
        }).catch((err) => {
            conn.end()
            return res.json(ResultJson().setCode(-1).setMsg('database query error: ' + err.message))
        })
    }, (err) => {
        return res.json(ResultJson().setCode(-1).setMsg('database connection error: ' + err.message))
    })
})

module.exports = router