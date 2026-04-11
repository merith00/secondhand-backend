import dotenv from 'dotenv';
import app from './app.js';
import { testConnection } from './config/db.js';
dotenv.config();
const PORT = process.env.PORT || 5000;
const startServer = async () => {
    try {
        await testConnection();
        app.listen(PORT, () => {
            console.log(`Server laeuft auf Port ${PORT}`);
        });
    } catch (error) {
        console.error('Server konnte nicht gestartet werden:', error.message);
        process.exit(1);
    }
};
startServer();
