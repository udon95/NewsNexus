const { HocuspocusServer } = require('@hocuspocus/server')

const server = new HocuspocusServer({
  port: 4000,  // You can choose another port if needed
  host: 'https://bwnu7ju2ja.ap-southeast-1.awsapprunner.com/', // Or your host URL if deploying
})

server.start()
