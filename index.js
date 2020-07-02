const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');
const qs = require('querystring');

const notFound = (req, res) => {
    fs.readFile(path.join(__dirname, '404.html'), (err, data) => {
        if (err) {
            res.write(404, 'not found')
        } else {
            res.writeHead(404, {'Content-Type': "text/html;charset='utf-8'"})
            res.write(data);
            res.end();
        }
    })
}

const writeDb = (chunk)=>{
    fs.appendFile(path.join(__dirname, 'db'), chunk, err => {
        if(err) throw err;
        console.log('db insert ', chunk && chunk.toString())
    })
}

http.createServer((req, res) => {

    // 1. 路由处理
    // 2. 静态资源托管
    // 3. HTTP verb
    // 4. store

    let pathName = url.parse(req.url).pathname;


    // /api =>

    if (pathName.startsWith('/api')) {
        const method = req.method;
        if (method === 'GET') {
            const query = qs.parse(url.parse(req.url).query) // ?a=1&b=2 => {}
            const resData = {
                code: 200,
                msg: 'success',
                data: query
            }
            res.end(JSON.stringify(resData));
            return;
        }
        if (method === 'POST') {
            const contentType = req.headers['content-type'];
            if(contentType === 'application/json'){
                let postData = '';
                req.on('data', chunk => {
                    postData += chunk;
                    writeDb(chunk);
                })
                req.on('end', ()=>{
                    res.end(postData);
                })
            }
        }
    }

    if (pathName === '/') {
        pathName = path.join(__dirname, 'index.html');
    }

    const extName = path.extname(pathName);

    if (extName === '.html') {
        // index.html
        fs.readFile(pathName, (err, data) => {
            if (err) {
                // 404 => 404.html
                notFound(req, res);
            } else {
                res.writeHead(200, {'Content-Type': "text/html;charset='utf-8'"})
                res.write(data);
                res.end();
            }
        })
    }

    // res.write('Hello Nodejs');
    // res.end();
}).listen(8080);
