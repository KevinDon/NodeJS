var RmbDollar = 60;

function roundTwoDecimals(amount) {
    return Math.round(amount * 100) / 100;
}

exports.rmbToAUD = function (rmb) {
    return roundTwoDecimals(rmb / RmbDollar)
};

exports.audToRmb = function (aud) {
    return roundTwoDecimals(aud * RmbDollar)
};