/** @jsxImportSource frog/jsx */

import { Button, Frog, TextInput } from 'frog'
import { devtools } from 'frog/dev'
// import { neynar } from 'frog/hubs'
import { handle } from 'frog/next'
import { serveStatic } from 'frog/serve-static'
import { abi } from '../abi'
import axios from 'axios'
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const rootCastHash = "0xe69827036a2f7c86a35d2082f3ecd6e25ffd6da2"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.resolve(__dirname, '../data');

// Function to save JSON data to a file
function saveJSONToFile(fid, data) {
  const filePath = path.join(dataDir, `${fid}.json`);

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Data saved to ${filePath}`);
}

// Function to read JSON data from a file
function readJSONFromFile(fid) {
  const filePath = path.join(dataDir, `${fid}.json`);

  if (!fs.existsSync(filePath)) {
    return null
  }

  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
}

const countFilePath = path.resolve('submissionCount.json');

const getSubmissionCount = () => {
  if (!fs.existsSync(countFilePath)) {
    return 0;
  }
  const data = fs.readFileSync(countFilePath, 'utf8');
  return JSON.parse(data).count || 0;
};

const incrementSubmissionCount = () => {
  const currentCount = getSubmissionCount();
  const newCount = currentCount + 1;
  fs.writeFileSync(countFilePath, JSON.stringify({ count: newCount }));
  return newCount;
};

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
  return c.res({
    action: "/step-one",
    image: ('https://github.com/jpfraneto/images/blob/main/leggendary.png?raw=true'),
    intents: [
      <TextInput placeholder="jerry garcia, steve jobs, etc." />,
      <Button value="reply">reply</Button>,
    ],
  })
})

// STEP 2 - CHECK IF ALREADY REPLIED
app.frame('/step-one', async (c) => { 
  const { buttonValue, frameData } = c
  let fid, userInput
  if(frameData){
    fid = frameData.fid
    userInput = frameData?.inputText || ""
  }
  if(false) {
    return c.res({
      image: (
        <div
              style={{
                    alignItems: 'center',
                    background:'linear-gradient(to right, #432889, #17101F)',
                    backgroundSize: '100% 100%',
                    display: 'flex',
                    flexDirection: 'column',
                    flexWrap: 'nowrap',
                    height: '100%',
                    justifyContent: 'center',
                    textAlign: 'center',
                    width: '100%',
                  }}>
                  <div
          style={{
            color: 'white',
            fontSize: 50,
            fontStyle: 'normal',
            letterSpacing: '-0.025em',
            lineHeight: 1,
            display: "flex",
            marginTop: 30,
            padding: '0 120px',
            whiteSpace: 'pre-wrap',
          }}
        >
               aloja
        </div>

        </div>
      ),
      intents: [
        <Button.Link href="https://warpcast.com/~/compose?text=choose%20the%20most%20legendary%20human%20of%20our%20time%20on%20the%20frame%20below%20%F0%9F%91%87%F0%9F%8F%BD%20%28credits%3A%20%40jpfraneto%29&embeds[]=https://bangercaster.xyz/api
        ">share frame</Button.Link>,
      ],
    })
  } else {
    if(!frameData?.inputText || frameData?.inputText.length < 8 ){
      return c.res({
        image: (

          <div
          style={{
                alignItems: 'center',
                background:'linear-gradient(to right, #432889, #17101F)',
                backgroundSize: '100% 100%',
                display: 'flex',
                flexDirection: 'column',
                flexWrap: 'nowrap',
                height: '100%',
                justifyContent: 'center',
                textAlign: 'center',
                width: '100%',
              }}>
              <div
      style={{
        color: 'white',
        fontSize: 50,
        fontStyle: 'normal',
        letterSpacing: '-0.025em',
        lineHeight: 1,
        display: "flex",
        marginTop: 30,
        padding: '0 120px',
        whiteSpace: 'pre-wrap',
      }}
    >
             enter a valid name
    </div>
    </div>
        ),
        intents: [
          <TextInput placeholder="ricky martin, cristiano ronaldo, etc." />,
          <Button value="reply">try again</Button>,
        ],
      })
    }
    let poiesisResponse = await axios.post('https://poiesis.anky.bot/legendary', {userInput} ,{
      headers: {
        'Authorization': `Bearer ${process.env.POIESIS_API_KEY}`
      }
    });
    if(poiesisResponse?.data?.isLegendary){
      const dataToSave = {
        chosenHuman: userInput,
        isLegendary: poiesisResponse?.data.isLegendary,
        legendaryness: poiesisResponse?.data.legendaryness,
        replyToUser: poiesisResponse?.data.replyToUser,
        fid: fid
      }
      try {
        const usernameResponse = await axios.get(
          `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}&viewer_fid=16098`,
          {
            headers: {
              api_key: process.env.NEYNAR_API_KEY,
            },
          }
        );
        let castText = `@${usernameResponse.data.users[0].username} - ${userInput}\n\n${dataToSave.replyToUser}`
        let castOptions = {
          text: castText,
          signer_uuid: process.env.ANKYSYNC_SIGNER,
          parent: rootCastHash
        };
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
        
      }
      
      return c.res({
        image: (

          <div
          style={{
                alignItems: 'center',
                background:'linear-gradient(to right, #432889, #17101F)',
                backgroundSize: '100% 100%',
                display: 'flex',
                flexDirection: 'column',
                flexWrap: 'nowrap',
                height: '100%',
                justifyContent: 'center',
                textAlign: 'center',
                width: '100%',
              }}>
              <div
      style={{
        color: 'white',
        fontSize: 50,
        fontStyle: 'normal',
        letterSpacing: '-0.025em',
        lineHeight: 1,
        display: "flex",
        marginTop: 30,
        padding: '0 120px',
        whiteSpace: 'pre-wrap',
      }}
    >
             {poiesisResponse?.data.replyToUser}
    </div>
    <div
      style={{
        color: 'orange',
        fontSize: 40,
        fontStyle: 'normal',
        letterSpacing: '-0.025em',
        lineHeight: 1,
        display: "flex",
        marginTop: 30,
        padding: '0 120px',
        whiteSpace: 'pre-wrap',
      }}
    >
             (your choice was commented below the first cast where this frame was shared)
    </div>

    </div>
        ),
        intents: [
          <Button.Link href={`https://warpcast.com/jpfraneto/${rootCastHash.slice(0,10)}`}>read comments</Button.Link>,
          <Button.Link href="https://warpcast.com/~/compose?text=choose%20the%20most%20legendary%20human%20of%20our%20time%20on%20the%20frame%20below%20%F0%9F%91%87%F0%9F%8F%BD%20%28credits%3A%20%40jpfraneto%29&embeds[]=https://bangercaster.xyz/api
          ">share frame</Button.Link>,
        ],
      })
    } else {
      return c.res({
        image: (
<div
style={{
      alignItems: 'center',
      background:'linear-gradient(to right, #432889, #17101F)',
      backgroundSize: '100% 100%',
      display: 'flex',
      flexDirection: 'column',
      flexWrap: 'nowrap',
      height: '100%',
      justifyContent: 'center',
      textAlign: 'center',
      width: '100%',
    }}>
    <div
style={{
color: 'white',
fontSize: 50,
fontStyle: 'normal',
letterSpacing: '-0.025em',
lineHeight: 1,
display: "flex",
marginTop: 30,
padding: '0 120px',
whiteSpace: 'pre-wrap',
}}
>
{`${userInput} is not a legendary human. please try again`}
</div>

</div>
        ),
        intents: [
          <TextInput placeholder="ricky martin, cristiano ronaldo, etc." />,
          <Button value="reply">try again</Button>,
        ],
      })
    }
  }
})

devtools(app, { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
