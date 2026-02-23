const http = require('http');

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/products?page=1&limit=2',
    method: 'GET'
};


const req = http.request(options, (res) => {
    console.log(`statusCode: ${res.statusCode}`);
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        console.log('Raw data:', data);
        try {
            const response = JSON.parse(data);
            console.log('Response Metadata:', {
                page: response.page,
                pages: response.pages,
                total: response.total,
                productsCount: response.products ? response.products.length : 0
            });
            if (response.products && response.products.length > 0) {
                console.log('First product name:', response.products[0].name);
            }
        } catch (e) {
            console.error('Error parsing response:', e.message);
            console.log('Raw data:', data);
        }
    });
});

req.on('error', (error) => {
    console.error('Error connecting to server:', error.message);
});

req.end();
