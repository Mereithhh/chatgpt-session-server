
import http from "http"
import { chatgptToken } from "chatgpt-token/module"

const parseJSON = (d) => {
  let r = {};
  try {
    r = JSON.parse(d)
  } catch (err) { }
  return r;
}
http.createServer(async function (request, response) {
  const getData = (req) => {
    return new Promise((resolve) => {
      let d = "";
      req.on("data", (chunk) => {
        d = d + String(chunk)
      })
      req.on("end", () => {
        resolve(d)
      })
    })
  }
  const d = await getData(request)
  if (request.method == "POST" && request.url == "/token") {
    const body = parseJSON(d);
    if (Boolean(body.username) && Boolean(body.password)) {
      console.log("[request]", body)
      const token = await chatgptToken(body.username, body.password)
      if (token) {
        response.writeHead(200, { "Content-Type": "application/json" });
        const res = {
          token,
        }
        console.log("[get token success]", res)
        response.end(JSON.stringify(res))
        return;
      } else {
        response.statusCode = 500
        response.end()
        return;
      }
    } else {
      response.statusCode = 417
      response.end()
      return;
    }
  } else {
    response.statusCode = 404
    response.end()
    return;
  }
}).listen(3000)

console.log("server start！")