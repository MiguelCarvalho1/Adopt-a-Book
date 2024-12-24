import React from 'react';


function RankingsPage() {
  const rankings = [
    { position: 1, name: 'Maria Antunes', transactions: 15 },
    { position: 2, name: 'Carlos Oliveira', transactions: 12 },
  ];

  const badges = [
    { name: 'Top Doador', icon: '🏅', description: 'Realizou mais de 10 doações.' },
    { name: 'Primeira Troca', icon: '🎉', description: 'Concluiu a primeira troca.' },
  ];

  return (
    <div>
      <h1>Rankings e Conquistas</h1>

    </div>
  );
}

export default RankingsPage;
