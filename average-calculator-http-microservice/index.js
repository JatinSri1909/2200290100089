const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 9876;

const windowSize = 10;
let storedNumbers = [];

// function to fetch numbers from the test server
const fetchNumbers = async (type) => {
    const urlMap = {
        p: 'http://20.244.56.144/evaluation-service/primes',
        f: 'http://20.244.56.144/evaluation-service/fibo',
        e: 'http://20.244.56.144/evaluation-service/even',
        r: 'http://20.244.56.144/evaluation-service/rand'
    };
    const url = urlMap[type];
    console.log(`Fetching numbers from URL: ${url}`); // Debugging line
    if (!url) throw new Error('Invalid number type');

    try {
        const response = await axios.get(url, {
            headers: {
                'Authorization': 'Bearer YOUR_BEARER_TOKEN' // Replace with your actual API key or token
            },
            timeout: 500
        });
        console.log('Fetched numbers:', response.data.numbers); // Debugging line
        return response.data.numbers;
    } catch (error) {
        console.error('Error fetching numbers:', error);
        return [];
    }
};

//route to handle requests
app.get(`/numbers/:numberid`, async(req, res) => {
    const numberId = req.params.numberid;
    const newNumbers = await fetchNumbers(numberId);

    // Update stored numbers
    const windowPrevState = [...storedNumbers];
    newNumbers.forEach(num => {
        if (!storedNumbers.includes(num)) {
            if (storedNumbers.length >= windowSize) {
                storedNumbers.shift(); // Remove the oldest number
            }
            storedNumbers.push(num); // Add the new number
        }
    });

    // Calculate average
    const avg = storedNumbers.length > 0 ? (storedNumbers.reduce((a, b) => a + b, 0) / storedNumbers.length).toFixed(2) : 0;

    // Prepare response
    const response = {
        windowPrevState,
        windowCurrState: [...storedNumbers],
        numbers: newNumbers,
        avg: parseFloat(avg)
    };

    res.json(response);
    
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
})