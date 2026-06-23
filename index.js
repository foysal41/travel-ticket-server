const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());
const { MongoClient, ServerApiVersion , ObjectId } = require("mongodb");
const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const uri = process.env.MONGO_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const database = client.db("travel_ticket_db");
    const ticketCollections = database.collection("tickets");
    const bookedTicketCollection = database.collection('booked_tickets')

    app.get("/api/tickets", async (req, res) => {
      const result = await ticketCollections.find().toArray();
      console.log(result);
      res.send(result);
    });

    app.post("/api/createTicket", async (req, res) => {
      const tickets = req.body;
      const result = await ticketCollections.insertOne(tickets);
      res.send(result);
    });


    //ticket update api
  app.patch("/api/ticket/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log("ID:", id);
    console.log("DATA:", updateData);

    const result = await ticketCollections.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updateData,
          verificationStatus: "pending",
        },
      }
    );

    res.send(result);
  } catch (error) {
    console.error("PATCH ERROR:", error);
    res.status(500).send({
      message: error.message,
    });
  }
});


app.patch('/api/bookedTicket/status/:id', async(req, res) => {
  const {id} = req.params;
  const {status} = req.body;


  const result = await bookedTicketCollection.updateOne(
    {_id : new ObjectId(id)},
    {
      $set:{
        status: status,
      }
    }
  )

  res.send(result)
})


app.patch('/api/tickets/reduce-quantity/:id' , async(req, res)=> {
  const id = req.params.id;
  const {bookingQuantity} = req.body;

  const ticket = await ticketCollections.findOne({
    _id: new ObjectId(id),
  });


  const updateQuantity = Number(ticket.quantity) = Number(bookingQuantity);

  const result = await ticketCollections.updateOne(
    {_id: new ObjectId(id)},
    {
      $set: {
        quantity:String(updateQuantity)
      }
    }
  )

  res.send(result)



})




//-------------------ADMIN related API ----------------------------------
app.patch("/api/ticket/status/:id" , async(req, res) => {
  const {id}  = req.params;

  const {status} = req.body;

    console.log("ID:", id);
  console.log("STATUS:", status);

  const result = await ticketCollections.updateOne(
    {_id: new ObjectId(id)},
    {
      $set:{
        verificationStatus: status,
      },
    }
  )

  res.send(result);
})

// app.patch("/api/advertiseTicket/status/:id", async (req, res) => {
//   const { id } = req.params;
//    const { ticketDisplayByAdmin } = req.body;

//   console.log("ads id:", id);
//   console.log("ads status:", status);

//   const result = await ticketCollections.updateOne(
//     { _id: new ObjectId(id) },
//     {
//       $set: {
//        ticketDisplayByAdmin,
//       },
//     }
//   );

//   res.send(result);
// });


//-------------------User related API ----------------------------------

app.get("/api/allBookedTickets" , async(req, res) => {
  const result = await bookedTicketCollection.find().toArray();
 res.send(result)
})

app.post("/api/bookedTicket", async(req, res) => {
  const bookedTicket = req.body
  const result = await bookedTicketCollection.insertOne(bookedTicket);
  res.send(result);
})






    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
