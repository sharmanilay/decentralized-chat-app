import './App.css'
import { useEffect, useState, useReducer } from 'react'
import Gun from 'gun';
import {faker} from '@faker-js/faker'

//Port 5050 is the port of the gun server we previously created
const gun = Gun({
  peers: [
    'http://localhost:5050/gun'
  ]
})

// The messages array will hold the chat messages

const currentState = {
  messages: []
}

// This reducer function will edit the messages array
const reducer = (state, message) => {
  return {
    messages: [message, ...state.messages]
  }
}

function App() {
  const [messageText, setMessageText] = useState('')
  const [state, dispatch] = useReducer(reducer, currentState)

  useEffect(() => {
    const messagesRef = gun.get('MESSAGES')
    messagesRef.map().on(m => {
      dispatch({
        name: m.name,
        avatar: m.avatar,
        content: m.content,
        timestamp: m.timestamp
      })
    })
  }, [])

  // remove duplicate messages
  const newMessagesArray = () => {
    console.log(state.messages)
    if (state.messages && state.messages.length) {
      const formattedMessages = state.messages.filter((value, index) => {
        const _value = JSON.stringify(value)
        return (
          index === state.messages.findIndex(obj => {
            return JSON.stringify(obj) === _value
          })
        )
      })
      return formattedMessages
    }
    return []
  }
  // console.log(faker.name.firstName())

  const sendMessage = () => {
    // a reference to the current room
    const messagesRef = gun.get('MESSAGES')
    // The message object to be sent/saved
    const firstName = faker.name.firstName()
    const messageObject = {
      sender: firstName,
      avatar: faker.image.avatar(),
      content: messageText,
      timestamp: Date().substring(16, 21)
    }

    // this function sends/saves the message onto the network
    messagesRef.set(messageObject)

    // clear the text field after message has been sent
    setMessageText('')
  }

  return (
    <div className='App'>
      <main>
        <div className='messages'>
          <ul>
          {newMessagesArray().map((msg, index) => [
            <li key={index} className='message'>
              <img alt='avatar' src={msg.avatar} />
              <div>
                {msg.content}
                <span>{msg.sender}</span>
              </div>
            </li>
          ])}
          </ul>
        </div>
        <div className='input-box'>
          <input onChange={e => setMessageText(e.target.value)} value={messageText} placeholder='Type a message...' />
          <button onClick={sendMessage}>Send</button>
        </div>
      </main>
    </div>
  )
}

export default App;