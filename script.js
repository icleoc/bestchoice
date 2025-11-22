// Função para buscar voos da Kiwi.com API (gratuita, com preços)
async function fetchFlights(origin, destination, departureDate, returnDate) {
    const apiKey = 'SUA_CHAVE_KIWI_AQUI'; // Substitua pela sua chave da Kiwi.com (não use a chave AviationStack aqui)
    let url = `https://tequila-api.kiwi.com/v2/search?fly_from=${origin}&fly_to=${destination}&date_from=${departureDate}&date_to=${departureDate}&adults=1&curr=BRL&limit=20`; // Limita a 20 resultados
    
    if (returnDate) {
        url += `&return_from=${returnDate}&return_to=${returnDate}`; // Adiciona volta se fornecida
    }

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'apikey': apiKey
            }
        });

        if (!response.ok) {
            throw new Error('Erro na API: ' + response.status);
        }

        const data = await response.json();
        console.log(data); // Para debug

        // Processa e ordena por preço (menor para maior)
        const flights = data.data
            .sort((a, b) => a.price - b.price) // Ordena por preço ascendente
            .slice(0, 10) // Mostra apenas as 10 mais baratas
            .map(flight => {
                const airline = flight.airlines[0] || 'Desconhecida';
                const price = `R$ ${flight.price}`;
                const link = flight.deep_link; // Link para reserva

                return {
                    airline,
                    origin: flight.cityFrom + ' (' + flight.flyFrom + ')',
                    destination: flight.cityTo + ' (' + flight.flyTo + ')',
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
    e.preventDefault(); // Evita reload da página
    const origin = document.getElementById('origin').value.toUpperCase();
    const destination = document.getElementById('destination').value.toUpperCase();
    const departureDate = document.getElementById('departure-date').value;
    const returnDate = document.getElementById('return-date').value || null;

    fetchFlights(origin, destination, departureDate, returnDate);
});
