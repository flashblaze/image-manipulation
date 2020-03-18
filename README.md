# image-manipulation

A simple image manipulation website created in React and Node

# Installation and usage

1. Clone the repo using `git clone https://github.com/FlashBlaze/image-manipulation.git`

2. Go into directory `cd image-manipulation` and install dependencies `npm install`

3. Register an application on [Imgur](https://api.imgur.com/oauth2/addclient)

   - Choose your application name
   - Choose `OAuth 2 authorization without a callback URL`
   - Skip Application website
   - Enter your email and description
   - Copy the `Client ID`

4. Create `.env` file at the root of directory and paste the Client ID like so
   `CLIENT_ID=your_value_here`

5. After installation, run the app `npm run dev-nodemon` and go to http://localhost:3000 in your preferred browser to view the site

### Frontend:

- React
- Next
- Antd

### Backend:

- Express
- Sharp
- Imgur API

#### Why Heroku? Isn't Zeit preferred for Next.js?

Initially the site was hosted on [Zeit](https://zeit.co). However, it does not appear to support file uploading (at least for me it didn't). As a result, it is now being hosted on [Heroku](https://heroku.com)
