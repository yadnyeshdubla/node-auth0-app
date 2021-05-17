### node auth0 app

using https://auth0.com/ for user authentication


## Getting started


To get the frontend running locally:

- Clone this repo
- `npm install` to install all req'd dependencies
- `node index.js` to start the local server (this project uses create-react-app)


Local web server will use port 3000 
 



**API:**

- /auth/login   for login
- /auth/register for register
- /api/me will give login user data
- /api/upload to upload image for loggedin user
- /publi/images/{userId} will get image as response