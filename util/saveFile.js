const fs = require('fs')

module.exports = class SaveFile{
    static toJson(filename, content){
        fs.appendFileSync(filename, content)
    }

    static toCSV(filename, content){
        fs.appendFileSync(filename, content, function(err){
            if(err) console.log(err)
            console.log("CSV saved")
        })
    }
}