
const mysql = require('mysql');

var connection = null;

function initMySqlConnection() {

  connection = mysql.createConnection({     
    host: 'localhost',
    user: 'root',
    password: '123456',
    port: '3306',
    database: 'jzapi',
    timezone: '08:00'
  }); 
  connection.on('error', function(err) {
    if(err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log('[Server] 数据库连接释放');
        connection = null;
    } else {
        throw err;
    }
  });
  connection.connect();
  console.log('[Server] 连接数据库');
}

module.exports = {
  /**
   * 获取 MYSQL 连接
   * @returns {mysql.Connection} MYSQL 连接
   */
  getConnection() { 
    if(connection == null)
      initMySqlConnection();
    return connection;
  }
}