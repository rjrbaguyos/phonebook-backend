require('dotenv').config()
const mongoose = require('mongoose')

if (process.argv.length < 4 && process.argv.length !== 2) {
  console.log('provide arguments: password name number')
  process.exit(1)
}


const name = process.argv[2]
const number = process.argv[3]

const url = process.env.MONGODB_URI

mongoose.set('strictQuery',false)

mongoose.connect(url, { family: 4 })



const personSchema = new mongoose.Schema({
  id: String,
  name: String,
  number: String
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 3){
    Person.find({}).then(result => {
        result.forEach(person => {
            console.log(person)
        })
        mongoose.connection.close()
        process.exit(1)
    })
    
}
/*
Person.find({}).then(result => {
  result.forEach(person => {
    console.log(person)
  })
  mongoose.connection.close()
})
*/

const person = new Person({
  name: `${name}`,
  number: `${number}`,
})



person.save().then(result => {
  console.log('person saved!')
  mongoose.connection.close()
})

