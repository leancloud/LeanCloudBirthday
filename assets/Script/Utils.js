function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

function padding(num, length) {
    for(var len = (num + "").length; len < length; len = num.length) {
        num = "0" + num;            
    }
    return num;
}

function formatDateStr(num) {
    return ('0' + num).slice(-2);
}

module.exports = {
    getRandomInt,
    padding,
    formatDateStr,
};