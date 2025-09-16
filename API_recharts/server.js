const express = require('express');
const cors = require('cors');
const fs = require('fs');
const csv = require('csv-parser');
const app = express();
const PORT = 3001;

app.use(cors());

function lerCSV(caminho, callback) {
  const resultados = [];
  fs.createReadStream(caminho)
    .pipe(csv())
    .on('data', (data) => resultados.push(data))
    .on('end', () => {
      callback(resultados);
    });
}

app.get('/API_recharts/custos', (req, res) => {
  lerCSV('./custos.csv', (dados) => {
    res.json(dados);
  });
});

//Depois, quando migrar para Protheus direto, é só trocar a função lerCSV por uma query SQL → o front continua igual, sem mudar nada.

const custos = require('./custos.json'); 

app.get('/API_recharts/custos', (req, res) => {
  const { ano } = req.query; 
  let resultado = custos;

  if (ano) {
    resultado = custos.filter(c => c.ano == ano);
  }

  res.json(resultado);
});

app.get('/API_recharts/consumo', (req, res) => {
  const agrupado = {};

  custos.forEach(item => {
    if (!agrupado[item.mes]) {
      agrupado[item.mes] = 0;
    }
    agrupado[item.mes] += item.custo;
  });

  const resultado = Object.keys(agrupado).map(mes => ({
    mes: parseInt(mes),
    custo: agrupado[mes]
  }));

  res.json(resultado);
});

app.listen(PORT, () => console.log(`API rodando na porta ${PORT}`));
