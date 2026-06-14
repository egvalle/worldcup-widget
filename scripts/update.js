const fs = require('fs');

function fechaGT(fecha) {

    const partes = new Intl.DateTimeFormat(
        'en-US',
        {
            timeZone: 'America/Guatemala',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }
    ).formatToParts(fecha);

    const year = partes.find(
        p => p.type === 'year'
    ).value;

    const month = partes.find(
        p => p.type === 'month'
    ).value;

    const day = partes.find(
        p => p.type === 'day'
    ).value;

    return `${year}-${month}-${day}`;
}

async function actualizar() {

    const response = await fetch(
        'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard'
    );

    const data = await response.json();

    const eventos = data.events || [];

    const hoyGT = fechaGT(new Date());

    const eventosHoy = eventos.filter(evento => {

        const fechaEventoGT = fechaGT(
            new Date(evento.date)
        );

        return fechaEventoGT === hoyGT;

    });

    eventosHoy.sort((a, b) => {

        const prioridad = {
            in: 1,
            pre: 2,
            post: 3
        };

        const pa =
            prioridad[a.status.type.state] || 9;

        const pb =
            prioridad[b.status.type.state] || 9;

        if (pa !== pb) {
            return pa - pb;
        }

        return (
            new Date(a.date) -
            new Date(b.date)
        );

    });

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
                `${local.score}-${visita.score}`,

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
        JSON.stringify(
            resultado,
            null,
            2
        )
    );

    console.log(
        `Actualizados ${resultado.length} partidos`
    );
}

actualizar().catch(error => {

    console.error(error);

    process.exit(1);

});
