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
    action: "/fear",
    image: ('https://github.com/jpfraneto/images/blob/main/FEAR.png?raw=true'),
    intents: [
      <TextInput placeholder="what does fear mean to you?" />,
      <Button value="reply">reply</Button>,
    ],
  })
})

app.frame('/fear', async (c) => { 
  const { buttonValue, frameData } = c
  let fid, text
  if(frameData){
    fid = frameData.fid
    text = frameData.inputText
  }
  console.log("the message hash is", frameData?.messageHash)
  let castOptions = {
    text: text,
    signer_uuid: process.env.ANKYSYNC_SIGNER,
    parent: frameData?.messageHash || "https://warpcast.com/~/channel/anky"
  };

  const response = await axios.post('https://poiesis.anky.bot/fear', {text} ,{
    headers: {
      'Authorization': `Bearer ${process.env.POIESIS_API_KEY}`
    }
  });
  try {
    const neynarResponse = axios.post(
      "https://api.neynar.com/v2/farcaster/cast",
      castOptions,
      {
        headers: {
          api_key: process.env.NEYNAR_API_KEY,
        },
      }
    );
  } catch (error) {
    console.log("there was an error casting")
  }

  return c.res({
    image: (
      <div
        style={{
          color:"white",
          padding: '40px',
          fontSize: "40px"
        }}>
        {response.data.fear}
      </div>
    ),
  })
})

devtools(app, { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
