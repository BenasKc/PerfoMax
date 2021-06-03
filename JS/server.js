

var http = require('http');
var fs = require('fs');
var mysql = require('mysql2');
var crypto = require('crypto');
var con = mysql.createConnection(
    {
        host:'localhost',
        user:'user',
        password: 'userpass'
    }
);
function authentication(req, res, next){
    res.writeHead(403, {"Content-Type":'text/html'});
    res.write(`
    <!DOCTYPE html>
    <html>
        <link rel='stylesheet' href='/err-style.css'>
        <body id='error-body'>
            <h3>Error 403</h3>
            <h1>OOPS, there seems to be a problem...</h1>
            <h2>You do not have permission to view this page, please <a href='/register'>register</a> or <a href='/login'>login</a></h2>
        </body>
    </html>`)
    res.end();
}
function onRequest(req, res){
    
    if(req.method == 'GET'){
        if(req.url !== '/login' && req.url !== '/register' && req.url !== '/err-style.css' && req.url !== '/style-auth.css'){
            //authentication(req, res);
            switch(req.url){
                case '/':
                    res.writeHead(200, {"Content-Type":'text/html'});
                    fs.createReadStream("../HTML/index.html").pipe(res);
                    break;
                case '/style.css':
                    res.writeHead(200, {"Content-Type":'text/css'});
                    fs.createReadStream("../CSS/style.css").pipe(res);
                    break;
                case '/index.js':
                    res.writeHead(200, {"Content-Type":'text/js'});
                    fs.createReadStream("../JS/index.js").pipe(res);
                    break;
                default:
                    res.writeHead(404, {"Content-Type":'text/html'});
                    fs.createReadStream("../HTML/PageMissing.html").pipe(res);
                    break;
            }
        }
        else{
            switch(req.url){
                case '/login':
                    res.writeHead(200, {"Content-Type":'text/html'});
                    fs.createReadStream("../HTML/login.html").pipe(res);
                    break;
                case '/register':
                    res.writeHead(200, {"Content-Type":'text/html'});
                    fs.createReadStream("../HTML/register.html").pipe(res);
                    break;
                case '/err-style.css':
                    res.writeHead(200, {"Content-Type":'text/css'});
                    fs.createReadStream("../CSS/err-style.css").pipe(res);
                    break;
                case '/style-auth.css':
                    res.writeHead(200, {"Content-Type":'text/css'});
                    fs.createReadStream("../CSS/style-auth.css").pipe(res);
                    break;
            }
        }
        
    }
    else if(req.method == 'POST'){
        switch(req.url){
            case '/registerauth':
                var body ='';
                req.on('data', function(chunk){
                    body += chunk;
                });
                req.on('end', function (){
                    console.log();
                        registerperson(res, req, body.split('&')[0].split('=')[1], body.split('&')[2].split('=')[1], body.split('&')[1].split('=')[1])
                    res.writeHead(302, {'Location' : '/'});
                    res.end();
                })
                
                break;
            case '/loginauth':
                
                var body ='';
                req.on('data', function(chunk){
                    body += chunk;
                });
                req.on('end', function (){
                    login(body.split('&')[0].split('=')[1], body.split('&')[1].split('=')[1], function(perm){
                        if(perm == '"OK"'){
                            res.writeHead(302, {'Location' : '/'});
                            res.end();
                        }
                        else{
                            res.writeHead(403, {"Content-Type":'text/html'});
                            res.write(`
                            <!DOCTYPE html>
                            <html>
                                <link rel='stylesheet' href='/err-style.css'>
                                <body id='error-body'>
                                    <h3>Error 403</h3>
                                    <h1>OOPS, there seems to be a problem...</h1>
                                    <h2>You do not have permission to view this page, please <a href='/register'>register</a> or <a href='/login'>login</a></h2>
                                </body>
                            </html>`)
                            res.end();
                        }
                    });
                    
                    
                })
                break;
        }
    }
}
con.connect(function(err){
    if(err) throw err;
    
})
function registerperson(res, req, Username, Password, Email){
    con.query(`CALL PerfoMax.Create_User('${Username}', '${Password}', '${Email}')`, function(err, result){
        if (err) {
            res.writeHead(405, {'Content-Type':'text/plain'});
            res.end(err);
        }
        console.log(result);
    })

}
function login(Password, Email, callback){
        con.query(`CALL PerfoMax.Authenticate_Login('${Email}', '${Password}')`, function(err, result){
        if (err) throw err;
        var statusdb = JSON.stringify(result[0][0]).split('{')[1].split(':')[1].replace('}', '');
        callback(statusdb);

    })
    return;
    
}
http.createServer(onRequest).listen(5005);
console.log(crypto.randomBytes(16).toString('hex'));
