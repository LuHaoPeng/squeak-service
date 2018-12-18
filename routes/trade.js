let express = require('express')
let ResultJson = require('../common/result')
const connector = require('../common/dbConnector')
let router = express.Router()

router.get('/tree/:type', function (req, res) {
    let table, rootText
    switch (parseInt(req.params.type)) {
        case 1:
            table = 'trade_tailor'
            rootText = '裁剪'
            break
        case 2:
            table = 'trade_workshop'
            rootText = '车间'
            break
        case 3:
            table = 'trade_process'
            rootText = '后道'
            break
        case 4:
            table = 'trade_warehouse'
            rootText = '仓库'
            break
        case 5:
            table = 'trade_sale'
            rootText = '销售'
            break
        default:
            return res.json(ResultJson().setCode(-1).setMsg('wrong parameter: type'))
    }
    connector.connect((conn) => {
        conn.query(`SELECT LEFT(trade_time, 4) as year, SUBSTR(trade_time, 6, 2) as month	
                FROM ${table} GROUP BY LEFT(trade_time, 7) ORDER BY year DESC, month DESC`).then((rows) => {
            conn.end()
            if (rows.length <= 0) {
                return res.json({
                    text: rootText,
                    icon: TREE_ICON_URL.root,
                    children: []
                })
            }
            let treeMenuData = [], lastYear = rows[0].year, monthArray = []
            for (let {year, month} of rows) {
                if (year !== lastYear) {
                    treeMenuData.push({year: lastYear + '年', month: monthArray})
                    lastYear = year
                    monthArray = []
                }
                monthArray.push(month + '月')
            }
            treeMenuData.push({year: lastYear + '年', month: monthArray})
            return res.json({
                text: rootText,
                icon: TREE_ICON_URL.root,
                children: buildTreeOptionFromTemplate(treeMenuData)
            })
        }).catch((err) => {
            conn.end()
            return res.json(ResultJson().setCode(-1).setMsg('database query error: ' + err.message))
        })
    }, (err) => {
        return res.json(ResultJson().setCode(-1).setMsg('database connection error: ' + err.message))
    })
})

router.get('/content/:type/year/:yearNo/month/:monthNo', function (req, res) {
    let table
    switch (parseInt(req.params.type)) {
        case 1:
            table = 'trade_tailor'
            break
        case 2:
            table = 'trade_workshop'
            break
        case 3:
            table = 'trade_process'
            break
        case 4:
            table = 'trade_warehouse'
            break
        case 5:
            table = 'trade_sale'
            break
        default:
            return res.json(ResultJson().setCode(-1).setMsg('wrong parameter: type'))
    }
    connector.connect((conn) => {
        let queryStr = `SELECT trade_no, consume, produce, DATE_FORMAT(trade_time, '%Y-%m-%d %H:%i:%s') trade_time, 
                operator, DATE_FORMAT(update_time, '%Y-%m-%d %H:%i:%s') update_time 
                FROM ${table} WHERE SUBSTR(trade_time, 1, 7) LIKE '${req.params.yearNo === 'all' ?
            '%' : req.params.yearNo}-${req.params.monthNo === 'all' ?
            '%' : req.params.monthNo}' ORDER BY trade_time DESC`
        conn.query(queryStr).then((rows) => {
            conn.end()
            return res.json(ResultJson().setData({tradeData: rows}))
        }).catch((err) => {
            conn.end()
            return res.json(ResultJson().setCode(-1).setMsg('database query error: ' + err.message))
        })
    }, (err) => {
        return res.json(ResultJson().setCode(-1).setMsg('database connection error: ' + err.message))
    })
})

router.post('/create/:type', function (req, res) {
    console.log(req.body)
    let table
    switch (parseInt(req.params.type)) {
        case 1:
            table = 'trade_tailor'
            break
        case 2:
            table = 'trade_workshop'
            break
        case 3:
            table = 'trade_process'
            break
        case 4:
            table = 'trade_warehouse'
            break
        case 5:
            table = 'trade_sale'
            break
        default:
            return res.json(ResultJson().setCode(-1).setMsg('wrong parameter: type'))
    }
    connector.connect((conn) => {
        let queryStr = `INSERT INTO ${table} (trade_no, consume, produce, trade_time, operator) 
                VALUES ('${req.body.trade_no}', ${req.body.consume}, ${req.body.produce}, '${req.body.trade_time}',
                '${req.body.operator}')`
        conn.query(queryStr).then(() => {
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

router.post('/edit/:type', function (req, res) {
    console.log(req.body)
    let table
    switch (parseInt(req.params.type)) {
        case 1:
            table = 'trade_tailor'
            break
        case 2:
            table = 'trade_workshop'
            break
        case 3:
            table = 'trade_process'
            break
        case 4:
            table = 'trade_warehouse'
            break
        case 5:
            table = 'trade_sale'
            break
        default:
            return res.json(ResultJson().setCode(-1).setMsg('wrong parameter: type'))
    }
    connector.connect((conn) => {
        let queryStr = `UPDATE ${table} SET consume = ${req.body.consume}, produce = ${req.body.produce}, 
                operator = '${req.body.operator}' WHERE trade_no = '${req.body.trade_no}'`
        conn.query(queryStr).then(() => {
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

router.post('/delete/:type', function (req, res) {
    console.log(req.body)
    let table
    switch (parseInt(req.params.type)) {
        case 1:
            table = 'trade_tailor'
            break
        case 2:
            table = 'trade_workshop'
            break
        case 3:
            table = 'trade_process'
            break
        case 4:
            table = 'trade_warehouse'
            break
        case 5:
            table = 'trade_sale'
            break
        default:
            return res.json(ResultJson().setCode(-1).setMsg('wrong parameter: type'))
    }
    connector.connect((conn) => {
        let queryStr = `DELETE FROM ${table} WHERE trade_no = '${req.body.trade_no}'`
        conn.query(queryStr).then(() => {
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

const TREE_ICON_URL = Object.freeze({
    root: '../img/role.png',
    folder: '../img/calendar.png',
    item: '../img/order.png'
})

function buildTreeOptionFromTemplate(template) {
    let yearArray = []
    for (let {year: yearText, month} of template) {
        let monthArray = []
        for (let monthText of month) {
            monthArray.push({
                text: monthText,
                icon: TREE_ICON_URL.item
            })
        }
        yearArray.push({
            text: yearText,
            icon: TREE_ICON_URL.folder,
            children: monthArray
        })
    }
    return yearArray
}

module.exports = router