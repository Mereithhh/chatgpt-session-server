# chatgpt-session-server
Use api to get chatgpt session by your username and password.  :)

Because [transitive-bullshit/chatgpt-api](https://github.com/transitive-bullshit/chatgpt-api) neeed it.

PS: This project use [playwright](https://playwright.dev/) to get session.  

The image is a little large, maybe I'll optimize.

## Deploy (docker)

```
docker run --name chatgpt-session-server -d --restart always -p 3000:3000 mereith/chatgpt-session-server:latest
```

## Usage
### request
```
POST /token
{
  "username": "your username",
  "password": "your password"
}
```
### response
```
{
  token: "your session token"
}
```


## Run localy
### Requirement

This package use playright to  simulate login behavior, and use chromium hardless mode.

so you need to install chromium first.

```bash
npx playwright install chromium
```

### Run

```bash
cd src
npm install
node server.js
```

## Separate Package

I also made a separate package just for get session token:
- [Mereithhh/chatgpt-token](https://github.com/Mereithhh/chatgpt-token)