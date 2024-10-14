// Importa MongoClient de la biblioteca de MongoDB
const { MongoClient } = require('mongodb');

// Reemplaza la URI con la que obtuviste de MongoDB Atlas
const uri = 'mongodb+srv://<usuario>:<contraseña>@<nombre-del-cluster>.mongodb.net/<nombreDeTuBaseDeDatos>?retryWrites=true&w=majority';

async function main() {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        // Conéctate al cliente
        await client.connect();
        console.log('Conexión exitosa a MongoDB Atlas');

        // Selecciona la base de datos
        const database = client.db('<nombreDeTuBaseDeDatos>'); // Asegúrate de reemplazar esto
        const sales = database.collection('sales');

        // Inserta varios documentos en la colección sales
        await sales.insertMany([
            { 'item': 'abc', 'price': 10, 'quantity': 2, 'date': new Date('2014-03-01T08:00:00Z') },
            { 'item': 'jkl', 'price': 20, 'quantity': 1, 'date': new Date('2014-03-01T09:00:00Z') },
            { 'item': 'xyz', 'price': 5, 'quantity': 10, 'date': new Date('2014-03-15T09:00:00Z') },
            { 'item': 'xyz', 'price': 5, 'quantity': 20, 'date': new Date('2014-04-04T11:21:39.736Z') },
            { 'item': 'abc', 'price': 10, 'quantity': 10, 'date': new Date('2014-04-04T21:23:13.331Z') },
            { 'item': 'def', 'price': 7.5, 'quantity': 5, 'date': new Date('2015-06-04T05:08:13Z') },
            { 'item': 'def', 'price': 7.5, 'quantity': 10, 'date': new Date('2015-09-10T08:43:00Z') },
            { 'item': 'abc', 'price': 10, 'quantity': 5, 'date': new Date('2016-02-06T20:20:13Z') },
        ]);

        // Ejecuta un comando find para ver los artículos vendidos el 4 de abril de 2014.
        const salesOnApril4th = await sales.find({
            date: { $gte: new Date('2014-04-04'), $lt: new Date('2014-04-05') }
        }).count();

        // Imprime un mensaje en la consola.
        console.log(`${salesOnApril4th} sales occurred on April 4th, 2014.`);

        // Ejecuta una agregación y abre un cursor a los resultados.
        const aggregationResults = await sales.aggregate([
            // Encuentra todas las ventas que ocurrieron en 2014.
            { $match: { date: { $gte: new Date('2014-01-01'), $lt: new Date('2015-01-01') } } },
            // Agrupa el total de ventas por cada producto.
            { $group: { _id: '$item', totalSaleAmount: { $sum: { $multiply: ['$price', '$quantity'] } } } }
        ]).toArray();

        // Imprime los resultados de la agregación.
        console.log('Sales aggregation results:', aggregationResults);

    } catch (error) {
        console.error('Error en la conexión o ejecución:', error);
    } finally {
        // Cierra la conexión al cliente
        await client.close();
    }
}

// Llama a la función principal
main().catch(console.error);
