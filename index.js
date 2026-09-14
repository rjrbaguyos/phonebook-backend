require('dotenv').config()
const http = require('http')
const express = require('express')
const Person = require('./models/person')
const morgan = require('morgan')
const { threadName } = require('worker_threads')
const app = express()



app.use(express.static('dist'))
app.use(morgan(':method :url :status :content - :response-time ms'))
app.use(express.json())

morgan.token('content', function logContent (req) {
    return JSON.stringify(req.body)
})

let persons = []

app.get('/', (request, response) => {
    response.send('<h1>Hello World</h1>')
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then((person) => {
    response.json(person)
  })
})

app.get('/api/persons/:id', (request, response) => {
  Person.find({_id:request.params.id}).then((person) => {
    console.log(person)
    response.json(person)
  })
})

app.get('/info', async (request, response) =>{
    const today = new Date()
    const numPeople = await Person.countDocuments({})
    console.log(numPeople)
    response.send(`<p>Phonebook has info for ${numPeople} people</p>
        
        <p>${today}</p>`)

}
) 


app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})


app.post('/api/persons', (request, response) => {
    const body = request.body

    

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'name or number missing'
        })
    }

    const nameCheck = Person.find({name: body.name}).then(result => {
        if (result.length !== 0) {
            return response.status(403).json({
                name: body.name,
                number: body.number,
                error: 'name already exists'
            })
        }
    })
    
    const person = new Person({
      name: body.name,
      number: body.number,
    })
    
    person.save().then((result) => {
      console.log('person saved!')
      response.json(result)
    })
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number, id } = request.body

  Person.findById(request.params.id)
    .then(person => {
      if (!person) {
        return response.status(404).end()
      }

      person.number = number

      return person.save().then((updatedPerson) => {
        response.json(updatedPerson)
      })
    })
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.error("error.message")

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError'){
    console.log(error.name)
    return response.status(400).json({error: error.message})
  }

  next(error)
}

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})