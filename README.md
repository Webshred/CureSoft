## 🏥 MedicalSoftware:

A modern, full-stack medical management application designed to streamline healthcare operations. Built with a focus on scalability, maintainability, and user experience. 

## 🚀 Technologies Used Frontend:

Vite <br>
React<br>
TypeScript<br> 
Tailwind CSS <br>
shadcn/ui <br>

Node.js <br>
Express.js <br>
MongoDB <br>
Mongoose <br>
JWT <br>

## 📦 Getting Started:

```sh
1. Clone the Repository
git clone https://github.com/Webshred/CureSoft.git
cd MedicalSoftware

2. Install frontend dependencies
npm install

3. Start the development server
npm run dev
The frontend will be available at http://localhost:5173 by default.

4. Set Up the Backend Open a new terminal window:
cd MedicalSoftware/backend

5. Install backend dependencies
npm install

6. Create a .env file in the backend directory with the following content:
MONGO_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_jwt_secret_key
Replace your_mongodb_connection_string and your_jwt_secret_key with your actual MongoDB URI and a secure JWT secret key.

7.  Start the backend server:
node server.js
The backend will be running at http://localhost:5000.
```

## 📁 Project Structure 

```sh
MedicalSoftware/
├── backend/               # Express.js backend
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── server.js          # Entry point for the backend
│   └── .env               # Environment variables
├── public/                # Static assets
├── src/                   # React frontend source code
│   ├── components/        # Reusable components
│   ├── pages/             # Page components
│   ├── App.tsx            # Main App component
│   └── main.tsx           # Entry point for React
├── package.json           # Project metadata and scripts
├── tailwind.config.ts     # Tailwind CSS configuration
└── vite.config.ts         # Vite configuration
```
## ✅ Features User Authentication: 

Secure login and registration using JWT. <br>
Responsive Design: Mobile-first UI with Tailwind CSS. <br>
Modular Architecture: Clean separation between frontend and backend. API Integration: RESTful API for seamless data exchange. <br>
State Management: Efficient state handling with React hooks.<br>

## 🛠️ Available Scripts In the project root: 

```sh
Edit npm run dev       
# Starts the Vite development server
npm run build     
# Builds the frontend for production
npm run preview   
# Previews the production build In the backend directory:
node server.js   
# Starts the Express.js server 
```
## 📌 Notes 

Ensure MongoDB is running locally or provide a valid remote URI in the .env file. 
Use strong, unique values for JWT_SECRET to maintain security. 
Consider using tools like Postman for testing API endpoints. 

## 🤝 Contributing Contributions are welcome! 

Please fork the repository and submit a pull request for any enhancements or bug fixes. 

## 📄 License:

This project is licensed under the MIT License.
