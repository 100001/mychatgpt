### 使用说明
1. 执行命令：npm i
2. 在根目录新增.env文件，将apiKey直接copy进去
3. 本地开发执行命令：node server ，然后浏览器访问localhost:3000
4. 部署到服务器，需要先安装pm2，然后执行：pm2 start index.json