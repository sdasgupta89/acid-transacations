import { MongoClient } from "mongodb";
const uri = "mongodb+srv://snehaDS:m.%40NGaMs3kQ9zkp@clustersharded.h3mp9.mongodb.net/sample_airbnb?retryWrites=true&w=majority";


async function runTransaction() {
  const client = new MongoClient(uri);

  try {
    await client.connect();

    const session = client.startSession();

    const transactionOptions = {
      readConcern: { level: 'snapshot' },
      writeConcern: { w: 'majority' },
      readPreference: 'primary'
    };

    try {
      const result = await session.withTransaction(async () => {
        const db = client.db('sample_airbnb');
        const collection = db.collection('listingsAndReviews');
        const bedrooms = 1;

        await collection.updateOne(
          { _id: "10006546" },
          { $inc: { bedrooms: +bedrooms } },
          { session }
        );

        await collection.updateOne(
            { _id: "10009999" },
            { $inc: { bedrooms: -bedrooms } },
            { session }
        );
      }, transactionOptions);
      console.log("Transaction committed successfully.", result);
    } catch (error) {
      console.error("Transaction aborted due to an error:", error);
    } finally {
      session.endSession();
    }

  } catch (error) {
    console.error("MongoDB connection error:", error);
  } finally {
    await client.close();
  }
}

runTransaction().catch(console.error);
