/** @jsxImportSource frog/jsx */

import { Button, Frog, TextInput } from 'frog'
import { devtools } from 'frog/dev'
// import { neynar } from 'frog/hubs'
import { handle } from 'frog/next'
import { serveStatic } from 'frog/serve-static'
import { abi } from '../abi'
import axios from 'axios'

const app = new Frog({
  assetsPath: '/',
  basePath: '/api',
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
  imageOptions: {
    /* Other default options */
    fonts: [
      {
        name: 'Righteous',
        source: 'google',
      },
    ],
  },
})

// Uncomment to use Edge Runtime
// export const runtime = 'edge'

app.frame('/', (c) => {
  const { buttonValue, inputText, status } = c
  return c.res({
    action: "/submit",
    image: ('https://github.com/jpfraneto/images/blob/main/ankkky.png?raw=true'),
    intents: [
      <TextInput placeholder="what do you want a joke about?" />,
      <Button value="dad jokes">dad joke</Button>,
    ],
  })
})

app.frame('/submit', async (c) => { 
  console.log("on the submit route", process.env)

  const { buttonValue, frameData } = c
  let fid, text
  if(frameData){
    fid = frameData.fid
    text = frameData.inputText
  }
  console.log("the text is: ", text)
  const response = await axios.post('https://poiesis.anky.bot/joke', {text} ,{
    headers: {
      'Authorization': `Bearer ${process.env.POIESIS_API_KEY}`
    }
  });
  
  
  return c.res({
    image: (
      <div
        style={{
          color:"white",
          padding: '20px',
          fontSize: "40px"
        }}>
        {response.data.joke}
      </div>
    ),
    intents: [
      <Button value="one">one</Button>,
      <Button value="one">two</Button>,
      <Button value="one">three</Button>,
    ],
  })
})

devtools(app, { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
