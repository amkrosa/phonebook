const express = require("express")
const bodyParser = require('body-parser')
const morgan = require("morgan")
const app = express()
const cors = require('cors')

app.use(cors())
app.use(bodyParser.json())
app.disable('x-powered-by')
app.use(express.static('build'))

let persons =  [
    { 
      "name": "Arto Hellas", 
      "number": "040-123456",
      "id": 1
    },
    { 
      "name": "Ada Lovelace", 
      "number": "39-44-5323523",
      "id": 2
    },
    { 
      "name": "Dan Abramov", 
      "number": "12-43-234345",
      "id": 3
    },
    { 
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122",
      "id": 4
    }
  ]

morgan.token('post-data', (req, res) => JSON.stringify(req.body))

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post-data'))

app.get('/', (req, res) => {
    res.redirect('/info')
})

app.get('/api/persons', (req, res) => {
    res.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    person ? response.json(person) : response.status(404).end()
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
    response.status(204).end()
})

app.post('/api/persons', (request, response) => {
    const body = request.body
    console.log(body)

    if (!body.name || !body.number){
        return response.status(400).json({
            error: `name (${body.name}) or number (${body.number}) is missing`
        })
    }
    if (persons.find( person => person.name.toUpperCase() === body.name.toUpperCase() )){
        return response.status(409).json({
            error: `${body.name} already exists`
        })
    }

    const person = {
        id: Math.floor(Math.random()*Date.now()),
        name: body.name,
        number: body.number
    }

    persons = persons.concat(person)

    console.log(person)
    response.json(person)

})

app.get('/info', (req, res) => {
    res.send(`Phonebook has info for ${persons.length} people</br>${new Date()}`)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})