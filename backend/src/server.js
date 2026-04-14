import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { testConnection } from './config/db.js';
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
