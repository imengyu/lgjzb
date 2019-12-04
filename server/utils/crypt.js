var crypto = require('crypto');
 
/**
 * 加密方法
 * @param {string} key 加密key
 * @param {string} iv       向量
 * @param {string} data     需要加密的数据
 * @returns {string}
 */
var encrypt = function (key, iv, data) {
    var cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
    var crypted = cipher.update(data, 'utf8', 'binary');
    crypted += cipher.final('binary');
    crypted = new Buffer(crypted, 'binary').toString('base64');
    return crypted;
};
 
/**
 * 解密方法
 * @param {string} key      解密的key
 * @param {string} iv       向量
 * @param {string} crypted  密文
 * @returns {string}
 */
var decrypt = function (key, iv, crypted) {
    crypted = new Buffer(crypted, 'base64').toString('binary');
    var decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
    var decoded = decipher.update(crypted, 'binary', 'utf8');
    decoded += decipher.final('utf8');
    return decoded;
};

module.exports = {
  encrypt,
  decrypt
}