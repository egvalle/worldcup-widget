const fs = require('fs');

async function actualizar() {

    const response = await fetch(
        'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard'
    );

    const data = await response.json();

    const eventos = data.events || [];

    const resultado = [];

    eventos.slice(0, 5).forEach(evento => {

        const comp = evento.competitions[0];

        const local = comp.competitors.find(
            c => c.homeAway === 'home'
        );

        const visita = comp.competitors.find(
            c => c.homeAway === 'away'
        );

        resultado.push({

            home:
                local.team.abbreviation ||
                local.team.shortDisplayName,

            away:
                visita.team.abbreviation ||
                visita.team.shortDisplayName,

            score:
                local.score + '-' + visita.score,

            state:
                evento.status.type.state,

            detail:
                evento.status.type.detail,

            date:
                evento.date
        });

    });

    fs.writeFileSync(
        './data/matches.json',
        JSON.stringify(resultado, null, 2)
    );

}

actualizar();
