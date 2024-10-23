### Install and run locally

`npm install --force`
`npm start`
navigate to "main.localhost:3000" it is important to use main.localhost and not localhost directly so cookies could work!!!!

### Docker

docker build -t my-cra-app .
docker run -p 3000:3000 my-cra-app
