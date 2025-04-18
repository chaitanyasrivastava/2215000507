const express = require('express');
const axios = require('axios');
const app = express();

// Set up EJS as view engine
app.set('view engine', 'ejs');
app.set('views', './views');

// Configuration
const PORT = 9876;
const WINDOW_SIZE = 10;
const TEST_SERVER_BASE_URL = 'http://20.244.56.144/evaluation-service';
const TIMEOUT_MS = 500;

// Your credentials from registration
const AUTH_CREDENTIALS = {
    email: "chaitanya.srivastava_cs22@gmail.con",
    name: "chaitanya srivastava",
    rollNo: "2215000507",
    accessCode: "CNneGT",
    clientID: "dcfb25c9-0e05-411a-be48-2b4cd22d8d6f",
    clientSecret: "YXyTeBmjDbMqMjz"
};

let authToken = null;
let tokenExpiry = null;

// Data storage for each number type
const numberWindows = {
    p: [], // primes
    f: [], // fibonacci
    e: [], // even
    r: []  // random
};

// Helper function to get or refresh auth token
const getAuthToken = async () => {
    // If we have a valid token, return it
    if (authToken && tokenExpiry && Date.now() < tokenExpiry) {
        return authToken;
    }
    
    try {
        const response = await axios.post(`${TEST_SERVER_BASE_URL}/auth`, AUTH_CREDENTIALS, {
            timeout: TIMEOUT_MS
        });
        
        authToken = response.data.access_token;
        // Set expiry slightly before actual expiry to avoid edge cases
        tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 5000;
        
        return authToken;
    } catch (error) {
        console.error('Error getting auth token:', error.message);
        return null;
    }
};

// Helper function to calculate average
const calculateAverage = (numbers) => {
    if (numbers.length === 0) return 0;
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    return parseFloat((sum / numbers.length).toFixed(2));
};

// Helper function to fetch numbers from test server with auth
const fetchNumbers = async (numberType) => {
    try {
        const token = await getAuthToken();
        if (!token) {
            console.error('No auth token available');
            return [];
        }

        let endpoint;
        switch (numberType) {
            case 'p': endpoint = '/primes'; break;
            case 'f': endpoint = '/fibo'; break;
            case 'e': endpoint = '/even'; break;
            case 'r': endpoint = '/rand'; break;
            default: return [];
        }

        const response = await axios.get(`${TEST_SERVER_BASE_URL}${endpoint}`, {
            timeout: TIMEOUT_MS,
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        return response.data.numbers || [];
    } catch (error) {
        console.error(`Error fetching ${numberType} numbers:`, error.message);
        return [];
    }
};

// Helper function to update window state
const updateWindowState = (numberType, newNumbers) => {
    const window = numberWindows[numberType];
    const prevState = [...window];
    
    // Add new numbers, ensuring uniqueness
    newNumbers.forEach(num => {
        if (!window.includes(num)) {
            if (window.length >= WINDOW_SIZE) {
                window.shift(); // Remove oldest if window is full
            }
            window.push(num);
        }
    });
    
    return prevState;
};

// Main endpoint
app.get('/numbers/:numberId', async (req, res) => {
    const numberId = req.params.numberId.toLowerCase();
    
    // Validate numberId
    if (!['p', 'f', 'e', 'r'].includes(numberId)) {
        return res.status(400).json({ error: 'Invalid number ID. Use p, f, e, or r.' });
    }
    
    // Fetch numbers from test server
    const fetchedNumbers = await fetchNumbers(numberId);
    
    // Update window state
    const windowPrevState = updateWindowState(numberId, fetchedNumbers);
    const windowCurrState = numberWindows[numberId];
    const avg = calculateAverage(windowCurrState);
    
    // Prepare response
    const response = {
        windowPrevState,
        windowCurrState,
        numbers: fetchedNumbers,
        avg
    };
    
    res.json(response);
});

// Simple UI to test the service
app.get('/', (req, res) => {
    res.render('index', { 
        numberTypes: [
            { id: 'p', name: 'Prime Numbers' },
            { id: 'f', name: 'Fibonacci Numbers' },
            { id: 'e', name: 'Even Numbers' },
            { id: 'r', name: 'Random Numbers' }
        ]
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});