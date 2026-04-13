import express from "express"
import {CosmosClient} from "@azure/cosmos" 
import cors from "cors"
const app = express();
app.use(cors()); // pour permettre les requêtes depuis ton front

const endpoint = "";
const key = "";
const client = new CosmosClient({ endpoint, key });

const databaseName = 'tp_final_object_connecte_db';
const containerName = 'inputs';

app.get('/api/data', async (req, res) => {
    const database = client.database(databaseName);
    const container = database.container(containerName);

    try {
        const { resources: items } = await container.items
            .query("SELECT * FROM c")
            .fetchAll();
        res.json(items);
    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur serveur");
    }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));