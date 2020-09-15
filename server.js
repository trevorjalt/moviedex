require('dotenv').config()
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const MOVIEDEX = require('./moviedex.json')

console.log(process.env.API_TOKEN)

const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());

app.use(function validationBearerToken(req, res, next) {
    const apiToken = process.env.API_TOKEN
    const authToken = req.get('Authorization')
    
    console.log('validate bearer token middleware')
    
    if (!authToken || authToken.split(' ')[1] !== apiToken) {
        return res.status(401).json({ error: "Unauthorized request" })
    }
    next()
})

let movieGenres = MOVIEDEX.map(movies => movies.genre.toLowerCase())
let validGenres = [...new Set(movieGenres)]
console.log(validGenres)

function handleGetMovies(req, res) {
    let response = MOVIEDEX

    
    if (req.query.genre && !validGenres.includes(req.query.genre.toLowerCase())) {
        return res.status(400).json({ message: "There are no genres matching your query" })
    }
    if (req.query.genre) {
        response = response.filter(movies => 
            movies.genre.toLowerCase().includes(req.query.genre.toLowerCase()))
    } 

    if (req.query.country) {
        response = response.filter(movies =>
            movies.country.toLowerCase().includes(req.query.country.toLowerCase()))
    }

    if (req.query.avg_vote) {
        response = response.filter(movies => 
            Number(movies.avg_vote) >= Number(req.query.avg_vote))
    }

    res.json(response)
}

app.get('/movie', handleGetMovies)

const PORT=8000

app.listen(PORT, () => {
    console.log(`Server is listening at http://localhost:${PORT}`)
})

