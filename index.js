require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')

const app = express()
const cors = require('cors')
const errorhandler = require('./middleware/errorhandler')
const Person = require('./models/person')


app.use(cors())
app.use(bodyParser.json())
app.disable('x-powered-by')
app.use(express.static('build'))

morgan.token('post-data', (req, res) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post-data'))

app.get('/api/persons', (request, response, next) => {
  Person.find({}).then((persons) => {
    response.json(persons.map(person => person.toJSON()))
  })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then((person) => {
    person ? response.json(person.toJSON()) : response.status(404).end()
  })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {

  Person.findByIdAndDelete(request.params.id).then(() => {
    response.status(204).end()
  })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body
  console.log(body)

  if (!body.name || !body.phone) {
    return response.status(400).json({
      error: `name (${body.name}) or number (${body.phone}) is missing`,
    })
  }

  const person = new Person({
    name: body.name,
    phone: body.phone,
  })

  person.save()
    .then((savedPerson) => {
      response.json(savedPerson.toJSON())
    })
    .catch(error => next(error))

  console.log(person)

})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    phone: body.phone,
  }

  Person.findByIdAndUpdate(request.params.id, person, {
    new: true,
  })
    .then((updatedPerson) => {
      response.json(updatedPerson.toJSON())
    })
    .catch(error => next(error))

})

app.get('/info', (req, res) => {
  Person.estimatedDocumentCount()
    .then((count) => {
      res.send(`Phonebook has info for ${count} people</br>${new Date()}`)
    })
})

app.use(errorhandler.unknownEndpoint)
app.use(errorhandler.errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})