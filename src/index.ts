import express from 'express';
import dotenv from 'dotenv';

import {start} from './bot';

dotenv.config();
const app = express();



const port = process.env.PORT || 4000;
app.listen(port, () => {
    start();
    console.log(`App is running on port ${port}`);
});
