require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./confgis/dbConfig.js');
const { PORT } = process.env;

// const { graphqlHTTP } = require('express-graphql');
// const userSchema = require('./graph-ql-schema/user-graphql.schemas');
// const userResolver = require('./graphql-resolvers/user-resolver');
// require('./quene/worker.js');

const app = express();
app.use(cors({
    origin: ["http://localhost:3000"]
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use("/uploads", express.static("uploads"))
app.use(morgan('dev'));

app.use("/api", require('./routes/index'));

// app.use('/graphql', graphqlHTTP({
//     schema: userSchema,
//     rootValue: userResolver,
//     graphiql: true,
// }));

connectDB();

app.listen(PORT, () => {
    console.log(`server is listening at ${PORT} !!`)
})
