function formatTime(time) {
    if (typeof time !== 'number' || time < 0) {
        return time
    }

    var hour = parseInt(time / 3600)
    time = time % 3600
    var minute = parseInt(time / 60)
    time = time % 60
    var second = time

    return ([hour, minute, second]).map(function(n) {
        n = n.toString()
        return n[1] ? n : '0' + n
    }).join(':')
}

function formatLocation(longitude, latitude) {
    if (typeof longitude === 'string' && typeof latitude === 'string') {
        longitude = parseFloat(longitude)
        latitude = parseFloat(latitude)
    }

    longitude = longitude.toFixed(2)
    latitude = latitude.toFixed(2)

    return {
        longitude: longitude.toString().split('.'),
        latitude: latitude.toString().split('.')
    }
}
var dateUtils = {
    UNITS: {
        '年': 31557600000,
        '月': 2629800000,
        '天': 86400000,
        '小时': 3600000,
        '分钟': 60000,
        '秒': 1000
    },
    humanize: function(milliseconds) {
        var humanize = '';
        for (var key in this.UNITS) {
            if (milliseconds >= this.UNITS[key]) {
                humanize = Math.floor(milliseconds / this.UNITS[key]) + key + '前';
                break;
            }
        }
        return humanize || '刚刚';
    },
    format: function(dateStr) {
        var date = this.parse(dateStr)
        var diff = Date.now() - date.getTime();
        if (diff < this.UNITS['天']) {
            return this.humanize(diff);
        }
        var _format = function(number) {
            return (number < 10 ? ('0' + number) : number);
        };
        return date.getFullYear() + '/' + _format(date.getMonth() + 1) + '/' + _format(date.getDay()) + '-' +
            _format(date.getHours()) + ':' + _format(date.getMinutes());
    },
    parse: function(str) { //将"yyyy-mm-dd HH:MM:ss"格式的字符串，转化为一个Date对象
        var a = str.split(/[^0-9]/);
        return new Date(a[0], a[1] - 1, a[2], a[3], a[4], a[5]);
    }
};

/**
 * @param listData 查找的列表
 * @param newInfo  查找的item
 * @param exists   返回是否存在数据
 * @return newInfo下标 或 应该放置的下标
 */
function getTagIndex(listData, newInfo, exists) {
    let startIndex = 0;
    let endIndex = listData.length;
    let judgeIndex;
    let ret;
    if (endIndex === 0) {
        exists[0] = false;
        return 0;
    }
    endIndex--;
    // const encoder = new TextEncoder();
    while (true) {
        judgeIndex = Math.floor((startIndex + endIndex) / 2);
        ret = compareString(newInfo, listData[judgeIndex].epc);
        // ret = compareBytes(newInfo, encoder.encode(listData[judgeIndex].epc));
        if (ret > 0) {
            if (judgeIndex === endIndex) {
                exists[0] = false;
                return judgeIndex + 1;
            }
            startIndex = judgeIndex + 1;
        } else if (ret < 0) {
            if (judgeIndex === startIndex) {
                exists[0] = false;
                return judgeIndex;
            }
            endIndex = judgeIndex - 1;
        } else {
            exists[0] = true;
            return judgeIndex;
        }
    }
}

function compareString(b1, b2) {
    if (b1 < b2) {
        return -1;
    } else if (b1 > b2) {
        return 1;
    } else {
        return 0;
    }
}


// function compareBytes(b1, b2) {
//     const len = b1.length < b2.length ? b1.length : b2.length;
//     let value1;
//     let value2;
//     for (let i = 0; i < len; i++) {
//         value1 = b1[i] & 0xFF;
//         value2 = b2[i] & 0xFF;
//         if (value1 > value2) {
//             return 1;
//         } else if (value1 < value2) {
//             return -1;
//         }
//     }
//     if (b1.length > b2.length) {
//         return 2;
//     } else if (b1.length < b2.length) {
//         return -2;
//     } else {
//         return 0;
//     }
// }


// 实际生产环境建议把日志注释掉，可能影响性能
function log(msg) {
    console.log(msg)
}


module.exports = {
    formatTime: formatTime,
    formatLocation: formatLocation,
    dateUtils: dateUtils,
    getTagIndex: getTagIndex,
    log: log,
}


// export function log(msg) {
// 	console.log(msg)
// }