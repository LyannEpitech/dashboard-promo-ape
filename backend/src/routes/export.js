import { Router } from 'express';
import GitHubService from '../services/github.js';
import { calculateStudentMetrics } from '../services/metrics.js';

const router = Router();

// GET /api/export/csv
router.get('/csv', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const { org = 'Epitech', maxStudents = 50 } = req.query;
    const github = new GitHubService(req.user.accessToken);

    // Récupérer les membres
    const members = await github.getOrgMembers(org, parseInt(maxStudents));
    
    // Calculer les métriques pour chaque étudiant
    const students = [];
    for (const member of members.slice(0, parseInt(maxStudents))) {
      try {
        const user = await github.getUser(member.login);
        const repos = await github.getUserRepos(member.login, 5);
        
        let allCommits = [];
        for (const repo of repos.slice(0, 5)) {
          const commits = await github.getRepoCommits(member.login, repo.name);
          allCommits = allCommits.concat(commits);
        }
        
        const metrics = calculateStudentMetrics(user, repos, allCommits);
        students.push(metrics);
      } catch (error) {
        console.error(`Erreur pour ${member.login}:`, error.message);
      }
    }

    // Générer CSV
    const headers = [
      'username',
      'displayName',
      'totalRepos',
      'totalCommits',
      'commitsLastWeek',
      'daysSinceLastCommit',
      'activityRate',
      'activityScore',
      'isInactive',
      'isRush',
      'lastCommitDate',
      'profileUrl'
    ];

    const csvRows = [headers.join(',')];
    
    for (const student of students) {
      const row = [
        student.username,
        `"${student.displayName}"`,
        student.totalRepos,
        student.totalCommits,
        student.commitsLastWeek,
        student.daysSinceLastCommit,
        student.activityRate.toFixed(2),
        student.activityScore,
        student.isInactive,
        student.isRush,
        student.lastCommitDate || '',
        student.profileUrl
      ];
      csvRows.push(row.join(','));
    }

    const csv = csvRows.join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="students-${org}-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);

  } catch (error) {
    console.error('Erreur export CSV:', error);
    res.status(500).json({ error: 'Erreur lors de l\'export CSV' });
  }
});

// GET /api/export/json
router.get('/json', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const { org = 'Epitech', maxStudents = 50 } = req.query;
    const github = new GitHubService(req.user.accessToken);

    const members = await github.getOrgMembers(org, parseInt(maxStudents));
    
    const students = [];
    for (const member of members.slice(0, parseInt(maxStudents))) {
      try {
        const user = await github.getUser(member.login);
        const repos = await github.getUserRepos(member.login, 5);
        
        let allCommits = [];
        for (const repo of repos.slice(0, 5)) {
          const commits = await github.getRepoCommits(member.login, repo.name);
          allCommits = allCommits.concat(commits);
        }
        
        const metrics = calculateStudentMetrics(user, repos, allCommits);
        students.push(metrics);
      } catch (error) {
        console.error(`Erreur pour ${member.login}:`, error.message);
      }
    }

    res.json({
      exportedAt: new Date().toISOString(),
      organization: org,
      count: students.length,
      students
    });

  } catch (error) {
    console.error('Erreur export JSON:', error);
    res.status(500).json({ error: 'Erreur lors de l\'export JSON' });
  }
});

// GET /api/export/pdf
router.get('/pdf', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const { org = 'Epitech', maxStudents = 50 } = req.query;
    const github = new GitHubService(req.user.accessToken);

    const members = await github.getOrgMembers(org, parseInt(maxStudents));
    
    const students = [];
    for (const member of members.slice(0, parseInt(maxStudents))) {
      try {
        const user = await github.getUser(member.login);
        const repos = await github.getUserRepos(member.login, 5);
        
        let allCommits = [];
        for (const repo of repos.slice(0, 5)) {
          const commits = await github.getRepoCommits(member.login, repo.name);
          allCommits = allCommits.concat(commits);
        }
        
        const metrics = calculateStudentMetrics(user, repos, allCommits);
        students.push(metrics);
      } catch (error) {
        console.error(`Erreur pour ${member.login}:`, error.message);
      }
    }

    // Pour l'instant, retourner un PDF simple (placeholder)
    // Dans une vraie implémentation, utiliser une librairie comme puppeteer ou pdfkit
    const html = `
      <html>
        <head><title>Export ${org}</title></head>
        <body>
          <h1>Rapport d'activité - ${org}</h1>
          <p>Exporté le: ${new Date().toLocaleString('fr-FR')}</p>
          <table border="1">
            <tr>
              <th>Nom</th>
              <th>Commits</th>
              <th>Score</th>
              <th>Statut</th>
            </tr>
            ${students.map(s => `
              <tr>
                <td>${s.displayName}</td>
                <td>${s.totalCommits}</td>
                <td>${s.activityScore}/100</td>
                <td>${s.isInactive ? 'Inactif' : s.isRush ? 'Rush' : 'Actif'}</td>
              </tr>
            `).join('')}
          </table>
        </body>
      </html>
    `;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="students-${org}-${new Date().toISOString().split('T')[0]}.pdf"`);
    
    // Pour l'instant, on retourne le HTML avec un content-type PDF
    // Le navigateur proposera le téléchargement
    res.send(Buffer.from(html));

  } catch (error) {
    console.error('Erreur export PDF:', error);
    res.status(500).json({ error: 'Erreur lors de l\'export PDF' });
  }
});

export default router;