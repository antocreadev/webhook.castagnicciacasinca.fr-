const express = require('express');
const { exec } = require('child_process');
const app = express();
const PORT = 4000;

app.use(express.json());

app.post('/rebuild', (req, res) => {
  console.log('Webhook reçu ! Début du build...');

  const buildCmd = `
    cd ~/astro-tourisme.castagnicciacasinca.fr && \
    npm run build && \
    sudo cp -r dist/* /var/www/tourisme.castagnicciacasinca.fr
  `;

  exec(buildCmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`Erreur: ${error.message}`);
      return res.status(500).send('Erreur pendant le build');
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
    }
    console.log(`stdout: ${stdout}`);
    res.status(200).send('Build terminé avec succès');
  });
});

app.listen(PORT, () => {
  console.log(`Serveur prêt sur http://localhost:${PORT}`);
});

