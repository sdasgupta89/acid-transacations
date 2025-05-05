# acid-transacations
# TRANSACTION

__Ability to update multiple different records as part of a single ACID transaction which is guaranteed to either succeed or fail as a whole__

__SA Maintainer__: [Sneha Das Guota](mailto:sneha.dasgupta@mongodb.com) <br/>
__Time to setup__: 15 mins <br/>
__Time to execute__: 15 mins <br/>


---
## Description

This proof shows how MongoDB is able handle multi document ACID compliant transactions, implemented in a way that is idiomatic to your chosen programming language, in a way that feels familiar to anyone who has used relational databases. A transaction allows a series of insert and update operations to be applied across multiple different documents which are committed together upon successful completion of all steps, or completely rolled back, if an error occurs. A transaction in a database system must maintain Atomicity, Consistency, Isolation, and Durability (ACID), in order to ensure accuracy, completeness, and data integrity. For more information, see the online [MongoDB Transactions documentation](https://docs.mongodb.com/manual/core/transactions/)

---
## Setup
__1. Configure Laptop__
* Ensure MongoDB version __4.0+__ is already installed your laptop, mainly to enable MongoDB command line tools to be used (no MongoDB databases will be run on the laptop for this proof)

__2. Configure Atlas Environment__
* Log-on to your [Atlas account](http://cloud.mongodb.com) (using the MongoDB SA preallocated Atlas credits system) and navigate to your SA project
* In the project's Security tab, choose to add a new user called __main_user__, and for __User Privileges__ specify __Read and write to any database__ (make a note of the password you specify)
* Create an __M0__ based 3 node replica-set in a single cloud provider region of your choice with default settings
* In the Security tab, add a new __IP Whitelist__ for your laptop's current IP address

__3. Start the MongoDB Shell and Connect to your Atlas Cluster__
* You must use **mongosh** to run this proof point. If you haven't done so yet, please [install mongosh](https://docs.mongodb.com/mongodb-shell/install/) before continuing.
* In the Atlas console, for the database cluster you deployed, click the __Connect button__, select __Connect with the Mongo Shell__, and in the __Run your connection string in your command line__ section copy the connection command line - make a note of this connection command line
* __IMPORTANT__: Before the Mongo Shell is started, run the following command:

  `bash setup-env.sh`
  
  The above command loads the Mongo Shell with a variable containing your Operating System username.  All non-alphanumeric characters are removed.  This variable will be used to configure a unique namespace (database and collection) to avoid any conflicts with other SAs performing this demo.

* From a command line terminal on your laptop, launch the Mongo Shell using the Atlas cluster connection command you just captured, and when prompted, provide the password that you specified in an earlier setup step, for example:
  ```bash
  mongosh "mongodb+srv://testcluster-x123x.mongodb.net/test" --username main_user 
  ```

__4. Create a Database and Insert Some Initial Data__
* Using the Shell create the _TRANSACTIONS_ database and populate a collection that uses the username of the logged in user (to avoid collisions), by inserting player documents into the collection.
  