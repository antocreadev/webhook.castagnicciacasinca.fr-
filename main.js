const express = require('express');
const { exec } = require('child_process');
const app = express();
const PORT = 4000;

let isBuilding = false;
let pendingBuild = false;

app.use(express.json());

function runBuild(res = null) {
  if (isBuilding) {
    pendingBuild = true;
    console.log('Build déjà en cours, mis en attente...');
    if (res) res.status(202).send('Build en cours, requête mise en attente');
    return;
  }

  isBuilding = true;
  pendingBuild = false;
  console.log('Début du build...');

  const buildCmd = `
    cd ~/astro-tourisme.castagnicciacasinca.fr && \
    rm -rf dist && \
    npm run build && \
    sudo cp -r dist/* /var/www/tourisme.castagnicciacasinca.fr
  `;

  exec(buildCmd, (error, stdout, stderr) => {
    isBuilding = false;

    if (error) {
      console.error(`Erreur: ${error.message}`);
      if (stderr) console.error(`stderr: ${stderr}`);
      if (res) res.status(500).send('Erreur pendant le build');
    } else {
      console.log('Build terminé avec succès');
      if (stdout) console.log(`stdout: ${stdout}`);
      if (res) res.status(200).send('Build terminé avec succès');
    }

    // Si un build était en attente, le lancer
    if (pendingBuild) {
      console.log('Lancement du build en attente...');
      runBuild();
    }
  });
}

app.post('/rebuild', (req, res) => {
  console.log('Webhook reçu !');
  runBuild(res);
});

app.listen(PORT, () => {
  console.log(`Serveur prêt sur http://localhost:${PORT}`);
});