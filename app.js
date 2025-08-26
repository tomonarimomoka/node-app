const http = require('http'); //httpモジュールを取得
const fs = require('fs');
const ejs = require('ejs'); //ejsオブジェクトの読み込み
const url = require('url');
const qs = require('querystring');
//テンプレートファイルの読み込み
//非同期だからコールバック関数は必要ない
//サーバーが起動する前だからできること。。
const index_page = fs.readFileSync('./index.ejs','utf8');
const other_page = fs.readFileSync('./other.ejs','utf8');
const style_css = fs.readFileSync('./style.css','utf-8');

var data ={msg:'no message...'};

var data2 ={
    'Taro':['taro@taro','090-999-999','Tokyo'],
    'Miku':['miku@miku','07033310112','sancha'],
    'Shiromoto':['shiromoto@shiromoto','0120-333-096','akasaka'],
    'kurashian':['kurasian@kurasian','0120-500-500','yokohama'],
}

var server = http.createServer(getFromClient);
//httpサーバーを待ち受け状態にする
server.listen(3000); 
console.log('Server start!');


//method!
//createServerの処理
function getFromClient(request,response){
    var url_parts = url.parse(request.url,true); //第二引数にtrueを入れることでクエリパラメータをJSON風に持てる
    switch(url_parts.pathname){
        case '/':

            response_index(request,response);
            break;
        case '/other':
            response_other(request,response);
            break;
        case '/style.css':
            response.writeHead(200,{'Content-Type':'text/css'});
            response.write(style_css);
            response.end();
            break;
        default:
            response.writeHead(200,{'Content-Type':'text/plain'});
            response.end('no page...');
            break;
    }
}

function response_index(request,response){

    //POSTアクセス時の処理
    if(request.method == 'POST'){
        //console.log("********request.method == 'POST'********")
        
        var body = '';

        //データ受信のイベント処理
        request.on('data',(data) => {
            body += data;
        });

        //データ受信終了のアクセス処理
        request.on('end',() => {
            data = qs.parse(body); //データのパース

            //cookieの保存
            setcookie('msg',data.msg,response);

            write_index(request,response);
        });
    }else{
        write_index(request,response);
    }
}

function response_other(request,response){
    var msg = "これはOtherページです。"
    var content = ejs.render(other_page,{
        title:"Other",
        content:msg,
        data:data2,
        filename:'data_item',
    });

    response.writeHead(200,{'Content-type':'text/html'});
    response.write(content);
    response.end();
}


//indexの表示作成
function write_index(request,response){
    console.log("********write_index********")
    var msg = "※伝言を表示します"
    var cookie_data = getcookie('msg',request);
    console.log("cookie_data = ",cookie_data)
    //cookie_data = "test cookie_data" 
    var content = ejs.render(index_page , {
        title:"index",
        content:msg,
        data:data,
        cookie_data:cookie_data,
    });
    response.writeHead(200,{'Content-Type':'text/html'});
    response.write(content);
    response.end();
}

function setcookie(key,value,response){
    console.log("********setcookie********")
    var cookie = qs.escape(value);
    console.log("cookie = " + cookie)
    response.setHeader('Set-Cookie',[key + '=' + cookie]);
}

function getcookie(key,request){
    console.log("********getcookie********")
    console.log("request.headers.cookie = " + request.headers.cookie)
    var cookie_data = request.headers.cookie != undefined ? request.headers.cookie:'';
    var data = cookie_data.split(';');
    for(var i in data){
        if(data[i].trim().startsWith(key + '=')){
            var result = data[i].trim().substring(key.length + 1);
            return unescape(result);
        }
    }
    return '';
}