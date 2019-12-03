const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const connection  = require('./connection.js');  

app.use(bodyParser.json());
app.get('/', (req, res) => {
  res.send('hello')
})

/**
 * 获取数据的 api
 * 参数：
 *   cate_id：筛选 1 级菜单的 ID
 *   child_id：筛选 2 级菜单的 ID
 */
app.get('/getData', (req, res) => {
  var cate_id = req.query.cate_id;
  var child_id = req.query.child_id;

  if(!cate_id || !child_id) {
    res.status(400).send('参数不合法');
    return;
  }

  //查询mysql来取得数据
  connection.getConnection().query('SELECT * FROM t_jobs WHERE parent_cate_id = ' + cate_id + 
    ' AND parent_child_id = ' + child_id, (err, results) => {

    //排序 按 add_time 降序排序
    results.sort((a,b) => {
      let cp = 0;
      cp=-a.add_time.localeCompare(b.add_time);
      if(cp==0) {
        if(a.id == b.id) cp = 0;
        else if(a.id > b.id) cp = 1;
        else if(a.id < b.id) cp = -1;
      }
      return cp;
    })
    res.send(results);
  })
})


/**
 * 发布数据
 * 参数：body
 *    {
 *      
 *    }
 */
app.post('/publishData', (req, res) => {
  var body = req.body;

  if(!body) {
    res.status(400).send('参数不合法');
    return;
  }

  var prop_arr = [], i = 0;
  var props = Object.keys(body);
  var props_str = '', props_pl_str = '';
  for(;i < props.length; i++) {
    if(i > 0) props_pl_str += ',?'; else props_pl_str = '?'; 
    if(i > 0) props_str += ',' + props[i]; else props_str = props[i]; 
    prop_arr.push(body[props[i]]);
  }

  connection.getConnection().query('INSERT INTO t_jobs(' + props_str + ') VALUES(' + props_pl_str + ')', prop_arr, (err, results) => {
    if(err) res.status(500).send('服务器错误，请稍后重试');
    else res.send('成功');
  });

})

/**
 * 侦听端口号 3010
 */
app.listen(3010, () => console.info('[Server] App listening on port 3010!'))
