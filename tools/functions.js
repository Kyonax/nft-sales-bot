const axios = require('axios')
const fs = require("fs");
//Functions of APP - Everything Important
module.exports = {
    shuffleArray: async function (item) {
        var j, x, i;

        for (i = item.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            x = item[i];
            item[i] = item[j];
            item[j] = x;
        }
        return item;
    },
    chooseRandomItem: function (array) {
        var item = array[Math.floor(Math.random() * array.length)];
        return item
    },
    loopMethod: async function (method, props, time) {
        function loop() {
            setTimeout(async function () {
                await method(props);
                loop();
            }, time);
        }

        loop();
    },
    loopMethodEach: async function (method, props, time, index, limit) {
        function loop() {
            setTimeout(async function () {
                await method(props, index);

                index++
                if (index < limit) {
                    loop();
                } else {
                    console.log(`[] Data Done`);
                }
            }, time);
        }

        loop();
    },loopMethodEachReverse: async function (method, props, time, index, limit) {    
        function loop() {
            setTimeout(async function () {
                await method(props, index);

                index--
                if (index >= limit) {
                    loop();
                } else {
                    console.log(`[] Data Done`);
                }
            }, time);
        }

        loop();
    },
    propsObject: function (obj, props) {
        return props.split('.').reduce((x, a) => x, obj);
    },
    axiosGet: async function (api) {
        let data = null;
        await axios.get(api).then((api_data_) => {
            data = api_data_
        })

        return data
    },
    readJSON: async function (json) {
        let _jsonString = null;
        _jsonString = await fs.readFileSync(json, "utf8", (err, _jsonString) => {
            if (err) {
                console.log("File read failed:", err);
                return;
            }
        })

        return _jsonString
    },
    writeJSON: async function (json, path) {
        fs.writeFileSync(path, JSON.stringify(json), (err) => {
            if (err) console.log(err);
        });
    },
    walkJSON: async function (json, method) {
        for (let i in json) {
            await method(i)
        }
    },
    numberSeparator: function (x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
}