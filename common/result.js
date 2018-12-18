'use strict'

function getInstance() {
    return new ResultJson()
}

function ResultJson() {
    this.code = 0
    this.msg = 'success'
    this.data = null
    ResultJson.prototype.setCode = (code) => {
        this.code = code
        return this
    }
    ResultJson.prototype.setMsg = (msg) => {
        this.msg = msg
        return this
    }
    ResultJson.prototype.setData = (data) => {
        this.data = data
        return this
    }
}

exports = module.exports = getInstance