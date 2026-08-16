const http = require('http')
const express = require('express')
const morgan = require('morgan')
const app = express()



app.use(express.static('dist'))
app.use(morgan(':method :url :status :content - :response-time ms'))
app.use(express.json())

morgan.token('content', function logContent (req) {
    return JSON.stringify(req.body)
})

let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/', (request, response) => {
    response.send('<h1>Hello World</h1>')
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(person => person.id === id)

    if (person) {
        response.json(person)
    }
    else {
        response.status(404).end()
    }
})

app.get('/info', (request, response) =>{
    const today = new Date()
    response.send(`<p>Phonebook has info for ${persons.length} people</p>
        
        <p>${today}</p>`)

}
) 


app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    persons = persons.filter(person => person.id !== id)

    response.status(200).end()
})

const generateId = (max) => {
    const num = Math.floor(Math.random() * max)
    return String(num)
}

app.post('/api/persons', (request, response) => {
    const body = request.body

    

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'name or number missing'
        })
    }

    const nameCheck = persons.find(n => n.name === body.name)

    if (nameCheck) {
        return response.status(403).json({
            name: body.name,
            number: body.number,
            error: 'name already exists'
        })
    }

    const person ={
        name: body.name,
        number: body.number,
        id: generateId(100000)
    }

    persons = persons.concat(person)
    
    response.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})