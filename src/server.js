import { chromium } from '@playwright/test';
import { writeFileSync } from "fs"
import http from "http"

const headers = {
  "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
};

let i = 0;
const writePic = async (page) => {
  const buffer = await page.screenshot()
  writeFileSync(`${i}.png`, buffer)
  i++
}

const getToken = async (username, password, withPic) => {

  const browser = await chromium.launch();

  const context = await browser.newContext();

  const page = await context.newPage();

  await page.setExtraHTTPHeaders(headers)

  await page.goto("https://chat.openai.com/auth/login")
  if (withPic) {
    await writePic(page)
  }

  await page.waitForSelector('button:nth-child(1)')

  await page.click('button:nth-child(1)')

  await page.waitForSelector('h1')
  if (withPic) {
    await writePic(page)
  }

  await page.fill('#username', username);
  await page.click('button[type="submit"]')

  await page.waitForSelector('#password')
  await page.waitForSelector('button[type="submit"]')
  await page.waitForSelector('h1')

  await page.fill('#password', password);

  await page.click('button[type="submit"]')
  if (withPic) {
    await writePic(page)
  }
  let ok = true;

  try {
    await page.waitForURL("https://chat.openai.com/chat", { timeout: 10000 })
  } catch (err) {
    ok = false;
  }
  if (ok) {
    if (withPic) {
      await writePic(page)
    }

    const cookies = (await context.storageState()).cookies

    const sessionTokenItem = cookies.find(item => item.name == "__Secure-next-auth.session-token")

    const token = sessionTokenItem.value;
    await browser.close();
    return token;

  } else {
    await browser.close();
    return false;
  }

}


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
      const token = await getToken(body.username, body.password)
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