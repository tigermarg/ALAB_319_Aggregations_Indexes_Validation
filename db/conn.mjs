//Imports
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

//Create connection string
const connectionString = process.env.atlasURI || '';

const client = new MongoClient(connectionString);

let conn;

try {
    //try to connect to client
    conn = await client.connect();
    console.log(`MongoDB is connected`);
} catch (err) {
    console.error(err)
}

let db = conn.db('sample_training');

export default db;