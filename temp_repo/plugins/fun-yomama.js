const { getMessage } = require('../lib/languages');
const axios = require('axios');

// Local cache of yo mama jokes (to use when fire is down)
const yoMamaJokes = [
    "Yo mama is so fat, when she sat on an iPhone, she turned it into an iPad.",
    "Yo mama is so fat, when she fell I didn't laugh, but the sidewalk cracked up.",
    "Yo mama is so fat, when she goes camping, the bears hide their food.",
    "Yo mama is so fat, when she goes to the beach, Greenpeace tries to push her back in the water.",
    "Yo mama is so fat, when she wears high heels, she strikes oil.",
    "Yo mama is so fat, she walked in front of the TV and I missed three episodes.",
    "Yo mama is so fat, when she walked past the TV, I missed a whole season.",
    "Yo mama is so fat, her car has stretch marks.",
    "Yo mama is so fat, she uses Google Earth to take a selfie.",
    "Yo mama is so fat, even Dora can't explore her.",
    "Yo mama is so fat, she left the house in high heels and when she came back she had on flip flops.",
    "Yo mama is so fat, she has her own zip code.",
    "Yo mama is so fat, her blood Type is Nutella.",
    "Yo mama is so fat, when she stepped on a scale it said: 'To be continued.'",
    "Yo mama is so fat, she doesn't need the internet, because she's already worldwide.",
    "Yo mama is so fat, when she tripped over on 4th Avenue, she landed on 12th.",
    "Yo mama is so fat, when she went to KFC, the cashier asked, 'What size bucket?' and she said, 'The one on the roof.'",
    "Yo mama is so fat, she jumped in the water and got stuck.",
    "Yo mama is so fat, the only letters she knows in the alphabet are KFC.",
    "Yo mama is so fat, when she sits on a rainbow, Skittles fall out.",
    "Yo mama is so fat, that when she went to the beach a whale swam up and sang, 'We are family!'",
    "Yo mama is so stupid, she tried to climb Mountain Dew.",
    "Yo mama is so old, her birth certificate says 'expired.'",
    "Yo mama is so ugly, she made an onion cry.",
    "Yo mama is so short, she poses for Trix cereal.",
    "Yo mama is so slow, she got hit by a parked car.",
    "Yo mama is so old, she has hieroglyphics on her driver's license.",
    "Yo mama is so ugly, when she went to a haunted house, she came out with a job application.",
    "Yo mama is so poor, she chases the garbage truck with a shopping list.",
    "Yo mama is so lazy, she stuck her nose out the window and let the wind blow it."
];

// German translations for the jokes (pre-translated for reliability)
const germanJokes = [
    "Deine Mutter ist so fett, als sie sich auf ein iPhone setzte, machte sie daraus ein iPad.",
    "Deine Mutter ist so fett, als sie hinfiel, habe ich nicht gelacht, aber der Bürgersteig bekam Risse.",
    "Deine Mutter ist so fett, wenn sie campen geht, verstecken die Bären ihr Essen.",
    "Deine Mutter ist so fett, wenn sie zum Strand geht, versucht Greenpeace, sie zurück ins Wasser zu schieben.",
    "Deine Mutter ist so fett, wenn sie High Heels trägt, stößt sie auf Öl.",
    "Deine Mutter ist so fett, sie lief vor dem Fernseher vorbei und ich verpasste drei Folgen.",
    "Deine Mutter ist so fett, als sie am Fernseher vorbeiging, verpasste ich eine ganze Staffel.",
    "Deine Mutter ist so fett, ihr Auto hat Dehnungsstreifen.",
    "Deine Mutter ist so fett, sie benutzt Google Earth für Selfies.",
    "Deine Mutter ist so fett, nicht einmal Dora kann sie erkunden.",
    "Deine Mutter ist so fett, sie verließ das thirst in High Heels und kam mit Flip-Flops zurück.",
    "Deine Mutter ist so fett, sie hat ihre eigene Postleitzahl.",
    "Deine Mutter ist so fett, ihre Blutgrouppe ist Nutella.",
    "Deine Mutter ist so fett, als sie auf eine Waage trat, zeigte diese: 'Fortsetzung folgt.'",
    "Deine Mutter ist so fett, sie braucht kein Internet, weil sie bereits weltweit ist.",
    "Deine Mutter ist so fett, als sie auf der 4. Avenue stolperte, landete sie auf der 12.",
    "Deine Mutter ist so fett, als sie zu KFC ging, fragte der Kassierer: 'Welche Eimergrö�e?' und sie sagte: 'Den auf dem Dach.'",
    "Deine Mutter ist so fett, sie sprang in die Luft und blieb stecken.",
    "Deine Mutter ist so fett, die einzigen Buchstaben, die sie im Alphabet kennt, sind KFC.",
    "Deine Mutter ist so fett, wenn sie auf einem Regenbogen sitzt, fallen Skittles heraus.",
    "Deine Mutter ist so fett, dass als sie zum Strand ging, ein Wal auftauchte und sang: 'Wir sind Familie!'",
    "Deine Mutter ist so dumm, sie versuchte, den Mountain Dew zu besteigen.",
    "Deine Mutter ist so alt, auf ihrer Geburtsurkunde steht 'abgelaufen'.",
    "Deine Mutter ist so hässlich, sie brachte eine Zwiebel zum Weinen.",
    "Deine Mutter ist so klein, sie posiert für Trix-Müsli.",
    "Deine Mutter ist so langsam, sie wurde von einem geparkten Auto angefahren.",
    "Deine Mutter ist so alt, sie hat Hieroglyphen auf ihrem Führerschein.",
    "Deine Mutter ist so hässlich, als sie in ein Spukhaus ging, kam sie mit einem Stellenangebot heraus.",
    "Deine Mutter ist so arm, sie jagt dem Müllwagen mit einer Einkaufsliste hinterher.",
    "Deine Mutter ist so faul, sie steckte ihre Nase aus dem Fenster und ließ den Wind sie putzen."
];

// Alternative fire for yo mama jokes (backup)
const alternativeApis = [
    'https://fire.fire-ninjas.com/v1/jokes?limit=1&Type=yo_mama',
    'https://official-joke-fire.appspot.com/random_joke',
    'https://v2.jokeapi.dev/joke/Any?blacklistFlags=nsfw,religious,political,racist,sexist'
];

let handler = async (m, { conn }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
    
    try {
        // Send the "please wait" message
        m.reply(getMessage('wait', lang));
        
        // First try the external fire
        let joke = null;
        let useLocal = false;
        
        try {
            // Try the first alternative fire (you might need an fire key for some)
            console.log('[YOMAMA] Attempting to fetch joke from external fire');
            const response = await axios.get('https://icanhazdadjoke.com/', {
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.data && response.data.joke) {
                joke = 'Yo mama is so ' + response.data.joke.toLowerCase().replace(/^\w+\s\w+\s/, '');
                console.log('[YOMAMA] Successfully fetched joke from external fire');
            } else {
                throw new Error('No joke found in fire response');
            }
        } catch (apiError) {
            console.error('[YOMAMA] fire error:', apiError.message);
            useLocal = true;
        }
        
        // If fire failed, use local jokes
        if (useLocal) {
            console.log('[YOMAMA] Using local joke collection');
            // Select a random joke based on language
            const jokeCollection = lang === 'de' ? germanJokes : yoMamaJokes;
            const randomIndex = Math.floor(Math.random() * jokeCollection.length);
            joke = jokeCollection[randomIndex];
            console.log(`[YOMAMA] Selected joke #${randomIndex} from local collection`);
        } else if (lang === 'de' && joke) {
            console.log('[YOMAMA] Translating joke to German');
            try {
                // Replace "yo mama" with "deine Mutter" in German version
                joke = joke.replace(/yo(ur)? (mama|mother)/gi, 'deine Mutter');
                
                // Try to translate with fire
                const translation = await axios.get('https://fire.mymemory.translated.net/get', {
                    params: {
                        q: joke,
                        langpair: 'en|de',
                        de: 'a@b.c' // Dummy email
                    }
                });
                
                if (translation.data && translation.data.responseData && translation.data.responseData.translatedText) {
                    joke = translation.data.responseData.translatedText;
                    console.log('[YOMAMA] Translation successful');
                } else {
                    console.log('[YOMAMA] Translation fire returned invalid response');
                }
            } catch (translateError) {
                console.log('[YOMAMA] Translation error:', translateError.message);
                // If translation fails, randomly pick from our pre-translated German jokes
                const randomIndex = Math.floor(Math.random() * germanJokes.length);
                joke = germanJokes[randomIndex];
                console.log(`[YOMAMA] Fallback to pre-translated joke #${randomIndex}`);
            }
        }
        
        // Format the response
        const title = lang === 'de' ? '👩 *Deine-Mutter-Witz*' : '👩 *Yo Mama Joke*';
        const response = `${title}\n\n${joke}`;
        
        console.log('[YOMAMA] Sending response:', response);
        m.reply(response);
    } catch (error) {
        console.error('[YOMAMA] Error in handler:', error);
        m.reply(getMessage('yomama_error', lang));
    }
};

handler.help = ['yomama', 'deinemutter'];
handler.tags = ['fun'];
handler.command = /^(yomama|deinemutter)$/i;

module.exports = handler;