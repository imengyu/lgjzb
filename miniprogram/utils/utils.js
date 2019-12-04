module.exports = {
  formatDate
}

Date.prototype.format = formatDate;

function formatDate(formatStr) {
  var str = formatStr ? formatStr : 'YYYY-MM-dd HH:ii:ss';
  //var Week = ['日','一','二','三','四','五','六'];   
  str = str.replace(/yyyy|YYYY/, this.getFullYear());
  str = str.replace(/MM/, pad(this.getMonth() + 1, 2));
  str = str.replace(/dd|DD/, pad(this.getDate(), 2));
  str = str.replace(/HH/, pad(this.getHours(), 2));
  str = str.replace(/hh/, pad(this.getHours() > 12 ? this.getHours() - 12 : this.getHours(), 2));
  str = str.replace(/mm/, pad(this.getMinutes(), 2));
  str = str.replace(/ii/, pad(this.getMinutes(), 2));
  str = str.replace(/ss/, pad(this.getSeconds(), 2));
  return str;
}