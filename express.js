const express = require('express');
const sqlite3 = require('sqlite3');
const app = express();
const port = 3000;


const db = new sqlite3.Database("./itemsdb.sqlite", (err) => {
    if (err) {
        console.error("Erro ao criar ou conectar ao banco de dados", err);
    } else {
        console.log("Banco de dados conectado com sucesso");
    }
});


db.run(`CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    descricao TEXT NOT NULL,
    data_adicao DATE DEFAULT CURRENT_TIMESTAMP
)`, (err) => {
    if (err) {
        console.error("Erro ao criar a tabela", err);
    } else {
        console.log("Tabela criada com sucesso");
    }
});

app.use(express.json());


app.post('/items', (req, res) => {
    const { name, descricao } = req.body;


    if (!name || !descricao) {
        return res.status(400).json({ message: "O nome e a descrição são obrigatórios" });
    }

    const query = 'INSERT INTO items (nome, descricao) VALUES (?, ?)';

    db.run(query, [name, descricao], function(err) {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        res.status(201).json({
            id: this.lastID,
            name,
            descricao
        });
    });
});


app.get('/items', (req, res) => {
    const query = 'SELECT * FROM items';

    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        res.status(200).json(rows);
    });
});


app.get('/items/:id', (req, res) => {
    const { id } = req.params;

    const query = 'SELECT * FROM items WHERE id = ?';

    db.get(query, [id], (err, row) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }

        if (!row) {
            return res.status(404).json({ message: "Item não encontrado" });
        }

        res.status(200).json(row);
    });
});


app.put('/items/:id', (req, res) => {
    const { id } = req.params;
    const { name, descricao } = req.body;


    if (!name || !descricao) {
        return res.status(400).json({ message: "O nome e a descrição são obrigatórios" });
    }

    const query = 'UPDATE items SET name = ?, descicao = ? WHERE id = ?';

    db.run(query, [name, descricao, id], function(err) {
        if (err) {
            return res.status(400).json({ message: err.message });
        }

        if (this.changes === 0) {
            return res.status(404).json({ message: "Item não encontrado" });
        }

        res.status(200).json({ id, name, descricao });
    });
});


app.patch('/items/:id', (req, res) => {
    const { id } = req.params;
    const { name, descricao } = req.body;


    const updates = [];
    const values = [];

    if (name) {
        updates.push("nome = ?");
        values.push(name);
    }
    if (descricao) {
        updates.push("descricao = ?");
        values.push(descricao);
    }

    if (updates.length === 0) {
        return res.status(400).json({ message: "Nada para atualizar. Envie pelo menos um campo" });
    }


    values.push(id);

    const query = 'UPDATE items SET ${updates.join(", ")} WHERE id = ?';

    db.run(query, values, function(err) {
        if (err) {
            return res.status(400).json({ message: err.message });
        }

        if (this.changes === 0) {
            return res.status(404).json({ message: "Item não encontrado" });
        }

        res.status(200).json({ id, name, descricao });
    });
});


app.delete('/items/:id', (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM items WHERE id = ?';

    db.run(query, [id], function(err) {
        if (err) {
            return res.status(400).json({ message: err.message });
        }

        if (this.changes === 0) {
            return res.status(404).json({ message: "Item não encontrado" });
        }

        res.status(200).json({ message: "Item deletado com sucesso" });
    });
});


app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});