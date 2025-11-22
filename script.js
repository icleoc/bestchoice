// Mapeamento de nomes para códigos IATA (expanda conforme necessário)
const airportMap = {
    "são paulo": "GRU",
    "sao paulo": "GRU",
    "rio de janeiro": "GIG",
    "nova york": "JFK",
    "los angeles": "LAX",
    "londres": "LHR",
    "paris": "CDG",
    "tokyo": "NRT",
    "dubai": "DXB",
    "sydney": "SYD",
    // Adicione mais conforme precisar
};

// Função para converter entrada em código IATA
function getIataCode(input) {
    const lowerInput = input.toLowerCase().trim();
    return airportMap[lowerInput] || input.toUpperCase(); // Se não encontrar, assume que é código
}

// Função para popular datalist com sugestões
function populateDatalist() {
    const datalist = document.getElementById('airports-list');
    const destDatalist = document.getElementById('airports-list-dest');
    Object.keys(airportMap).forEach(name => {
        const option = document.createElement('option');
        option.value = name.charAt(0).toUpperCase() + name.slice(1); // Capitaliza
        datalist.appendChild(option);
        destDatalist.appendChild(option.cloneNode(true));
    });
}

// Função para buscar voos da AviationStack API
async function fetchFlights(origin, destination) {
    const apiKey = '14f94ea7f5f142ed54c177df4d2c7328';
    const originCode = getIataCode(origin);
    let url = `http://api.aviationstack.com/v1/flights?access_key=${apiKey}&dep_iata=${originCode}&limit=20`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Erro na API: ' + response.status);
        }

        const data = await response.json();
        console.log(data); // Para debug

        // Filtra por destino se fornecido
        let flights = data.data.filter(flight => !destination || getIataCode(destination) === flight.arrival.iata).slice(0, 10);

        flights = flights.map(flight => {
            const airline = flight.airline?.name || 'Desconhecida';
            const originText = flight.departure?.airport + ' (' + flight.departure?.iata + ')';
            const destinationText = flight.arrival?.airport + ' (' + flight.arrival?.iata + ')';
            const price = 'Preço não disponível (verifique em sites de reservas)';
            const link = `https://www.google.com/flights?hl=pt-BR#flt=${flight.departure.iata}.${flight.arrival.iata}.${flight.departure.scheduled.split('T')[0]}`;

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
    container.innerHTML = '';
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
    e.preventDefault();
    const origin = document.getElementById('origin').value;
    const destination = document.getElementById('destination').value || null;

    fetchFlights(origin, destination);
});

// Inicializa datalist ao carregar
document.addEventListener('DOMContentLoaded', populateDatalist);
