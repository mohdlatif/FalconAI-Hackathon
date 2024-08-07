# LexiLeap 📚🚀

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Chrome Web Store](https://img.shields.io/badge/Chrome-Extension-blue.svg)](https://chrome.google.com/webstore)
[![Mobile App](https://img.shields.io/badge/Mobile-App-green.svg)](https://play.google.com/store)

LexiLeap is an innovative vocabulary learning tool designed for non-native English speakers. It seamlessly integrates into your daily web browsing experience, making language learning effortless and contextual.

## 🌟 Features

- 🧠 AI-powered definitions and examples
- 🖱️ One-click word saving
- 🔍 Automatic word highlighting across websites
- 💡 Hover-over functionality for quick meaning recall
- 👤 Personalized word banks

## 🏗️ Project Structure

The project consists of three main components:

1. 🌐 Chrome Extension
2. 📱 Mobile App
3. 🖥️ Backend Server

### Chrome Extension 🌐

The Chrome extension is the core component of LexiLeap. It allows users to interact with web pages, save words, and view definitions.

#### Setup
1. Navigate to the `extension` folder
2. Load the extension in Chrome from the `extension` folder

### Mobile App 📱

The mobile app provides on-the-go access to saved words and definitions.

> Note: The mobile app was challenging to implement, but we managed to create a functional version. It may have limited features compared to the Chrome extension.

#### Setup
1. Navigate to the `mobile-app` folder
2. Install dependencies: `npm install`
3. Run the app:
   - For Android: `npx react-native run-android`
   - For iOS: `npx react-native run-ios`

### Backend Server 🖥️

The backend server handles user authentication, stores user data, and serves AI-generated definitions.

#### Setup
1. Navigate to the `backend` folder
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Start the server: `npm start`
