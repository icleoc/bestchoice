// Função para buscar voos da AviationStack API (gratuita, dados em tempo real)
async function fetchFlights(origin, destination) {
    const apiKey = '14f94ea7f5f142ed54c177df4d2c7328'; // Sua chave fornecida
    let url = `http://api.aviationstack.com/v1/flights?access_key=${apiKey}&dep_iata=${origin}&limit=20`; // Busca voos saindo de 'origin'

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Erro na API: ' + response.status);
        }

        const data = await response.json();
        console.log(data); // Para debug

        // Filtra por destino se fornecido, e limita a 10
        let flights = data.data.filter(flight => !destination || flight.arrival.iata === destination.toUpperCase()).slice(0, 10);

        flights = flights.map(flight => {
            const airline = flight.airline?.name || 'Desconhecida';
            const originText = flight.departure?.airport + ' (' + flight.departure?.iata + ')';
            const destinationText = flight.arrival?.airport + ' (' + flight.arrival?.iata + ')';
            const price = 'Preço não disponível (verifique em sites de reservas)'; // AviationStack não dá preços
            const link = `https://www.google.com/flights?hl=pt-BR#flt=${flight.departure.iata}.${flight.arrival.iata}.${flight.departure.scheduled.split('T')[0]}`; // Link para Google Flights

            return {
                airline,
                origin: originText,
                destination: destinationText,
                price,
                link
            };
        });

        renderFlights(flights);
    } catch (error) {
        console.error('Erro ao buscar voos:', error);
        document.getElementById('flights-container').innerHTML = '<p>Erro ao carregar voos. Verifique os dados e tente novamente.</p>';
    }
}

// Função para renderizar os cards
function renderFlights(flights) {
    const container = document.getElementById('flights-container');
    container.innerHTML = ''; // Limpa
    if (flights.length === 0) {
        container.innerHTML = '<p>Nenhum voo encontrado para os critérios selecionados.</p>';
        return;
    }
    flights.forEach(flight => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <h3>${flight.airline}</h3>
            <p><strong>Origem:</strong> ${flight.origin}</p>
            <p><strong>Destino:</strong> ${flight.destination}</p>
            <p class="price">${flight.price}</p>
        `;
        card.addEventListener('click', () => {
            window.open(flight.link, '_blank');
        });
        container.appendChild(card);
    });
}

// Evento do formulário
document.getElementById('search-form').addEventListener('submit', (e) => {
    e.preventDefault(); // Evita reload
    const origin = document.getElementById('origin').value.toUpperCase();
    const destination = document.getElementById('destination').value.toUpperCase() || null;

    fetchFlights(origin, destination);
});
