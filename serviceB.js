// Microservice B - ServiceB.js
import { MongoClient } from "mongodb";
import http from "http";
const uri = 'mongodb+srv://snehadasgupta:eie9LxnofWbEHKLv@cluster0.0xm8g3h.mongodb.net/migrator';
const dbName = 'migrator';
const collectionName = 'orders';
const PORT = 4001;
let updatedData = [];
const RETRY_LIMIT = 3; 

async function runTransactions() {
  const client = new MongoClient(uri);
  const db = client.db(dbName);
  const collection = db.collection(collectionName);
  const session = collection.client.startSession();
  const RETRY_LIMIT = 3; // Define the number of retries
  const freight = 10.25;
  const projection = {
    _id: 0,   
    employeeId: 1,  
    orderId: 1,
    freight: 1,
    customerId: 1
  };
  const query = {
    employeeId: 5,
    $or: [{ orderId: { $eq: 10248 } }, { orderId: { $eq: 10254 } }]
  };
  try {
      await session.withTransaction(async () => {
        await client.connect();
          for (let attempt = 0; attempt < RETRY_LIMIT; attempt++) {
              try {
                console.log('Service A: Transaction Started.');
                await collection.updateOne({ employeeId: 5, orderId: 10248 }, { $inc: { freight: freight } }, { session });
                await collection.updateOne({ employeeId: 5, orderId: 10254 }, { $inc: { freight: -freight } }, { session });
                console.log('Service A: Transaction committed.');
                updatedData = await collection.find(query , {projection}).toArray();
                console.log('Query Result from Service A:', updatedData);
                // If both updates succeed, exit the retry loop
                break;
              } catch (error) {
                  // Check if it's a transient error and decide if you should retry
                  if (error instanceof MongoError && error.hasErrorLabel('TransientTransactionError')) {
                      console.warn('TransientTransactionError, retrying transaction: ', attempt + 1);

                      // Add a brief delay before retrying to avoid an immediate retry storm (optional but recommended)
                      await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1)));
                  } else {
                      // If it's not a transient error or RETRY_LIMIT reached, rethrow the error
                      throw error;
                  }
              }
          }
      }, {
          readConcern: { level: 'snapshot' },
          writeConcern: { w: 'majority' },
          readPreference: 'primary'
      });
  } finally {
      session.endSession();
  }
}

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  runTransactions().then(() => 
    console.log('Transaction of Service B completed successfully')).catch(err => 
    console.error('Transaction of Service B failed', err));
  res.end(JSON.stringify(updatedData));
})

server.listen(PORT, () => {
  console.log(`Service B running at http://localhost:${PORT}/`);
  startFiringRequests();
});

function startFiringRequests() {
  setInterval(() => {
    const options = {
      hostname: '127.0.0.1',
      port: PORT,
      path: '/',
      method: 'GET',
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log(`Received response from server: ${data.trim()}`);
      });
    });
    req.on('error', (error) => {
      console.error(`Error in request: ${error.message}`);
    });
    req.end();
  }, 5000); 
}
