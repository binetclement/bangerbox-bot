const {

  Client,

  LocalAuth

} = require(
  'whatsapp-web.js'
)

const qrcode =
  require('qrcode-terminal')

const cron =
  require('node-cron')

const {
  createClient

} = require(
  '@supabase/supabase-js'
)

// 🔗 SUPABASE
const supabase =
  createClient(

    'https://ldfsidulqwovycwgmwib.supabase.co',

    'sb_publishable_CGTfP1lXCgDX_ZI1Aqn1sQ_cimKfwDG'
  )

// 📱 WHATSAPP
const client =
  new Client({

    authStrategy:
      new LocalAuth(),

    puppeteer: {

      headless: true
    }
  })

// 🔳 QR CODE
client.on('qr', qr => {

  qrcode.generate(qr, {
    small: true
  })

  console.log(
    'Scan le QR code WhatsApp'
  )
})

// ✅ READY
client.on('ready', async () => {

  console.log(
    'WhatsApp READY ✅'
  )

  // 🔍 afficher groupes
  const chats =
    await client.getChats()

  chats.forEach(chat => {

    if (chat.isGroup) {

      console.log(

        chat.name,

        chat.id._serialized
      )
    }
  })

  // 🔥 MESSAGE TEST
  await client.sendMessage(

    '120363425149311694@g.us',

    '🔥 Bangerbox connecté'
  )
})

// ⏰ DAILY RECAP
cron.schedule(

  '0 18 * * *',

  async () => {

    console.log(
      'Daily recap'
    )

    // 🎵 récupérer sons
    const {
      data: songs

    } = await supabase
      .from('submissions')
      .select('*')

    // 💬 récupérer commentaires
    const {
      data: comments

    } = await supabase
      .from('comments')
      .select('*')

    // 🗳️ récupérer votes
    const {
      data: votes

    } = await supabase
      .from('votes')
      .select('*')

    // 🔥 récupérer réactions
    const {
      data: reactions

    } = await supabase
      .from('reactions')
      .select('*')

    // 📝 message compact
    const message = `

🔥 BANGERBOX DAILY

🎵 ${songs.length} sons
💬 ${comments.length} commentaires
🗳️ ${votes.length} votes
🔥 ${reactions.length} réactions

https://bangerbox.app/CAYBC8
`

    // 📤 envoyer groupe
    await client.sendMessage(

      '120363425149311694@g.us',

      message
    )

    console.log(
      'Daily envoyé ✅'
    )
  }
)

// 👀 watcher nouveaux sons
let latestSubmissionId = null

async function watchNewSongs() {

  console.log(
    'watching songs...'
  )

  const {
    data: songs,
    error

  } = await supabase
.from('submissions')
.select('*')
.eq(
  'league_id',
  '808dcb4f-120e-465b-b02a-04755076bc8c'
)
.order('created_at', {
  ascending: false
})
.limit(1)

  if (error) {

    console.log(error)

    return
  }

  if (!songs?.length) {

    console.log(
      'Aucun son'
    )

    return
  }

  const latestSong =
    songs[0]

  console.log(
    'LATEST:',
    latestSong.id
  )

  // 🚫 premier lancement
  if (!latestSubmissionId) {

    latestSubmissionId =
      latestSong.id

    console.log(
      'INIT SONG ID'
    )

    return
  }

  // ✅ nouveau son
  if (
    latestSong.id !==
    latestSubmissionId
  ) {

    console.log(
      'NEW SONG DETECTED'
    )

    latestSubmissionId =
      latestSong.id

    const message =
      `👀 ${latestSong.username} vient de poster un son
https://bangerbox.app/CAYBC8`

    try {

      await client.sendMessage(

        '120363425149311694@g.us',

        message
      )

      console.log(
        'Nouveau son envoyé ✅'
      )

    } catch (err) {

      console.log(
        'Erreur WhatsApp'
      )

      console.log(err)
    }
  }
}

// 🚀 INIT
client.initialize()

setInterval(

  watchNewSongs,

  30000
)