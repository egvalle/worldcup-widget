const fs = require('fs');

async function actualizar() {

    const response = await fetch(
        'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard'
    );

    const data = await response.json();

    const eventos = data.events || [];

    const hoyGT = new Date().toLocaleDateString(
        'en-CA',
        {
            timeZone: 'America/Guatemala'
        }
    );

    const eventosHoy = eventos.filter(evento => {

        const fechaEvento = new Date(evento.date)
            .toLocaleDateString(
                'en-CA',
                {
                    timeZone: 'America/Guatemala'
                }
            );

        return (
            fechaEvento === hoyGT &&
            ['pre', 'in'].includes(evento.status.type.state)
        );
    });

    eventosHoy.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
    );

    const resultado = [];

    eventosHoy.forEach(evento => {

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

    console.log(
        `Actualizados ${resultado.length} partidos`
    );
}

actualizar().catch(console.error);
